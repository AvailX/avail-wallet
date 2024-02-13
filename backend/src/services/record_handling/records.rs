use snarkvm::prelude::{Network, Plaintext, Record};

//use rayon::prelude::*;
use crate::{
    api::aleo_client::{setup_client, setup_local_client},
    helpers::utils::get_timestamp_from_i64,
    models::wallet_connect::records::{GetRecordsRequest, RecordFilterType, RecordsFilter},
    services::{
        local_storage::{
            encrypted_data::handle_block_scan_failure,
            persistent_storage::{get_address_string, update_last_sync},
            session::view::VIEWSESSION,
            storage_api::{
                deployment::find_encrypt_store_deployments,
                records::{get_record_pointers, get_record_pointers_for_record_type},
                transaction::get_tx_ids_from_date,
            },
        },
        record_handling::utils::sync_transaction,
    },
};
use std::ops::Sub;
use tauri::{Manager, Window};

use avail_common::{
    aleo_tools::program_manager::Credits,
    errors::{AvailError, AvailErrorType, AvailResult},
    models::encrypted_data::{EncryptedData, RecordTypeCommon},
};

/// Scans the blockchain for new records, distills record pointers, transition pointer and tags, and returns them
pub fn get_records<N: Network>(
    last_sync: u32,
    height: u32,
    window: Option<Window>,
) -> AvailResult<bool> {
    let view_key = VIEWSESSION.get_instance::<N>()?;
    let address = view_key.to_address();

    let api_client = setup_local_client::<N>();

    let step_size = 49;

    let latest_height = height;

    let last_sync_block = api_client.get_block(last_sync)?;
    let last_sync_timestamp = get_timestamp_from_i64(last_sync_block.timestamp())?;

    let stored_transaction_ids = get_tx_ids_from_date::<N>(last_sync_timestamp)?;

    let mut end_height = last_sync.saturating_add(step_size);
    let mut start_height = last_sync;

    if end_height > latest_height {
        end_height = latest_height;
    }

    let mut found_flag = false;

    for _ in (last_sync..latest_height).step_by(step_size as usize) {
        let mut blocks = api_client.get_blocks(start_height, end_height)?;
        //blocks.reverse();

        for block in blocks {
            // Check for deployment transactions
            let transactions = block.transactions();
            let timestamp = get_timestamp_from_i64(block.clone().timestamp())?;
            let height = block.height();

            find_encrypt_store_deployments(
                transactions,
                height,
                timestamp,
                address,
                stored_transaction_ids.clone(),
            )?;

            for transaction in transactions.iter() {
                if stored_transaction_ids.contains(&transaction.id()) {
                    continue;
                }

                let transaction_result =
                    match sync_transaction::<N>(transaction, height, timestamp, None, None) {
                        Ok(transaction_result) => transaction_result,
                        Err(e) => {
                            match handle_block_scan_failure::<N>(height) {
                                Ok(_) => {}
                                Err(e) => {
                                    return Err(AvailError::new(
                                        AvailErrorType::Internal,
                                        e.to_string(),
                                        "Error syncing transaction".to_string(),
                                    ));
                                }
                            }

                            return Err(AvailError::new(
                                AvailErrorType::Internal,
                                e.to_string(),
                                "Error syncing transaction".to_string(),
                            ));
                        }
                    };

                found_flag = transaction_result.0.is_some()
                    || !transaction_result.1.is_empty()
                    || !transaction_result.2.is_empty();
            }

            // if anything fails before here, all data relate to {height} must be purged.
            println!("Syncing.. {}", height);
            update_last_sync(height)?;
        }

        // calculate percentage of blocks scanned at each step
        let percentage = (((end_height - last_sync) as f32 / (latest_height - last_sync) as f32)
            * 10000 as f32)
            .round()
            / 100.0;

        // if percentage is greater than 100, set it to 100
        let percentage = if percentage > 100.0 {
            100.0
        } else {
            percentage
        };

        println!("{}% of blocks scanned", percentage);

        // update progress bar
        if let Some(window) = window.clone() {
            match window.emit("scan_progress", percentage) {
                Ok(_) => {}
                Err(e) => {
                    return Err(AvailError::new(
                        AvailErrorType::Internal,
                        e.to_string(),
                        "Error updating progress bar".to_string(),
                    ));
                }
            };
        }

        // Search in reverse order from the latest block to the earliest block
        start_height = end_height + 1;
        end_height = start_height.saturating_add(step_size);
        if end_height > latest_height {
            end_height = latest_height;
        };
    }

    println!("Found flag: {}", found_flag);
    Ok(found_flag)
}

