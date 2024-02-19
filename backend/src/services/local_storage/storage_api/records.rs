use std::str::FromStr;

use avail_common::errors::AvailError;
use snarkvm::circuit::integers::Integer;
use snarkvm::circuit::{Identifier, Inject};
use snarkvm::prelude::{
    bail, Address, AleoID, Entry, Field, Literal, Network, Plaintext, Testnet3, ToField,
};

use crate::api::encrypted_data::update_data;
use crate::models::pointers::record::{AvailRecord, Metadata, Pointer};
use crate::models::storage::persistent::PersistentStorage;
use crate::models::wallet_connect::records::{GetRecordsRequest, RecordFilterType};
use crate::services::local_storage::encrypted_data::{
    get_encrypted_data_by_id, get_encrypted_data_by_nonce, handle_encrypted_data_query,
    update_encrypted_data_spent_by_id,
};
use crate::services::local_storage::persistent_storage::get_address_string;
use crate::services::local_storage::tokens::{add_balance, subtract_balance};
use crate::services::local_storage::{
    encrypted_data::{get_encrypted_data_by_flavour, store_encrypted_data},
    persistent_storage::{get_address, get_network},
    session::view::VIEWSESSION,
};

use avail_common::{
    errors::AvailResult,
    models::{
        constants::{TRANSITION_PREFIX, TX_PREFIX},
        encrypted_data::{EncryptedData, EncryptedDataTypeCommon, RecordTypeCommon},
        traits::encryptable::Encryptable,
    },
};

/// Encrypts record pointers using the wallet owner's address and stores them in persistent storage
pub fn encrypt_and_store_records<N: Network>(
    record_pointers: Vec<AvailRecord<N>>,
    address: Address<N>,
) -> AvailResult<Vec<EncryptedData>> {
    let encrypted_records = record_pointers
        .iter()
        .map(|record| {
            let encrypted_record = record.to_encrypted_data(address)?;

            store_encrypted_data(encrypted_record.clone())?;

            Ok(encrypted_record)
        })
        .collect::<AvailResult<Vec<EncryptedData>>>()?;

    Ok(encrypted_records)
}

fn decrypt_record_pointers<N: Network>(
    encrypted_data: Vec<EncryptedData>,
) -> AvailResult<Vec<AvailRecord<N>>> {
    let view_key = VIEWSESSION.get_instance::<N>()?;

    let records = encrypted_data
        .iter()
        .map(|x| {
            let encrypted_data = x.to_enrypted_struct::<N>()?;

            let record: AvailRecord<N> = encrypted_data.decrypt(view_key)?;

            Ok(record)
        })
        .collect::<AvailResult<Vec<AvailRecord<N>>>>()?;

    Ok(records)
}

pub fn get_record_pointers<N: Network>(
    request: GetRecordsRequest,
) -> AvailResult<(Vec<AvailRecord<N>>, Vec<String>)> {
    // TODO - use address to filter when supporting hd wallets
    let address = match request.address() {
        Some(address) => address.clone(),
        None => get_address_string()?,
    };

    let mut base_query = format!(
        "SELECT * FROM encrypted_data WHERE flavour='{}' AND owner='{}' AND network='{}'",
        EncryptedDataTypeCommon::Record.to_str(),
        address,
        get_network()?,
    );

    if let Some(filter) = request.filter() {
        match RecordFilterType::from_string(filter.record_type()) {
            RecordFilterType::Spent => base_query.push_str(" AND spent=true"),
            RecordFilterType::Unspent => base_query.push_str(" AND spent=false"),
            _ => (),
        }

        let program_ids = filter.program_ids();
        if !program_ids.is_empty() {
            let program_ids_list = program_ids
                .iter()
                .map(|id| format!("'{}'", id))
                .collect::<Vec<String>>()
                .join(", ");
            base_query.push_str(&format!(" AND program_ids IN ({})", program_ids_list));
        }

        match filter.function_id() {
            Some(function_id) => {
                base_query.push_str(&format!(" AND function_ids='{}'", function_id));
            }
            None => (),
        }

        match filter.record_name() {
            Some(record_name) => {
                base_query.push_str(&format!(" AND record_name='{}'", record_name));
            }
            None => (),
        }
    }

    if let Some(page) = request.page() {
        base_query.push_str(&format!(" LIMIT 50 OFFSET {}", page * 50));
    }

    let encrypted_records = handle_encrypted_data_query(&base_query)?;

    let encrypted_record_pointers_ids = encrypted_records
        .iter()
        .map(|x| x.id.clone().unwrap().to_string())
        .collect::<Vec<String>>();

    let record_pointers = decrypt_record_pointers::<N>(encrypted_records)?;

    Ok((record_pointers, encrypted_record_pointers_ids))
}

