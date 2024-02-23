use avail_common::models::encrypted_data::EncryptedDataTypeCommon;
use chrono::{DateTime, Local};
use snarkvm::circuit::Aleo;
use snarkvm::console::network::Testnet3;
use snarkvm::ledger::transactions::ConfirmedTransaction;
use snarkvm::prelude::{
    Address, Ciphertext, Entry, Execution, Field, GraphKey, Identifier, Itertools, Literal,
    Network, Output, Plaintext, ProgramID, Record, RecordType, Transaction, Transition, Value,
    ViewKey,
};
use snarkvm::synthesizer::program::{Command, Instruction, ProgramCore};
use snarkvm::utilities::ToBits;
use std::collections::HashMap;
use std::ops::Sub;
use std::str::FromStr;
use tauri::{Manager, Window};

use crate::api::{
    aleo_client::{setup_client, setup_local_client},
    encrypted_data::{post_encrypted_data, send_transaction_in},
    fee::{create_record, fetch_record},
    user::name_to_address,
};

use crate::helpers::validation::validate_address_bool;
use crate::models::event::EventTransition;
use crate::models::pointers::{
    deployment::DeploymentPointer,
    message::TransactionMessage,
    record::AvailRecord,
    transaction::{ExecutedTransition, TransactionPointer},
};
use crate::models::wallet_connect::balance::Balance;

use crate::models::wallet_connect::records::{GetRecordsRequest, RecordFilterType, RecordsFilter};
use crate::services::local_storage::encrypted_data::get_encrypted_data_by_flavour;
use crate::services::local_storage::tokens::{
    add_balance, get_balance, get_program_id_for_token, if_token_exists, init_token,
};
use crate::services::local_storage::{
    encrypted_data::{
        store_encrypted_data, update_encrypted_data_by_id, update_encrypted_data_synced_on_by_id,
        update_encrypted_transaction_confirmed_by_id, update_encrypted_transaction_state_by_id,
    },
    persistent_storage::{
        get_address, get_address_string, get_backup_flag, get_network, get_username,
    },
    session::view::VIEWSESSION,
    storage_api::{
        deployment::get_deployment_pointer,
        records::{
            check_if_record_exists, encrypt_and_store_records, get_record_pointers,
            update_record_spent_local, update_records_spent_backup,
        },
        transaction::get_transaction_pointer,
    },
};
use crate::services::record_handling::transfer::find_confirmed_block_height;

use avail_common::{
    aleo_tools::program_manager::{Credits, ProgramManager},
    errors::{AvailError, AvailErrorType, AvailResult},
    models::encrypted_data::{EncryptedData, EventTypeCommon, RecordTypeCommon, TransactionState},
    models::{fee_request::FeeRequest, network::SupportedNetworks},
};

use super::decrypt_transition::DecryptTransition;

/// Gets all tags from a given block height to the latest block height
pub fn get_tags<N: Network>(min_block_height: u32) -> AvailResult<Vec<String>> {
    let api_client = setup_client::<N>()?;
    let latest_height = api_client.latest_height()?;

    let step = 49;

    let mut end_height = latest_height;
    let mut start_height = latest_height.sub(step);

    let mut tags: Vec<String> = vec![];
    for _ in (min_block_height..latest_height).step_by(step as usize) {
        println!("start_height: {:?}", start_height);
        println!("end_height: {:?}", end_height);
        let blocks = api_client.get_blocks(start_height, end_height)?;

        let field_tags: Vec<_> = blocks.iter().flat_map(|block| block.tags()).collect();
        let _ = field_tags.iter().map(|tag| tags.push(tag.to_string()));

        end_height = start_height;
        start_height = start_height.saturating_sub(step);
    }

    Ok(tags)
}

/// This is to check if a record is spent or not
/// TODO: Needs to be made much faster to be included in txs_sync -> Deprecate
/// Note this is only used in txs_sync just in case the user has spent the records he is receiving already from a different wallet.
fn spent_checker<N: Network>(
    block_height: u32,
    local_tags: Vec<String>,
) -> AvailResult<(Vec<String>, Vec<String>)> {
    let api_client = setup_client::<N>()?;
    let latest_height = api_client.latest_height()?;

    let step = 49;

    let mut end_height = latest_height;
    let mut start_height = latest_height.sub(step);

    let spent_tags: Vec<String> = vec![];
    for _ in (block_height..latest_height).step_by(step as usize) {
        println!("start_height: {:?}", start_height);
        println!("end_height: {:?}", end_height);
        let blocks = api_client.get_blocks(start_height, end_height)?;

        let tags: Vec<_> = blocks.iter().flat_map(|block| block.tags()).collect();

        let tags = tags
            .iter()
            .map(|tag| tag.to_string())
            .collect::<Vec<String>>();

        //check if tags contains any of the local tags and make a vector of bools representing if the local tags are spent or not
        let mut result = vec![];
        for local_tag in local_tags.clone() {
            if tags.contains(&local_tag) {
                result.push(local_tag);
            }
        }

        // Search in reverse order from the latest block to the earliest block
        end_height = start_height;
        start_height = start_height.saturating_sub(step);
    }

    //check what local tags are not in result and add them as unspent
    let mut unspent_tags: Vec<String> = vec![];
    for local_tag in local_tags {
        if !spent_tags.contains(&local_tag) {
            unspent_tags.push(local_tag);
        }
    }

    Ok((spent_tags, unspent_tags))
}

pub fn transition_to_record<N: Network>(
    transition: &Transition<N>,
    commitment: &str,
    index: u8,
) -> AvailResult<(
    Record<N, Plaintext<N>>,
    Record<N, Ciphertext<N>>,
    HashMap<String, String>,
)> {
    let v_key = VIEWSESSION.get_instance::<N>()?;
    let output = transition.outputs();

    let record = match output.get(index as usize) {
        Some(output) => output.clone().into_record(),
        None => {
            return Err(AvailError::new(
                AvailErrorType::Internal,
                "Record not found".to_string(),
                "Record not found".to_string(),
            ))
        }
    };

    if let Some((r_commitment, record)) = record {
        if r_commitment.to_string() == commitment {
            let decrypted_record = record.decrypt(&v_key)?;
            let data_map = decrypted_record
                .data()
                .iter()
                .map(|(k, v)| (k.to_string(), v.to_string()))
                .collect::<HashMap<String, String>>();
            Ok((decrypted_record, record, data_map))
        } else {
            Err(AvailError::new(
                AvailErrorType::Internal,
                "Record not found".to_string(),
                "Record not found".to_string(),
            ))
        }
    } else {
        Err(AvailError::new(
            AvailErrorType::Internal,
            "Record not found".to_string(),
            "Record not found".to_string(),
        ))
    }
}

/// Updates spent state of records if the tag matches the transition input tag
pub fn input_spent_check<N: Network>(
    transition: &Transition<N>,
    spent: bool,
) -> AvailResult<Vec<String>> {
    let inputs = transition.inputs();

    let mut spent_ids: Vec<String> = vec![];

    let filter = RecordsFilter::new(
        vec![transition.program_id().to_string()],
        None,
        RecordFilterType::Unspent,
        None,
    );
    let get_records_request = GetRecordsRequest::new(None, Some(filter), None);
    let (record_pointers, ids) = get_record_pointers::<N>(get_records_request)?;

    for input in inputs {
        let input_tag = match input.tag() {
            Some(tag) => tag,
            None => continue,
        };

        for (record_pointer, id) in record_pointers.iter().zip(ids.iter()) {
            if &record_pointer.tag()? == input_tag {
                update_record_spent_local::<N>(id, spent)?;
                spent_ids.push(id.to_string());
            }
        }
    }

    Ok(spent_ids)
}

/// Gets record name from program using the index of the output record
pub fn get_record_name<N: Network>(
    program: ProgramCore<N, Instruction<N>, Command<N>>,
    function_id: &Identifier<N>,
    output_index: usize,
) -> AvailResult<String> {
    let function = program.get_function(function_id).unwrap();

    let output = function.outputs()[output_index].clone();

    Ok(output.value_type().to_string())
}

