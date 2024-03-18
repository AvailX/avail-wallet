use snarkvm::{console::program::Itertools, prelude::Network};
use std::str::FromStr;
use tauri_plugin_http::reqwest;
use uuid::Uuid;

use crate::{
    api::client::get_rm_client_with_session,
    models::pointers::message::TransactionMessage,
    services::local_storage::{
        persistent_storage::{get_address_string, get_last_tx_sync, update_last_tx_sync},
        session::view::VIEWSESSION,
    },
};

use avail_common::{
    errors::{AvError, AvailError, AvailErrorType, AvailResult},
    models::{
        encrypted_data::{
            Data, DataRequest, EncryptedData, EncryptedDataRecord, EncryptedDataSyncRequest,
            EncryptedDataUpdateRequest, PageRequest,
        },
        traits::encryptable::EncryptedStruct,
    },
};

/* --ENCRYPTED DATA SERVICE-- */

/// update encrypted data by id
pub async fn update_data(data: Vec<EncryptedData>, idx: Vec<String>) -> AvailResult<String> {
    const MAX_BATCH_SIZE: usize = 300;

    // Assuming data and idx have the same length
    let batches = data.chunks(MAX_BATCH_SIZE);
    let idx_batches = idx.chunks(MAX_BATCH_SIZE);

    for (batch, idx_batch) in batches.zip(idx_batches) {
        let request = batch
            .iter()
            .enumerate()
            .map(|(i, data)| {
                let id = Uuid::from_str(&idx_batch[i])?;
                Ok(EncryptedDataUpdateRequest {
                    id,
                    ciphertext: data.ciphertext.clone(),
                    nonce: data.nonce.clone(),
                })
            })
            .collect::<Result<Vec<EncryptedDataUpdateRequest>, AvailError>>()?;

        let res = get_rm_client_with_session(reqwest::Method::PUT, "data")?
            .json(&request)
            .send()
            .await?;

        if res.status() == 200 {
            let _result = res.text().await?;
        } else if res.status() == 401 {
            return Err(AvailError::new(
                AvailErrorType::Unauthorized,
                "User session has expired.".to_string(),
                "Your session has expired, please authenticate again.".to_string(),
            ));
        } else {
            return Err(AvailError::new(
                AvailErrorType::External,
                "Error updating encrypted data record ".to_string(),
                "Error updating backup data.".to_string(),
            ));
        }
    }

    Ok("Updated Succesfully".to_string())
}

/// update transactions received to synced
pub async fn synced(ids: Vec<Uuid>) -> AvailResult<String> {
    let res = get_rm_client_with_session(reqwest::Method::PUT, "sync")?
        .json(&ids)
        .send()
        .await?;

    if res.status() == 200 {
        let result = res.text().await?;
        Ok(result)
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error syncing data".to_string(),
            "Error syncing data".to_string(),
        ))
    }
}

///recover_txs get all blocks, tx_in and tx_out back locally
pub async fn get_new_transaction_messages<N: Network>(
) -> AvailResult<(Vec<TransactionMessage<N>>, Vec<Uuid>)> {
    let address = get_address_string()?;
    let last_sync_time = get_last_tx_sync()?;

    let request = EncryptedDataSyncRequest {
        owner: address,
        last_sync: last_sync_time,
    };
    println!("==/> POST DATA TX-SENT - {:?}", request);
    let res = get_rm_client_with_session(reqwest::Method::POST, "txs_received")?
        .json(&request)
        .send()
        .await?;

    if res.status() == 200 {
        // update last sync time
        update_last_tx_sync(chrono::Utc::now())?;

        let result: Vec<EncryptedDataRecord> = res.json().await?;

        println!("Enc Data {:?}", result);
        let encrypted_txs = result
            .clone()
            .into_iter()
            .map(|x| x.to_enrypted_struct::<N>())
            .collect::<AvailResult<Vec<EncryptedStruct<N>>>>()?;

        let v_key = VIEWSESSION.get_instance::<N>()?;

        let txs_in: Vec<TransactionMessage<N>> = encrypted_txs
            .into_iter()
            .map(|x| x.decrypt(v_key))
            .collect::<Result<Vec<TransactionMessage<N>>, _>>()?;

        let ids = result
            .into_iter()
            .map(|x| {
                x.id.ok_or_else(|| {
                    AvailError::new(
                        AvailErrorType::Internal,
                        "Transaction id not found".to_string(),
                        "Transaction Id not found".to_string(),
                    )
                })
            })
            .collect::<Result<Vec<Uuid>, AvailError>>()?;

        Ok((txs_in, ids))
    } else if res.status() == 401 {
        Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ))
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error checking transaction messages".to_string(),
            "Error checking transaction messages".to_string(),
        ))
    }
}

