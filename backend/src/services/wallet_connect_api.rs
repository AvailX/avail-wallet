use super::{
    local_storage::{
        encrypted_data::update_encrypted_transaction_state_by_id,
        persistent_storage::{get_address, get_address_string, get_network},
        session::{password::PASS, view::VIEWSESSION},
        storage_api::{
            event::{
                get_avail_event_raw, get_avail_events_raw, get_event_raw, get_events_raw,
                get_succinct_avail_event_raw, get_succinct_avail_events_raw,
            },
            records::{
                get_page_count_for_filter, get_record_pointers, update_record_spent_local,
                update_record_spent_local_via_nonce,
            },
        },
        utils::{get_private_key, sign_message},
    },
    record_handling::{
        records::find_aleo_credits_record_to_spend,
        utils::{
            get_token_balance, handle_deployment_update_and_encrypted_storage,
            handle_encrypted_storage_and_message, handle_transaction_update_and_encrypted_storage,
            parse_inputs,
        },
    },
};
use chrono::Local;
use std::str::FromStr;

use crate::api::aleo_client::setup_client;
use crate::models::event::{AvailEvent, SuccinctAvailEvent};
use crate::models::pointers::{deployment::DeploymentPointer, transaction::TransactionPointer};
use crate::models::wallet_connect::{
    balance::{BalanceRequest, BalanceResponse},
    create_event::{CreateEventRequest, CreateEventResponse},
    decrypt::{DecryptRequest, DecryptResponse},
    get_event::{GetEventRequest, GetEventResponse, GetEventsRequest, GetEventsResponse},
    records::{GetRecordsRequest, GetRecordsResponse, RecordWithPlaintext},
    sign::{SignatureRequest, SignatureResponse},
};

use snarkvm::circuit::Aleo;
use snarkvm::{
    circuit::{AleoV0, Environment},
    prelude::{Address, Ciphertext, Field, Network, Program, Record, Signature, Testnet3},
};

use tauri::{Manager, Window};

use avail_common::{
    aleo_tools::program_manager::*,
    converters::messages::{field_to_fields, utf8_string_to_bits},
    errors::{AvailError, AvailErrorType, AvailResult},
    models::{
        encrypted_data::{EventTypeCommon, TransactionState},
        network::SupportedNetworks,
    },
};

#[tauri::command(rename_all = "snake_case")]
pub fn get_balance(request: BalanceRequest) -> AvailResult<BalanceResponse> {
    let network = get_network()?;
    println!(
        "===> Asset ID in Request Backend {:?}",
        Some(request.asset_id())
    );
    //TODO - Read ARC20 to deduce assets id something like {program_id/record_name} seems reasonable.
    let asset_id = match request.asset_id() {
        Some(asset_id) => asset_id,
        None => "credits".to_string(),
    };
    println!("===> Asset ID in Backend {:?}", asset_id);
    //TODO - V2 HD wallet support
    let _address = match request.address() {
        Some(address) => address.to_string(),
        None => get_address_string()?,
    };

    let balance = match SupportedNetworks::from_str(&network)? {
        SupportedNetworks::Testnet3 => get_token_balance::<Testnet3>(&asset_id)?,
        _ => get_token_balance::<Testnet3>(&asset_id)?, //SupportedNetworks::Mainnet => get_aleo_balance::<Mainnet>()?,
    };

    Ok(BalanceResponse::new(vec![balance], None))
}

#[tauri::command(rename_all = "snake_case")]
pub async fn request_create_event(
    request: CreateEventRequest,
    fee_private: bool,
    window: Window,
) -> AvailResult<CreateEventResponse> {
    let network = get_network()?;
    match SupportedNetworks::from_str(&network)? {
        SupportedNetworks::Testnet3 => {
            request_create_event_raw::<Testnet3, AleoV0>(request, fee_private, Some(window)).await
        }
        _ => request_create_event_raw::<Testnet3, AleoV0>(request, fee_private, Some(window)).await, //SupportedNetworks::Mainnet => request_create_event_raw::<Mainnet>(request),
    }
}

