use chrono::{DateTime, Local};

use dirs;
use snarkvm::{ledger::transactions::ConfirmedTransaction, prelude::*};
use tauri::{Manager, Window};
use tauri_plugin_http::reqwest;

use std::fs;
use std::{ops::Add, str::FromStr};
use tokio::time::{Duration, Instant};

use crate::api::aleo_client::setup_client;
use crate::services::local_storage::encrypted_data::update_encrypted_transaction_state_by_id;
use crate::{
    helpers::utils::get_timestamp_from_i64,
    services::authentication::session::get_session_after_creation,
    services::local_storage::storage_api::records::update_record_spent_local,
};

use crate::models::{pointers::transaction::TransactionPointer, transfer::TransferRequest};

use avail_common::{
    aleo_tools::program_manager::{ProgramManager, TransferType},
    errors::{AvailError, AvailErrorType, AvailResult},
    models::{
        encrypted_data::{EventTypeCommon, TransactionState},
        network::SupportedNetworks,
    },
};

use crate::services::local_storage::{
    persistent_storage::{get_address, get_network},
    session::password::PASS,
    utils::get_private_key,
};

use super::records::*;
use super::utils::{get_address_from_recipient, handle_encrypted_storage_and_message};

/// Generic ARC20 token transfer function
#[tauri::command(rename_all = "snake_case")]
pub async fn transfer(request: TransferRequest, window: Window) -> AvailResult<String> {
    let network = get_network()?;

    let transfer_task_res = match SupportedNetworks::from_str(&network)? {
        SupportedNetworks::Testnet3 => {
            tokio::task::spawn_blocking(move || transfer_raw::<Testnet3>(request, Some(window)))
                .await?
        }
        _ => {
            tokio::task::spawn_blocking(move || transfer_raw::<Testnet3>(request, Some(window)))
                .await?
        }
    }
    .await?;

    PASS.extend_session()?;

    Ok(format!("Transaction '{}' Successful", transfer_task_res))
}

pub async fn transfer_raw<N: Network>(
    request: TransferRequest,
    window: Option<Window>,
) -> AvailResult<String> {
    match request.transfer_type() {
        TransferType::Private => {
            transfer_private_util::<N>(
                request.asset_id().as_str(),
                request.amount(),
                request.fee(),
                request.fee_private(),
                request.message().clone(),
                request.recipient().as_str(),
                request.password().clone(),
                window,
            )
            .await
        }
        TransferType::PublicToPrivate => {
            transfer_public_to_private_util::<N>(
                request.asset_id().as_str(),
                request.amount(),
                request.fee(),
                request.fee_private(),
                request.message().clone(),
                request.recipient().as_str(),
                request.password().clone(),
                window,
            )
            .await
        }
        TransferType::PrivateToPublic => {
            transfer_private_to_public_util::<N>(
                request.asset_id().as_str(),
                request.amount(),
                request.fee(),
                request.fee_private(),
                request.message().clone(),
                request.recipient().as_str(),
                request.password().clone(),
                window,
            )
            .await
        }
        TransferType::Public => {
            transfer_public::<N>(
                request.asset_id().as_str(),
                request.amount(),
                request.fee(),
                request.fee_private(),
                request.message().clone(),
                request.recipient().as_str(),
                request.password().clone(),
                window,
            )
            .await
        }
    }
}