pub async fn post_encrypted_data(request: Vec<EncryptedData>) -> AvailResult<Vec<String>> {
    const MAX_BATCH_SIZE: usize = 300;
    let mut ids: Vec<String> = Vec::new();

    // Split the request into batches of MAX_BATCH_SIZE
    let batches = request.chunks(MAX_BATCH_SIZE);

    for batch in batches {
        let request = batch
            .into_iter()
            .map(|data| EncryptedDataRecord::from(data.to_owned()))
            .collect::<Vec<EncryptedDataRecord>>();
        println!("==/> POST DATA - {:?}", request);
        let res = get_rm_client_with_session(reqwest::Method::POST, "data")?
            .json(&request)
            .send()
            .await?;

        if res.status() == 200 {
            let result = res.text().await?;
            let batch_ids: Vec<String> = serde_json::from_str(&result)?;
            ids.extend(batch_ids);
        } else if res.status() == 401 {
            return Err(AvailError::new(
                AvailErrorType::Unauthorized,
                "User session has expired.".to_string(),
                "Your session has expired, please authenticate again.".to_string(),
            ));
        } else {
            return Err(AvailError::new(
                AvailErrorType::External,
                "Error posting encrypted data ".to_string(),
                "".to_string(),
            ));
        }
    }

    Ok(ids)
}

pub async fn send_transaction_in(request: EncryptedData) -> AvailResult<String> {
    println!("==/> POST DATA TX-SENT - {:?}", request.clone());
    let res = get_rm_client_with_session(reqwest::Method::POST, "tx_sent")?
        .json(&EncryptedDataRecord::from(request))
        .send()
        .await?;

    if res.status() == 200 {
        let result = res.text().await?;

        Ok(result)
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error posting encrypted data ".to_string(),
            "".to_string(),
        ))
    }
}

pub async fn delete_invalid_transactions_in(ids: Vec<Uuid>) -> AvailResult<String> {
    let res = get_rm_client_with_session(reqwest::Method::DELETE, "txs_in")?
        .json(&ids)
        .send()
        .await?;

    if res.status() == 200 {
        let result = res.text().await?;

        Ok(result)
    } else if res.status() == 401 {
        Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ))
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error deleting invalid transaction messages".to_string(),
            "Error deleting invalid transaction messages".to_string(),
        ))
    }
}

pub async fn get_data_count() -> AvailResult<i64> {
    let res = get_rm_client_with_session(reqwest::Method::GET, "data_count")?
        .send()
        .await?;

    if res.status() == 200 {
        let result = res.text().await?;
        let count = result.parse::<i64>()?;
        Ok(count)
    } else if res.status() == 401 {
        Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ))
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error getting encrypted data count".to_string(),
            "Error getting encrypted data count".to_string(),
        ))
    }
}

