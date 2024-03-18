use std::str::FromStr;

use chrono::{DateTime, Utc};
use rusqlite::{params_from_iter, ToSql};
use snarkvm::prelude::{Network, Testnet3};

use crate::models::pointers::{
    deployment::DeploymentPointer, record::AvailRecord, transaction::TransactionPointer,
    transition::TransitionPointer,
};
use crate::models::storage::persistent::PersistentStorage;
use crate::{
    api::encrypted_data::recover_data,
    services::local_storage::{persistent_storage::*, session::view::VIEWSESSION},
};

use avail_common::{
    errors::{AvailError, AvailErrorType, AvailResult},
    models::encrypted_data::{
        EncryptedData, EncryptedDataTypeCommon, EventTypeCommon, RecordTypeCommon, TransactionState,
    },
    models::network::SupportedNetworks,
};

/* Main Encrypted Data funcions */

///initialize enrypted data table
pub fn initialize_encrypted_data_table() -> AvailResult<()> {
    let storage = PersistentStorage::new()?;

    storage.execute_query(
        "CREATE TABLE IF NOT EXISTS encrypted_data (
            id TEXT PRIMARY KEY,
            owner TEXT NOT NULL,
            ciphertext TEXT NOT NULL,
            nonce TEXT NOT NULL,
            flavour TEXT NOT NULL,
            record_type TEXT,
            program_ids TEXT,
            function_ids TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP,
            synced_on TIMESTAMP,
            network TEXT NOT NULL,
            record_name TEXT,
            spent BOOLEAN,
            event_type TEXT,
            record_nonce TEXT,
            state TEXT
        )",
    )?;

    Ok(())
}

/// store any encrypted data in persistent storage
pub fn store_encrypted_data(data: EncryptedData) -> AvailResult<()> {
    let storage = PersistentStorage::new()?;
    let data_temp = data.clone();
    let id = match data.id {
        Some(id) => id.to_string(),
        None => Err(AvailError::new(
            AvailErrorType::Internal,
            "No id found.".to_string(),
            "No id found.".to_string(),
        ))?,
    };

    let flavour = data.flavour.to_str();
    let ciphertext = data.ciphertext;
    let nonce = data.nonce;
    let record_type = match data.record_type {
        Some(record_type) => Some(record_type.to_str()),
        None => None,
    };
    let event_type = match data.event_type {
        Some(event_type) => Some(event_type.to_str()),
        None => None,
    };
    let transaction_state = match data.transaction_state {
        Some(transaction_state) => Some(transaction_state.to_str()),
        None => None,
    };
    println!("DATA in local storage =====> {:?}", data_temp);
    storage.save_mixed(
        vec![&id,&data.owner, &ciphertext, &nonce, &flavour,&record_type,&data.program_ids,&data.function_ids,&data.created_at,&data.updated_at,&data.synced_on,&data.network,&data.record_name,&data.spent,&event_type,&data.record_nonce,&transaction_state],
        "INSERT INTO encrypted_data (id,owner,ciphertext,nonce,flavour,record_type,program_ids,function_ids,created_at,updated_at,synced_on,network,record_name,spent,event_type,record_nonce,state) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17)"
            .to_string(),
    )?;

    Ok(())
}

