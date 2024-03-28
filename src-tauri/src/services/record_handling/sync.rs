use snarkvm::prelude::*;
use tauri::Window;
use uuid::Uuid;

use crate::{
    api::{
        aleo_client::{setup_client, setup_local_client},
        encrypted_data::{
            delete_invalid_transactions_in, get_new_transaction_messages, post_encrypted_data,
            synced,
        },
    },
    helpers::utils::get_timestamp_from_i64_utc,
    models::event::TxScanResponse,
    models::pointers::message::TransactionMessage,
    services::local_storage::{
        encrypted_data::{
            get_encrypted_data_to_backup, get_encrypted_data_to_update,
            update_encrypted_data_synced_on_by_id,
        },
        storage_api::records::{encrypt_and_store_records, update_records_spent_backup},
    },
};

use std::str::FromStr;

use avail_common::{
    errors::{AvailError, AvailErrorType, AvailResult},
    models::{encrypted_data::EncryptedData, network::SupportedNetworks},
};

use crate::services::local_storage::persistent_storage::{
    get_address, get_backup_flag, get_last_backup_sync, get_last_sync, get_network,
    update_last_backup_sync,
};

use super::{records::get_records, utils::sync_transaction};

/// processes transactions into record and transition pointers and stores them
fn process_transaction<N: Network>(
    transaction_message: &TransactionMessage<N>,
    address: Address<N>,
    id: Uuid,
) -> AvailResult<(Vec<EncryptedData>, Vec<EncryptedData>, Option<Uuid>)> {
    let (transaction, timestamp) = transaction_message.verify()?;

    if let Some(transaction) = transaction {
        println!("Transaction verified");
        let (_, record_pointers, encrypted_transitions, _) = sync_transaction(
            &transaction,
            transaction_message.confirmed_height(),
            timestamp,
            transaction_message.message(),
            Some(transaction_message.from()),
        )?;
        println!("{:?}", record_pointers);
        let encrypted_records = encrypt_and_store_records(record_pointers, address)?;
        Ok((encrypted_records, encrypted_transitions, None))
    } else {
        println!("Transaction failed verification");
        Ok((vec![], vec![], Some(id)))
    }
}

#[tauri::command(rename_all = "snake_case")]
pub async fn txs_sync() -> AvailResult<TxScanResponse> {
    let network = get_network()?;

    let transactions = match SupportedNetworks::from_str(&network)? {
        SupportedNetworks::Testnet3 => txs_sync_raw::<Testnet3>().await?,
        _ => txs_sync_raw::<Testnet3>().await?, //SupportedNetworks::Devnet => txs_sync_raw::<Devnet>().await?,
                                                //SupportedNetworks::Mainnet => txs_sync_raw::<Mainnet>().await?,
    };

    Ok(transactions)
}