pub async fn recover_data(_address: &str) -> AvailResult<Data> {
    let data_count = get_data_count().await?;
    let pages = (data_count as f64 / 300.0).ceil() as i64;
    println!("Pages: {}", pages);
    let mut encrypted_data: Vec<Data> = vec![];

    for page in 0..pages {
        let page_request = PageRequest { page };

        let res = get_rm_client_with_session(reqwest::Method::GET, "recover_data")?
            .json(&page_request)
            .send()
            .await?;

        if res.status() == 200 {
            let result: Data = res.json().await?;
            encrypted_data.push(result);
        } else if res.status() == 401 {
            return Err(AvailError::new(
                AvailErrorType::Unauthorized,
                "User session has expired.".to_string(),
                "Your session has expired, please authenticate again.".to_string(),
            ));
        } else {
            return Err(AvailError::new(
                AvailErrorType::External,
                "Error recovering encrypted data ".to_string(),
                "Error recovering encrypted data".to_string(),
            ));
        }
    }

    let mut record_pointers: Vec<EncryptedDataRecord> = vec![];
    let mut transactions: Vec<EncryptedDataRecord> = vec![];
    let mut transitions: Vec<EncryptedDataRecord> = vec![];
    let mut deployments: Vec<EncryptedDataRecord> = vec![];
    println!("DATA FROM SERVER {:?}", encrypted_data);
    for data in encrypted_data {
        record_pointers.extend(data.record_pointers);
        transactions.extend(data.transactions);
        transitions.extend(data.transitions);
        deployments.extend(data.deployments);
    }

    Ok(Data {
        record_pointers,
        transactions,
        transitions,
        deployments,
    })
}

pub async fn delete_all_server_storage() -> AvailResult<String> {
    let res = get_rm_client_with_session(reqwest::Method::DELETE, "data")?
        .send()
        .await?;

    if res.status() == 200 {
        let result = res.text().await?;

        Ok(result)
    } else if res.status() == 401 {
        Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ))
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error deleting encrypted data records ".to_string(),
            "Error deleting server side data.".to_string(),
        ))
    }
}

pub async fn import_encrypted_data(request: DataRequest) -> AvailResult<String> {
    // check that every vector in data request does not exceed 75

    let record_pointers = request.data.record_pointers.len();
    let transactions = request.data.transactions.len();
    let transitions = request.data.transitions.len();
    let deployments = request.data.deployments.len();

    // if they exceed 300 in sum, then split into several DataRequest where the sum of the data vectors inside is less than 300
    if record_pointers + transactions + transitions + deployments > 300 {
        let mut data_requests: Vec<DataRequest> = vec![];

        let mut record_pointers = request.data.record_pointers.clone();
        let mut transactions = request.data.transactions.clone();
        let mut transitions = request.data.transitions.clone();
        let mut deployments = request.data.deployments.clone();

        while record_pointers.len() + transactions.len() + transitions.len() + deployments.len()
            > 300
        {
            let mut record_pointers_batch = record_pointers.split_off(75);
            let mut transactions_batch = transactions.split_off(75);
            let mut transitions_batch = transitions.split_off(75);
            let mut deployments_batch = deployments.split_off(75);

            let data: Data = Data {
                record_pointers: record_pointers.clone(),
                transactions: transactions.clone(),
                transitions: transitions.clone(),
                deployments: deployments.clone(),
            };

            let data_request = DataRequest {
                address: request.address.clone(),
                data,
            };

            data_requests.push(data_request);

            record_pointers = record_pointers_batch;
            transactions = transactions_batch;
            transitions = transitions_batch;
            deployments = deployments_batch;
        }

        let data = Data {
            record_pointers,
            transactions,
            transitions,
            deployments,
        };

        let data_request = DataRequest {
            address: request.address.clone(),
            data,
        };

        data_requests.push(data_request);

        for data_request in data_requests {
            let res = get_rm_client_with_session(reqwest::Method::POST, "import_data")?
                .json(&data_request)
                .send()
                .await?;

            if res.status() != 200 {
                return Err(AvailError::new(
                    AvailErrorType::External,
                    "Error importing encrypted data.".to_string(),
                    "Error backing up encrypted data.".to_string(),
                ));
            }
        }

        Ok("Imported Succesfully".to_string())
    } else {
        let res = get_rm_client_with_session(reqwest::Method::POST, "import_data")?
            .json(&request)
            .send()
            .await?;

        if res.status() == 200 {
            let result = res.text().await?;
            Ok(result)
        } else if res.status() == 401 {
            Err(AvailError::new(
                AvailErrorType::Unauthorized,
                "User session has expired.".to_string(),
                "Your session has expired, please authenticate again.".to_string(),
            ))
        } else {
            Err(AvailError::new(
                AvailErrorType::External,
                "Error importing encrypted data.".to_string(),
                "Error backing up encrypted data.".to_string(),
            ))
        }
    }
}