pub fn get_page_count_for_filter(request: GetRecordsRequest) -> AvailResult<i32> {
    let address = match request.address() {
        Some(address) => address.clone(),
        None => get_address_string()?,
    };

    let db = PersistentStorage::new()?;

    let mut base_query = format!(
        "SELECT COUNT(*) FROM encrypted_data WHERE flavour='{}' AND owner='{}' AND network='{}'",
        EncryptedDataTypeCommon::Record.to_str(),
        address,
        get_network()?,
    );

    if let Some(filter) = request.filter() {
        match RecordFilterType::from_string(filter.record_type()) {
            RecordFilterType::Spent => base_query.push_str(" AND spent=true"),
            RecordFilterType::Unspent => base_query.push_str(" AND spent=false"),
            _ => (),
        }

        let program_ids = filter.program_ids();
        if !program_ids.is_empty() {
            let program_ids_list = program_ids
                .iter()
                .map(|id| format!("'{}'", id))
                .collect::<Vec<String>>()
                .join(", ");
            base_query.push_str(&format!(" AND program_ids IN ({})", program_ids_list));
        }

        match filter.function_id() {
            Some(function_id) => {
                base_query.push_str(&format!(" AND function_ids='{}'", function_id));
            }
            None => (),
        }

        match filter.record_name() {
            Some(record_name) => {
                base_query.push_str(&format!(" AND record_name='{}'", record_name));
            }
            None => (),
        }
    }
    let mut query_statement = db.conn.prepare(base_query.as_str())?;
    let count: i32 = query_statement.query_row([], |row| row.get(0))?;

    let page_count = count / 50;

    Ok(page_count)
}

pub fn get_record_pointers_ids<N: Network>() -> AvailResult<(Vec<AvailRecord<N>>, Vec<String>)> {
    let encrypted_records = get_encrypted_data_by_flavour(EncryptedDataTypeCommon::Record)?;

    let encrypted_record_pointers_ids = encrypted_records
        .iter()
        .map(|x| x.id.clone().unwrap().to_string())
        .collect::<Vec<String>>();

    let record_pointers = decrypt_record_pointers::<N>(encrypted_records)?;

    Ok((record_pointers, encrypted_record_pointers_ids))
}

pub fn get_record_pointers_for_record_type<N: Network>(
    record_type: RecordTypeCommon,
    address: &str,
) -> AvailResult<(Vec<AvailRecord<N>>, Vec<String>)> {
    let network = get_network()?;

    let query = format!(
        "SELECT * FROM encrypted_data WHERE flavour='{}' AND owner='{}' AND network='{}' AND record_type='{}';",
        EncryptedDataTypeCommon::Record.to_str(),
        address,
        network,
        record_type.to_str()
    );

    let encrypted_record_pointers = handle_encrypted_data_query(&query)?;

    let encrypted_record_pointers_ids = encrypted_record_pointers
        .iter()
        .map(|x| x.id.unwrap().to_string())
        .collect::<Vec<String>>();

    let record_pointers = decrypt_record_pointers::<N>(encrypted_record_pointers)?;

    Ok((record_pointers, encrypted_record_pointers_ids))
}

/* Utilities */