/// syncs transactions sent to user by another avail user
pub async fn txs_sync_raw<N: Network>() -> AvailResult<TxScanResponse> {
    let api_client = setup_client::<N>()?;

    let backup = get_backup_flag()?;

    let address = get_address::<N>()?;
    let latest_height = api_client.latest_height()?;

    let (txs_in, ids) = get_new_transaction_messages::<N>().await?;

    println!("Transactions In: {:?}", txs_in);

    if txs_in == vec![] {
        let res = TxScanResponse {
            txs: false,
            block_height: latest_height,
        };
        return Ok(res);
    }

    let mut records_n_transitions_to_post = txs_in
        .iter()
        .zip(ids.iter())
        .map(|(tx, id)| {
            let (encrypted_records, encrypted_transitions, invalid_tx) =
                process_transaction(tx, address, *id)?;
            Ok((encrypted_records, encrypted_transitions, invalid_tx))
        })
        .collect::<AvailResult<Vec<(Vec<EncryptedData>, Vec<EncryptedData>, Option<Uuid>)>>>()?;

    if backup {
        // separate records and transitions
        let records_to_post = records_n_transitions_to_post
            .iter_mut()
            .flat_map(|(records, _, _)| records.clone())
            .collect::<Vec<EncryptedData>>();

        let transitions_to_post = records_n_transitions_to_post
            .iter_mut()
            .flat_map(|(_, transitions, _)| transitions.clone())
            .collect::<Vec<EncryptedData>>();

        let invalid_ids = records_n_transitions_to_post
            .iter_mut()
            .filter_map(|(_, _, invalid_id)| *invalid_id)
            .collect::<Vec<Uuid>>();

        let encrypted_record_ids = post_encrypted_data(records_to_post).await?;
        let encrypted_transition_ids = post_encrypted_data(transitions_to_post).await?;

        encrypted_record_ids
            .iter()
            .map(|id| update_encrypted_data_synced_on_by_id(id))
            .collect::<AvailResult<Vec<()>>>()?;

        encrypted_transition_ids
            .iter()
            .map(|id| update_encrypted_data_synced_on_by_id(id))
            .collect::<AvailResult<Vec<()>>>()?;

        let ids_to_sync = ids
            .iter()
            .filter(|id| !invalid_ids.contains(id))
            .copied()
            .collect::<Vec<Uuid>>();

        synced(ids_to_sync).await?;
        delete_invalid_transactions_in(invalid_ids).await?;
    } else {
        //NOTE - delete encrypted messages (The name may be misleading, but this is just to clear the encrypted transaction messages sent after they are received.)
        delete_invalid_transactions_in(ids).await?;
    }

    let res = TxScanResponse::new(true, latest_height);
    Ok(res)

    // TODO - Check if the records were spent through another platform in the meantime by taking the min block height, getting all the tags and checking the records found against them.
}

// NOTE - Production, passes window as parameter
///scans all blocks from last sync to cater for transitions, new records created
#[tauri::command(rename_all = "snake_case")]
pub async fn blocks_sync(height: u32, window: Window) -> AvailResult<bool> {
    let network = get_network()?;
    let last_sync = get_last_sync()?;

    print!("From Last Sync: {:?} to height: {:?}", last_sync, height);

    let task = tokio::spawn(async move {
        let found_flag = match SupportedNetworks::from_str(network.as_str())? {
            SupportedNetworks::Testnet3 => {
                get_records::<Testnet3>(last_sync, height, Some(window))?
            }
            _ => {
                return Err(AvailError::new(
                    AvailErrorType::Internal,
                    "Invalid Network".to_string(),
                    "Invalid Network".to_string(),
                ));
            }
        };

        Ok(found_flag)
    });

    let result = task.await;

    let found_flag = match result {
        Ok(res) => res?,
        Err(_) => {
            return Err(AvailError::new(
                AvailErrorType::Internal,
                "Error scanning Aleo blockchain".to_string(),
                "Error scanning Aleo blockchain".to_string(),
            ));
        }
    };

    print!("Scan Complete");

    Ok(found_flag)
}

// TODO - Handle splitting the payload if it maxes deserialization limit.
/// Backs up unsynced encrypted data to the server
#[tauri::command(rename_all = "snake_case")]
pub async fn sync_backup() -> AvailResult<()> {
    let network = get_network()?;
    let backup = get_backup_flag()?;

    if backup {
        let last_backup_sync = get_last_backup_sync()?;

        /* Handle spent updates first */
        let encrypted_data_to_update = get_encrypted_data_to_update(last_backup_sync)?;

        let ids_to_update = encrypted_data_to_update
            .iter()
            .filter_map(|data| data.id)
            .map(|id| id.to_string())
            .collect::<Vec<String>>();

        // post spent updates
        match SupportedNetworks::from_str(network.as_str())? {
            SupportedNetworks::Testnet3 => {
                update_records_spent_backup::<Testnet3>(ids_to_update).await?
            }
            _ => update_records_spent_backup::<Testnet3>(ids_to_update).await?,
        };

        /* Handle posting new found encrypted data */
        let encrypted_data = get_encrypted_data_to_backup(last_backup_sync)?;

        println!("Encrypted Data: {:?}", encrypted_data);

        let ids = post_encrypted_data(encrypted_data).await?;

        ids.iter()
            .map(|id| update_encrypted_data_synced_on_by_id(id))
            .collect::<AvailResult<Vec<()>>>()?;

        let last_sync = get_last_sync()?;

        // get timestamp from block
        let api_client = match SupportedNetworks::from_str(&network)? {
            SupportedNetworks::Testnet3 => setup_client::<Testnet3>(),
            _ => setup_client::<Testnet3>(),
        };

        let block = api_client?.get_block(last_sync)?;
        let timestamp = get_timestamp_from_i64_utc(block.timestamp())?;

        update_last_backup_sync(timestamp)
    } else {
        Err(AvailError::new(
            AvailErrorType::Internal,
            "Backup not enabled, go to settings to enable it.".to_string(),
            "Backup not enabled, go to settings to enable it.".to_string(),
        ))
    }
}