/// Transfer tokens privately
async fn transfer_private_util<N: Network>(
    asset_id: &str,
    amount: &u64,
    fee: &u64,
    fee_private: &bool,
    message: Option<String>,
    to: &str,
    password: Option<String>,
    window: Option<Window>,
) -> AvailResult<String> {
    let api_client = setup_client::<N>()?;

    let sender_address = get_address::<N>()?;

    let private_key = get_private_key::<N>(password)?;

    //extend session auth
    let _session_task = get_session_after_creation::<N>(&private_key).await?;

    let recipient = get_address_from_recipient::<N>(to).await?;
    let mut record_nonces: Vec<String> = vec![];

    let program_manager =
        ProgramManager::<N>::new(Some(private_key), None, Some(api_client.clone()), None).unwrap();

    // get required records if private tx
    let (token_record, _token_commitment, token_id) =
        find_tokens_to_spend::<N>(asset_id, amount, vec![])?;
    let token_nonce = token_record.nonce().to_string();
    record_nonces.push(token_nonce);

    let (fee_record, _fee_commitment, fee_id) = match fee_private {
        true => {
            let (fee_record, _fee_commitment, fee_id) =
                find_aleo_credits_record_to_spend::<N>(fee, vec![])?;
            let fee_nonce = fee_record.nonce().to_string();
            record_nonces.push(fee_nonce);
            (Some(fee_record), Some(_fee_commitment), Some(fee_id))
        }
        false => (None, None, None),
    };

    let program_id = format!("{}.aleo", asset_id);

    let mut pending_transaction = TransactionPointer::<N>::new(
        Some(to.to_string()),
        None,
        TransactionState::Processing,
        None,
        Some(program_id.clone()),
        Some("transfer_private".to_string()),
        vec![],
        record_nonces,
        Local::now(),
        None,
        message,
        EventTypeCommon::Send,
        Some(*amount as f64 / 1000000.0),
        Some(*fee as f64 / 1000000.0),
        None,
    );

    let pending_tx_id = pending_transaction.encrypt_and_store(sender_address)?;

    if let Some(window) = window.clone() {
        match window.emit("tx_state_change", &pending_tx_id) {
            Ok(_) => {}
            Err(e) => {
                return Err(AvailError::new(
                    AvailErrorType::Internal,
                    "Error emitting tx_state_change event".to_string(),
                    "Error emitting transaction state".to_string(),
                ));
            }
        };
    };

    let amount = amount.to_owned();
    let fee = fee.to_owned();

    // update spent states
    update_record_spent_local::<N>(&token_id, true)?;
    if let Some(fee_id) = fee_id.clone() {
        update_record_spent_local::<N>(&fee_id, true)?;
    }

    if let Some(window) = window.clone() {
        match window.emit("tx_in_progress_notification", "") {
            Ok(_) => {}
            Err(e) => {
                return Err(AvailError::new(
                    AvailErrorType::Internal,
                    "Error emitting tx_in_progress_notification event".to_string(),
                    "Error emitting tx notification event".to_string(),
                ));
            }
        };
    };

    let transaction_id = match program_manager.transfer(
        amount,
        fee,
        recipient,
        TransferType::Private,
        None,
        Some(token_record),
        fee_record.clone(),
        &program_id,
    ) {
        Ok(tx_id) => tx_id,
        Err(e) => {
            println!("{:?}", e);
            update_record_spent_local::<N>(&token_id, false)?;

            if let Some(fee_id) = fee_id {
                update_record_spent_local::<N>(&fee_id, false)?;
            }

            pending_transaction.update_failed_transaction(
                "Transaction execution failed, no records were spent.".to_string(),
                None,
            );

            let encrypted_failed_transaction =
                pending_transaction.to_encrypted_data(sender_address)?;

            update_encrypted_transaction_state_by_id(
                &pending_tx_id,
                &encrypted_failed_transaction.ciphertext,
                &encrypted_failed_transaction.nonce,
                TransactionState::Failed,
            )?;

            if let Some(window) = window.clone() {
                match window.emit("tx_state_change", &pending_tx_id) {
                    Ok(_) => {}
                    Err(e) => {
                        return Err(AvailError::new(
                            AvailErrorType::Internal,
                            "Error emitting tx_state_change event".to_string(),
                            "Error emitting transaction state".to_string(),
                        ));
                    }
                };
            };

            return Err(AvailError::new(
                AvailErrorType::Internal,
                "Error transferring tokens".to_string(),
                format!("Error transferring tokens: {:?}", e),
            ));
        }
    };

    let encrypted_message_task = tokio::spawn(async move {
        handle_encrypted_storage_and_message(
            transaction_id,
            recipient,
            &pending_tx_id,
            Some(token_id),
            fee_id,
            false,
            window,
        )
        .await
    });

    match encrypted_message_task.await? {
        Ok(_) => {}
        Err(e) => return Err(e),
    };

    Ok(format!("Transaction Id {}", transaction_id))
}