pub fn get_record_type<N: Network>(
    program: ProgramCore<N, Instruction<N>, Command<N>>,
    record_name: String,
    record: Record<N, Plaintext<N>>,
) -> AvailResult<RecordTypeCommon> {
    let mut token_count = 0;
    let mut nft_count = 0;

    let functions = program.functions().clone().into_keys();
    for function in functions {
        let fn_str = function.to_string();
        match fn_str.as_str() {
            _ if fn_str.contains("approve_public") => token_count = token_count + 1,
            _ if fn_str.contains("unapprove_public") => token_count = token_count + 1,
            _ if fn_str.contains("transfer_from_public") => token_count = token_count + 1,
            _ if fn_str.contains("transfer_public") => token_count = token_count + 1,
            _ if fn_str.contains("transfer") => token_count = token_count + 1,
            _ if fn_str.contains("transfer_private") => token_count = token_count + 1,
            _ if fn_str.contains("transfer_private_to_public") => token_count = token_count + 1,
            _ if fn_str.contains("transfer_public_to_private") => token_count = token_count + 1,
            _ if fn_str.contains("mint") => token_count = token_count + 1,
            _ if fn_str.contains("mint_private") => token_count = token_count + 1,
            _ if fn_str.contains("split") => token_count = token_count + 1,
            _ if fn_str.contains("join") => token_count = token_count + 1,
            _ if fn_str.contains("deposit") => token_count = token_count + 1,
            _ if fn_str.contains("withdraw") => token_count = token_count + 1,
            _ if fn_str.contains("burn") => token_count = token_count + 1,
            _ if fn_str.contains("create") => token_count = token_count + 1,
            _ if fn_str.contains("init") => token_count = token_count + 1,

            // -------- NFT --------
            _ if fn_str.contains("initialize") => nft_count = nft_count + 1,
            _ if fn_str.contains("initialize_collection") => nft_count = nft_count + 1,
            _ if fn_str.contains("add_nft") => nft_count = nft_count + 1,
            _ if fn_str.contains("admin") => nft_count = nft_count + 1,
            _ if fn_str.contains("register") => nft_count = nft_count + 1,
            _ if fn_str.contains("minting") => nft_count = nft_count + 1,
            _ if fn_str.contains("add_minter") => nft_count = nft_count + 1,
            _ if fn_str.contains("update_toggle_settings") => nft_count = nft_count + 1,
            _ if fn_str.contains("set_mint_block") => nft_count = nft_count + 1,
            _ if fn_str.contains("transfer") => nft_count = nft_count + 1,
            _ if fn_str.contains("update_symbol") => nft_count = nft_count + 1,
            _ if fn_str.contains("update_base_uri") => nft_count = nft_count + 1,
            _ if fn_str.contains("open_mint") => nft_count = nft_count + 1,
            _ if fn_str.contains("mint") => nft_count = nft_count + 1,
            _ if fn_str.contains("claim_nft") => nft_count = nft_count + 1,
            _ if fn_str.contains("claim") => nft_count = nft_count + 1,
            _ if fn_str.contains("burn_nft") => nft_count = nft_count + 1,
            _ if fn_str.contains("burn") => nft_count = nft_count + 1,
            _ => {}
        }
    }
    let mut nft_record_flag = 0;
    let mut token_record_flag = 0;
    for key in record.data().clone().into_keys() {
        match key.to_string().as_str() {
            "data" => nft_record_flag = nft_record_flag + 1,
            "edition" => nft_record_flag = nft_record_flag + 1,
            "amount" => token_record_flag = token_record_flag + 1,
            _ => {}
        }
    }
    if (token_count >= 7 && token_record_flag >= 1) {
        return Ok(RecordTypeCommon::Tokens);
    } else if (nft_count >= 8 && nft_record_flag >= 2) {
        return Ok(RecordTypeCommon::NFT);
    } else if (record_name.contains("nft") || record_name.contains("NFT")) {
        return Ok(RecordTypeCommon::NFT);
    } else if (record_name.contains("token") || record_name.contains("Token")) {
        return Ok(RecordTypeCommon::Tokens);
    } else {
        return Ok(RecordTypeCommon::None);
    }
}

/// Derives all record pointers from a transition and returns them as a vector
pub fn transition_to_record_pointer<N: Network>(
    transaction_id: N::TransactionID,
    transition: Transition<N>,
    block_height: u32,
    view_key: ViewKey<N>,
) -> AvailResult<Vec<AvailRecord<N>>> {
    let address = view_key.to_address();
    let address_x_coordinate = address.to_x_coordinate();
    let sk_tag = GraphKey::try_from(view_key)?.sk_tag();
    let api_client = setup_client::<N>()?;

    let outputs = transition.outputs();
    let mut records: Vec<AvailRecord<N>> = vec![];

    for (index, output) in outputs.iter().enumerate() {
        let record = output.clone().into_record();

        let rp = match record {
            Some((commitment, record)) => {
                match record.is_owner_with_address_x_coordinate(&view_key, &address_x_coordinate) {
                    true => {
                        let record = match record.decrypt(&view_key) {
                            Ok(record) => record,
                            Err(_) => {
                                return Err(AvailError::new(
                                    AvailErrorType::SnarkVm,
                                    "Error decrypting record".to_string(),
                                    "Error decrypting record".to_string(),
                                ))
                            }
                        };

                        match check_if_record_exists::<N>(&record.nonce().to_string())? {
                            true => continue,
                            false => {}
                        }

                        let program_id = transition.program_id();
                        let mut record_type = RecordTypeCommon::None;
                        let program = api_client.get_program(program_id)?;
                        let record_name =
                            get_record_name(program.clone(), transition.function_name(), index)?;
                        // check if its in the records table
                        if if_token_exists(&record_name.clone())? {
                            if record_name == "credits.record" {
                                record_type = RecordTypeCommon::AleoCredits;
                            } else {
                                record_type = RecordTypeCommon::Tokens;
                            }

                            let balance = get_record_type_and_amount::<N>(
                                record.clone(),
                                record_name.clone(),
                                view_key,
                            )?;
                            add_balance::<N>(
                                record_name.clone().as_str(),
                                balance.to_string().as_str(),
                                view_key,
                            )?;
                        } else {
                            record_type = match program_id.to_string().as_str() {
                                "credits.aleo" => RecordTypeCommon::AleoCredits,
                                _ => get_record_type(
                                    program.clone(),
                                    record_name.clone(),
                                    record.clone(),
                                )?,
                            };
                            if record_type == RecordTypeCommon::Tokens
                                || record_type == RecordTypeCommon::AleoCredits
                            {
                                let balance = get_record_type_and_amount::<N>(
                                    record.clone(),
                                    record_name.clone(),
                                    view_key,
                                )?;
                                init_token::<N>(
                                    record_name.clone().as_str(),
                                    &program_id.to_string(),
                                    view_key.to_address().to_string().as_str(),
                                    balance.to_string().as_str(),
                                )?;
                            }
                        }

                        let record_pointer = AvailRecord::from_record(
                            commitment,
                            &record,
                            sk_tag,
                            record_type,
                            &program_id.to_string(),
                            block_height,
                            transaction_id,
                            transition.id().to_owned(),
                            &transition.function_name().to_string(),
                            record_name,
                            index as u8,
                            &record.owner().to_string(),
                        )?;

                        let encrypted_record_pointer = record_pointer.to_encrypted_data(address)?;

                        store_encrypted_data(encrypted_record_pointer)?;
                        Some(record_pointer)
                    }
                    false => None,
                }
            }
            None => None,
        };

        if let Some(rp) = rp {
            records.push(rp);
        }
    }

    Ok(records)
}

pub fn get_record_type_and_amount<N: Network>(
    record: Record<N, Plaintext<N>>,
    record_name: String,
    view_key: ViewKey<N>,
) -> AvailResult<String> {
    if record.data().clone().is_empty() {
        Ok("0u64".to_string())
    } else {
        let mut balance = "".to_string();
        for key in record.data().clone().into_keys() {
            let is_key: bool = match key.to_string().as_str() {
                "amount" => true,
                "microcredits" => true,
                _ => false,
            };
            if is_key {
                let balance_entry = match record.data().get(&key.clone()) {
                    Some(bal) => Ok(bal),
                    None => Err(()),
                };
                let balance_u64 = match balance_entry.unwrap() {
                    Entry::Private(Plaintext::Literal(Literal::<N>::U64(amount), _)) => **amount,
                    Entry::Public(Plaintext::Literal(Literal::<N>::U64(amount), _)) => **amount,
                    Entry::Constant(Plaintext::Literal(Literal::<N>::U64(amount), _)) => **amount,
                    Entry::Private(Plaintext::Literal(Literal::<N>::U128(amount), _)) => {
                        **amount as u64
                    }
                    _ => 0u64,
                };
                balance = format!("{}u64", balance_u64.to_string());
            }
        }
        Ok(balance)
    }
}