pub async fn blocks_sync_test(height: u32) -> AvailResult<bool> {
    let network = get_network()?;
    let last_sync = 1720731u32;

    print!("From Last Sync: {:?} to height: {:?}", last_sync, height);

    let task = tokio::spawn(async move {
        let found_flag = match SupportedNetworks::from_str(network.as_str())? {
            SupportedNetworks::Testnet3 => get_records::<Testnet3>(last_sync, 1764731u32, None)?,
            _ => {
                return Err(AvailError::new(
                    AvailErrorType::Internal,
                    "Invalid Network".to_string(),
                    "Invalid Network".to_string(),
                ));
            }
        };

        Ok(found_flag)
    });

    let result = task.await;

    let found_flag = match result {
        Ok(res) => res?,
        Err(_) => {
            return Err(AvailError::new(
                AvailErrorType::Internal,
                "Error scanning Aleo blockchain".to_string(),
                "Error scanning Aleo blockchain".to_string(),
            ));
        }
    };

    print!("Scan Complete {}", found_flag);

    Ok(found_flag)
}

#[cfg(test)]
mod test {
    use super::*;

    use crate::api::encrypted_data::delete_all_server_storage;
    use crate::api::user::delete_user;
    use crate::models::{storage::languages::Languages, transfer::TransferRequest};
    use crate::services::account::generation::import_wallet;
    use crate::{
        models::pointers::transaction::TransactionPointer,
        services::{
            account::key_management::key_controller::KeyController,
            authentication::session::get_session_after_creation,
            local_storage::{
                encrypted_data::{
                    drop_encrypted_data_table, get_encrypted_data_by_flavour,
                    initialize_encrypted_data_table,
                },
                persistent_storage::{
                    delete_user_preferences, initial_user_preferences, update_address,
                    update_last_sync,
                },
                session::view::VIEWSESSION,
                storage_api::transaction::decrypt_transactions_exec,
            },
            record_handling::{records::find_aleo_credits_record_to_spend, transfer::transfer_raw},
        },
    };

    use avail_common::{
        aleo_tools::program_manager::{ProgramManager, TransferType},
        models::constants::*,
    };

    #[cfg(target_os = "linux")]
    use crate::services::account::key_management::key_controller::linuxKeyController;
    #[cfg(target_os = "macos")]
    use crate::services::account::key_management::key_controller::macKeyController;
    #[cfg(target_os = "windows")]
    use crate::services::account::key_management::key_controller::windowsKeyController;

    use snarkvm::prelude::{AleoID, Field, FromStr, PrivateKey, Testnet3, ToBytes, ViewKey};