/// Fetches an aleo credits record to spend
pub fn find_aleo_credits_record_to_spend<N: Network>(
    amount: &u64,
    previous: Vec<String>,
) -> AvailResult<(Record<N, Plaintext<N>>, String, String)> {
    let address = get_address_string()?;
    let (record_pointers, encrypted_record_ids) =
        get_record_pointers_for_record_type::<N>(RecordTypeCommon::AleoCredits, &address)?;

    let mut iter = 0;
    let mut balance_counter = 0u64;

    for record in record_pointers.iter() {
        if record.metadata.spent {
            iter += 1;
            continue;
        }
        if previous.clone().contains(&record.metadata.nonce) {
            iter += 1;
            continue;
        }

        let aleo_record = record.to_record()?;
        let record_amount = aleo_record.microcredits()?;

        if &record_amount >= amount {
            return Ok((
                aleo_record,
                record.pointer.commitment.clone(),
                encrypted_record_ids[iter].clone(),
            ));
        }

        iter += 1;
        balance_counter += record_amount;
    }

    // TODO - implement join_n
    if &balance_counter > amount {
        return Err(AvailError::new(
            AvailErrorType::Internal,
            "Join aleo credit records to obtain a sufficient balance.".to_string(),
            "Join aleo credit records to obtain a sufficient balance.".to_string(),
        ));
    }

    Err(AvailError::new(
        AvailErrorType::Internal,
        "Not enough balance".to_string(),
        "Not enough balance".to_string(),
    ))

    // find first record that satisfies the amount required
}

pub fn find_tokens_to_spend<N: Network>(
    asset_id: &str,
    amount: &u64,
    previous: Vec<String>,
) -> AvailResult<(Record<N, Plaintext<N>>, String, String)> {
    let _address = get_address_string()?;
    let program_id = format!("{}{}", asset_id, ".aleo");
    let record_name = format!("{}{}", asset_id, ".record");

    let filter = RecordsFilter::new(
        vec![program_id.to_string()],
        None,
        RecordFilterType::Unspent,
        Some(record_name.to_string()),
    );
    let get_records_request = GetRecordsRequest::new(None, Some(filter), None);
    let (record_pointers, ids) = get_record_pointers::<N>(get_records_request)?;

    let mut iter = 0;
    let mut balance_counter = 0u64;

    for record in record_pointers.iter() {
        if record.metadata.spent {
            iter += 1;
            continue;
        }
        if previous.clone().contains(&record.metadata.nonce) {
            iter += 1;
            continue;
        }

        let aleo_record = record.to_record()?;
        let record_amount = aleo_record.microcredits()?;

        if &record_amount >= amount {
            return Ok((
                aleo_record,
                record.pointer.commitment.clone(),
                ids[iter].clone(),
            ));
        }

        iter += 1;
        balance_counter += record_amount;
    }

    // TODO - implement join_n
    if &balance_counter > amount {
        return Err(AvailError::new(
            AvailErrorType::Internal,
            "Join token records to obtain a sufficient balance.".to_string(),
            "Join token records to obtain a sufficient balance.".to_string(),
        ));
    }

    Err(AvailError::new(
        AvailErrorType::Internal,
        "Not enough balance".to_string(),
        "Not enough balance".to_string(),
    ))

    // find first record that satisfies the amount required
}