pub fn output_to_record_pointer<N: Network>(
    transaction_id: N::TransactionID,
    transition_id: N::TransitionID,
    function_id: &Identifier<N>,
    program_id: &ProgramID<N>,
    output: &Output<N>,
    block_height: u32,
    view_key: ViewKey<N>,
    index: usize,
) -> AvailResult<(Option<AvailRecord<N>>, Option<String>)> {
    let address_x_coordinate = view_key.to_address().to_x_coordinate();
    let sk_tag = GraphKey::try_from(view_key)?.sk_tag();

    let record = output.clone().into_record();

    match record {
        Some((commitment, record)) => {
            match record.is_owner_with_address_x_coordinate(&view_key, &address_x_coordinate) {
                true => {
                    let record = match record.decrypt(&view_key) {
                        Ok(record) => record,
                        Err(_) => return Ok((None, None)),
                    };

                    match check_if_record_exists::<N>(&record.nonce().to_string())? {
                        true => return Ok((None, None)),
                        false => {}
                    }

                    let api_client = setup_client::<N>()?;
                    let program = api_client.get_program(program_id)?;
                    let record_name = get_record_name(program.clone(), function_id, index)?;
                    let mut balance = "".to_string();

                    let mut record_type = RecordTypeCommon::None;
                    if if_token_exists(&record_name.clone())? {
                        if record_name.clone() == "credits.record" {
                            record_type = RecordTypeCommon::AleoCredits;
                        } else {
                            record_type = RecordTypeCommon::Tokens;
                        }

                        balance = get_record_type_and_amount::<N>(
                            record.clone(),
                            record_name.clone(),
                            view_key,
                        )?;
                        add_balance::<N>(
                            record_name.clone().as_str(),
                            balance.to_string().as_str(),
                            view_key,
                        )?;
                    } else {
                        record_type = match program_id.to_string().as_str() {
                            "credits.aleo" => RecordTypeCommon::AleoCredits,
                            _ => get_record_type(
                                program.clone(),
                                record_name.clone(),
                                record.clone(),
                            )?,
                        };

                        if record_type == RecordTypeCommon::Tokens
                            || record_type == RecordTypeCommon::AleoCredits
                        {
                            balance = get_record_type_and_amount::<N>(
                                record.clone(),
                                record_name.clone(),
                                view_key,
                            )?;
                            init_token::<N>(
                                record_name.clone().as_str(),
                                &program_id.to_string(),
                                view_key.to_address().to_string().as_str(),
                                balance.to_string().as_str(),
                            )?;
                        }
                    }
                    let record_pointer = AvailRecord::from_record(
                        commitment,
                        &record.clone(),
                        sk_tag,
                        record_type,
                        &program_id.to_string(),
                        block_height,
                        transaction_id,
                        transition_id,
                        &function_id.to_string(),
                        record_name.clone(),
                        index as u8,
                        &record.owner().to_string(),
                    )?;

                    Ok((Some(record_pointer), Some(balance)))
                }
                false => Ok((None, None)),
            }
        }
        None => Ok((None, None)),
    }
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_all_nft_data() -> AvailResult<Vec<String>> {
    let network = get_network()?;

    match SupportedNetworks::from_str(network.as_str())? {
        SupportedNetworks::Testnet3 => {
            let nft_data = get_all_nft_raw::<Testnet3>()?;
            println!("===> NFT Data {:?}", nft_data);
            Ok(nft_data)
        }
        _ => Err(AvailError::new(
            AvailErrorType::Internal,
            "Network not supported".to_string(),
            "Network not supported".to_string(),
        )),
    }
}

pub fn get_all_nft_raw<N: Network>() -> AvailResult<Vec<String>> {
    let nft_encrypted_data =
        get_encrypted_data_by_flavour(EncryptedDataTypeCommon::Record).unwrap();

    let v_key = VIEWSESSION.get_instance::<N>().unwrap();
    let api_client = setup_client::<N>()?;
    let records = nft_encrypted_data
        .iter()
        .map(|x| {
            let encrypted_data = x.to_enrypted_struct::<N>().unwrap();
            let block: AvailRecord<N> = encrypted_data.decrypt(v_key).unwrap();
            block
        })
        .collect::<Vec<AvailRecord<N>>>();
    let program_ids = records
        .iter()
        .filter(|record| record.metadata.record_type == RecordTypeCommon::NFT)
        .map(|record| record.metadata.program_id.clone())
        .collect::<Vec<String>>();
    let plaintexts: Vec<Record<N, Plaintext<N>>> = records
        .iter()
        .filter(|&record| record.metadata.record_type == RecordTypeCommon::NFT) // NFT Records
        .filter_map(|record: &AvailRecord<N>| match record.to_record() {
            Ok(record) => Some(record),
            Err(e) => None,
        })
        .collect::<Vec<_>>();
    fn u128_to_string(u: u128) -> String {
        let mut temp_u128 = u;
        let mut bytes = vec![] as Vec<u8>;

        while temp_u128 > 0u128 {
            let byte = (temp_u128 & 0xff) as u8;
            bytes.push(byte);
            temp_u128 >>= 8;
        }

        String::from_utf8_lossy(&bytes).to_string()
    }
    let mut count = 0;
    let full_urls = plaintexts
        .iter()
        .filter_map(|record| {
            println!("===> PROGRAM ID {:?}", program_ids[count]);
            println!(
                "===> BASE {:?}",
                api_client
                    .get_mapping_value(program_ids[count].clone(), "general_settings", "3u8")
                    .unwrap()
                    .to_string()
                    .replace("u128", "")
            );
            let base_uri_0 = u128_to_string(
                u128::from_str(
                    &api_client
                        .get_mapping_value(program_ids[count].clone(), "general_settings", "3u8")
                        .unwrap()
                        .to_string()
                        .replace("u128", ""),
                )
                .unwrap(),
            );
            let base_uri_1 = u128_to_string(
                u128::from_str(
                    &api_client
                        .get_mapping_value(program_ids[count].clone(), "general_settings", "4u8")
                        .unwrap()
                        .to_string()
                        .replace("u128", ""),
                )
                .unwrap(),
            );
            let base_uri_2 = u128_to_string(
                u128::from_str(
                    &api_client
                        .get_mapping_value(program_ids[count].clone(), "general_settings", "5u8")
                        .unwrap()
                        .to_string()
                        .replace("u128", ""),
                )
                .unwrap(),
            );
            let base_uri_3 = u128_to_string(
                u128::from_str(
                    &api_client
                        .get_mapping_value(program_ids[count].clone(), "general_settings", "6u8")
                        .unwrap()
                        .to_string()
                        .replace("u128", ""),
                )
                .unwrap(),
            );
            let base_uri = format!("{}{}{}{}", base_uri_0, base_uri_1, base_uri_2, base_uri_3);
            count = count + 1;
            let check_if_ans = match record
                .data()
                .clone()
                .get(&Identifier::<N>::from_str("data").unwrap())
                .cloned()?
            {
                Entry::Private(Plaintext::Literal(Literal::<N>::Field(data), _)) => true,
                _ => false,
            };
            if check_if_ans {
                let data_field = record
                    .data()
                    .clone()
                    .get(&Identifier::<N>::from_str("data").unwrap())
                    .cloned()?
                    .to_string();
                if data_field.contains(".private") {
                    let data_field = &data_field[..data_field.len() - 8];
                    Some(format!("{}{}", base_uri, data_field))
                } else {
                    println!("===> NFT Data Field {:?}", data_field);
                    Some(format!("{}{}", base_uri, &data_field[..]))
                }
            } else {
                let data1 = record
                    .data()
                    .clone()
                    .get(&Identifier::<N>::from_str("data1").unwrap())
                    .cloned()?;

                let data2 = record
                    .data()
                    .clone()
                    .get(&Identifier::<N>::from_str("data2").unwrap())
                    .cloned()?;
                match (data1, data2) {
                    (
                        Entry::Private(Plaintext::Literal(Literal::<N>::U128(data1), _)),
                        Entry::Private(Plaintext::Literal(Literal::<N>::U128(data2), _)),
                    ) => {
                        let data1 = u128_to_string(*data1);
                        let data2 = u128_to_string(*data2);
                        Some(format!("{}{}{}", base_uri, data1, data2))
                    }
                    _ => None,
                }
            }
        })
        .collect::<Vec<_>>();

    Ok(full_urls)
}

/// Helper to parse the mapping value from the program mapping
fn parse_with_suffix(input: &str) -> Result<u64, std::num::ParseIntError> {
    //remove last three characters
    let input = &input[..input.len() - 3];
    input.parse::<u64>()
}

/// Get public balance for any ARC20 token
pub fn get_public_token_balance<N: Network>(asset_id: &str) -> AvailResult<f64> {
    let address = get_address_string()?;
    let record_name = format!("{}.record", asset_id);
    // let program_id = format!("{}.aleo", asset_id);
    let mut program_id = get_program_id_for_token(&record_name)?;
    if (program_id == "") {
        program_id = format!("{}.aleo", asset_id);
    }
    println!("===> PROGRAM ID FOR FETCH {:?}", program_id);
    let api_client = setup_client::<N>()?;

    let credits_mapping = match api_client.get_mapping_value(program_id, "account", &address) {
        Ok(credits_mapping) => credits_mapping,
        Err(e) => match e.to_string().as_str() {
            "Mapping not found" => return Ok(0.0),
            _ => return Err(e.into()),
        },
    };

    let pub_balance = parse_with_suffix(&credits_mapping.to_string())? as f64;

    println!("pub_balance: {:?}", pub_balance);

    Ok(pub_balance / 1000000.0)
}

/// Get private balance for any ARC20 token
pub fn get_private_token_balance<N: Network>(asset_id: &str) -> AvailResult<f64> {
    let address = get_address_string()?;
    let record_name = format!("{}.record", asset_id);
    let program_id = format!("{}.aleo", asset_id);
    println!("===> Asset ID in get_private_balance() {:?}", asset_id);

    let vk = VIEWSESSION.get_instance::<N>()?;
    let balance = get_balance(&record_name, vk)?;

    println!("balance: {:?}", balance);
    let balance_trimmed = balance.trim_end_matches("u64");

    Ok(balance_trimmed.parse::<u64>()? as f64 / 1000000.0)
}

/// Get Arc20 Token Balance
pub fn get_token_balance<N: Network>(asset_id: &str) -> AvailResult<Balance> {
    let asset_id_modified = asset_id.to_string();
    let asset_id_final = asset_id.to_string().replace(".record", "");
    println!("===> Asset ID after mpod {:?}", asset_id_final);
    let public = get_public_token_balance::<N>(&asset_id_final)?;
    let private = get_private_token_balance::<N>(&asset_id_final)?;
    println!("===> Token Balance of {:?}", asset_id_final);
    println!("public: {:?}", public);
    println!("private: {:?}", private);

    Ok(Balance::new(public, private))
}

/// Handles encrypted message passing and updated transaction state
pub async fn handle_encrypted_storage_and_message<N: Network>(
    transaction_id: N::TransactionID,
    recipient_address: Address<N>,
    transaction_pointer_id: &str,
    input_id: Option<String>,
    fee_id: Option<String>,
    wallet_connect: bool,
    window: Option<Window>,
) -> AvailResult<()> {
    let username = get_username()?;
    let backup = get_backup_flag()?;
    let view_key = VIEWSESSION.get_instance::<N>()?;

    let sender_address = get_address::<N>()?;

    let mut processing_transaction_pointer = get_transaction_pointer::<N>(transaction_pointer_id)?;
    processing_transaction_pointer.update_pending_transaction();

    let encrypted_pending_transaction =
        processing_transaction_pointer.to_encrypted_data(sender_address)?;

    update_encrypted_transaction_state_by_id(
        transaction_pointer_id,
        &encrypted_pending_transaction.ciphertext,
        &encrypted_pending_transaction.nonce,
        TransactionState::Pending,
    )?;

    if let Some(window) = window.clone() {
        match window.emit("tx_state_change", &transaction_pointer_id) {
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

    // search for the transaction on chain
    let (
        block_height,
        transitions,
        timestamp,
        transaction_state,
        fee_tx_id,
        rejected_execution,
        fee,
    ) = find_confirmed_block_height::<N>(transaction_id)?;

    println!("State of transaction: {:?}", transaction_state);

    if transaction_state == TransactionState::Rejected {
        // input record was not spent in this case
        if let Some(input_id) = input_id {
            update_record_spent_local::<N>(&input_id, false)?;
        }

        //TODO - Do not double subtract input id
        handle_transaction_rejection(
            processing_transaction_pointer,
            transaction_pointer_id,
            rejected_execution,
            fee_tx_id,
            block_height,
            fee,
            sender_address,
        )?;

        if let Some(window) = window.clone() {
            match window.emit("tx_state_change", &transaction_pointer_id) {
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

        // Check for remainder of private fee given back as new record
        for transition in transitions {
            transition_to_record_pointer(transaction_id, transition, block_height, view_key)?;
        }

        return Ok(());
    } else if transaction_state == TransactionState::Aborted {
        // records were not spent in this case
        if let Some(input_id) = input_id {
            update_record_spent_local::<N>(&input_id, false)?;
        }
        if let Some(fee_id) = fee_id {
            update_record_spent_local::<N>(&fee_id, false)?;
        }

        processing_transaction_pointer.update_aborted_transaction(
            "Transaction aborted by the Aleo blockchain. No tokens were spent.".to_string(),
            transaction_id,
            block_height,
        );

        let updated_encrypted_transaction =
            processing_transaction_pointer.to_encrypted_data(sender_address)?;

        update_encrypted_transaction_state_by_id(
            transaction_pointer_id,
            &updated_encrypted_transaction.ciphertext,
            &updated_encrypted_transaction.nonce,
            TransactionState::Aborted,
        )?;

        if let Some(window) = window.clone() {
            match window.emit("tx_state_change", &transaction_pointer_id) {
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

        return Ok(());
    }

    let mut execution_transitions: Vec<ExecutedTransition<N>> = vec![];
    let mut spent_ids: Vec<String> = vec![];

    let records = transitions
        .iter()
        .filter(|transition| !transition.is_fee_public())
        .map(|transition| {
            let transition = transition.to_owned();

            if !transition.is_fee_private() {
                if wallet_connect {
                    let mut transition_spent_ids = match input_spent_check::<N>(&transition, true) {
                        Ok(transition_spent_ids) => transition_spent_ids,
                        Err(e) => {
                            return Err(AvailError::new(
                                AvailErrorType::Internal,
                                e.to_string(),
                                "Error checking input spent".to_string(),
                            ))
                        }
                    };

                    spent_ids.append(&mut transition_spent_ids);
                }

                let executed_transition = ExecutedTransition::<N>::new(
                    transition.program_id().to_string(),
                    transition.function_name().to_string(),
                    transition.id().to_owned(),
                );

                execution_transitions.push(executed_transition);
            }

            let record_pointers =
                transition_to_record_pointer(transaction_id, transition, block_height, view_key)?;

            println!("record_pointers found from transfer: {:?}", record_pointers);

            Ok(record_pointers)
        })
        .collect::<AvailResult<Vec<Vec<AvailRecord<N>>>>>()?
        .concat();

    handle_transaction_confirmed::<N>(
        transaction_pointer_id,
        transaction_id,
        execution_transitions,
        block_height,
        timestamp,
        fee,
        sender_address,
    )?;

    println!("Inshallah confirmed");
    let mut confirmed_transaction_pointer = get_transaction_pointer::<N>(transaction_pointer_id)?;
    println!("{:?}", confirmed_transaction_pointer);

    //check if private fee was spent
    if let Some(fee_id) = fee_id {
        update_record_spent_local::<N>(&fee_id, true)?;
        if backup {
            spent_ids.push(fee_id);
        }
    }

    //update token input was spent
    if let Some(input_id) = input_id {
        update_record_spent_local::<N>(&input_id, true)?;
        if backup {
            spent_ids.push(input_id);
        }
    }

    if let Some(window) = window.clone() {
        match window.emit("tx_state_change", &transaction_pointer_id) {
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

    if sender_address != recipient_address {
        let transaction_message = TransactionMessage::<N>::new(
            transaction_id,
            block_height,
            username,
            processing_transaction_pointer.message(),
        );

        let encrypted_transaction_message =
            transaction_message.to_encrypted_data(recipient_address)?;

        send_transaction_in(encrypted_transaction_message).await?;
    }

    Ok(())
}

/// Handles updating pending transaction and encrypted storage
pub async fn handle_transaction_update_and_encrypted_storage<N: Network>(
    transaction_id: N::TransactionID,
    transaction_pointer_id: &str,
    fee_id: Option<String>,
    window: Option<Window>,
) -> AvailResult<()> {
    let backup = get_backup_flag()?;
    let view_key = VIEWSESSION.get_instance::<N>()?;

    let sender_address = get_address::<N>()?;

    // Update transaction to pending to confirm
    let mut processing_transaction_pointer = get_transaction_pointer::<N>(transaction_pointer_id)?;
    processing_transaction_pointer.update_pending_transaction();

    let encrypted_pending_transaction =
        processing_transaction_pointer.to_encrypted_data(sender_address)?;

    update_encrypted_transaction_state_by_id(
        transaction_pointer_id,
        &encrypted_pending_transaction.ciphertext,
        &encrypted_pending_transaction.nonce,
        TransactionState::Pending,
    )?;

    if let Some(window) = window.clone() {
        match window.emit("tx_state_change", &transaction_pointer_id) {
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

    let (
        block_height,
        transitions,
        timestamp,
        transaction_state,
        fee_tx_id,
        rejected_execution,
        fee,
    ) = find_confirmed_block_height::<N>(transaction_id)?;

    if transaction_state == TransactionState::Rejected {
        // Check for remainder of private fee given back as new record
        for transition in transitions {
            transition_to_record_pointer(transaction_id, transition, block_height, view_key)?;
        }

        handle_transaction_rejection(
            processing_transaction_pointer,
            transaction_pointer_id,
            rejected_execution,
            fee_tx_id,
            block_height,
            fee,
            sender_address,
        )?;

        if let Some(window) = window.clone() {
            match window.emit("tx_state_change", &transaction_pointer_id) {
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

        return Ok(());
    } else if transaction_state == TransactionState::Aborted {
        // fee was not consumed in this case
        if let Some(fee_id) = fee_id {
            update_record_spent_local::<N>(&fee_id, false)?;
        }

        //TODO - Update record spent state for input nonces

        processing_transaction_pointer.update_aborted_transaction(
            "Transaction aborted by the Aleo blockchain. No tokens were spent.".to_string(),
            transaction_id,
            block_height,
        );
        let updated_encrypted_transaction =
            processing_transaction_pointer.to_encrypted_data(sender_address)?;
        update_encrypted_transaction_state_by_id(
            transaction_pointer_id,
            &updated_encrypted_transaction.ciphertext,
            &updated_encrypted_transaction.nonce,
            TransactionState::Aborted,
        )?;

        if let Some(window) = window.clone() {
            match window.emit("tx_state_change", &transaction_pointer_id) {
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

        return Ok(());
    }

    let mut execution_transitions: Vec<ExecutedTransition<N>> = vec![];
    let mut spent_ids: Vec<String> = vec![];

    let records = transitions
        .iter()
        .filter(|transition| !transition.is_fee_public())
        .map(|transition| {
            let transition = transition.to_owned();

            if !transition.is_fee_private() {
                let mut transition_spent_ids = input_spent_check::<N>(&transition, true)?;
                spent_ids.append(&mut transition_spent_ids);

                let executed_transition = ExecutedTransition::<N>::new(
                    transition.program_id().to_string(),
                    transition.function_name().to_string(),
                    transition.id().to_owned(),
                );

                execution_transitions.push(executed_transition);
            }

            let record_pointer =
                transition_to_record_pointer(transaction_id, transition, block_height, view_key)?;
            Ok(record_pointer)
        })
        .collect::<AvailResult<Vec<Vec<AvailRecord<N>>>>>()?
        .concat();

    handle_transaction_confirmed::<N>(
        transaction_pointer_id,
        transaction_id,
        execution_transitions,
        block_height,
        timestamp,
        fee,
        sender_address,
    )?;

    //TODO - Do not double subtract fee
    //check if private fee was spent
    if let Some(fee_id) = fee_id {
        update_record_spent_local::<N>(&fee_id, true)?;
        if backup {
            spent_ids.push(fee_id);
        }
    }

    if let Some(window) = window.clone() {
        match window.emit("tx_state_change", &transaction_pointer_id) {
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

    Ok(())
}

// TODO - Handle fee remainder for deployment handler
/// Handles updating deployment transaction and encrypted storage
pub async fn handle_deployment_update_and_encrypted_storage<N: Network>(
    transaction_id: N::TransactionID,
    deployment_pointer_id: &str,
    fee_id: Option<String>,
    window: Option<Window>,
) -> AvailResult<()> {
    let backup = get_backup_flag()?;
    let sender_address = get_address::<N>()?;
    let view_key = VIEWSESSION.get_instance::<N>()?;

    // Update transaction to pending to confirm
    let mut processing_deployment_pointer = get_deployment_pointer::<N>(deployment_pointer_id)?;
    processing_deployment_pointer.update_pending_deployment();

    let encrypted_pending_deployment =
        processing_deployment_pointer.to_encrypted_data(sender_address)?;

    update_encrypted_transaction_state_by_id(
        deployment_pointer_id,
        &encrypted_pending_deployment.ciphertext,
        &encrypted_pending_deployment.nonce,
        TransactionState::Pending,
    )?;

    if let Some(window) = window.clone() {
        match window.emit("tx_state_change", &deployment_pointer_id) {
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

    let (block_height, transitions, _, transaction_state, _fee_tx_id, _, fee) =
        find_confirmed_block_height::<N>(transaction_id)?;

    if transaction_state == TransactionState::Rejected {
        for transition in transitions {
            input_spent_check(&transition, true)?;
            transition_to_record_pointer(
                transaction_id,
                transition.clone(),
                block_height,
                view_key,
            )?;
        }

        handle_deployment_rejection(
            processing_deployment_pointer,
            deployment_pointer_id,
            transaction_id,
            block_height,
            fee,
            sender_address,
        )?;

        if let Some(window) = window.clone() {
            match window.emit("tx_state_change", &deployment_pointer_id) {
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

        return Ok(());
    } else if transaction_state == TransactionState::Aborted {
        // fee was not consumed in this case
        if let Some(fee_id) = fee_id {
            update_record_spent_local::<N>(&fee_id, false)?;
        }

        processing_deployment_pointer.update_aborted_deployment(
            "Transaction aborted by the Aleo blockchain. No tokens were spent.".to_string(),
            transaction_id,
            block_height,
        );
        let updated_encrypted_deployment =
            processing_deployment_pointer.to_encrypted_data(sender_address)?;
        update_encrypted_transaction_state_by_id(
            deployment_pointer_id,
            &updated_encrypted_deployment.ciphertext,
            &updated_encrypted_deployment.nonce,
            TransactionState::Aborted,
        )?;

        if let Some(window) = window.clone() {
            match window.emit("tx_state_change", &deployment_pointer_id) {
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

        return Ok(());
    }

    //checking for remainder if private fee was spent
    for transition in transitions {
        input_spent_check(&transition, true)?;
        transition_to_record_pointer(transaction_id, transition.clone(), block_height, view_key)?;
    }

    handle_deployment_confirmed(
        deployment_pointer_id,
        transaction_id,
        block_height,
        fee,
        sender_address,
    )?;

    // if record was spent on fee update state
    if let Some(fee_id) = fee_id {
        update_record_spent_local::<N>(&fee_id, true)?;

        if backup {
            update_records_spent_backup::<N>(vec![fee_id]).await?;
        }
    }

    if let Some(window) = window.clone() {
        match window.emit("tx_state_change", &deployment_pointer_id) {
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

    Ok(())
}

pub fn handle_deployment_confirmed<N: Network>(
    pointer_id: &str,
    tx_id: N::TransactionID,
    block_height: u32,
    fee: Option<f64>,
    sender_address: Address<N>,
) -> AvailResult<()> {
    let mut pending_transaction_pointer = get_deployment_pointer::<N>(pointer_id)?;

    pending_transaction_pointer.update_confirmed_deployment(tx_id, block_height, fee);
    let updated_encrypted_transaction =
        pending_transaction_pointer.to_encrypted_data(sender_address)?;

    update_encrypted_data_by_id(
        pointer_id,
        &updated_encrypted_transaction.ciphertext,
        &updated_encrypted_transaction.nonce,
    )?;

    Ok(())
}

pub fn handle_deployment_rejection<N: Network>(
    mut pointer: DeploymentPointer<N>,
    pointer_id: &str,
    tx_id: N::TransactionID,
    block_height: u32,
    fee: Option<f64>,
    sender_address: Address<N>,
) -> AvailResult<()> {
    pointer.update_rejected_deployment(
        "Transaction rejected by the Aleo blockchain.".to_string(),
        Some(tx_id),
        block_height,
        fee,
    );

    let updated_encrypted_deployment = pointer.to_encrypted_data(sender_address)?;

    update_encrypted_transaction_state_by_id(
        pointer_id,
        &updated_encrypted_deployment.ciphertext,
        &updated_encrypted_deployment.nonce,
        TransactionState::Rejected,
    )?;

    Ok(())
}

pub fn handle_transaction_rejection<N: Network>(
    mut pointer: TransactionPointer<N>,
    pointer_id: &str,
    rejected_execution: Option<Execution<N>>,
    tx_id: Option<N::TransactionID>,
    block_height: u32,
    fee: Option<f64>,
    sender_address: Address<N>,
) -> AvailResult<()> {
    // NOTE - If bugs out change to update via input nonces
    if let Some(rejected_execution) = rejected_execution {
        let rejected_transitions = rejected_execution.transitions();

        for transition in rejected_transitions {
            if !transition.is_fee_private() {
                input_spent_check::<N>(transition, false)?;
            }
        }
    }

    pointer.update_rejected_transaction(
        "Transaction rejected by the Aleo blockchain.".to_string(),
        tx_id,
        block_height,
        fee,
    );

    let updated_encrypted_transaction = pointer.to_encrypted_data(sender_address)?;

    update_encrypted_transaction_state_by_id(
        pointer_id,
        &updated_encrypted_transaction.ciphertext,
        &updated_encrypted_transaction.nonce,
        TransactionState::Rejected,
    )?;

    Ok(())
}

pub fn handle_transaction_confirmed<N: Network>(
    transaction_pointer_id: &str,
    tx_id: N::TransactionID,
    execution_transitions: Vec<ExecutedTransition<N>>,
    block_height: u32,
    timestamp: DateTime<Local>,
    fee: Option<f64>,
    sender_address: Address<N>,
) -> AvailResult<()> {
    let mut pending_transaction_pointer = get_transaction_pointer::<N>(transaction_pointer_id)?;

    pending_transaction_pointer.update_confirmed_transaction(
        tx_id,
        block_height,
        execution_transitions,
        timestamp,
        TransactionState::Confirmed,
        fee,
    );

    let updated_encrypted_transaction =
        pending_transaction_pointer.to_encrypted_data(sender_address)?;

    let program_ids = match updated_encrypted_transaction.clone().program_ids {
        Some(program_ids) => program_ids,
        None => {
            return Err(AvailError::new(
                AvailErrorType::Internal,
                "Program ids not found".to_string(),
                "Program ids not found".to_string(),
            ))
        }
    };

    let function_ids = match updated_encrypted_transaction.clone().function_ids {
        Some(function_ids) => function_ids,
        None => {
            return Err(AvailError::new(
                AvailErrorType::Internal,
                "Function ids not found".to_string(),
                "Function ids not found".to_string(),
            ))
        }
    };

    update_encrypted_transaction_confirmed_by_id(
        transaction_pointer_id,
        &updated_encrypted_transaction.ciphertext,
        &updated_encrypted_transaction.nonce,
        &program_ids,
        &function_ids,
    )?;

    Ok(())
}

/// Sync transaction whilst scanning blocks
pub fn sync_transaction<N: Network>(
    transaction: &ConfirmedTransaction<N>,
    block_height: u32,
    timestamp: DateTime<Local>,
    message: Option<String>,
    from: Option<String>,
) -> AvailResult<(
    Option<EncryptedData>,
    Vec<AvailRecord<N>>,
    Vec<EncryptedData>,
    bool,
)> {
    let view_key = VIEWSESSION.get_instance::<N>()?;
    let address = view_key.to_address();

    let mut record_pointers: Vec<AvailRecord<N>> = vec![];
    let mut encrypted_transition_pointers: Vec<EncryptedData> = vec![];

    let mut execution_transitions: Vec<ExecutedTransition<N>> = vec![];
    let mut found_flag = false;

    let state = check_transaction_state::<N>(transaction)?;

    for transition in transaction.transitions() {
        let ownership_check = match DecryptTransition::owns_transition(
            view_key,
            *transition.tpk(),
            *transition.tcm(),
        ) {
            Ok(res) => res,
            Err(_e) => false,
        };

        if ownership_check {
            input_spent_check(&transition.clone(), true)?;

            let execution_transition = ExecutedTransition::<N>::new(
                transition.program_id().to_string(),
                transition.function_name().to_string(),
                transition.id().to_owned(),
            );

            if !transition.is_fee_private() && !transition.is_fee_public() {
                execution_transitions.push(execution_transition);
            }

            let mut transition_record_pointers = transition_to_record_pointer::<N>(
                transaction.id().to_owned(),
                transition.clone(),
                block_height,
                view_key,
            )?;

            record_pointers.append(&mut transition_record_pointers);
        } else {
            let (mut transition_record_pointers, mut encrypted_transitions, _transition_spent_ids) =
                DecryptTransition::check_inputs_outputs_inclusion::<N>(
                    view_key,
                    transition.clone(),
                    transaction.id().to_owned(),
                    timestamp,
                    block_height,
                    message.clone(),
                    from.clone(),
                )?;

            record_pointers.append(&mut transition_record_pointers);
            if !transition.is_fee_private() && !transition.is_fee_public() {
                encrypted_transition_pointers.append(&mut encrypted_transitions);
            }

            found_flag = true;
        }
    }

    let execution_transaction = match !execution_transitions.is_empty() {
        true => {
            let inner_tx = transaction.transaction();
            let fee = match inner_tx.fee_amount() {
                Ok(fee) => *fee as f64 / 1000000.0,
                Err(_) => {
                    return Err(AvailError::new(
                        AvailErrorType::SnarkVm,
                        "Error calculating fee".to_string(),
                        "Issue calculating fee".to_string(),
                    ))
                }
            };

            println!("Fee found from external execution: {:?}", fee);

            let execution_tx = TransactionPointer::<N>::new(
                None,
                Some(transaction.id().to_owned()),
                state,
                Some(block_height),
                None,
                None,
                execution_transitions,
                vec![],
                timestamp,
                Some(timestamp),
                None,
                EventTypeCommon::Execute,
                None,
                Some(fee),
                None,
            );

            let encrypted_exec_tx = execution_tx.to_encrypted_data(address)?;
            store_encrypted_data(encrypted_exec_tx.clone())?;

            found_flag = true;

            Some(encrypted_exec_tx)
        }
        false => None,
    };

    Ok((
        execution_transaction,
        record_pointers,
        encrypted_transition_pointers,
        found_flag,
    ))
}

pub fn check_transaction_state<N: Network>(
    transaction: &ConfirmedTransaction<N>,
) -> AvailResult<TransactionState> {
    if let ConfirmedTransaction::<N>::AcceptedExecute(_, _, _) = transaction {
        Ok(TransactionState::Confirmed)
    } else if let ConfirmedTransaction::<N>::AcceptedDeploy(_, _, _) = transaction {
        Ok(TransactionState::Confirmed)
    } else if let ConfirmedTransaction::<N>::RejectedExecute(_, _, _, _) = transaction {
        //TODO - Return rejected execution

        Ok(TransactionState::Rejected)
    } else if let ConfirmedTransaction::<N>::RejectedDeploy(_, _, _, _) = transaction {
        Ok(TransactionState::Rejected)
    } else {
        Ok(TransactionState::Pending)
    }
}

pub fn get_executed_transitions<N: Network>(
    transaction: &Transaction<N>,
    block_height: u32,
) -> AvailResult<Vec<ExecutedTransition<N>>> {
    let view_key = VIEWSESSION.get_instance::<N>()?;
    let mut execution_transitions: Vec<ExecutedTransition<N>> = vec![];

    for transition in transaction.transitions() {
        input_spent_check(transition, true)?;

        let ownership_check = match DecryptTransition::owns_transition(
            view_key,
            *transition.tpk(),
            *transition.tcm(),
        ) {
            Ok(res) => res,
            Err(_e) => false,
        };

        if ownership_check {
            let execution_transition = ExecutedTransition::<N>::new(
                transition.program_id().to_string(),
                transition.function_name().to_string(),
                transition.id().to_owned(),
            );

            if !transition.is_fee_private() && !transition.is_fee_public() {
                execution_transitions.push(execution_transition);
            }

            transition_to_record_pointer(
                transaction.id(),
                transition.clone(),
                block_height,
                view_key,
            )?;
        }
    }

    Ok(execution_transitions)
}

pub fn get_fee_transition<N: Network>(
    transaction_id: N::TransactionID,
) -> AvailResult<EventTransition> {
    let view_key = VIEWSESSION.get_instance::<N>()?;
    let api_client = setup_client::<N>()?;

    let transaction = match api_client.get_transaction(transaction_id) {
        Ok(transaction) => transaction,
        Err(_) => {
            return Err(AvailError::new(
                AvailErrorType::Node,
                "Transaction not found".to_string(),
                "Transaction not found".to_string(),
            ))
        }
    };
    let fee_transition = transaction.fee_transition();

    match fee_transition {
        Some(fee_transition) => {
            let transition = fee_transition.transition();
            let (inputs, outputs) =
                DecryptTransition::decrypt_inputs_outputs(view_key, transition)?;
            let fee_event_transition = EventTransition::new(
                transition.id().to_string(),
                transition.program_id().to_string(),
                transition.function_name().to_string(),
                inputs,
                outputs,
            );
            Ok(fee_event_transition)
        }
        None => Err(AvailError::new(
            AvailErrorType::Internal,
            "Fee transition not found".to_string(),
            "Fee transition not found".to_string(),
        )),
    }
}

pub async fn get_address_from_recipient<N: Network>(recipient: &str) -> AvailResult<Address<N>> {
    match validate_address_bool(recipient) {
        true => {
            let address = Address::<N>::from_str(recipient)?;
            Ok(address)
        }
        false => name_to_address(recipient).await,
    }
}

/* --Wallet Connect Utilities-- */

pub fn to_commitment<N: Network>(
    record: Record<N, Plaintext<N>>,
    program_id: &ProgramID<N>,
    record_name: &Identifier<N>,
) -> AvailResult<Field<N>> {
    //construct the input as `(program_id || record_name || record)`.
    let mut input = program_id.to_bits_le();
    record_name.write_bits_le(&mut input);
    record.write_bits_le(&mut input);

    //Compute the BHP hash of the program record input.
    let commitment = match N::hash_bhp1024(&input) {
        Ok(commitment) => commitment,
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::Internal,
                e.to_string(),
                "Record input commitment not found".to_string(),
            ))
        }
    };

    Ok(commitment)
}

pub fn parse_inputs<N: Network>(
    inputs: Vec<String>,
    function_identifier: &str,
) -> AvailResult<(Vec<Value<N>>, Vec<String>, Option<Address<N>>, Option<f64>)> {
    // check if input is address
    let mut values: Vec<Value<N>> = vec![];
    let mut nonces: Vec<String> = vec![];
    let mut recipient_address: Option<Address<N>> = None;
    let mut amount = None;

    for (_index, input) in inputs.iter().enumerate() {
        // Check if value is address
        if validate_address_bool(input) {
            recipient_address = Some(Address::<N>::from_str(input)?);
            let value = Value::from_str(input)?;
            values.push(value);
        } else {
            //check if value is record
            match Record::<N, Plaintext<N>>::from_str(input) {
                Ok(record) => {
                    let nonce = record.nonce().to_string();
                    nonces.push(nonce);
                    let value = Value::Record(record);
                    values.push(value);
                }
                Err(_) => {
                    let value = Value::from_str(input)?;
                    values.push(value);

                    // value is constant plaintext input
                    if function_identifier.contains("transfer") {
                        let trimmed_input = input.trim_end_matches("u64");

                        if let Ok(amount_found) = trimmed_input.parse::<u64>() {
                            amount = Some(amount_found as f64 / 1000000.0);
                        }
                    }
                }
            }
        }
    }

    Ok((values, nonces, recipient_address, amount))
}

pub async fn estimate_fee<N, A>(
    program_id: &str,
    function_id: &str,
    inputs: Vec<Value<N>>,
    program_manager: ProgramManager<N>,
) -> AvailResult<u64>
where
    N: Network,
    A: Aleo<Network = N>,
{
    // Get the program from chain, error if it doesn't exist
    let program = program_manager.api_client()?.get_program(program_id)?;

    let function_identifier = Identifier::<N>::from_str(function_id)?;
    // API Call to see if record already exists
    let _fee_value = 0i32;
    let _if_exists = true;
    match fetch_record(program_id.to_string(), function_id.to_string()).await? {
        // Return the fee amount if the record exists
        Some(x) => Ok(u64::try_from(x)?),
        // Estimate the fee and also initiate an API call to Fee Estimation Microservice to create a record for the program.
        None => {
            let (fee, (_storage_fee, _namespace_fee), execution) = program_manager
                .estimate_execution_fee::<A>(&program, function_identifier, inputs.iter())?;
            let execution_vector =
                FeeRequest::to_bytes_execution_object::<N>(execution.clone()).await;
            match execution_vector {
                Ok(execution_vec) => {
                    let request = FeeRequest::new(
                        execution_vec,
                        program_id.to_string(),
                        function_id.to_string(),
                        SupportedNetworks::Testnet3,
                    );
                    println!("Sending a request to Avail's Fee Estimation Microservice to add the fee data");
                    let result: String = create_record(request).await?;
                    println!("{:?}", result);
                }
                Err(_e) => (),
            }
            println!("Execution Fee: {}", fee);
            Ok(fee)
        }
    }
}

// ======================================================== TESTS ========================================================
#[cfg(test)]
mod test {
    use std::{
        fmt::format,
        ptr::null,
        time::{Duration, Instant},
    };

    use avail_common::{
        aleo_tools::{
            api::AleoAPIClient,
            test_utils::{AVAIL_NFT_TEST, RECORD_NFT_CLAIM, RECORD_NFT_MINT, TOKEN_MINT},
        },
        models::constants::{
            TESTNET3_ADDRESS, TESTNET3_PRIVATE_KEY, TESTNET_ADDRESS, TESTNET_PRIVATE_KEY,
        },
    };
    use snarkvm::{
        circuit::{environment::Private, AleoV0},
        prelude::{Parser, PrivateKey, Transaction},
        synthesizer::Program,
    };
    use tokio::time::sleep;

    use crate::{models::pointers::record::Metadata, services::local_storage::tokens::get_balance};

    use super::*;
    use snarkvm::prelude::Testnet3;
    #[tokio::test]
    async fn test_get_all_nft_data() {
        // AViewKey1cbThXosaWwor5t5F87m22K1hSRA4BWL5HrsNxRik15Rq
        let res = get_all_nft_data().unwrap();
        // let str0 = u128_to_string(340282366920938463463374607431768211455u128);
        // let str1 = u128_to_string(340282366920938463463374607431768211455u128);
        // let str2 = u128_to_string(5459521u128);
        // let str3 = u128_to_string(60419623520418866384139602471830189160u128);
        // let str4 = u128_to_string(133468932882108420321626207034102345825u128);
        // let str5 = u128_to_string(13350705778619439u128);
        // let str6 = u128_to_string(0u128);
        // let str7 = u128_to_string(129967232274961287173788227149222870785u128);

        // println!("res\n {:?}\n {:?} \n {:?} \n {:?}, \n{:?}, \n {:?}, \n {:?}", str1, str2, str3, str4, str5, str6, str7);
        // println!(":{:?}",format!("{:x}", 5459521u128));
        // println!(":{:?}",format!("{:x}", 60419623520418866384139602471830189160u128));
        // println!(":{:?}",format!("{:x}", 133468932882108420321626207034102345825u128));
        // println!(":{:?}",format!("{:x}", 60419623520418866384139602471830189160u128));
        println!("res\n {:?}", res);
    }
    fn u128_to_string(u: u128) -> String {
        let mut temp_u128 = u;
        let mut bytes = vec![] as Vec<u8>;

        while temp_u128 > 0u128 {
            let byte = (temp_u128 & 0xff) as u8;
            bytes.push(byte);
            temp_u128 >>= 8;
        }

        // bytes.reverse();

        String::from_utf8_lossy(&bytes).to_string()
        // Convert u128 to an array of bytes in little-endian or big-endian
        // let mut bytes: Vec<u8> = Vec::new();
        // let mut temp_big_int = big_int_value;

        // while temp_big_int > 0 {
        //     let byte_value = (temp_big_int & 255) as u8;
        //     bytes.push(byte_value);
        //     temp_big_int = temp_big_int >> 8;
        // }

        // // Since bytes are pushed in a reverse order, they need to be reversed to represent the original number correctly

        // // Convert bytes to string
        // // If you want a human-readable hexadecimal string
        // let hex_string = bytes.iter().map(|byte| format!("{:02x}", byte)).collect::<String>();

        // // If you want a string representation of the bytes separated by commas
        // // let bytes_string = bytes.iter().map(|byte| byte.to_string()).collect::<Vec<String>>().join(",");

        // hex_string
    }

    // #[tokio::test]
    // async fn test_token_record() {
    //     let mut api_client = setup_client::<Testnet3>().unwrap();
    //     let pk = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();
    //     let pk_3 = PrivateKey::<Testnet3>::from_str(TESTNET3_PRIVATE_KEY).unwrap();
    //     let vk = ViewKey::<Testnet3>::try_from(pk).unwrap();
    //     let vk_3 = ViewKey::<Testnet3>::try_from(pk_3).unwrap();
    //     let fee = 10000u64;
    //     let program_id = "token_avl_4.aleo";
    //     // INPUTS
    //     let address_to_mint = Value::<Testnet3>::try_from(TESTNET3_ADDRESS).unwrap();
    //     let amt_input = Value::<Testnet3>::try_from("100u64").unwrap();
    //     let transfer_amt = Value::<Testnet3>::try_from("1u64").unwrap();
    //     let fee = 10000u64;

    //     // let token_program = Program::<Testnet3>::from_str(TOKEN_PROGRAM).unwrap();
    //     let token_mint_program = Program::<Testnet3>::from_str(TOKEN_MINT).unwrap();
    //     let mut program_manager =
    //         ProgramManager::<Testnet3>::new(Some(pk), None, Some(api_client.clone()), None)
    //             .unwrap();
    //     let mut program_manager_3 =
    //         ProgramManager::<Testnet3>::new(Some(pk_3), None, Some(api_client.clone()), None)
    //             .unwrap();
    //     // program_manager.add_program(&token_program);
    //     program_manager.add_program(&token_mint_program);
    //     program_manager_3.add_program(&token_mint_program);

    // STEP - 0     DEPLOY PROGRAM (DONT NEED TO DEPLOY AGAIN)
    // let deployement_id = program_manager.deploy_program("token_avl_4.aleo", 10000u64, None, None).unwrap();
    // println!("----> Program Deployed - {:?}", deployement_id);
    // let mint_program: Result<ProgramCore<Testnet3, Instruction<Testnet3>, Command<Testnet3>>, snarkvm::prelude::Error> = api_client.get_program("token_avl.aleo");

    // STEP - 1     MINT ****ONLY FOR TESTING PURPOSES****
    // let inputs =  vec![address_to_mint.clone(), amt_input.clone()];
    // let mint_tokens = program_manager.execute_program(program_id, "mint_public", inputs.iter(), fee, None, None).unwrap().to_string();
    // println!("----> Tokens Minted - {:?}", mint_tokens);

    // let mint_txn = api_client.get_transaction(<Testnet3 as Network>::TransactionID::from_str("at17hlupnq8nutyzvdccj5smhf6s8u7yzplwjf38xzqgl93486r3c8s9mrhuc").unwrap()).unwrap();
    // println!("----> Mint Tokens TXN - {:?}", mint_txn);

    // STEP - 2    QUERY MAPPING TO VERIFY
    // let mapping_op = program_manager.get_mapping_value(program_id, "account", TESTNET3_ADDRESS).unwrap();
    // println!("----> Mapping Value - {:?}", mapping_op);

    // STEP - 4    PREPARE TOKEN RECORD BY USING transfer_public_to_private() fn
    // let inputs =  vec![address_to_mint.clone(), transfer_amt.clone()];
    // let token_record = program_manager_3.execute_program(program_id, "transfer_public_to_private", inputs.iter(),fee, None, None).unwrap().to_string();
    // let record_txn = api_client.get_transaction(<Testnet3 as Network>::TransactionID::from_str(&token_record).unwrap()).unwrap();

    // println!("----> Token Record TXN - {:?}", record_txn);

    // let record_txn_id = <Testnet3 as Network>::TransactionID::from_str("at18r5vumc27swqw0vtm9gp4la0cwg8nxk4njm49sp2dj7anp596c9qgaz66w").unwrap();
    // let record_txn = api_client.get_transaction(<Testnet3 as Network>::TransactionID::from_str("at18r5vumc27swqw0vtm9gp4la0cwg8nxk4njm49sp2dj7anp596c9qgaz66w").unwrap()).unwrap();
    // // println!("----> Token Record TXN - {:?}", record_txn);
    // let mut latest_height = api_client.latest_height().unwrap();
    // for transition in record_txn.clone().into_transitions(){
    //     println!("INN");
    //     if transition.program_id().to_string() == program_id {
    //         println!("OKK");
    //         let record_pointer_token = transition_to_record_pointer::<Testnet3>(record_txn.clone().id(), transition.clone(), latest_height, vk_3).unwrap();

    //         println!("----> Token Record - {:?}", record_pointer_token);
    //     }
    // }

    // STEP - 4    QUERY LOCAL STORAGE TO VERIFY
    //     let mapping_op = program_manager
    //         .get_mapping_value(program_id, "account", TESTNET3_ADDRESS)
    //         .unwrap();
    //     println!("----> Mapping Value - {:?}", mapping_op);
    //     let local_db_value = get_balance("token_avl_4.record", vk_3).unwrap();
    //     println!("----> Local DB Value - {:?}", local_db_value);
    // }

    // #[test]
    // fn test_get_private_balance() {
    //     let _res = get_private_token_balance::<Testnet3>("credits").unwrap();

    //     println!("res: {:?}", _res);
    // }

    // #[test]
    // fn get_public_balance() {
    //     get_public_token_balance::<Testnet3>("credits").unwrap();
    // }

    // #[tokio::test]
    // async fn test_estimate_fee() {

    //     let program_id = "credits.aleo";
    //     let function_id = "transfer_public";

    //     let inputs = vec![
    //         // Value::<Testnet3>::try_from(TESTNET_ADDRESS).unwrap(),
    //         Value::<Testnet3>::try_from(TESTNET3_ADDRESS).unwrap(),
    //         Value::<Testnet3>::try_from("10000u64").unwrap(),
    //         // Value::<Testnet3>::try_from("true").unwrap()
    //     ];

    //     //let inputs = vec![];

    //     let api_client = setup_client::<Testnet3>().unwrap();

    //     let pk = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();
    //     let program_manager =
    //         ProgramManager::<Testnet3>::new(Some(pk), None, Some(api_client), None).unwrap();
    //     let start = Instant::now();
    //     let res =
    //         estimate_fee::<Testnet3, AleoV0>(program_id, function_id, inputs, program_manager)
    //             .await.unwrap();
    //     println!("ELAPSED TIME: {:?}",start.elapsed());
    //     println!("res: {:?}", res);
    // }
    // }

    // fn string_to_u128(s: String) -> u128 {
    //     let mut result = 0u128;
    //     for c in s.chars() {
    //         result <<= 8;
    //         result |= c as u128;
    //     }
    //     result
    // }

    // #[tokio::test]
    // async fn test_nft_record(){
    //    // ARRANGE
    //    let mut api_client = setup_client::<Testnet3>().unwrap();
    //     // ALEO INPUTS
    //     let program_id = "avail_nft_0.aleo";
    //     let nft_program = Program::<Testnet3>::from_str(AVAIL_NFT_TEST).unwrap();
    //     let symbol_u128 = format!("{}u128", string_to_u128("AVL".to_string()));
    //     let token_id_u128 = format!("{}u128", string_to_u128("https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.f6s.com%2Fcompany%2Favail-avail.global&psig=AOvVaw2PqnSWdrMxspXoYbX1xHDG&ust=1708445613257000&source=images&cd=vfe&opi=89978449&ved=0CBMQjRxqFwoTCLCV84Dmt4QDFQAAAAAdAAAAABAE".to_string()));
    //     // let token_id_obj = format!("{}")
    //     let token_id_obj = format!("{{
    //         data0: {},
    //         data1: 0u128
    //     }}", token_id_u128);
    //     let total = Value::<Testnet3>::try_from("10u128").unwrap();
    //     let symbol = Value::<Testnet3>::try_from(symbol_u128).unwrap();
    //     let token_id = Value::<Testnet3>::try_from(token_id_obj).unwrap();
    //     let base_uri = Value::<Testnet3>::try_from("{
    //         data0: 143324u128,
    //         data1: 883746u128,
    //         data2: 993843u128,
    //         data3: 932838u128
    //     }").unwrap();
    //     let edition = Value::<Testnet3>::try_from("0scalar").unwrap();
    //     let owner = Value::<Testnet3>::try_from(TESTNET_ADDRESS).unwrap();
    //     let amount = Value::<Testnet3>::try_from("3u8").unwrap();
    //     let settings = Value::<Testnet3>::try_from("3u32").unwrap();
    //     let block = Value::<Testnet3>::try_from("64400u32").unwrap(); //UPDATE ASPER VALUE
    //     let hiding_nonce = Value::<Testnet3>::try_from("1234scalar").unwrap();
    //     // let record_NFT_mint = Value::<Testnet3>::Record(Record::<Testnet3,Plaintext<Testnet3>>::from_str(RECORD_NFT_MINT).unwrap());
    //     // let record_NFT_claim = Value::<Testnet3>::Record(Record::<Testnet3,Plaintext<Testnet3>>::from_str(RECORD_NFT_CLAIM).unwrap());
    //     // Program manager

    //     let pk = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();
    //     let vk = ViewKey::<Testnet3>::try_from(pk).unwrap();
    //     let fee = 10000u64;
    //     let mut program_manager =
    //         ProgramManager::<Testnet3>::new(Some(pk), None, Some(api_client.clone()), None).unwrap();
    //     program_manager.add_program(&nft_program);
    //     // ACT
    //     // ============================== DOCUMENTATION FOR TESTING ==============================
    //     // STEP - 0     DEPLOY PROGRAM (DONT NEED TO DEPLOY AGAIN)
    //     // let deployement_id = program_manager.deploy_program(program_id, 10000u64, None, None).unwrap();
    //     // println!("----> Program Deployed - {:?}", deployement_id);

    //     let program = program_manager.get_program(program_id).unwrap();

    //     // ALEO FUNCTIONS EXECUTION FLOW STARTS HERE
    //     // Comment out steps that you finish executing
    //     // STEP - 1     initialize_collection()
    //     // let init_inputs = vec![total.clone(), symbol.clone(), base_uri.clone()];
    //     // let init_txn_id = program_manager.execute_program(program_id, "initialize_collection", init_inputs.iter(), 10000u64, None, None).unwrap().to_string();
    //     // println!("----> Initialised a NFT Collection (TXN-ID) - {:?}", init_txn_id);

    //     // // STEP - 2     add_nft()
    //     // let add_nft_inputs = vec![token_id.clone(), edition.clone()];
    //     // let add_nft_txn_id = program_manager.execute_program(program_id, "add_nft", add_nft_inputs.iter(), fee, None, None).unwrap().to_string();
    //     // println!("----> Added a NFT to the Collection (TXN-ID) - {:?}", add_nft_txn_id);

    //     // // Get the txn_id from the output and get_transaction() using the output
    //     // // STEP - 3     add_minter()
    //     // let add_minter_inputs = vec![owner.clone(), amount.clone()];
    //     // let add_minter_txn_id = program_manager.execute_program(program_id, "add_minter", add_minter_inputs.iter(), fee, None, None).unwrap().to_string();
    //     // println!("----> Added a Minter to the Collection (TXN-ID) - {:?}", add_nft_txn_id);
    //     // sleep(Duration::from_secs(20)).await;
    //     // println!("Waited 20 secs for the TXN to Broadcast ");
    //     let add_minter_txn = api_client.get_transaction(<Testnet3 as Network>::TransactionID::from_str("at1uete9wa8w993ndy6e0hsynvap0yfpzru82ps5tm3hx6g908p3upsf8kl8s").unwrap()).unwrap();//(<Testnet3 as Network>::TransactionID::from_str(&add_minter_txn_id).unwrap()).unwrap();
    //     println!("----> Minter TXN owner for checking - {:?}", add_minter_txn.owner());
    //     // let record_pointer_NFT_mint =
    //     let mut nonce = "".to_string();
    //     let mut commitment = "".to_string();
    //     let mut latest_height = api_client.latest_height().unwrap();
    //     for transition in add_minter_txn.clone().into_transitions(){
    //         if transition.program_id().to_string() == program_id {
    //             let record_pointer_NFT_mint = transition_to_record_pointer(add_minter_txn.clone().id(), transition.clone(), latest_height, vk).unwrap();
    //             // STEP - 4     set_mint_block()
    //             for record in record_pointer_NFT_mint{
    //                 let mint_block = format!("{}u32",record.pointer.block_height);
    //                 let mint_block_inputs = vec![Value::<Testnet3>::try_from(mint_block.to_string()).unwrap()];
    //                 // let block_txn_id = program_manager.execute_program(program_id, "set_mint_block", mint_block_inputs.iter(), fee, None, None).unwrap().to_string();
    //                 // println!("----> Updated block number (TXN-ID) - {:?}", block_txn_id);

    //                 nonce = record.metadata.nonce;
    //                 commitment = record.pointer.commitment;

    //             }
    //         }
    //     }
    //     // SETUP NFT_MINT RECORD
    //     let NFT_mint_record = format!("{}{}{}", RECORD_NFT_MINT, nonce, ".public }");
    //     println!("----> NFT_mint.record created and stored - {:?}", NFT_mint_record);
    //     // STEP - 5     update_toggle_settings()
    //     let settings_inputs = vec![settings.clone()];
    //     // let settings_txn_id = program_manager.execute_program(program_id, "update_toggle_settings", settings_inputs.iter(), fee, None, None).unwrap().to_string();
    //     // println!("----> Updated settings to allow minting without whitelisting (TXN-ID) - {:?}", settings_txn_id);

    //     // STEP - 6     open_mint()
    //     // let open_mint_inputs = vec![hiding_nonce.clone()];
    //     // let open_mint_txn_id = program_manager.execute_program(program_id, "open_mint", open_mint_inputs.iter(), fee, None, None).unwrap().to_string();
    //     // println!("----> Open Mint function invoked (TXN-ID) - {:?}", open_mint_txn_id);
    //     let open_mint_txn = api_client.get_transaction(<Testnet3 as Network>::TransactionID::from_str("at1xj60pnlgzg0tc5ntm2n02vll93uq4xtretadjzea343h2qgl8gzq4m0yuk").unwrap()).unwrap();
    //     let mut claim_nonce = "".to_string();
    //     let mut claim = "0field";
    //     let mut latest_height = api_client.latest_height().unwrap();
    //     for transition in open_mint_txn.clone().into_transitions(){
    //         if transition.program_id().to_string() == program_id {
    //             let record_pointer_NFT_claim = transition_to_record_pointer(add_minter_txn.clone().id(), transition.clone(), latest_height, vk).unwrap();
    //             for record in record_pointer_NFT_claim{
    //                 claim_nonce = record.metadata.nonce;
    //             }
    //             let ops = &transition.outputs()[1];
    //             println!("----> Claim value fetch sucessful - {:?}", ops);
    //         }
    //     }
    //     // SETUP NFT_CLAIM RECORD
    //     let NFT_claim_record = format!("{}{}{}", RECORD_NFT_CLAIM, claim_nonce, ".public }");
    //     println!("----> NFT_claim.record created and stored - {:?}", NFT_claim_record);

    //     // STEP - 7     mint()
    //     let mint_inputs = vec![Value::<Testnet3>::Record(Record::<Testnet3, Plaintext<Testnet3>>::from_str(&NFT_mint_record.clone()).unwrap()) ,hiding_nonce.clone()];
    //     let mint_txn_id = program_manager.execute_program(program_id, "mint", mint_inputs.iter(), fee, None, None).unwrap().to_string();
    //     println!("----> Mint function invoked (TXN-ID) - {:?}", mint_txn_id);

    //     // STEP - 8     claim_nft()
    //     let nft_inputs = vec![Value::<Testnet3>::Record(Record::<Testnet3, Plaintext<Testnet3>>::from_str(&NFT_claim_record.clone()).unwrap()) ,token_id.clone(), edition.clone()];
    //     let nft_txn_id = program_manager.execute_program(program_id, "claim_nft", nft_inputs.iter(), fee, None, None).unwrap().to_string();
    //     println!("----> NFT Claimed (TXN-ID) - {:?}", nft_txn_id);

    //     // // FINAL STEP - SEND THE TRANSITION TO FUNCTION TO GET RECORD TYPE
    //     let nft_txn = api_client.get_transaction(<Testnet3 as Network>::TransactionID::from_str("at1ya42tgdqawkkwf5t8ezuez954j3lgpv92xqhlcc0eajfnzrwlc9qhgve9y").unwrap()).unwrap();
    //     for transition in nft_txn.clone().into_transitions(){
    //         if transition.program_id().to_string() == program_id {
    //             let record_pointer_NFT = transition_to_record_pointer(add_minter_txn.clone().id(), transition.clone(), latest_height, vk).unwrap();

    //             println!("----> NFT Fetched sucessfully - {:?}", record_pointer_NFT);
    //         }
    //     }

    // }
    // // // fn get_nonce<N:Network>(txn: Transaction<N>, program_id: &str, api_client: AleoAPIClient<N>, vk: ViewKey<N> ) -> Metadata{
    // //     let latest_height = api_client.latest_height().unwrap();
    // //     for transition in txn.into_transitions(){
    // //         if transition.program_id().to_string() == program_id {
    // //             println!("----> Transition Found - {:?}", transition.id());
    // //             let res = transition_to_record_pointer(txn.id(), transition.clone(), latest_height, vk).unwrap();
    // //             let metadata = for record in res.iter(){
    // //                 return record.metadata;
    // //             }
    // //         }
    // //     }
    // //     return ();
    // }
}