/// Convert public tokens to private tokens
async fn transfer_public_to_private_util<N: Network>(
    asset_id: &str,
    amount: &u64,
    fee: &u64,
    fee_private: &bool,
    message: Option<String>,
    to: &str,
    password: Option<String>,
    window: Option<Window>,
) -> AvailResult<String> {
    let api_client = setup_client::<N>()?;
    let sender_address = get_address::<N>()?;
    let private_key = get_private_key::<N>(password)?;

    //extend session auth
    let _session_task = get_session_after_creation::<N>(&private_key).await?;
    let recipient = get_address_from_recipient::<N>(to).await?;
    let mut record_nonces: Vec<String> = vec![];

    let program_manager =
        ProgramManager::<N>::new(Some(private_key), None, Some(api_client.clone()), None)?;

    let program_id = format!("{}.aleo", asset_id);

    //get required records if private fee
    let (fee_record, _fee_commitment, fee_id) = match fee_private {
        true => {
            let (fee_record, _fee_commitment, fee_id) =
                find_aleo_credits_record_to_spend::<N>(fee, vec![])?;

            let fee_nonce = fee_record.nonce().to_string();
            record_nonces.push(fee_nonce);

            update_record_spent_local::<N>(&fee_id, true)?;
            (Some(fee_record), Some(_fee_commitment), Some(fee_id))
        }
        false => (None, None, None),
    };

    let mut pending_transaction = TransactionPointer::<N>::new(
        Some(to.to_string()),
        None,
        TransactionState::Processing,
        None,
        Some(program_id.clone()),
        Some("transfer_public_to_private".to_string()),
        vec![],
        record_nonces,
        Local::now(),
        None,
        message,
        EventTypeCommon::Send,
        Some(*amount as f64 / 1000000.0),
        Some(*fee as f64 / 1000000.0),
        None,
    );

    let pending_tx_id = pending_transaction.encrypt_and_store(sender_address)?;

    if let Some(window) = window.clone() {
        match window.emit("tx_state_change", &pending_tx_id) {
            Ok(_) => {}
            Err(e) => {
                return Err(AvailError::new(
                    AvailErrorType::Internal,
                    "Error emitting tx_state_change event".to_string(),
                    "Error emitting transaction state".to_string(),
                ));
            }
        }
    };

    // update spent states
    if let Some(fee_id) = fee_id.clone() {
        update_record_spent_local::<N>(&fee_id, true)?;
    }

    if let Some(window) = window.clone() {
        match window.emit("tx_in_progress_notification", "") {
            Ok(_) => {}
            Err(e) => {
                return Err(AvailError::new(
                    AvailErrorType::Internal,
                    "Error emitting tx_in_progress_notification event".to_string(),
                    "Error emitting tx notification event".to_string(),
                ));
            }
        };
    };

    let transaction_id = match program_manager.transfer(
        amount.to_owned(),
        fee.to_owned(),
        recipient,
        TransferType::PublicToPrivate,
        None,
        None,
        fee_record.clone(),
        &program_id,
    ) {
        Ok(tx_id) => tx_id,
        Err(e) => {
            if let Some(fee_id) = fee_id {
                update_record_spent_local::<N>(&fee_id, false)?;
            }

            pending_transaction.update_failed_transaction(
                "Transaction execution failed, no records were spent.".to_string(),
                None,
            );

            let encrypted_failed_transaction =
                pending_transaction.to_encrypted_data(sender_address)?;

            update_encrypted_transaction_state_by_id(
                &pending_tx_id,
                &encrypted_failed_transaction.ciphertext,
                &encrypted_failed_transaction.nonce,
                TransactionState::Failed,
            )?;

            if let Some(window) = window.clone() {
                match window.emit("tx_state_change", &pending_tx_id) {
                    Ok(_) => {}
                    Err(e) => {
                        return Err(AvailError::new(
                            AvailErrorType::Internal,
                            "Error emitting tx_state_change event".to_string(),
                            "Error emitting transaction state".to_string(),
                        ));
                    }
                };
            };

            return Err(AvailError::new(
                AvailErrorType::Internal,
                "Error transferring tokens".to_string(),
                format!("Error transferring tokens: {:?}", e),
            ));
        }
    };

    handle_encrypted_storage_and_message(
        transaction_id,
        recipient,
        &pending_tx_id,
        None,
        fee_id,
        false,
        window,
    )
    .await?;

    Ok(format!("Transaction Id {}", transaction_id.to_string()))
}

/// Convert private tokens to public tokens
async fn transfer_private_to_public_util<N: Network>(
    asset_id: &str,
    amount: &u64,
    fee: &u64,
    fee_private: &bool,
    message: Option<String>,
    to: &str,
    password: Option<String>,
    window: Option<Window>,
) -> AvailResult<String> {
    let api_client = setup_client::<N>()?;
    let sender_address = get_address::<N>()?;
    let private_key = get_private_key::<N>(password)?;

    //extend session auth
    let _session_task = get_session_after_creation::<N>(&private_key).await?;
    let recipient = get_address_from_recipient::<N>(to).await?;
    let mut record_nonces: Vec<String> = vec![];

    let program_manager =
        ProgramManager::<N>::new(Some(private_key), None, Some(api_client.clone()), None).unwrap();

    // get required records if private tx
    let (token_record, _token_commitment, token_id) =
        find_tokens_to_spend::<N>(asset_id, amount, vec![])?;
    let token_nonce = token_record.nonce().to_string();
    record_nonces.push(token_nonce);

    let (fee_record, _fee_commitment, fee_id) = match fee_private {
        true => {
            let (fee_record, _fee_commitment, fee_id) =
                find_aleo_credits_record_to_spend::<N>(fee, vec![])?;

            let fee_nonce = fee_record.nonce().to_string();
            record_nonces.push(fee_nonce);

            update_record_spent_local::<N>(&fee_id, true)?;
            (Some(fee_record), Some(_fee_commitment), Some(fee_id))
        }
        false => (None, None, None),
    };

    let program_id = format!("{}.aleo", asset_id);

    let mut pending_transaction = TransactionPointer::<N>::new(
        Some(to.to_string()),
        None,
        TransactionState::Processing,
        None,
        Some(program_id.clone()),
        Some("transfer_private_to_public".to_string()),
        vec![],
        record_nonces,
        Local::now(),
        None,
        message,
        EventTypeCommon::Send,
        Some(*amount as f64 / 1000000.0),
        Some(*fee as f64 / 1000000.0),
        None,
    );

    let pending_tx_id = pending_transaction.encrypt_and_store(sender_address)?;

    if let Some(window) = window.clone() {
        match window.emit("tx_state_change", &pending_tx_id) {
            Ok(_) => {}
            Err(e) => {
                return Err(AvailError::new(
                    AvailErrorType::Internal,
                    "Error emitting tx_state_change event".to_string(),
                    "Error emitting transaction state".to_string(),
                ));
            }
        };
    };

    // update spent states
    update_record_spent_local::<N>(&token_id, true)?;
    if let Some(fee_id) = fee_id.clone() {
        update_record_spent_local::<N>(&fee_id, true)?;
    }

    if let Some(window) = window.clone() {
        match window.emit("tx_in_progress_notification", "") {
            Ok(_) => {}
            Err(e) => {
                return Err(AvailError::new(
                    AvailErrorType::Internal,
                    "Error emitting tx_in_progress_notification event".to_string(),
                    "Error emitting tx notification event".to_string(),
                ));
            }
        };
    };

    let transfer_res = match program_manager.transfer(
        amount.to_owned(),
        fee.to_owned(),
        recipient,
        TransferType::PrivateToPublic,
        None,
        Some(token_record.clone()),
        fee_record.clone(),
        &program_id,
    ) {
        Ok(tx_id) => tx_id,
        Err(e) => {
            update_record_spent_local::<N>(&token_id, false)?;

            if let Some(fee_id) = fee_id {
                update_record_spent_local::<N>(&fee_id, false)?;
            }

            pending_transaction.update_failed_transaction(
                "Transaction execution failed, no records were spent.".to_string(),
                None,
            );

            let encrypted_failed_transaction =
                pending_transaction.to_encrypted_data(sender_address)?;

            update_encrypted_transaction_state_by_id(
                &pending_tx_id,
                &encrypted_failed_transaction.ciphertext,
                &encrypted_failed_transaction.nonce,
                TransactionState::Failed,
            )?;

            if let Some(window) = window.clone() {
                match window.emit("tx_state_change", &pending_tx_id) {
                    Ok(_) => {}
                    Err(e) => {
                        return Err(AvailError::new(
                            AvailErrorType::Internal,
                            "Error emitting tx_state_change event".to_string(),
                            "Error emitting transaction state".to_string(),
                        ));
                    }
                };
            };

            return Err(AvailError::new(
                AvailErrorType::Internal,
                "Error transferring tokens".to_string(),
                format!("Error transferring tokens: {:?}", e),
            ));
        }
    };

    handle_encrypted_storage_and_message(
        transfer_res,
        recipient,
        &pending_tx_id,
        Some(token_id),
        fee_id,
        false,
        window,
    )
    .await?;

    Ok(format!("Transaction Id {}", transfer_res))
}