pub fn handle_encrypted_data_query(query: &str) -> AvailResult<Vec<EncryptedData>> {
    let storage = PersistentStorage::new()?;

    let mut query_statement = storage.conn.prepare(query)?;

    let query_iter = query_statement.query_map([], |row| {
        let id: String = row.get(0)?;
        let owner: String = row.get(1)?;
        let ciphertext: String = row.get(2)?;
        let nonce: String = row.get(3)?;
        let flavour: String = row.get(4)?;
        let record_type: Option<String> = row.get(5)?;
        let program_ids: Option<String> = row.get(6)?;
        let function_ids: Option<String> = row.get(7)?;
        let created_at: DateTime<Utc> = row.get(8)?;
        let updated_at: Option<DateTime<Utc>> = row.get(9)?;
        let synced_on: Option<DateTime<Utc>> = row.get(10)?;
        let network: String = row.get(11)?;
        let record_name: Option<String> = row.get(12)?;
        let spent: Option<bool> = row.get(13)?;
        let event_type: Option<String> = row.get(14)?;
        let record_nonce: Option<String> = row.get(15)?;
        let transaction_state: Option<String> = row.get(16)?;

        let id = match uuid::Uuid::parse_str(&id) {
            Ok(id) => id,
            Err(_) => {
                return Err(rusqlite::Error::InvalidColumnType(
                    0,
                    "Error converting id string to uuid".to_string(),
                    rusqlite::types::Type::Text,
                ))
            }
        };

        let record_type = match record_type {
            Some(record_type) => RecordTypeCommon::from_str(&record_type),
            None => None,
        };

        let event_type = match event_type {
            Some(event_type) => EventTypeCommon::from_str(&event_type),
            None => None,
        };

        let transaction_state = match transaction_state {
            Some(transaction_state) => TransactionState::from_str(&transaction_state),
            None => None,
        };

        let flavour = EncryptedDataTypeCommon::from(flavour.as_str());

        let encrypted_data = EncryptedData::new(
            Some(id),
            owner,
            ciphertext,
            nonce,
            flavour,
            record_type,
            program_ids,
            function_ids,
            created_at,
            updated_at,
            synced_on,
            network,
            record_name,
            spent,
            event_type,
            record_nonce,
            transaction_state,
        );

        Ok(encrypted_data)
    })?;

    let mut encrypted_data: Vec<EncryptedData> = Vec::new();

    for data in query_iter {
        encrypted_data.push(data?);
    }

    Ok(encrypted_data)
}

pub fn handle_encrypted_data_query_params<T: ToSql>(
    query: &str,
    query_params: Vec<T>,
) -> AvailResult<Vec<EncryptedData>> {
    let storage = PersistentStorage::new()?;

    let mut query_statement = storage.conn.prepare(query)?;

    let query_iter = query_statement.query_map(params_from_iter(query_params.iter()), |row| {
        let id: String = row.get(0)?;
        let owner: String = row.get(1)?;
        let ciphertext: String = row.get(2)?;
        let nonce: String = row.get(3)?;
        let flavour: String = row.get(4)?;
        let record_type: Option<String> = row.get(5)?;
        let program_ids: Option<String> = row.get(6)?;
        let function_ids: Option<String> = row.get(7)?;
        let created_at: DateTime<Utc> = row.get(8)?;
        let updated_at: Option<DateTime<Utc>> = row.get(9)?;
        let synced_on: Option<DateTime<Utc>> = row.get(10)?;
        let network: String = row.get(11)?;
        let record_name: Option<String> = row.get(12)?;
        let spent: Option<bool> = row.get(13)?;
        let event_type: Option<String> = row.get(14)?;
        let record_nonce: Option<String> = row.get(15)?;
        let transaction_state: Option<String> = row.get(16)?;

        let id = match uuid::Uuid::parse_str(&id) {
            Ok(id) => id,
            Err(_) => {
                return Err(rusqlite::Error::InvalidColumnType(
                    0,
                    "Error converting id string to uuid".to_string(),
                    rusqlite::types::Type::Text,
                ))
            }
        };

        let record_type = match record_type {
            Some(record_type) => RecordTypeCommon::from_str(&record_type),
            None => None,
        };

        let event_type = match event_type {
            Some(event_type) => EventTypeCommon::from_str(&event_type),
            None => None,
        };

        let transaction_state = match transaction_state {
            Some(transaction_state) => TransactionState::from_str(&transaction_state),
            None => None,
        };
        let flavour = EncryptedDataTypeCommon::from(flavour.as_str());

        let encrypted_data = EncryptedData::new(
            Some(id),
            owner,
            ciphertext,
            nonce,
            flavour,
            record_type,
            program_ids,
            function_ids,
            created_at,
            updated_at,
            synced_on,
            network,
            record_name,
            spent,
            event_type,
            record_nonce,
            transaction_state,
        );

        Ok(encrypted_data)
    })?;

    let mut encrypted_data: Vec<EncryptedData> = Vec::new();

    for data in query_iter {
        encrypted_data.push(data?);
    }

    Ok(encrypted_data)
}