    fn test_setup_prerequisites() {
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
    }
    #[tokio::test]
    async fn test_blocks_scan() {
        //NOTE - Don't forget to change OS depending on what you testing on -default should be linux

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

        let vk = ViewKey::<Testnet3>::try_from(&pk).unwrap();

        delete_user_preferences().unwrap();
        initial_user_preferences(
            false,
            None,
            None,
            false,
            true,
            vk.to_address().to_string(),
            Languages::English,
        )
        .unwrap();

        get_session_after_creation(&pk).await.unwrap();
        delete_user().await.unwrap();

        key_controller
            .delete_key(Some(STRONG_PASSWORD), ext)
            .unwrap();

        //delete_all_server_storage().await.unwrap();
        drop_encrypted_data_table().unwrap();

        delete_user_preferences().unwrap();
        // initialize the user preferences

        import_wallet(
            None,
            STRONG_PASSWORD.to_string(),
            false,
            &pk.to_string(),
            false,
            Languages::English,
        )
        .await
        .unwrap();

        let fee = 4000000u64;
        let amount = 100000u64;
        let recipient_address = Address::<Testnet3>::from_str(TESTNET3_ADDRESS).unwrap();
        let asset_id = "credits".to_string();

        let request = TransferRequest::new(
            recipient_address.to_string(),
            amount,
            Some("Public to Private Transfer Test".to_string()),
            Some(STRONG_PASSWORD.to_string()),
            TransferType::Public,
            false,
            fee,
            asset_id,
        );

        transfer_raw::<Testnet3>(request, None).await.unwrap();

        let recipient_view_key = ViewKey::<Testnet3>::from_str(TESTNET3_VIEW_KEY).unwrap();

        VIEWSESSION
            .set_view_session(&recipient_view_key.to_string())
            .unwrap();

        update_address(&recipient_address.to_string()).unwrap();

        tokio::time::sleep(tokio::time::Duration::from_secs(45)).await;

        let api_client = setup_client::<Testnet3>().unwrap();

        let latest_height = api_client.latest_height().unwrap();

        blocks_sync_test(latest_height).await.unwrap();

        //sync_backup().await.unwrap();
    }

    #[tokio::test]
    async fn test_scan() {
        //test_setup_prerequisites();
        VIEWSESSION
            .set_view_session("AViewKey1tLudtDDJQBBcHBnBLaHTJVCdyBeNgwks9oYivxBSeegZ")
            .unwrap();

        let api_client = setup_client::<Testnet3>().unwrap();

        let latest_height = api_client.latest_height().unwrap();

        let start = std::time::Instant::now();
        blocks_sync_test(latest_height).await.unwrap();
        let duration = start.elapsed();

        println!("Time elapsed in blocks_sync_test() is: {:?}", duration);
    }

    // this will fail when using the same program name with the same node instance or live network
    #[tokio::test]
    async fn test_deployment_scan() {
        /* prepare record for fee */
        //NOTE - Don't forget to change OS depending on what you testing on -default should be linux

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

        let fee = 4000000u64;
        let amount = 100000u64;
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

        /* --Setup Done-- */

        let recipient_view_key = ViewKey::<Testnet3>::from_str(TESTNET3_VIEW_KEY).unwrap();
        let vk_bytes = recipient_view_key.to_bytes_le().unwrap();

        VIEWSESSION
            .set_view_session(&recipient_view_key.to_string())
            .unwrap();

        let _res = txs_sync().await.unwrap();

        let (string, program) = Program::<Testnet3>::parse(
            r"
program ftesting.aleo;

mapping store:
key as u32.public;
value as u32.public;

function compute:
input r0 as u32.private;
add r0 r0 into r1;
output r1 as u32.public;",
        )
        .unwrap();
        assert!(
            string.is_empty(),
            "Parser did not consume all of the string: '{string}'"
        );

        let pk2 = PrivateKey::<Testnet3>::from_str(TESTNET3_PRIVATE_KEY).unwrap();

        let api_client = setup_client::<Testnet3>().unwrap();

        let mut program_manager =
            ProgramManager::<Testnet3>::new(Some(pk2), None, Some(api_client.clone()), None)
                .unwrap();

        program_manager.add_program(&program).unwrap();

        let (fee_record, _fee_commitment, _fee_id) =
            find_aleo_credits_record_to_spend::<Testnet3>(&(amount - 1000), vec![]).unwrap();

        let _deployment = program_manager
            .deploy_program(program.id(), 0u64, Some(fee_record), None)
            .unwrap();

        let latest_height1 = api_client.latest_height().unwrap();
        update_last_sync(latest_height1).unwrap();

        // go to sleep for 2 minutes
        tokio::time::sleep(tokio::time::Duration::from_secs(25)).await;

        let latest_height2 = api_client.latest_height().unwrap();
        blocks_sync_test(latest_height2).await.unwrap();
    }