// Transfer tokens publicly
async fn transfer_public<N: Network>(
    asset_id: &str,
    amount: &u64,
    fee: &u64,
    fee_private: &bool,
    message: Option<String>,
    to: &str,
    password: Option<String>,
    window: Option<Window>,
) -> AvailResult<String> {
    let api_client = setup_client::<N>()?;
    let sender_address = get_address::<N>()?;
    let private_key = get_private_key::<N>(password)?;

    //extend session auth
    get_session_after_creation::<N>(&private_key).await?;
    let recipient = get_address_from_recipient::<N>(to).await?;

    let program_manager =
        ProgramManager::<N>::new(Some(private_key), None, Some(api_client.clone()), None)?;

    let mut record_nonces: Vec<String> = vec![];

    // get required records if private fee
    let (fee_record, _fee_commitment, fee_id) = match fee_private {
        true => {
            let (fee_record, _fee_commitment, fee_id) =
                find_aleo_credits_record_to_spend::<N>(fee, vec![])?;

            let fee_nonce = fee_record.nonce().to_string();
            record_nonces.push(fee_nonce);

            update_record_spent_local::<N>(&fee_id, true)?;
            (Some(fee_record), Some(_fee_commitment), Some(fee_id))
        }
        false => (None, None, None),
    };

    let program_id = format!("{}.aleo", asset_id);

    let mut pending_transaction = TransactionPointer::<N>::new(
        Some(to.to_string()),
        None,
        TransactionState::Processing,
        None,
        Some(program_id.clone()),
        Some("transfer_public".to_string()),
        vec![],
        record_nonces,
        Local::now(),
        None,
        message,
        EventTypeCommon::Send,
        Some(*amount as f64 / 1000000.0),
        Some(*fee as f64 / 1000000.0),
        None,
    );

    let pending_tx_id = pending_transaction.encrypt_and_store(sender_address)?;

    if let Some(window) = window.clone() {
        match window.emit("tx_state_change", &pending_tx_id) {
            Ok(_) => {}
            Err(e) => {
                return Err(AvailError::new(
                    AvailErrorType::Internal,
                    "Error emitting tx_state_change event".to_string(),
                    "Error emitting transaction state".to_string(),
                ));
            }
        };
    };

    // update spent states
    if let Some(fee_id) = fee_id.clone() {
        update_record_spent_local::<N>(&fee_id, true)?;
    }

    if let Some(window) = window.clone() {
        match window.emit("tx_in_progress_notification", "") {
            Ok(_) => {}
            Err(e) => {
                return Err(AvailError::new(
                    AvailErrorType::Internal,
                    "Error emitting tx_in_progress_notification event".to_string(),
                    "Error emitting tx notification event".to_string(),
                ));
            }
        };
    };

    let transfer_res = match program_manager.transfer(
        amount.to_owned(),
        fee.to_owned(),
        recipient,
        TransferType::Public,
        None,
        None,
        fee_record.clone(),
        &program_id,
    ) {
        Ok(tx_id) => tx_id,
        Err(e) => {
            if let Some(fee_id) = fee_id {
                update_record_spent_local::<N>(&fee_id, false)?;
            }

            pending_transaction.update_failed_transaction(
                "Transaction execution failed, no records were spent.".to_string(),
                None,
            );

            let encrypted_failed_transaction =
                pending_transaction.to_encrypted_data(sender_address)?;

            update_encrypted_transaction_state_by_id(
                &pending_tx_id,
                &encrypted_failed_transaction.ciphertext,
                &encrypted_failed_transaction.nonce,
                TransactionState::Failed,
            )?;

            if let Some(window) = window.clone() {
                match window.emit("tx_state_change", &pending_tx_id) {
                    Ok(_) => {}
                    Err(e) => {
                        return Err(AvailError::new(
                            AvailErrorType::Internal,
                            "Error emitting tx_state_change event".to_string(),
                            "Error emitting transaction state".to_string(),
                        ));
                    }
                };
            };

            return Err(AvailError::new(
                AvailErrorType::Internal,
                "Error transferring tokens".to_string(),
                format!("Error transferring tokens: {:?}", e),
            ));
        }
    };

    handle_encrypted_storage_and_message(
        transfer_res,
        recipient,
        &pending_tx_id,
        None,
        fee_id,
        false,
        window,
    )
    .await?;

    Ok(format!("Transaction Id {}", transfer_res))
}