/// Update record spent status on local storage via nonce
pub fn update_record_spent_local_via_nonce<N: Network>(
    nonce: &str,
    spent: bool,
) -> AvailResult<()> {
    let address = get_address::<N>()?;

    let v_key = VIEWSESSION.get_instance::<N>()?;

    if let Some(encrypted_data) = get_encrypted_data_by_nonce(nonce)?{

    let encrypted_data_id = match encrypted_data.id {
        Some(id) => id.to_string(),
        None => {
            return Err(AvailError::new(
                avail_common::errors::AvailErrorType::Internal,
                "No id found for encrypted data".to_string(),
                "No id found for encrypted data".to_string(),
            ))
        }
    };

    println!("Updating record spent {} status for id: {}",spent, encrypted_data_id);

    let encrypted_struct = encrypted_data.to_enrypted_struct::<N>()?;

    let mut record_pointer: AvailRecord<N> = encrypted_struct.decrypt(v_key)?;

    if record_pointer.metadata.spent == spent {
        return Ok(());
    }

    record_pointer.metadata.spent = spent;
    if record_pointer.clone().metadata.record_type == RecordTypeCommon::Tokens
        || record_pointer.clone().metadata.record_type == RecordTypeCommon::AleoCredits
    {
        let record = record_pointer.clone().to_record()?;
        let record_data_keys = record.data().clone().into_keys();
        let record_name = record_pointer.clone().metadata.name;
        for key in record_data_keys {
            let is_key: bool = matches!(key.to_string().as_str(), "amount" | "microcredits");

            if is_key {
                let balance_entry = match record.data().get(&key.clone()) {
                    Some(bal) => Ok(bal),
                    None => Err(()),
                };

                let balance = match balance_entry.unwrap() {
                    Entry::Private(Plaintext::Literal(Literal::<N>::U64(amount), _)) => **amount,
                    Entry::Public(Plaintext::Literal(Literal::<N>::U64(amount), _)) => **amount,
                    Entry::Constant(Plaintext::Literal(Literal::<N>::U64(amount), _)) => **amount,
                    _ => 0u64,
                };

                //let balance_field = balance_f.to_be_bytes();
                //let balance = u64::from_be_bytes(balance_field);

                let _ = match spent {
                    true => subtract_balance(&record_name, &balance.to_string(), v_key)?,
                    false => add_balance(&record_name, &balance.to_string(), v_key)?,
                };
            }
        }
    }
    let updated_record_pointer = record_pointer.encrypt_for(address)?;

    update_encrypted_data_spent_by_id(
        &encrypted_data_id,
        &updated_record_pointer.cipher_text.to_string(),
        &updated_record_pointer.nonce.to_string(),
        spent,
    )?;
}

    Ok(())
}

pub fn check_if_record_exists<N:Network>(nonce: &str) -> AvailResult<bool>{
    let encrypted_data = get_encrypted_data_by_nonce(nonce)?;

    if let Some(encrypted_data)= encrypted_data{
        Ok(encrypted_data.id.is_some())
    }else{
        Ok(false)
    }
   
}

/// Update record spent status on local storage
pub fn update_record_spent_local<N: Network>(id: &str, spent: bool) -> AvailResult<()> {
    let address = get_address::<N>()?;

    let v_key = VIEWSESSION.get_instance::<N>()?;

    let encrypted_data = get_encrypted_data_by_id(id)?;

    let encrypted_struct = encrypted_data.to_enrypted_struct::<N>()?;

    let mut record_pointer: AvailRecord<N> = encrypted_struct.decrypt(v_key)?;

    if record_pointer.metadata.spent == spent {
        return Ok(());
    }

    record_pointer.metadata.spent = spent;
    if record_pointer.clone().metadata.record_type == RecordTypeCommon::Tokens
        || record_pointer.clone().metadata.record_type == RecordTypeCommon::AleoCredits
    {
        let record = record_pointer.clone().to_record()?;
        let record_data_keys = record.data().clone().into_keys();
        let record_name = record_pointer.clone().metadata.name;
        for key in record_data_keys {
            let is_key: bool = matches!(key.to_string().as_str(), "amount" | "microcredits");

            if is_key {
                let balance_entry = match record.data().get(&key.clone()) {
                    Some(bal) => Ok(bal),
                    None => Err(()),
                };

                let balance = match balance_entry.unwrap() {
                    Entry::Private(Plaintext::Literal(Literal::<N>::U64(amount), _)) => **amount,
                    Entry::Public(Plaintext::Literal(Literal::<N>::U64(amount), _)) => **amount,
                    Entry::Constant(Plaintext::Literal(Literal::<N>::U64(amount), _)) => **amount,
                    _ => 0u64,
                };
                
                //let balance_field = balance_f.to_be_bytes();
                //let balance = u64::from_be_bytes(balance_field);

                let _ = match spent {
                    true => subtract_balance(&record_name, &balance.to_string(), v_key)?,
                    false => add_balance(&record_name, &balance.to_string(), v_key)?,
                };
            }
        }
    }
    let updated_record_pointer = record_pointer.encrypt_for(address)?;

    update_encrypted_data_spent_by_id(
        id,
        &updated_record_pointer.cipher_text.to_string(),
        &updated_record_pointer.nonce.to_string(),
        spent,
    )?;
    Ok(())
}