/// get encrypted data by their flavour
pub fn get_encrypted_data_by_flavour(
    flavour: EncryptedDataTypeCommon,
) -> AvailResult<Vec<EncryptedData>> {
    let address = get_address_string()?;
    let network = get_network()?;

    let query = format!(
        "SELECT * FROM encrypted_data WHERE flavour='{}' AND owner='{}' AND network='{}'",
        flavour.to_str(),
        address,
        network
    );

    handle_encrypted_data_query(&query)
}

/// get encrypted data by id
pub fn get_encrypted_data_by_id(id: &str) -> AvailResult<EncryptedData> {
    let query = format!("SELECT * FROM encrypted_data WHERE id='{}'", id);

    let encrypted_data = handle_encrypted_data_query(&query)?;

    if encrypted_data.len() > 0 {
        Ok(encrypted_data[0].clone())
    } else {
        Err(AvailError::new(
            AvailErrorType::Internal,
            "Data Not Found".to_string(),
            "Data Not Found".to_string(),
        ))
    }
}

/// get encrypted record pointer by nonce
pub fn get_encrypted_data_by_nonce(nonce: &str) -> AvailResult<Option<EncryptedData>> {
    let address = get_address_string()?;
    let network = get_network()?;

    let query = format!(
        "SELECT * FROM encrypted_data WHERE record_nonce='{}' AND owner='{}' AND network='{}'",
        nonce, address, network
    );

    let encrypted_data = handle_encrypted_data_query(&query)?;

    if !encrypted_data.is_empty() {
        Ok(Some(encrypted_data[0].clone()))
    } else {
        Ok(None)
    }
}

/* Main Encrypted Data funcions */

/// update encrypted data by id
pub fn update_encrypted_data_by_id(id: &str, ciphertext: &str, nonce: &str) -> AvailResult<()> {
    let storage = PersistentStorage::new()?;

    let query = format!(
        "UPDATE encrypted_data SET ciphertext=?1, nonce=?2 WHERE id='{}'",
        id
    );

    storage.save_mixed(vec![&ciphertext, &nonce], query)?;

    Ok(())
}

/// update encrypted data by id
pub fn update_encrypted_data_spent_by_id(
    id: &str,
    ciphertext: &str,
    nonce: &str,
    spent: bool,
) -> AvailResult<()> {
    let storage = PersistentStorage::new()?;
    let updated_at = Utc::now();

    let query = format!(
        "UPDATE encrypted_data SET ciphertext=?1, nonce=?2, spent=?3, updated_at=?4 WHERE id='{}'",
        id
    );

    storage.save_mixed(vec![&ciphertext, &nonce, &spent, &updated_at], query)?;

    Ok(())
}

/// update encrypted data and transaction state by id
pub fn update_encrypted_transaction_state_by_id(
    id: &str,
    ciphertext: &str,
    nonce: &str,
    transaction_state: TransactionState,
) -> AvailResult<()> {
    let storage = PersistentStorage::new()?;

    let query = format!(
        "UPDATE encrypted_data SET ciphertext=?1, nonce=?2, state=?3 WHERE id='{}'",
        id
    );

    storage.save_mixed(
        vec![&ciphertext, &nonce, &transaction_state.to_str()],
        query,
    )?;

    Ok(())
}

/// update encrypted data by id and program_ids and function_ids
pub fn update_encrypted_transaction_confirmed_by_id(
    id: &str,
    ciphertext: &str,
    nonce: &str,
    program_ids: &str,
    function_ids: &str,
) -> AvailResult<()> {
    let storage = PersistentStorage::new()?;

    let query = format!(
        "UPDATE encrypted_data SET ciphertext=?1, nonce=?2, program_ids=?3, function_ids=?4, state=?5 WHERE id='{}'",
        id
    );

    storage.save_mixed(
        vec![
            &ciphertext,
            &nonce,
            &program_ids,
            &function_ids,
            &TransactionState::Confirmed.to_str(),
        ],
        query,
    )?;

    Ok(())
}