// TODO - Add timer threshold for when to stop searching for transaction, and keep in unconfirmed state
/// Find Transaction on chain and handle state
pub fn find_confirmed_block_height<N: Network>(
    tx_id: N::TransactionID,
) -> AvailResult<(
    u32,
    Vec<Transition<N>>,
    DateTime<Local>,
    TransactionState,
    Option<N::TransactionID>,
    Option<Execution<N>>,
    Option<f64>,
)> {
    let api_client = setup_client::<N>()?;

    let latest_block_height = api_client.latest_height()?;

    let mut flag: bool = false;
    let mut iter = latest_block_height;

    let start_time = Instant::now();
    let search_duration = Duration::from_secs(180);

    println!("Waiting for transaction to confirm in block on chain");
    while !flag && start_time.elapsed() < search_duration {
        println!("Checking block {}", iter);
        let latest_height = api_client.latest_height()?;

        if iter > latest_height {
            println!("Iter > Latest Height");
            std::thread::sleep(std::time::Duration::from_secs(3));
            continue;
        }

        let block = match api_client.get_block(iter) {
            Ok(block) => {
                println!("Block {} found", iter);
                block
            }
            Err(e) => {
                println!("Error getting block: {:?}\n", e);
                std::thread::sleep(std::time::Duration::from_secs(3));
                continue;
            }
        };

        let transactions = block.transactions();

        // transactions that where in excess of the max limit of the block
        let aborted_transactions = block.aborted_transaction_ids();

        if aborted_transactions.contains(&tx_id) {
            flag = true;
            let timestamp = get_timestamp_from_i64(block.timestamp())?;
            return Ok((
                iter,
                vec![],
                timestamp,
                TransactionState::Aborted,
                None,
                None,
                None,
            ));
        }

        let tx = transactions.get(&tx_id);

        // TODO - Make it default to unconfirmed after 1 minute 30 seconds
        println!("In Progress");
        if let Some(tx) = tx {
            println!("Transaction found");
            // deduce state

            if let ConfirmedTransaction::<N>::AcceptedDeploy(_, _, _) = tx {
                flag = true;
                let timestamp = get_timestamp_from_i64(block.timestamp())?;
                let fee = tx.transaction().fee_amount()?;
                let mut transitions: Vec<Transition<N>> = vec![];

                if let Some(fee_transition) = tx.transaction().fee_transition() {
                    let transition = fee_transition.transition();
                    transitions.push(transition.clone());
                }

                return Ok((
                    iter,
                    transitions,
                    timestamp,
                    TransactionState::Aborted,
                    None,
                    None,
                    Some(*fee as f64 / 1000000.0),
                ));
            } else if let ConfirmedTransaction::<N>::AcceptedExecute(_, _, _) = tx {
                flag = true;
                println!("C1");
                let timestamp = get_timestamp_from_i64(block.timestamp())?;
                println!("C2");
                let fee = tx.transaction().fee_amount()?;
                println!("C3");

                let transitions = tx.transitions().cloned().collect::<Vec<_>>();
                println!("C4");
                return Ok((
                    iter,
                    transitions,
                    timestamp,
                    TransactionState::Confirmed,
                    None,
                    None,
                    Some(*fee as f64 / 1000000.0),
                ));
            }
        } else {
            for tx in transactions.iter() {
                if let ConfirmedTransaction::<N>::RejectedDeploy(_, fee_tx, _, _) = tx {
                    if tx.to_unconfirmed_transaction_id()? == tx_id {
                        flag = true;
                        let timestamp = get_timestamp_from_i64(block.timestamp())?;
                        let fee = tx.transaction().fee_amount()?;

                        let mut transitions: Vec<Transition<N>> = vec![];

                        if let Some(fee_transition) = tx.transaction().fee_transition() {
                            let transition = fee_transition.transition();
                            transitions.push(transition.clone());
                        }

                        return Ok((
                            iter,
                            transitions,
                            timestamp,
                            TransactionState::Rejected,
                            Some(fee_tx.id()),
                            None,
                            Some(*fee as f64 / 1000000.0),
                        ));
                    }
                } else if let ConfirmedTransaction::<N>::RejectedExecute(
                    _,
                    fee_tx,
                    rejected_execution,
                    _,
                ) = tx
                {
                    if tx.to_unconfirmed_transaction_id()? == tx_id {
                        flag = true;
                        let timestamp = get_timestamp_from_i64(block.timestamp())?;
                        let fee = tx.transaction().fee_amount()?;
                        let transitions = tx.transitions().cloned().collect::<Vec<_>>();
                        if let Some(rejected_execution) = rejected_execution.execution() {
                            return Ok((
                                iter,
                                transitions,
                                timestamp,
                                TransactionState::Rejected,
                                Some(fee_tx.id()),
                                Some(rejected_execution.to_owned()),
                                Some(*fee as f64 / 1000000.0),
                            ));
                        }

                        return Ok((
                            iter,
                            transitions,
                            timestamp,
                            TransactionState::Rejected,
                            Some(fee_tx.id()),
                            None,
                            Some(*fee as f64 / 1000000.0),
                        ));
                    }
                }
            }
        }

        iter = iter.add(1);
        std::thread::sleep(std::time::Duration::from_secs(7));
    }

    Err(AvailError::new(
        AvailErrorType::NotFound,
        "Transaction is unconfirmed, this might be due to issues with the Aleo network."
            .to_string(),
        "Transaction is unconfirmed, this might be due to issues with the Aleo network."
            .to_string(),
    ))
}