#[cfg(test)]

mod encrypted_data_api_tests {
    use super::*;
    use crate::api::encrypted_data::{delete_all_server_storage, post_encrypted_data};

    use crate::services::local_storage::encrypted_data::{
        delete_user_encrypted_data, get_encrypted_data_by_flavour, initialize_encrypted_data_table,
    };
    use crate::services::local_storage::persistent_storage::{
        delete_user_preferences, get_address, initial_user_preferences,
    };
    use crate::services::local_storage::storage_api::records::{
        encrypt_and_store_records, get_test_record_pointer,
    };

    use crate::services::local_storage::session::view::VIEWSESSION;

    use crate::models::storage::languages::Languages;

    use avail_common::models::encrypted_data::EncryptedDataTypeCommon;
    use snarkvm::prelude::{PrivateKey, Testnet3, ToBytes, ViewKey};

    use avail_common::models::constants::*;

    //TODO - Update endpoints required to test transactions in
    #[tokio::test]
    async fn test_get_new_transaction_messages() {
        let address = get_address_string().unwrap();
        println!("{}", address);
        let result = get_new_transaction_messages::<Testnet3>().await.unwrap();
        println!("{:?}", result);
    }

    #[tokio::test]
    async fn test_update_data() {
        let encrypted_record = EncryptedData::new(
            Some(Uuid::new_v4()),
            "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px".to_string(),
            "some ciphertext".to_string(),
            "some nonce".to_string(),
            EncryptedDataTypeCommon::Record,
            None,
            None,
            None,
            chrono::Utc::now(),
            None,
            None,
            "testnet3".to_string(),
            Some("record_name".to_string()),
            Some(false),
            None,
            None,
            None,
        );

        let updated_encrypted_record = EncryptedData::new(
            Some(Uuid::new_v4()),
            "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px".to_string(),
            "some ciphertext".to_string(),
            "some nonce".to_string(),
            EncryptedDataTypeCommon::Record,
            None,
            None,
            None,
            chrono::Utc::now(),
            None,
            None,
            "testnet3".to_string(),
            Some("record_name".to_string()),
            Some(false),
            None,
            None,
            None,
        );

        let ids = post_encrypted_data(vec![encrypted_record]).await.unwrap();

        let res = update_data(vec![updated_encrypted_record], ids)
            .await
            .unwrap();

        println!("{:?}", res);
        delete_all_server_storage().await.unwrap();
    }

    #[tokio::test]
    async fn test_synced() {
        let encrypted_record = EncryptedData::new(
            Some(Uuid::new_v4()),
            "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px".to_string(),
            "some ciphertext".to_string(),
            "some nonce".to_string(),
            EncryptedDataTypeCommon::Record,
            None,
            None,
            None,
            chrono::Utc::now(),
            None,
            None,
            "testnet3".to_string(),
            Some("record_name".to_string()),
            Some(false),
            None,
            None,
            None,
        );

        post_encrypted_data(vec![encrypted_record.clone()])
            .await
            .unwrap();
        let ids = vec![encrypted_record.id.unwrap()];

        let result = synced(ids).await.unwrap();
        println!("{:?}", result);
        delete_all_server_storage().await.unwrap();
    }