/// update synced_on field of encrypted data by id (data has been synced)
pub fn update_encrypted_data_synced_on_by_id(id: &str) -> AvailResult<()> {
    let storage = PersistentStorage::new()?;

    let query = format!("UPDATE encrypted_data SET synced_on=?1 WHERE id='{}'", id);

    let synced_on = Utc::now();

    storage.save_mixed(vec![&synced_on], query)?;

    Ok(())
}

/// delete encrypted data by id
pub fn delete_encrypted_data_by_id(id: &str) -> AvailResult<()> {
    let storage = PersistentStorage::new()?;

    let query = format!("DELETE FROM encrypted_data WHERE id='{}'", id);

    storage.execute_query(&query)?;

    Ok(())
}

/// delete encrypted data by owner address
pub fn delete_encrypted_data_by_address() -> AvailResult<()> {
    let storage = PersistentStorage::new()?;
    let address = get_address_string()?;

    let query = format!("DELETE FROM encrypted_data WHERE owner='{}'", address);

    storage.execute_query(&query)?;

    Ok(())
}

/// delete user encrypted data storage
pub fn delete_user_encrypted_data() -> AvailResult<()> {
    let storage = PersistentStorage::new()?;

    let query = "DELETE FROM encrypted_data";

    match storage.execute_query(query) {
        Ok(r) => r,
        Err(e) => match e.error_type {
            AvailErrorType::NotFound => {}
            _ => {
                return Err(AvailError::new(
                    AvailErrorType::Internal,
                    "Error deleting encrypted data ".to_string(),
                    "".to_string(),
                ))
            }
        },
    };

    Ok(())
}

pub fn drop_encrypted_data_table() -> AvailResult<()> {
    let storage = PersistentStorage::new()?;

    let query = "DROP TABLE encrypted_data";

    match storage.execute_query(query) {
        Ok(r) => r,
        Err(e) => match e.error_type {
            AvailErrorType::NotFound => {}
            _ => {
                return Err(AvailError::new(
                    AvailErrorType::Internal,
                    "Error dropping encrypted data table ".to_string(),
                    "Error deleting encrypted data table".to_string(),
                ))
            }
        },
    };

    Ok(())
}

pub fn get_encrypted_data_to_backup(
    last_backup_sync: DateTime<Utc>,
) -> AvailResult<Vec<EncryptedData>> {
    let query = "SELECT * FROM encrypted_data WHERE created_at > ?1";

    let encrypted_data = handle_encrypted_data_query_params(query, vec![last_backup_sync])?;

    Ok(encrypted_data)
}

pub fn get_encrypted_data_to_update(
    last_backup_sync: DateTime<Utc>,
) -> AvailResult<Vec<EncryptedData>> {
    let query = "SELECT * FROM encrypted_data WHERE updated_at > ?1";

    let encrypted_data = handle_encrypted_data_query_params(query, vec![last_backup_sync])?;

    Ok(encrypted_data)
}