#[tauri::command(rename_all = "snake_case")]
pub async fn pre_install_inclusion_prover() -> AvailResult<()> {
    let path = match dirs::home_dir() {
        Some(home_dir) => home_dir
            .join(".aleo")
            .join("resources")
            .join("inclusion.prover.cd85cc5"),

        None => {
            return Err(AvailError::new(
                AvailErrorType::Internal,
                "Error getting home directory".to_string(),
                "Error getting home directory".to_string(),
            ))
        }
    };

    if path.as_path().exists() {
        println!("inclusion.prover.cd85cc5 already exists");
        Ok(())
    } else {
        let client = reqwest::Client::new();

        println!("Downloading inclusion.prover.cd85cc5...");

        let task = tokio::spawn(async move {
            client
                .get("https://s3-us-west-1.amazonaws.com/aleo-resources/inclusion.prover.cd85cc5")
                .send()
                .await
        });

        let res = match task.await? {
            Ok(res) => res,
            Err(e) => {
                return Err(AvailError::new(
                    AvailErrorType::Internal,
                    "Error downloading inclusion.prover.cd85cc5".to_string(),
                    format!("Error downloading inclusion.prover.cd85cc5: {:?}", e),
                ))
            }
        };

        println!("Finished downloading inclusion.prover.cd85cc5...");

        let body = res.bytes().await?;

        fs::write(path, body)?;

        println!("Finished writing inclusion.prover.cd85cc5...");

        Ok(())
    }
}

#[cfg(test)]
mod transfer_tests {

    use crate::{api::aleo_client::setup_local_client, models::{
        storage::languages::Languages,
        wallet_connect::{get_event::GetEventsRequest, records::GetRecordsRequest},
    }};

    use crate::services::account::generation::import_wallet;
    use crate::services::account::key_management::key_controller::KeyController;
    use crate::services::local_storage::session::view::VIEWSESSION;
    use crate::services::local_storage::{
        encrypted_data::drop_encrypted_data_table,
        persistent_storage::{delete_user_preferences, update_address},
        storage_api::{event::get_avail_events_raw, records::get_record_pointers},
    };
    use crate::services::record_handling::sync::txs_sync;
    use avail_common::models::constants::*;

    use snarkvm::prelude::{Identifier, Testnet3};

    #[cfg(target_os = "linux")]
    use crate::services::account::key_management::key_controller::linuxKeyController;

    #[cfg(target_os = "macos")]
    use crate::services::account::key_management::key_controller::macKeyController;

    #[cfg(target_os = "windows")]
    use crate::services::account::key_management::key_controller::windowsKeyController;

    use super::*;
    async fn test_setup_prerequisites() {
        let pk = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();
        let ext = Identifier::<Testnet3>::from_str("test").unwrap();

        #[cfg(target_os = "macos")]
        let mac_key_controller = macKeyController {};
        #[cfg(target_os = "macos")]
        mac_key_controller
            .delete_key(Some(STRONG_PASSWORD), ext)
            .unwrap();

        #[cfg(target_os = "linux")]
        let linux_key_controller = linuxKeyController {};
        #[cfg(target_os = "linux")]
        linux_key_controller
            .delete_key(Some(STRONG_PASSWORD), ext)
            .unwrap();

        #[cfg(target_os = "windows")]
        let windows_key_controller = windowsKeyController {};
        #[cfg(target_os = "windows")]
        windows_key_controller
            .delete_key(Some(STRONG_PASSWORD), ext)
            .unwrap();

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
    }