/// Update record spent on encrypted backup after local storage has been updated
pub async fn update_records_spent_backup<N: Network>(ids: Vec<String>) -> AvailResult<()> {
    let encrypted_data = ids
        .iter()
        .map(|id| {
            let data = get_encrypted_data_by_id(id)?;
            Ok(data)
        })
        .collect::<AvailResult<Vec<EncryptedData>>>()?;

    update_data(encrypted_data, ids).await?;
    // update status server side via id
    Ok(())
}

///For Testing purposes
pub fn get_test_record_pointer() -> AvailRecord<Testnet3> {
    let test_transaction_id = AleoID::<Field<Testnet3>, TX_PREFIX>::from_str(
        "at1zux4zw83dayxtndd58skuy7qq7xg0d6ez86ak9zlqh2zru4kgggqjys70g",
    )
    .unwrap();
    let test_transition_id = AleoID::<Field<Testnet3>, TRANSITION_PREFIX>::from_str(
        "au1070w2eknk90ldz2rs88p8erdjq5we4787hr702pf3lmzxsr4kg8sr5lran",
    )
    .unwrap();

    let test_record_pointer: AvailRecord<Testnet3> = AvailRecord {
        pointer: Pointer {
            block_height: 10u32,
            transaction_id: test_transaction_id,
            transition_id: test_transition_id,
            commitment: "test_commitment".to_string(),
            tag: "test_tag".to_string(),
            index: 0u8,
            owner: "address".to_string(),
        },
        metadata: Metadata {
            record_type: RecordTypeCommon::AleoCredits,
            program_id: "credits.aleo".to_string(),
            function_id: "transfer_public_to_private".to_string(),
            spent: false,
            name: "credits.record".to_string(),
            nonce: "test_nonce".to_string(),
        },
    };

    test_record_pointer
}

#[cfg(test)]
mod records_storage_api_tests {
    use super::*;
    use crate::api::encrypted_data::{delete_all_server_storage, post_encrypted_data};
    use crate::models::storage::languages::Languages;
    use crate::models::wallet_connect::records::{wc_Record, RecordWithPlaintext, RecordsFilter};

    use crate::services::local_storage::encrypted_data::{
        delete_user_encrypted_data, drop_encrypted_data_table,
    };

    use crate::services::local_storage::{
        encrypted_data::initialize_encrypted_data_table,
        persistent_storage::{delete_user_preferences, initial_user_preferences, update_address},
        session::view::VIEWSESSION,
    };
    use avail_common::models::constants::*;
    use snarkvm::prelude::{PrivateKey, ToBytes, ViewKey};

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
    fn test_store_view_session() {
        let pk = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();
        let view_key = ViewKey::<Testnet3>::try_from(&pk).unwrap();

        VIEWSESSION.set_view_session(&view_key.to_string()).unwrap();
    }

    #[test]
    fn test_encrypt_and_store_records() {
        test_setup_prerequisites();

        let address = Address::<Testnet3>::from_str(TESTNET_ADDRESS).unwrap();
        let test_record_pointer = get_test_record_pointer();

        let encrypted_records =
            encrypt_and_store_records::<Testnet3>(vec![test_record_pointer], address).unwrap();

        print!("{:?}", encrypted_records);
        assert_eq!(encrypted_records.len(), 1);
    }

    #[test]
    fn test_get_record_pointers() {
        // test_store_view_session();

        VIEWSESSION
            .set_view_session("AViewKey1pViDeDV8dT1yTCdzU6ojxh8GdFDadSasRpk6mZdyz8mh")
            .unwrap();

        //let test_record_pointer = get_test_record_pointer();

        let record_filter = RecordsFilter::new(
            vec!["credits.aleo".to_string()],
            None,
            RecordFilterType::All,
            Some("credits.record".to_string()),
        );

        let request = GetRecordsRequest::new(None, Some(record_filter), None);
        let (pointers, _ids) = get_record_pointers::<Testnet3>(request).unwrap();

        print!("Pointers {:?}", pointers);

        // assert!(pointers == vec![test_record_pointer]);
    }