/// Function to handle the deletion of encrypted data when a scan fails at a specific block height
pub fn handle_block_scan_failure<N: Network>(block_height: u32) -> AvailResult<()> {
    let view_key = VIEWSESSION.get_instance::<N>()?;

    // get encrypted data stored withing the last two minutes
    let query = "SELECT * FROM encrypted_data WHERE created_at > ?1";

    let encrypted_data = handle_encrypted_data_query_params(
        query,
        vec![Utc::now()
            .checked_sub_signed(chrono::Duration::minutes(2))
            .unwrap()],
    )?;

    let mut ids_to_delete: Vec<String> = vec![];

    for data in encrypted_data {
        let encrypted_struct = data.to_enrypted_struct::<N>()?;

        match data.flavour {
            EncryptedDataTypeCommon::Record => {
                let record_pointer: AvailRecord<N> = encrypted_struct.decrypt(view_key)?;
                if record_pointer.pointer.block_height == block_height {
                    if let Some(id) = data.id {
                        ids_to_delete.push(id.to_string());
                    }
                }
            }
            EncryptedDataTypeCommon::Transaction => {
                let tx_pointer: TransactionPointer<N> = encrypted_struct.decrypt(view_key)?;
                if let Some(tx_height) = tx_pointer.block_height() {
                    if tx_height == block_height {
                        ids_to_delete.push(data.id.unwrap().to_string());
                    }
                }
            }
            EncryptedDataTypeCommon::Deployment => {
                let deployment: DeploymentPointer<N> = encrypted_struct.decrypt(view_key)?;

                if let Some(deployment_height) = deployment.block_height {
                    if deployment_height == block_height {
                        ids_to_delete.push(data.id.unwrap().to_string());
                    }
                }
            }
            EncryptedDataTypeCommon::Transition => {
                let transition: TransitionPointer<N> = encrypted_struct.decrypt(view_key)?;

                if transition.block_height == block_height {
                    ids_to_delete.push(data.id.unwrap().to_string());
                }
            }
            _ => {}
        }
    }

    Ok(())
}

///get encrypted data and store directly locally encrypted
#[tauri::command(rename_all = "snake_case")]
pub async fn get_and_store_all_data() -> AvailResult<String> {
    let address = get_address_string()?;
    let network = get_network()?;

    let mut data = recover_data(&address.to_string()).await?;
    println!("{:?}", data);
    // // TEMP FIX
    // // Swap data.deployments value to data.transitions
    // let temp_deployments = data.deployments;
    // data.deployments = data.transitions;
    // data.transitions = temp_deployments;
    // println!("SWAPPED DATYA{:?}", data);
    for encrypted_record_pointer in data.record_pointers {
        let e_r = match SupportedNetworks::from_str(&network)? {
            SupportedNetworks::Testnet3 => {
                AvailRecord::<Testnet3>::to_encrypted_data_from_record(encrypted_record_pointer)?
            }
            _ => AvailRecord::<Testnet3>::to_encrypted_data_from_record(encrypted_record_pointer)?,
        };
        store_encrypted_data(e_r)?;
    }
    println!("Record pointers stored");

    for encrypted_transaction in data.transactions {
        let e_t = match SupportedNetworks::from_str(&network)? {
            SupportedNetworks::Testnet3 => {
                TransactionPointer::<Testnet3>::to_encrypted_data_from_record(
                    encrypted_transaction,
                )?
            }
            _ => TransactionPointer::<Testnet3>::to_encrypted_data_from_record(
                encrypted_transaction,
            )?,
        };
        store_encrypted_data(e_t)?;
    }
    println!("Transaction pointers stored");
    for encrypted_deployment in data.deployments {
        let e_t = match SupportedNetworks::from_str(&network)? {
            SupportedNetworks::Testnet3 => {
                DeploymentPointer::<Testnet3>::to_encrypted_data_from_record(encrypted_deployment)?
            }
            _ => {
                DeploymentPointer::<Testnet3>::to_encrypted_data_from_record(encrypted_deployment)?
            }
        };
        store_encrypted_data(e_t)?;
    }
    println!("Deployment pointers stored");
    for encrypted_transition in data.transitions {
        let e_t = match SupportedNetworks::from_str(&network)? {
            SupportedNetworks::Testnet3 => {
                TransitionPointer::<Testnet3>::to_encrypted_data_from_record(encrypted_transition)?
            }
            _ => {
                TransitionPointer::<Testnet3>::to_encrypted_data_from_record(encrypted_transition)?
            }
        };
        store_encrypted_data(e_t)?;
    }

    Ok("Data recovered and stored locally".to_string())

    //now store the encoded/encrypted
}

#[cfg(test)]
mod encrypted_data_tests {
    use super::*;
    use crate::api::encrypted_data::{delete_all_server_storage, post_encrypted_data};
    use std::str::FromStr;

    use crate::models::pointers::{
        record::AvailRecord, transaction::TransactionPointer, transition::TransitionPointer,
    };
    use crate::models::storage::languages::Languages;
    use crate::services::local_storage::persistent_storage::initial_user_preferences;