    #[tokio::test]
    async fn test_private_transfer() {
        //NOTE - Don't forget to change OS depending on what you testing on -default should be linux

        /* -- Has to be called here cause has to await-- */
        let pk = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();
        let ext = Identifier::<Testnet3>::from_str("test").unwrap();

        #[cfg(target_os = "macos")]
        let mac_key_controller = macKeyController {};
        #[cfg(target_os = "macos")]
        mac_key_controller
            .delete_key(Some(STRONG_PASSWORD), ext)
            .unwrap();

        #[cfg(target_os = "linux")]
        let linux_key_controller = linuxKeyController {};
        #[cfg(target_os = "linux")]
        linux_key_controller
            .delete_key(Some(STRONG_PASSWORD), ext)
            .unwrap();

        #[cfg(target_os = "windows")]
        let windows_key_controller = windowsKeyController {};
        #[cfg(target_os = "windows")]
        windows_key_controller
            .delete_key(Some(STRONG_PASSWORD), ext)
            .unwrap();

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

        let fee = 300000u64;
        let amount = 900000u64;
        let recipient_address = Address::<Testnet3>::from_str(TESTNET_ADDRESS).unwrap();
        let asset_id = "credits".to_string();

        let request = TransferRequest::new(
            recipient_address.to_string(),
            amount,
            Some("Private Transfer Test".to_string()),
            Some(STRONG_PASSWORD.to_string()),
            TransferType::Private,
            false,
            fee,
            asset_id,
        );

        transfer_raw::<Testnet3>(request, None).await.unwrap();

        /* --SETUP COMPLETE */

        let get_records_request = GetRecordsRequest::new(None, None, None);
        let (records, ids) = get_record_pointers::<Testnet3>(get_records_request.clone()).unwrap();

        println!("Initial Records: {:?}\n", records);

        let get_events_request = GetEventsRequest {
            filter: None,
            page: None,
        };
        let events = get_avail_events_raw::<Testnet3>(get_events_request.clone()).unwrap();

        println!("Initial Events: {:?}\n", events);

        // call fee estimation
        let fee = 300000u64;
        let amount = 900000u64;
        let recipient_address = Address::<Testnet3>::from_str(TESTNET3_ADDRESS).unwrap();
        let asset_id = "credits".to_string();

        let request = TransferRequest::new(
            recipient_address.to_string(),
            amount,
            Some("Private Transfer Test".to_string()),
            Some(STRONG_PASSWORD.to_string()),
            TransferType::Private,
            false,
            fee,
            asset_id,
        );

        transfer_raw::<Testnet3>(request, None).await.unwrap();

        // get events and display
        let (records, _ids) = get_record_pointers::<Testnet3>(get_records_request.clone()).unwrap();

        println!("Post Private Transfer Sender Records: {:?}\n", records);

        let events = get_avail_events_raw::<Testnet3>(get_events_request.clone()).unwrap();

        println!("Post Private Transfer Sender Events: {:?}\n", events);

        let recipient_view_key = ViewKey::<Testnet3>::from_str(TESTNET3_VIEW_KEY).unwrap();
        let vk_bytes = recipient_view_key.to_bytes_le().unwrap();

        VIEWSESSION
            .set_view_session(&recipient_view_key.to_string())
            .unwrap();

        update_address(&recipient_address.to_string()).unwrap();

        let _res = txs_sync().await.unwrap();

        let (records, ids) = get_record_pointers::<Testnet3>(get_records_request).unwrap();

        println!("Post Private Transfer Receiver Records: {:?}\n", records);

        let events = get_avail_events_raw::<Testnet3>(get_events_request).unwrap();

        println!("Post Private Transfer Receiver Events: {:?}\n", events);
    }

    #[tokio::test]
    async fn test_transfer_public_to_private() {
        //NOTE - Don't forget to change OS depending on what you testing on -default should be linux

        /* -- Has to be called here cause has to await-- */
        let pk = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();
        let ext = Identifier::<Testnet3>::from_str("test").unwrap();

        #[cfg(target_os = "macos")]
        let mac_key_controller = macKeyController {};
        #[cfg(target_os = "macos")]
        mac_key_controller
            .delete_key(Some(STRONG_PASSWORD), ext)
            .unwrap();

        #[cfg(target_os = "linux")]
        let linux_key_controller = linuxKeyController {};
        #[cfg(target_os = "linux")]
        linux_key_controller
            .delete_key(Some(STRONG_PASSWORD), ext)
            .unwrap();

        #[cfg(target_os = "windows")]
        let windows_key_controller = windowsKeyController {};
        #[cfg(target_os = "windows")]
        windows_key_controller
            .delete_key(Some(STRONG_PASSWORD), ext)
            .unwrap();

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

        let fee = 300000u64;
        let amount = 900000u64;
        let recipient_address = Address::<Testnet3>::from_str(TESTNET3_ADDRESS).unwrap();
        let asset_id = "credits".to_string();

        let request = TransferRequest::new(
            recipient_address.to_string(),
            amount,
            Some("Public to Private Transfer Test".to_string()),
            Some(STRONG_PASSWORD.to_string()),
            TransferType::PublicToPrivate,
            false,
            fee,
            asset_id,
        );

        transfer_raw::<Testnet3>(request, None).await.unwrap();
    }