///Joins two records together
/// TODO - Join n records to meet amount x
/*
async fn join_records<N: Network>(
    pk: PrivateKey<N>,
    amount: u64,
    token: &str,
) -> AvailResult<String> {
    let fee = 10000u64;

    let fee_record = find_aleo_credits_record_to_spend::<N>(fee, vec![])?;

    // TODO - iteratively find records until amount is satisfied


    let inputs: Vec<Value<N>> = vec![Value::Record(input_record), Value::Record(input2_record)];

    let api_client = AleoAPIClient::<N>::local_testnet3("3030");
    let mut program_manager =
        ProgramManager::<N>::new(Some(pk), None, Some(api_client), None).unwrap();

    //calculate estimate

    let join_execution = program_manager.execute_program(
        "credits.aleo",
        "join",
        inputs.iter(),
        fee,
        fee_record,
        None,
    )?;

    update_identifier_status(fee_commitment, &fee_id).await?;
    update_identifier_status(input_commitment, &input_id).await?;
    update_identifier_status(input2_commitment, &input2_id).await?;

    //check tx block, normal post tx procedure
    Ok(join_execution)
}
*/

///Splits a record into two records
/*
async fn split_records<N: Network>(
    pk: PrivateKey<N>,
    amount: u64,
    token: &str,
) -> AvailResult<String> {
    let fee = 10000u64;

    let fee_record = find_aleo_credits_record_to_spend::<N>(fee, vec![])?;

    let input_record = find_aleo_credits_record_to_spend::<N>(amount, vec![])?;

    let inputs: Vec<Value<N>> = vec![Value::Record(input_record)];

    let api_client = AleoAPIClient::<N>::local_testnet3("3030");
    let mut program_manager =
        ProgramManager::<N>::new(Some(pk), None, Some(api_client), None).unwrap();

    let split_execution = program_manager.execute_program(
        "credits.aleo",
        "split",
        inputs.iter(),
        fee,
        fee_record,
        None,
    )?;

    //TODO - How to get commitment from record

    update_identifier_status(fee_record.to_commitment(program_id, record_name), &fee_id).await?;
    update_identifier_status(input_commitment, &input_id).await?;

    Ok(split_execution)
}
*/

#[cfg(test)]
mod record_handling_test {
    use super::*;
    use crate::services::local_storage::persistent_storage::get_last_sync;
    use snarkvm::prelude::{AleoID, Field, Testnet3};
    use std::str::FromStr;

    #[test]
    fn test_get_transaction() {
        let start = 500527u32;
        let end = 500531u32;

        let api_client = setup_local_client::<Testnet3>();

        let blocks = api_client.get_blocks(start, end).unwrap();

        let tx_id = &AleoID::<Field<Testnet3>, 29793>::from_str(
            "at1w8t8pkc9xuf2p05gp9fanxpx0h53jmpguc07ja34s3jm905v65gss306rr",
        );

        for block in blocks {
            let transactions = block.transactions();

            match tx_id {
                Ok(tx_id) => {
                    let tx = transactions.get(tx_id);
                    let info = match tx {
                        Some(tx) => tx,
                        None => {
                            println!("tx not found");
                            continue;
                        }
                    };
                    println!("info: {:?}", info);
                }
                Err(e) => {
                    print!("{}", e.to_string())
                }
            }
        }
    }

    /*
    #[test]
    fn test_nova() {
        let _res = get_nova_records::<Testnet3>(372243).unwrap();

        println!("res: {:?}", _res);
    }
    */

    #[test]
    fn test_get_records() {
        let api_client = setup_local_client::<Testnet3>();

        let latest_height = api_client.latest_height().unwrap();
        let last_sync = get_last_sync().unwrap();

        let _res = get_records::<Testnet3>(last_sync, latest_height, None).unwrap();

        println!("res: {:?}", _res);
    }

    #[test]
    fn find_aleo_credits_record_to_spend_test() {
        let _res = find_aleo_credits_record_to_spend::<Testnet3>(&10000, vec![]).unwrap();

        println!("res: {:?}", _res);
    }
}