    #[test]
    fn test_get_record_pointers_for_record_type() {
        test_store_view_session();
        let address = Address::<Testnet3>::from_str(TESTNET_ADDRESS).unwrap();
        let test_record_pointer = get_test_record_pointer();

        let pointers = get_record_pointers_for_record_type::<Testnet3>(
            RecordTypeCommon::AleoCredits,
            &address.to_string(),
        )
        .unwrap();

        print!("Pointers \n {:?}", pointers);

        assert!(pointers.0 == vec![test_record_pointer]);
    }

    #[test]
    fn test_get_record_pointer_for_program_id() {
        test_store_view_session();
        let test_record_pointer = get_test_record_pointer();
        let address = Address::<Testnet3>::from_str(TESTNET_ADDRESS).unwrap();

        let record_filter = RecordsFilter::new(
            vec!["credits.aleo".to_string()],
            None,
            RecordFilterType::All,
            None,
        );

        let request = GetRecordsRequest::new(Some(address.to_string()), Some(record_filter), None);

        let (pointers, _ids) = get_record_pointers::<Testnet3>(request).unwrap();

        print!("Pointers \n {:?}", pointers);

        assert!(pointers == vec![test_record_pointer]);
    }

    #[test]
    fn test_get_record_pointer_for_program_id_and_function_id() {
        test_store_view_session();
        let test_record_pointer = get_test_record_pointer();
        let address = Address::<Testnet3>::from_str(TESTNET_ADDRESS).unwrap();

        let record_filter = RecordsFilter::new(
            vec!["credits.aleo".to_string()],
            Some("transfer_public_to_private".to_string()),
            RecordFilterType::All,
            None,
        );

        let request = GetRecordsRequest::new(Some(address.to_string()), Some(record_filter), None);

        let (pointers, _ids) = get_record_pointers::<Testnet3>(request).unwrap();

        print!("Pointers \n {:?}", pointers);

        assert!(pointers == vec![test_record_pointer]);
    }

    #[test]
    fn test_get_record_pointer_for_program_id_and_record_name() {
        test_store_view_session();
        let test_record_pointer = get_test_record_pointer();
        let address = Address::<Testnet3>::from_str(TESTNET_ADDRESS).unwrap();
        let record_filter = RecordsFilter::new(
            vec!["credits.aleo".to_string()],
            None,
            RecordFilterType::All,
            Some("credits.record".to_string()),
        );

        let request = GetRecordsRequest::new(Some(address.to_string()), Some(record_filter), None);
        let (pointers, _ids) = get_record_pointers::<Testnet3>(request).unwrap();

        print!("Pointers \n {:?}", pointers);
        drop_encrypted_data_table().unwrap();
        assert!(pointers == vec![test_record_pointer]);
    }

    #[test]
    fn test_x() {
        let test_record_pointer = get_test_record_pointer();
        RecordWithPlaintext::from_record_pointer(test_record_pointer, "id".to_string()).unwrap();
    }

    #[tokio::test]
    async fn test_update_record_status() {
        test_setup_prerequisites();

        let test_pointer = get_test_record_pointer();
        let address = get_address::<Testnet3>().unwrap();

        let encrypted_record = encrypt_and_store_records(vec![test_pointer], address).unwrap();

        post_encrypted_data(encrypted_record.clone()).await.unwrap();

        let res = update_records_spent_backup::<Testnet3>(vec![encrypted_record[0]
            .id
            .unwrap()
            .to_string()])
        .await
        .unwrap();
        println!("{:?}", res);

        delete_all_server_storage().await.unwrap();
    }

    #[test]
    fn test_check_if_record_exists() {
        VIEWSESSION
        .set_view_session("AViewKey1myvhAr2nes8MF1y8gPV19azp4evwsBR4CqyzAi62nufW")
        .unwrap();

        let res = check_if_record_exists::<Testnet3>("").unwrap();
        println!("{:?}", res);

       ;
    }
}