    #[tokio::test]
    async fn test_transfer_private_to_public() {
        //NOTE - Don't forget to change OS depending on what you testing on -default should be linux

        /* -- Has to be called here cause has to await-- */
        let pk = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();
        let ext = Identifier::<Testnet3>::from_str("test").unwrap();

        #[cfg(target_os = "macos")]
        let mac_key_controller = macKeyController {};
        #[cfg(target_os = "macos")]
        mac_key_controller
            .delete_key(Some(STRONG_PASSWORD), ext)
            .unwrap();

        #[cfg(target_os = "linux")]
        let linux_key_controller = linuxKeyController {};
        #[cfg(target_os = "linux")]
        linux_key_controller
            .delete_key(Some(STRONG_PASSWORD), ext)
            .unwrap();

        #[cfg(target_os = "windows")]
        let windows_key_controller = windowsKeyController {};
        #[cfg(target_os = "windows")]
        windows_key_controller
            .delete_key(Some(STRONG_PASSWORD), ext)
            .unwrap();

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

        let fee = 300000u64;
        let amount = 900000u64;
        let recipient_address = Address::<Testnet3>::from_str(TESTNET_ADDRESS).unwrap();
        let asset_id = "credits".to_string();

        let request = TransferRequest::new(
            recipient_address.to_string(),
            amount,
            Some("Public to Private Transfer Test".to_string()),
            Some(STRONG_PASSWORD.to_string()),
            TransferType::PublicToPrivate,
            false,
            fee,
            asset_id,
        );

        transfer_raw::<Testnet3>(request, None).await.unwrap();

        /* --SETUP COMPLETE */

        let fee = 4000000u64;
        let amount = 100000u64;
        let recipient_address = Address::<Testnet3>::from_str(TESTNET3_ADDRESS).unwrap();
        let asset_id = "credits".to_string();

        let request = TransferRequest::new(
            recipient_address.to_string(),
            amount,
            Some("Private to Public Transfer Test".to_string()),
            Some(STRONG_PASSWORD.to_string()),
            TransferType::PrivateToPublic,
            false,
            fee,
            asset_id,
        );

        transfer_raw::<Testnet3>(request, None).await.unwrap();
    }

    #[tokio::test]
    async fn test_transfer_public() {
        //NOTE - Don't forget to change OS depending on what you testing on -default should be linux

        /* -- Has to be called here cause has to await-- */

        let pk = PrivateKey::<Testnet3>::from_str(TESTNET3_PRIVATE_KEY).unwrap();
        let ext = Identifier::<Testnet3>::from_str("test").unwrap();

        #[cfg(target_os = "macos")]
        let mac_key_controller = macKeyController {};
        #[cfg(target_os = "macos")]
        mac_key_controller
            .delete_key(Some(STRONG_PASSWORD), ext)
            .unwrap();

        #[cfg(target_os = "linux")]
        let linux_key_controller = linuxKeyController {};
        #[cfg(target_os = "linux")]
        linux_key_controller
            .delete_key(Some(STRONG_PASSWORD), ext)
            .unwrap();

        #[cfg(target_os = "windows")]
        let windows_key_controller = windowsKeyController {};
        #[cfg(target_os = "windows")]
        windows_key_controller
            .delete_key(Some(STRONG_PASSWORD), ext)
            .unwrap();

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
        /* --SETUP COMPLETE */

        let fee = 4000000u64;
        let amount = 100000u64;
        let recipient_address = Address::<Testnet3>::from_str("").unwrap();
        let asset_id = "credits".to_string();

        let request = TransferRequest::new(
            recipient_address.to_string(),
            amount,
            Some("Public Transfer Test".to_string()),
            Some(STRONG_PASSWORD.to_string()),
            TransferType::Public,
            false,
            fee,
            asset_id,
        );

        transfer_raw::<Testnet3>(request, None).await.unwrap();
    }

    // Transfer funds to test wallet on local dev network
    #[tokio::test]
    async fn test_transfer_public_to_private_util() {
        let api_client = setup_local_client::<Testnet3>();
        let private_key = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();

        let program_manager = ProgramManager::<Testnet3>::new(
            Some(private_key),
            None,
            Some(api_client.clone()),
            None,
        )
        .unwrap();

        let program_id = format!("credits.aleo");

        let recipient = Address::<Testnet3>::from_str(
            "aleo1x2s08a2jyvd5aq29dwexqfscqrz7fgssrkhwk7ppselp2292zqfqakg7gn",
        )
        .unwrap();

        let transaction_id = program_manager
            .transfer(
                100000000,
                0,
                recipient,
                TransferType::Public,
                None,
                None,
                None,
                &program_id,
            )
            .unwrap();
    }

    #[tokio::test]
    async fn test_inclusion_prover() {
        let _res = pre_install_inclusion_prover().await;
    }
}