    #[tokio::test]
    async fn test_post_encrypted_data() {
        let encrypted_record = EncryptedData::new(
            Some(Uuid::new_v4()),
            "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px".to_string(),
            "some ciphertext".to_string(),
            "some nonce".to_string(),
            EncryptedDataTypeCommon::Record,
            None,
            None,
            None,
            chrono::Utc::now(),
            None,
            None,
            "testnet3".to_string(),
            Some("record_name".to_string()),
            Some(false),
            None,
            None,
            None,
        );

        let res = post_encrypted_data(vec![encrypted_record]).await.unwrap();

        println!("{:?}", res);
        delete_all_server_storage().await.unwrap();
    }

    #[tokio::test]
    async fn test_recover_data() {
        let encrypted_record = EncryptedData::new(
            Some(Uuid::new_v4()),
            "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px".to_string(),
            "some ciphertext".to_string(),
            "some nonce".to_string(),
            EncryptedDataTypeCommon::Record,
            None,
            None,
            None,
            chrono::Utc::now(),
            None,
            None,
            "testnet3".to_string(),
            Some("record_name".to_string()),
            Some(false),
            None,
            None,
            None,
        );

        let res = post_encrypted_data(vec![encrypted_record]).await.unwrap();

        println!("{:?}", res);
        let address = get_address_string().unwrap();

        let result = recover_data(&address).await.unwrap();
        println!("{:?}", result);
        delete_all_server_storage().await.unwrap();
    }

    #[tokio::test]
    async fn test_delete_all() {
        let result = delete_all_server_storage().await.unwrap();
        println!("{:?}", result);
    }

    fn test_setup_prerequisites() {
        let pk = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();
        let view_key = ViewKey::<Testnet3>::try_from(&pk).unwrap();

        delete_user_encrypted_data().unwrap();

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
    async fn test_import_encrypted_data() {
        test_setup_prerequisites();
        let test_pointer = get_test_record_pointer();
        let address = get_address::<Testnet3>().unwrap();

        encrypt_and_store_records(vec![test_pointer], address).unwrap();

        let encrypted_record_pointers =
            get_encrypted_data_by_flavour(EncryptedDataTypeCommon::Record).unwrap();
        let backup_encrypted_records = encrypted_record_pointers
            .iter()
            .map(|encrypted_record| EncryptedDataRecord::from(encrypted_record.to_owned()))
            .collect::<Vec<EncryptedDataRecord>>();

        let encrypted_transactions =
            get_encrypted_data_by_flavour(EncryptedDataTypeCommon::Transaction).unwrap();
        let backup_encrypted_transactions = encrypted_transactions
            .iter()
            .map(|encrypted_transaction| {
                EncryptedDataRecord::from(encrypted_transaction.to_owned())
            })
            .collect::<Vec<EncryptedDataRecord>>();

        let encrypted_deployments =
            get_encrypted_data_by_flavour(EncryptedDataTypeCommon::Deployment).unwrap();
        let backup_encrypted_deployments = encrypted_deployments
            .iter()
            .map(|encrypted_deployment| EncryptedDataRecord::from(encrypted_deployment.to_owned()))
            .collect::<Vec<EncryptedDataRecord>>();

        let encrypted_transitions =
            get_encrypted_data_by_flavour(EncryptedDataTypeCommon::Transition).unwrap();
        let backup_encrypted_transitions = encrypted_transitions
            .iter()
            .map(|encrypted_transition| EncryptedDataRecord::from(encrypted_transition.to_owned()))
            .collect::<Vec<EncryptedDataRecord>>();

        let data = Data::new(
            backup_encrypted_records,
            backup_encrypted_transactions,
            backup_encrypted_transitions,
            backup_encrypted_deployments,
        );

        let address = get_address_string().unwrap();

        let request = DataRequest { address, data };

        let result = import_encrypted_data(request).await.unwrap();
        println!("{:?}", result);

        delete_all_server_storage().await.unwrap();
    }
}