pub async fn request_create_event_raw<N: Network, A: Aleo + Environment<Network = N>>(
    request: CreateEventRequest,
    fee_private: bool,
    window: Option<Window>,
) -> AvailResult<CreateEventResponse> {
    let api_client = setup_client::<N>()?;
    let private_key = match get_private_key::<N>(None) {
        Ok(private_key) => {
            PASS.extend_session()?;
            private_key
        }
        Err(e) => match e.error_type {
            AvailErrorType::Unauthorized => {
                if let Some(window) = window {
                    match window.emit("reauthenticate", "create-event") {
                        Ok(_) => {}
                        Err(e) => {
                            return Err(AvailError::new(
                                AvailErrorType::Internal,
                                "Error emitting reauthentication event".to_string(),
                                "Error emitting reauthentication state".to_string(),
                            ));
                        }
                    };
                }

                return Ok(CreateEventResponse::new(
                    None,
                    Some("Unauthorized, please reauthenticate.".to_string()),
                ));
            }
            _ => {
                return Ok(CreateEventResponse::new(
                    None,
                    Some("Error signing the event creation.".to_string()),
                ));
            }
        },
    };

    let address = get_address::<N>()?;
    let fee = (request.fee() * 1000000.0) as u64;

    let mut program_manager =
        ProgramManager::<N>::new(Some(private_key), None, Some(api_client), None)?;

    let mut fee_record_nonce: Option<String> = None;

    if request.event_type() == &EventTypeCommon::Deploy {
        let program = match request.inputs().get(0) {
            Some(program) => program,
            None => {
                return Err(AvailError::new(
                    AvailErrorType::Internal,
                    "Program not found".to_string(),
                    "Program not found".to_string(),
                ))
            }
        };

        let program = match Program::<N>::from_str(program) {
            Ok(program) => program,
            Err(_) => {
                return Err(AvailError::new(
                    AvailErrorType::Internal,
                    "Program string parsing failure".to_string(),
                    "Program string parsing failure".to_string(),
                ))
            }
        };

        program_manager.add_program(&program)?;

        // TODO - Check if dapps take all costs into account for deployment
        //let (minimum_deployment_cost, (_storage_cost, _namespace_cost)) =
        // program_manager.estimate_deployment_fee::<A>(&program, &private_key)?;

        //let mut fee = minimum_deployment_cost;
        //fee += request.fee();

        let (fee_record, _fee_commitment, fee_id) = match fee_private {
            true => {
                let (fee_record, fee_commitment, fee_id) =
                    find_aleo_credits_record_to_spend::<N>(&fee, vec![])?;

                let fee_nonce = fee_record.nonce().to_string();
                fee_record_nonce = Some(fee_nonce);

                (Some(fee_record), Some(fee_commitment), Some(fee_id))
            }
            false => (None, None, None),
        };

        let mut pending_deployment_tx = DeploymentPointer::<N>::new(
            None,
            request.program_id().clone(),
            request.fee(),
            TransactionState::Processing,
            None,
            fee_record_nonce,
            Local::now(),
            None,
            None,
        );

        let pending_event_id = pending_deployment_tx.encrypt_and_store(address)?;

        if let Some(window) = window.clone() {
            match window.emit("tx_state_change", &pending_event_id) {
                Ok(_) => {}
                Err(e) => {
                    return Err(AvailError::new(
                        AvailErrorType::Internal,
                        "Error emitting tx_state_change event".to_string(),
                        "Error emitting transaction state".to_string(),
                    ));
                }
            };
        }

        if let Some(fee_id) = fee_id.clone() {
            update_record_spent_local::<N>(&fee_id, true)?;
        }

        let transaction_id = match program_manager.deploy_program(program.id(), 0, fee_record, None)
        {
            Ok(tx_id) => tx_id,
            Err(_) => {
                if let Some(fee_id) = fee_id {
                    update_record_spent_local::<N>(&fee_id, false)?;
                }

                pending_deployment_tx.update_failed_deployment(
                    "Deployment failed, no records were spent.".to_string(),
                );

                let encrypted_failed_deployment =
                    pending_deployment_tx.to_encrypted_data(address)?;

                update_encrypted_transaction_state_by_id(
                    &pending_event_id,
                    &encrypted_failed_deployment.ciphertext,
                    &encrypted_failed_deployment.nonce,
                    TransactionState::Failed,
                )?;

                if let Some(window) = window.clone() {
                    match window.emit("tx_state_change", &pending_event_id) {
                        Ok(_) => {}
                        Err(e) => {
                            return Err(AvailError::new(
                                AvailErrorType::Internal,
                                "Error emitting tx_state_change event".to_string(),
                                "Error emitting transaction state".to_string(),
                            ));
                        }
                    };
                }

                return Ok(CreateEventResponse::new(
                    Some(pending_event_id),
                    Some(format!("Error deploying program: '{}'", program.id())),
                ));
            }
        };

        handle_deployment_update_and_encrypted_storage::<N>(
            transaction_id,
            &pending_event_id,
            fee_id,
            window,
        )
        .await?;

        Ok(CreateEventResponse::new(Some(pending_event_id), None))
    } else {
        let mut record_nonces: Vec<String> = vec![];

        let (input_values, input_nonces, recipient_address, amount) =
            parse_inputs::<N>(request.inputs().clone(), &request.function_id().clone())?;

        let (fee_record, _fee_commitment, fee_id) = match fee_private {
            true => {
                let (fee_record, fee_commitment, fee_id) =
                    find_aleo_credits_record_to_spend::<N>(&fee, input_nonces.clone())?;

                let fee_nonce = fee_record.nonce().to_string();
                record_nonces.push(fee_nonce);

                (Some(fee_record), Some(fee_commitment), Some(fee_id))
            }
            false => (None, None, None),
        };

        record_nonces.extend(input_nonces.clone());

        let mut pending_transaction = TransactionPointer::<N>::new(
            None,
            None,
            TransactionState::Processing,
            None,
            Some(request.program_id().clone()),
            Some(request.function_id().clone()),
            vec![],
            record_nonces,
            Local::now(),
            None,
            None,
            request.event_type().to_owned(),
            amount,
            Some(request.fee()),
            None,
        );

        let pending_event_id = pending_transaction.encrypt_and_store(address)?;

        if let Some(window) = window.clone() {
            match window.emit("tx_state_change", &pending_event_id) {
                Ok(_) => {}
                Err(e) => {
                    return Err(AvailError::new(
                        AvailErrorType::Internal,
                        "Error emitting tx_state_change event".to_string(),
                        "Error emitting transaction state".to_string(),
                    ));
                }
            };
        }

        // TODO - Update fee to spent and input_nonces to spent
        for nonce in input_nonces.clone() {
            update_record_spent_local_via_nonce::<N>(&nonce, true)?;
        }

        if let Some(fee_id) = fee_id.clone() {
            update_record_spent_local::<N>(&fee_id, false)?;
        }
        println!("=====> INPUTS {:?}", input_values);
        let transaction_id = match program_manager.execute_program(
            request.program_id().clone(),
            request.function_id().clone(),
            input_values.iter(),
            0,
            fee_record,
            None,
        ) {
            Ok(tx_id) => tx_id,
            Err(_) => {
                if let Some(fee_id) = fee_id {
                    update_record_spent_local::<N>(&fee_id, false)?;
                }

                for nonce in input_nonces {
                    update_record_spent_local_via_nonce::<N>(&nonce, false)?;
                }

                pending_transaction.update_failed_transaction(
                    "Transaction execution failed, no records were spent.".to_string(),
                );

                let encrypted_failed_transaction =
                    pending_transaction.to_encrypted_data(address)?;

                update_encrypted_transaction_state_by_id(
                    &pending_event_id,
                    &encrypted_failed_transaction.ciphertext,
                    &encrypted_failed_transaction.nonce,
                    TransactionState::Failed,
                )?;

                if let Some(window) = window.clone() {
                    match window.emit("tx_state_change", &pending_event_id) {
                        Ok(_) => {}
                        Err(e) => {
                            return Err(AvailError::new(
                                AvailErrorType::Internal,
                                "Error emitting tx_state_change event".to_string(),
                                "Error emitting transaction state".to_string(),
                            ));
                        }
                    };
                }

                return Ok(CreateEventResponse::new(
                    Some(pending_event_id),
                    Some(format!(
                        "Error executing program: '{}' function: '{}' ",
                        request.program_id(),
                        request.function_id()
                    )),
                ));
            }
        };

        match recipient_address {
            Some(recipient_address) => {
                handle_encrypted_storage_and_message::<N>(
                    transaction_id,
                    recipient_address,
                    &pending_event_id,
                    None,
                    fee_id,
                    true,
                    window,
                )
                .await?
            }
            None => {
                handle_transaction_update_and_encrypted_storage::<N>(
                    transaction_id,
                    &pending_event_id,
                    fee_id,
                    window,
                )
                .await?
            }
        }

        Ok(CreateEventResponse::new(Some(pending_event_id), None))
    }
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_records(request: GetRecordsRequest) -> AvailResult<GetRecordsResponse> {
    let network = get_network()?;
    match SupportedNetworks::from_str(&network)? {
        SupportedNetworks::Testnet3 => match get_records_raw::<Testnet3>(request) {
            Ok((records, page_count)) => {
                Ok(GetRecordsResponse::new(records, Some(page_count), None))
            }
            Err(error) => Ok(GetRecordsResponse::new(
                vec![],
                None,
                Some(error.external_msg),
            )),
        },
        _ => match get_records_raw::<Testnet3>(request) {
            Ok((records, page_count)) => {
                Ok(GetRecordsResponse::new(records, Some(page_count), None))
            }
            Err(error) => Ok(GetRecordsResponse::new(
                vec![],
                None,
                Some(error.external_msg),
            )),
        }, //SupportedNetworks::Mainnet => get_records_raw::<Mainnet>(request),
    }
}

pub fn get_records_raw<N: Network>(
    request: GetRecordsRequest,
) -> AvailResult<(Vec<RecordWithPlaintext>, i32)> {
    // TODO - return page count

    let page_count = get_page_count_for_filter(request.clone())?;
    let (pointers, ids) = get_record_pointers::<N>(request)?;

    let records_with_plaintext = pointers
        .iter()
        .zip(ids.iter())
        .map(|(pointer, id)| {
            RecordWithPlaintext::from_record_pointer::<N>(pointer.clone(), id.clone())
        })
        .collect::<AvailResult<Vec<RecordWithPlaintext>>>()?;

    Ok((records_with_plaintext, page_count))
}

#[tauri::command(rename_all = "snake_case")]
pub fn sign(request: SignatureRequest, window: Window) -> AvailResult<SignatureResponse> {
    let network = get_network()?;

    match SupportedNetworks::from_str(&network)? {
        SupportedNetworks::Testnet3 => {
            match sign_message::<Testnet3>(&request.get_message(), None) {
                Ok((signature, message_field)) => Ok(SignatureResponse::new(
                    Some(signature.to_string()),
                    Some(message_field.to_string()),
                    None,
                )),
                Err(e) => {
                    if e.error_type == AvailErrorType::Unauthorized {
                        match window.emit("reauthenticate", "sign") {
                            Ok(_) => {}
                            Err(e) => {
                                return Err(AvailError::new(
                                    AvailErrorType::Internal,
                                    "Error emitting reauthentication event".to_string(),
                                    "Error emitting reauthentication state".to_string(),
                                ));
                            }
                        };
                    }
                    Ok(SignatureResponse::new(
                        None,
                        None,
                        Some("Signing Failed".to_string()),
                    ))
                }
            }
        }
        _ => match sign_message::<Testnet3>(&request.get_message(), None) {
            Ok((signature, message_field)) => Ok(SignatureResponse::new(
                Some(signature.to_string()),
                Some(message_field.to_string()),
                None,
            )),
            Err(e) => {
                if e.error_type == AvailErrorType::Unauthorized {
                    match window.emit("reauthenticate", "sign") {
                        Ok(_) => {}
                        Err(e) => {
                            return Err(AvailError::new(
                                AvailErrorType::Internal,
                                "Error emitting reauthentication event".to_string(),
                                "Error emitting reauthentication state".to_string(),
                            ));
                        }
                    };
                }
                Ok(SignatureResponse::new(
                    None,
                    None,
                    Some("Signing Failed".to_string()),
                ))
            }
        },
        //SupportedNetworks::Mainnet => decrypt_record_raw::<Mainnet>(ciphertext),
    }
}

#[tauri::command(rename_all = "snake_case")]
pub fn verify(message: &str, address: &str, signature: &str) -> AvailResult<bool> {
    let network = get_network()?;

    match SupportedNetworks::from_str(&network)? {
        SupportedNetworks::Testnet3 => verify_signature::<Testnet3>(message, address, signature),
        _ => verify_signature::<Testnet3>(message, address, signature),
    }
}

fn verify_signature<N: Network>(
    message: &str,
    address: &str,
    signature: &str,
) -> AvailResult<bool> {
    let signature = Signature::<N>::from_str(signature)?;
    let address = Address::<N>::from_str(address)?;

    let msg_bits = utf8_string_to_bits(message);
    let msg_field = N::hash_bhp512(&msg_bits)?;
    let msg = field_to_fields(&msg_field)?;

    let result = signature.verify(&address, &msg);

    Ok(result)
}

#[tauri::command(rename_all = "snake_case")]
pub fn decrypt_records(request: DecryptRequest) -> AvailResult<DecryptResponse> {
    let network = get_network()?;
    match SupportedNetworks::from_str(&network)? {
        SupportedNetworks::Testnet3 => match decrypt_records_raw::<Testnet3>(request.ciphertexts) {
            Ok(plaintexts) => Ok(DecryptResponse::new(plaintexts, None)),
            Err(error) => Ok(DecryptResponse::new(vec![], Some(error.external_msg))),
        },
        _ => match decrypt_records_raw::<Testnet3>(request.ciphertexts) {
            Ok(plaintexts) => Ok(DecryptResponse::new(plaintexts, None)),
            Err(error) => Ok(DecryptResponse::new(vec![], Some(error.external_msg))),
        }, //SupportedNetworks::Mainnet => decrypt_record_raw::<Mainnet>(ciphertext),
    }
}

pub fn decrypt_records_raw<N: Network>(ciphertext: Vec<String>) -> AvailResult<Vec<String>> {
    let view_key = VIEWSESSION.get_instance::<N>()?;
    let records = ciphertext
        .iter()
        .map(|ciphertext| {
            let record_ciphertext = Record::<N, Ciphertext<N>>::from_str(ciphertext)?;
            let record = match record_ciphertext.decrypt(&view_key) {
                Ok(record) => record,
                Err(_) => {
                    return Err(AvailError::new(
                        AvailErrorType::SnarkVm,
                        format!("Decryption Failed on record: {}", ciphertext),
                        format!("Decryption Failed on record: {}", ciphertext),
                    ))
                }
            };
            Ok(record.to_string())
        })
        .collect::<AvailResult<Vec<String>>>()?;

    Ok(records)
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_events(request: GetEventsRequest) -> AvailResult<GetEventsResponse> {
    let network = get_network()?;
    match SupportedNetworks::from_str(&network)? {
        SupportedNetworks::Testnet3 => match get_events_raw::<Testnet3>(request) {
            Ok(events) => Ok(GetEventsResponse::new(events, None, None)),
            Err(error) => Ok(GetEventsResponse::new(
                vec![],
                None,
                Some(error.external_msg),
            )),
        },
        _ => match get_events_raw::<Testnet3>(request) {
            Ok(events) => Ok(GetEventsResponse::new(events, None, None)),
            Err(error) => Ok(GetEventsResponse::new(
                vec![],
                None,
                Some(error.external_msg),
            )),
        },
        //SupportedNetworks::Mainnet => get_events_raw::<Mainnet>(request),
    }
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_event(request: GetEventRequest) -> AvailResult<GetEventResponse> {
    let network = get_network()?;
    match SupportedNetworks::from_str(&network)? {
        SupportedNetworks::Testnet3 => match get_event_raw::<Testnet3>(&request.id) {
            Ok(event) => Ok(GetEventResponse::new(Some(event), None)),
            Err(error) => Ok(GetEventResponse::new(None, Some(error.external_msg))),
        },
        _ => match get_event_raw::<Testnet3>(&request.id) {
            Ok(event) => Ok(GetEventResponse::new(Some(event), None)),
            Err(error) => Ok(GetEventResponse::new(None, Some(error.external_msg))),
        },
        //SupportedNetworks::Mainnet => get_event_raw::<Mainnet>(request),
    }
}

/* --Avail Events-- */
#[tauri::command(rename_all = "snake_case")]
pub fn get_avail_events(request: GetEventsRequest) -> AvailResult<Vec<AvailEvent>> {
    let network = get_network()?;
    match SupportedNetworks::from_str(&network)? {
        SupportedNetworks::Testnet3 => get_avail_events_raw::<Testnet3>(request),
        _ => get_avail_events_raw::<Testnet3>(request), //SupportedNetworks::Mainnet => get_events_raw::<Mainnet>(request),
    }
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_succinct_avail_events(
    request: GetEventsRequest,
) -> AvailResult<Vec<SuccinctAvailEvent>> {
    let network = get_network()?;
    match SupportedNetworks::from_str(&network)? {
        SupportedNetworks::Testnet3 => get_succinct_avail_events_raw::<Testnet3>(request),
        _ => get_succinct_avail_events_raw::<Testnet3>(request),
    }
    //SupportedNetworks::Mainnet => get_events_raw::<Mainnet>(request),
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_succinct_avail_event(id: &str) -> AvailResult<SuccinctAvailEvent> {
    let network = get_network()?;
    match SupportedNetworks::from_str(&network)? {
        SupportedNetworks::Testnet3 => get_succinct_avail_event_raw::<Testnet3>(id),
        _ => get_succinct_avail_event_raw::<Testnet3>(id),
    }
    //SupportedNetworks::Mainnet => get_event_raw::<Mainnet>(request),
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_avail_event(id: &str) -> AvailResult<AvailEvent> {
    let network = get_network()?;
    match SupportedNetworks::from_str(&network)? {
        SupportedNetworks::Testnet3 => get_avail_event_raw::<Testnet3>(id),
        _ => get_avail_event_raw::<Testnet3>(id), //SupportedNetworks::Mainnet => get_event_raw::<Mainnet>(request),
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::api::encrypted_data::delete_all_server_storage;

    use crate::models::storage::languages::Languages;
    use crate::models::{
        transfer::TransferRequest,
        wallet_connect::records::{RecordFilterType, RecordsFilter},
    };

    use crate::services::account::key_management::key_controller::KeyController;

    #[cfg(target_os = "linux")]
    use crate::services::account::key_management::key_controller::linuxKeyController;
    #[cfg(target_os = "macos")]
    use crate::services::account::key_management::key_controller::macKeyController;
    #[cfg(target_os = "windows")]
    use crate::services::account::key_management::key_controller::windowsKeyController;

    use crate::services::local_storage::encrypted_data::{
        get_encrypted_data_by_flavour, initialize_encrypted_data_table,
    };
    use crate::services::local_storage::persistent_storage::initial_user_preferences;
    use crate::services::local_storage::utils::sign_message_w_key;
    use crate::services::local_storage::{
        encrypted_data::drop_encrypted_data_table, persistent_storage::delete_user_preferences,
    };
    use crate::services::record_handling::transfer::transfer_raw;

    use avail_common::models::encrypted_data::EncryptedDataTypeCommon;
    use avail_common::{models::constants::*, models::encrypted_data::EventTypeCommon};
    use snarkvm::prelude::{Address, FromStr, Identifier, PrivateKey, Testnet3, ViewKey};

    use crate::services::account::generation::import_wallet;

    /*
    #[tokio::test]
    async fn test_setup_prerequisites() {
        let pk = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();

        drop_encrypted_data_table().unwrap();
        delete_user_preferences().unwrap();
        // initialize the user preferences

        import_wallet(
            Some("Satoshi".to_string()),
            STRONG_PASSWORD.to_string(),
            false,
            &pk.to_string(),
            false,
            Languages::English,
        )
        .await
        .unwrap();

        let address = get_address::<Testnet3>().unwrap();

        let request = TransferRequest::new(
            address.to_string(),
            10000000,
            Some("Private Transfer Test".to_string()),
            Some(STRONG_PASSWORD.to_string()),
            TransferType::Private,
            false,
            300000,
            "credits".to_string(),
        );

        transfer_raw::<Testnet3>(request, None).await.unwrap();
    }
    */

    #[cfg(target_os = "linux")]
    #[tokio::test]
    async fn test_setup_prerequisites_linux() {
        let pk = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();
        let ext = Identifier::<Testnet3>::from_str("test").unwrap();
        let linux_key_controller = linuxKeyController {};
        linux_key_controller
            .delete_key(Some(STRONG_PASSWORD), ext)
            .unwrap();

        delete_all_server_storage().await.unwrap();
        drop_encrypted_data_table().unwrap();

        delete_user_preferences().unwrap();
        // initialize the user preferences

        import_wallet_linux(
            Some("Satoshi".to_string()),
            STRONG_PASSWORD.to_string(),
            false,
            &pk.to_string(),
            false,
        )
        .await
        .unwrap();

        let address = get_address_string().unwrap();

        let request = TransferRequest::new(
            address,
            10000000,
            Some("Private Transfer Test".to_string()),
            Some(STRONG_PASSWORD.to_string()),
            TransferType::Private,
            false,
            300000,
            "credits".to_string(),
        );

        let mut window: Window;

        let _x = tauri::Builder::default().setup(|app| {
            let window_ =
                tauri::WindowBuilder::new(app, "test", tauri::WindowUrl::App("index.html".into()))
                    .build()
                    .unwrap();
            window = window_;
            Ok(())
        });

        transfer(request, window).await.unwrap();
    }

    #[cfg(target_os = "windows")]
    #[tokio::test]
    async fn test_setup_prerequisites_windows() {
        let pk = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();

        drop_encrypted_data_table().unwrap();

        delete_user_preferences().unwrap();
        // initialize the user preferences

        import_wallet_windows(
            Some("Satoshi".to_string()),
            STRONG_PASSWORD.to_string(),
            false,
            &pk.to_string(),
            false,
        )
        .await
        .unwrap();

        let address = get_address_string().unwrap();

        let request = TransferRequest::new(
            address,
            10000000,
            Some("Private Transfer Test".to_string()),
            Some(STRONG_PASSWORD.to_string()),
            TransferType::Private,
            false,
            300000,
            "credits".to_string(),
        );

        let mut window: Window;

        let _x = tauri::Builder::default().setup(|app| {
            let window_ =
                tauri::WindowBuilder::new(app, "test", tauri::WindowUrl::App("index.html".into()))
                    .build()
                    .unwrap();
            window = window_;
            Ok(())
        });

        transfer(request, window).await.unwrap();
    }

    #[cfg(target_os = "android")]
    #[tokio::test]
    async fn test_setup_prerequisites_android() {
        let pk = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();

        drop_encrypted_data_table().unwrap();

        delete_user_preferences().unwrap();
        // initialize the user preferences

        import_wallet_android(
            Some("Satoshi".to_string()),
            STRONG_PASSWORD.to_string(),
            false,
            &pk.to_string(),
            false,
        )
        .await
        .unwrap();

        let address = get_address_string().unwrap();

        let request = TransferRequest::new(
            address,
            10000000,
            Some("Private Transfer Test".to_string()),
            Some(STRONG_PASSWORD.to_string()),
            TransferType::Private,
            false,
            300000,
            "credits".to_string(),
        );

        let mut window: Window;

        let _x = tauri::Builder::default().setup(|app| {
            let window_ =
                tauri::WindowBuilder::new(app, "test", tauri::WindowUrl::App("index.html".into()))
                    .build()
                    .unwrap();
            window = window_;
            Ok(())
        });

        transfer(request, window).await.unwrap();
    }

    #[cfg(target_os = "ios")]
    #[tokio::test]
    async fn test_setup_prerequisites_ios() {
        let pk = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();

        drop_encrypted_data_table().unwrap();

        delete_user_preferences().unwrap();
        // initialize the user preferences

        import_wallet_ios(
            Some("Satoshi".to_string()),
            STRONG_PASSWORD.to_string(),
            false,
            &pk.to_string(),
            false,
        )
        .await
        .unwrap();

        let address = get_address_string().unwrap();

        let request = TransferRequest::new(
            address,
            10000000,
            Some("Private Transfer Test".to_string()),
            Some(STRONG_PASSWORD.to_string()),
            TransferType::Private,
            false,
            300000,
            "credits".to_string(),
        );

        let mut window: Window;

        let _x = tauri::Builder::default().setup(|app| {
            let window_ =
                tauri::WindowBuilder::new(app, "test", tauri::WindowUrl::App("index.html".into()))
                    .build()
                    .unwrap();
            window = window_;
            Ok(())
        });

        transfer(request, window).await.unwrap();
    }

    fn test_setup_prerequisites() -> PrivateKey<Testnet3> {
        // no records transferred as set up.
        let pk = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();
        let view_key = ViewKey::<Testnet3>::try_from(&pk).unwrap();

        drop_encrypted_data_table().unwrap();

        delete_user_preferences().unwrap();
        // initialize the user preferences
        initial_user_preferences(
            false,
            None,
            None,
            false,
            false,
            view_key.to_address().to_string(),
            Languages::English,
        )
        .unwrap();

        initialize_encrypted_data_table().unwrap();

        VIEWSESSION.set_view_session(&view_key.to_string()).unwrap();

        return pk;
    }

    #[test]
    fn test_get_balance() {
        //change to what os you are testing on
        //test_setup_prerequisites_mac();
        VIEWSESSION
            .set_view_session("AViewKey1pViDeDV8dT1yTCdzU6ojxh8GdFDadSasRpk6mZdyz8mh")
            .unwrap();

        println!(
            " <<<<<<<<<<<<<< Testing get_balance() fn in Wallet Connect Rust API >>>>>>>>>>>>>>>"
        );
        let request = BalanceRequest::new(Some("credits"), None);
        let res = get_balance(request).unwrap();
        println!("res: {:?}", res);
    }

    #[test]
    fn test_get_records() {
        test_setup_prerequisites();

        println!(
            " <<<<<<<<<<<<<< Testing get_records() fn in Wallet Connect Rust API >>>>>>>>>>>>>>>"
        );
        let records_filter = RecordsFilter::new(
            vec!["credits.aleo".to_string()],
            None,
            RecordFilterType::All,
            Some("credits.record".to_string()),
        );

        let request = GetRecordsRequest::new(None, Some(records_filter), None);
        let (res, _page_count) = get_records_raw::<Testnet3>(request).unwrap();
        // println!("res: {:?}", res);

        println!("page_count: {:?}", _page_count);

        for value in res.into_iter() {
            println!("res: {:?}", value);
        }
    }

    #[tokio::test]
    async fn test_request_create_event() {
        println!(" <<<<<<<<<<<<<<< Testing request_create_event() fn in Wallet Connect Rust API >>>>>>>>>>>>>>>");
        /* -- Has to be called here cause has to await-- */
        let pk = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();
        let ext = Identifier::<Testnet3>::from_str("test").unwrap();

        let key_controller = {
            #[cfg(target_os = "linux")]
            {
                linuxKeyController {}
            }

            #[cfg(target_os = "macos")]
            {
                macKeyController {}
            }

            #[cfg(target_os = "windows")]
            {
                windowsKeyController {}
            }
        };

        key_controller
            .delete_key(Some(STRONG_PASSWORD), ext)
            .unwrap();

        delete_all_server_storage().await.unwrap();
        drop_encrypted_data_table().unwrap();

        delete_user_preferences().unwrap();
        // initialize the user preferences

        import_wallet(
            Some("Satoshi".to_string()),
            STRONG_PASSWORD.to_string(),
            false,
            &pk.to_string(),
            false,
            Languages::English,
        )
        .await
        .unwrap();

        let address = get_address::<Testnet3>().unwrap();

        let request = TransferRequest::new(
            address.to_string(),
            10000000,
            Some("Private Transfer Test".to_string()),
            Some(STRONG_PASSWORD.to_string()),
            TransferType::Private,
            false,
            300000,
            "credits".to_string(),
        );

        transfer_raw::<Testnet3>(request, None).await.unwrap();
        /* --SETUP COMPLETE */

        let recipient = Address::<Testnet3>::from_str(TESTNET3_ADDRESS).unwrap();
        let (record, _, _) = find_aleo_credits_record_to_spend::<Testnet3>(&10000, vec![]).unwrap();

        let program_id: &str = "credits.aleo";
        let function_id: &str = "transfer_private";
        let fee = 300000u64;
        let inputs: Vec<String> = [
            record.to_string(),
            recipient.to_string(),
            "10000u64".to_string(),
        ]
        .to_vec();

        let request = CreateEventRequest::new(
            None,
            EventTypeCommon::Execute,
            program_id.to_string(),
            function_id.to_string(),
            fee as f64 / 1000000.0,
            inputs,
        );

        PASS.set_pass_session(STRONG_PASSWORD).unwrap();

        let result_create_event =
            request_create_event_raw::<Testnet3, AleoV0>(request, false, None)
                .await
                .unwrap();
        println!("res: {:?}", result_create_event);
    }

    #[test]
    fn test_decrypt() {
        println!(
            " <<<<<<<<<<<<<<< Testing decrypt() fn in Wallet Connect Rust API >>>>>>>>>>>>>>>"
        );

        test_setup_prerequisites();

        let records_filter = RecordsFilter::new(
            vec!["credits.aleo".to_string()],
            None,
            RecordFilterType::Unspent,
            Some("credits.record".to_string()),
        );

        let request = GetRecordsRequest::new(None, Some(records_filter), None);
        let (res, _page_count) = get_records_raw::<Testnet3>(request).unwrap();

        let mut ciphertexts: Vec<String> = vec![];

        for value in res.into_iter() {
            ciphertexts.push(value.record.ciphertext);
        }

        let request = DecryptRequest::new(ciphertexts);
        let res = decrypt_records(request).unwrap();

        println!("Result: {:?}", res);
    }

    #[test]
    fn get_events_test() {
        println!(
            " <<<<<<<<<<<<<<< Testing get_events() fn in Wallet Connect Rust API >>>>>>>>>>>>>>>"
        );

        test_setup_prerequisites();

        VIEWSESSION
            .set_view_session("AViewKey1pViDeDV8dT1yTCdzU6ojxh8GdFDadSasRpk6mZdyz8mh")
            .unwrap();

        let request = GetEventsRequest {
            filter: None,
            page: None,
        };

        let res = get_events(request).unwrap();

        println!("Result: {:?}", res);
    }

    #[test]
    fn get_event_test() {
        println!(
            " <<<<<<<<<<<<<<< Testing get_event() fn in Wallet Connect Rust API >>>>>>>>>>>>>>>"
        );

        test_setup_prerequisites();

        let encrypted_transaction =
            get_encrypted_data_by_flavour(EncryptedDataTypeCommon::Transaction).unwrap();

        let request = GetEventRequest {
            id: encrypted_transaction[0].id.unwrap().to_string(),
            address: None,
        };

        let res = get_event(request).unwrap();

        println!("Result: {:?}", res);
    }

    #[test]
    fn test_verify_signature() {
        let pk = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();

        let message = "Hello World";

        let (signature, _) = sign_message_w_key::<Testnet3>(message, &pk).unwrap();

        let address = Address::<Testnet3>::try_from(&pk).unwrap();

        let res = verify(message, &address.to_string(), &signature.to_string()).unwrap();

        assert_eq!(res, true);
    }

    #[test]
    fn test_fee_f64() {
        let fee = 0.3;
        let fee = (fee * 1000000.0) as u64;
        println!("fee: {:?}", fee);

        let fee_x = 300000u64;
        //divide fee_x in a way that it becomes 0.3
        let fee_x = (fee_x as f64) / 1000000.0;
        println!("fee_x: {:?}", fee_x);
    }
}