    use crate::services::local_storage::session::view::VIEWSESSION;
    use crate::services::local_storage::storage_api::records::{
        encrypt_and_store_records, get_test_record_pointer,
    };

    use snarkvm::prelude::{PrivateKey, Testnet3, ToBytes, ViewKey};

    use avail_common::models::constants::*;

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

    #[test]
    fn test_store_encrypted_data() {
        test_setup_prerequisites();

        let test_pointer = get_test_record_pointer();
        let address = get_address::<Testnet3>().unwrap();

        let encrypted_record = encrypt_and_store_records(vec![test_pointer], address).unwrap();

        println!("{:?}", encrypted_record);
        // println!("{:?}", res);
    }

    #[test]
    fn test_get_encrypted_data_by_flavour() {
        //test_store_encrypted_data();

        VIEWSESSION
            .set_view_session("AViewKey1myvhAr2nes8MF1y8gPV19azp4evwsBR4CqyzAi62nufW")
            .unwrap();

        let res = get_encrypted_data_by_flavour(EncryptedDataTypeCommon::Record).unwrap();

        let v_key = VIEWSESSION.get_instance::<Testnet3>().unwrap();

        let records = res
            .iter()
            .map(|x| {
                let encrypted_data = x.to_enrypted_struct::<Testnet3>().unwrap();
                let block: AvailRecord<Testnet3> = encrypted_data.decrypt(v_key).unwrap();

                block
            })
            .collect::<Vec<AvailRecord<Testnet3>>>();

        for record in records {
            println!("{:?}\n", record);
        }
    }

    #[test]
    fn test_get_encrypted_data_by_flavour_no_decrypt() {
        let res = get_encrypted_data_by_flavour(EncryptedDataTypeCommon::Record).unwrap();

        for data in res {
            println!("{:?}\n", data);
        }
    }

    #[test]
    fn test_get_encrypted_data_by_id() {
        test_setup_prerequisites();

        let test_pointer = get_test_record_pointer();
        let address = get_address::<Testnet3>().unwrap();

        let encrypted_record = encrypt_and_store_records(vec![test_pointer], address).unwrap();

        let res = get_encrypted_data_by_id(&encrypted_record[0].id.unwrap().to_string()).unwrap();

        println!("{:?}", res);
    }

    #[test]
    fn test_update_encrypted_data_by_id() {
        test_setup_prerequisites();

        let test_pointer = get_test_record_pointer();

        let address = get_address::<Testnet3>().unwrap();

        let encrypted_record = encrypt_and_store_records(vec![test_pointer], address).unwrap();

        let res = update_encrypted_data_by_id(
            &encrypted_record[0].id.unwrap().to_string(),
            "ciphertext",
            "nonce",
        );

        assert!(res.is_ok());
    }

    #[test]
    fn test_delete_encrypted_data_by_id() {
        test_setup_prerequisites();

        let test_pointer = get_test_record_pointer();
        let address = get_address::<Testnet3>().unwrap();

        let encrypted_record = encrypt_and_store_records(vec![test_pointer], address).unwrap();

        let res = delete_encrypted_data_by_id(&encrypted_record[0].id.unwrap().to_string());
        assert!(res.is_ok());
    }

    #[test]
    fn test_delete_user() {
        delete_user_encrypted_data().unwrap();
    }

    #[test]
    fn test_drop_encrypted_data() {
        let storage = PersistentStorage::new().unwrap();

        let query = "DROP TABLE encrypted_data";

        storage.execute_query(query).unwrap();
    }

    #[tokio::test]
    async fn test_get_and_store_all_data() {
        test_setup_prerequisites();

        let test_pointer = get_test_record_pointer();
        let address = get_address::<Testnet3>().unwrap();

        let encrypted_record = encrypt_and_store_records(vec![test_pointer], address).unwrap();

        post_encrypted_data(encrypted_record.clone()).await.unwrap();

        let res = get_and_store_all_data().await.unwrap();
        println!("{:?}", res);

        delete_all_server_storage().await.unwrap();
    }
}