    #[tokio::test]
    async fn test_txs_scan() {
        /* prepare record for fee */
        /* -- Has to be called here cause has to await-- */
        let pk = PrivateKey::<Testnet3>::from_str(TESTNET3_PRIVATE_KEY).unwrap();
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

        match key_controller.delete_key(Some(STRONG_PASSWORD), ext) {
            Ok(_) => println!("Key deleted"),
            Err(e) => println!("Error deleting key: {:?}", e),
        }

        drop_encrypted_data_table().unwrap();

        delete_user_preferences().unwrap();
        // initialize the user preferences

        import_wallet(
            Some("SatoshiXY".to_string()),
            STRONG_PASSWORD.to_string(),
            false,
            &pk.to_string(),
            false,
            Languages::English,
        )
        .await
        .unwrap();

        println!("Imported Successfully");

        let fee = 300000u64;
        let amount = 400000u64;
        let recipient_address = Address::<Testnet3>::from_str(TESTNET3_ADDRESS_2).unwrap();
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

        /* --Setup Done-- */

        println!("Testing Complete transaction storage");
        let data = get_encrypted_data_by_flavour(
            avail_common::models::encrypted_data::EncryptedDataTypeCommon::TransactionMessage,
        )
        .unwrap();
        println!("{:?}\n", data);
        let transactions = decrypt_transactions_exec::<Testnet3>(data.clone()).unwrap();
        println!("{:?}\n", transactions);

        for data_p in data {
            let event = TransactionPointer::<Testnet3>::decrypt_to_event(data_p).unwrap();
            println!("{:?}", event);
        }

        let recipient_view_key = ViewKey::<Testnet3>::from_str(TESTNET3_VIEW_KEY2).unwrap();
        let vk_bytes = recipient_view_key.to_bytes_le().unwrap();

        VIEWSESSION
            .set_view_session(&recipient_view_key.to_string())
            .unwrap();
        update_address(&recipient_address.to_string()).unwrap();

        let _res = txs_sync().await.unwrap();

        println!("res: {:?}", _res);
    }

    #[test]
    fn test_process_transaction_failed_verification() {
        let tx_id = &AleoID::<Field<Testnet3>, 29793>::from_str(
            "at1w8t8pkc9xuf2p05gp9fanxpx0h53jmpguc07ja34s3jm905v65gss306rr",
        )
        .unwrap();

        let transition_id = &AleoID::<Field<Testnet3>, 30049>::from_str(
            "au1w8t8pkc9xuf2p05gp9fanxpx0h53jmpguc07ja34s3jm905v65gss306rr",
        )
        .unwrap();

        let test_transaction_message = TransactionMessage::<Testnet3>::new(
            tx_id.clone(),
            0u32,
            "Zack".to_string(),
            Some("Hello".to_string()),
        );

        let address = Address::<Testnet3>::from_str(TESTNET_ADDRESS).unwrap();

        let res = process_transaction(&test_transaction_message, address, Uuid::new_v4()).unwrap();

        println!("res: {:?}", res);
    }

    #[test]
    fn test_get_latest_height() {
        let api_client = setup_client::<Testnet3>().unwrap();

        let latest_height = api_client.latest_height().unwrap();
        println!("latest_height: {:?}", latest_height);
    }

    #[tokio::test]
    async fn test_transition_ownership() {
        /* prepare record for fee */
        //NOTE - Don't forget to change OS depending on what you testing on -default should be linux

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

        drop_encrypted_data_table().unwrap();

        delete_user_preferences().unwrap();
        // initialize the user preferences

        import_wallet(
            Some("SatoshiX".to_string()),
            STRONG_PASSWORD.to_string(),
            false,
            &pk.to_string(),
            false,
            Languages::English,
        )
        .await
        .unwrap();

        let fee = 4000000u64;
        let amount = 100000u64;
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

        /* --Setup Done-- */

        let recipient_view_key = ViewKey::<Testnet3>::from_str(TESTNET3_VIEW_KEY).unwrap();
        let vk_bytes = recipient_view_key.to_bytes_le().unwrap();

        VIEWSESSION
            .set_view_session(&recipient_view_key.to_string())
            .unwrap();

        tokio::time::sleep(tokio::time::Duration::from_secs(30)).await;

        let api_client = setup_client::<Testnet3>().unwrap();
        let latest_height2 = api_client.latest_height().unwrap();
        blocks_sync_test(latest_height2).await.unwrap();
    }
}
