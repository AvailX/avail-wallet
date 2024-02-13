use chrono::{DateTime, Local, Utc};
use snarkvm::prelude::Network;

use crate::models::{
    event::Event,
    pointers::{
        deployment::DeploymentPointer, transaction::TransactionPointer,
        transition::TransitionPointer,
    },
};
use crate::services::local_storage::encrypted_data::{
    get_encrypted_data_by_id, handle_encrypted_data_query, handle_encrypted_data_query_params,
};
use crate::services::local_storage::{
    encrypted_data::get_encrypted_data_by_flavour,
    persistent_storage::{get_address, get_network},
    session::view::VIEWSESSION,
};

use avail_common::{
    errors::{AvailError, AvailErrorType, AvailResult},
    models::encrypted_data::{EncryptedData, EncryptedDataTypeCommon},
};

pub fn get_transactions_exec<N: Network>() -> AvailResult<Vec<TransactionPointer<N>>> {
    let encrypted_transactions =
        get_encrypted_data_by_flavour(EncryptedDataTypeCommon::Transaction)?;

    let transactions = decrypt_transactions_exec(encrypted_transactions)?;

    Ok(transactions)
}

pub fn get_transaction_pointer<N: Network>(id: &str) -> AvailResult<TransactionPointer<N>> {
    let encrypted_transaction = get_encrypted_data_by_id(id)?;

    let transaction = decrypt_transactions_exec::<N>(vec![encrypted_transaction])?;

    Ok(transaction[0].to_owned())
}

pub fn decrypt_transactions_exec<N: Network>(
    encrypted_transactions: Vec<EncryptedData>,
) -> AvailResult<Vec<TransactionPointer<N>>> {
    let v_key = VIEWSESSION.get_instance::<N>()?;

    let transactions = encrypted_transactions
        .iter()
        .map(|x| {
            let encrypted_data = x.to_enrypted_struct::<N>()?;

            let tx_in: TransactionPointer<N> = encrypted_data.decrypt(v_key)?;

            Ok(tx_in)
        })
        .collect::<AvailResult<Vec<TransactionPointer<N>>>>()?;

    Ok(transactions)
}

pub fn decrypt_transaction_exec<N: Network>(encrypted_tx: EncryptedData) -> AvailResult<Event> {
    let v_key = VIEWSESSION.get_instance::<N>()?;

    let encrypted_data = encrypted_tx.to_enrypted_struct::<N>()?;

    let tx_out: TransactionPointer<N> = encrypted_data.decrypt(v_key)?;

    let event_id = match encrypted_tx.id {
        Some(id) => id.to_string(),
        None => {
            return Err(AvailError::new(
                AvailErrorType::Internal,
                "No event id found".to_string(),
                "No event id found".to_string(),
            ))
        }
    };

    tx_out.to_event(&event_id)
}

/* Utilities */
// get all transactions from a certain synced_on date forward and return Vector of transaction id string
pub fn get_tx_ids_from_date<N: Network>(
    date: DateTime<Local>,
) -> AvailResult<Vec<N::TransactionID>> {
    let address = get_address::<N>()?;
    let network = get_network()?;

    let timestamp = date.with_timezone(&Utc);

    let query = format!(
        "SELECT * FROM encrypted_data WHERE flavour IN ('{}','{}','{}') AND owner='{}' AND network='{}' AND created_at >= ?1",
        EncryptedDataTypeCommon::Transition.to_str(),
        EncryptedDataTypeCommon::Transaction.to_str(),
        EncryptedDataTypeCommon::Deployment.to_str(),
        address,
        network
    );

    let encrypted_transactions = handle_encrypted_data_query_params(&query, vec![timestamp])?;

    let mut transaction_ids: Vec<N::TransactionID> = Vec::new();

    for encrypted_transaction in encrypted_transactions {
        let encrypted_struct = encrypted_transaction.to_enrypted_struct::<N>()?;
        match encrypted_transaction.flavour {
            EncryptedDataTypeCommon::Transition => {
                let transition: TransitionPointer<N> =
                    encrypted_struct.decrypt(VIEWSESSION.get_instance::<N>()?)?;
                transaction_ids.push(transition.transaction_id);
            }
            EncryptedDataTypeCommon::Transaction => {
                let tx_exec: TransactionPointer<N> =
                    encrypted_struct.decrypt(VIEWSESSION.get_instance::<N>()?)?;
                if let Some(id) = tx_exec.transaction_id() {
                    transaction_ids.push(id);
                }
            }
            EncryptedDataTypeCommon::Deployment => {
                let deployment: DeploymentPointer<N> =
                    encrypted_struct.decrypt(VIEWSESSION.get_instance::<N>()?)?;
                if let Some(id) = deployment.id {
                    transaction_ids.push(id);
                }
            }
            _ => {}
        };
    }

    Ok(transaction_ids)
}

pub fn get_transaction_ids<N: Network>() -> AvailResult<Vec<N::TransactionID>> {
    let address = get_address::<N>()?;
    let network = get_network()?;

    let query = format!(
        "SELECT * FROM encrypted_data WHERE flavour IN ('{}','{}','{}') AND owner='{}' AND network='{}'",
        EncryptedDataTypeCommon::Transition.to_str(),
        EncryptedDataTypeCommon::Transaction.to_str(),
        EncryptedDataTypeCommon::Deployment.to_str(),
        address,
        network
    );

    let encrypted_transactions = handle_encrypted_data_query(&query)?;

    let mut transaction_ids: Vec<N::TransactionID> = Vec::new();

    for encrypted_transaction in encrypted_transactions {
        let encrypted_struct = encrypted_transaction.to_enrypted_struct::<N>()?;
        match encrypted_transaction.flavour {
            EncryptedDataTypeCommon::Transition => {
                let transition: TransitionPointer<N> =
                    encrypted_struct.decrypt(VIEWSESSION.get_instance::<N>()?)?;
                transaction_ids.push(transition.transaction_id);
            }
            EncryptedDataTypeCommon::Transaction => {
                let tx_exec: TransactionPointer<N> =
                    encrypted_struct.decrypt(VIEWSESSION.get_instance::<N>()?)?;

                if let Some(id) = tx_exec.transaction_id() {
                    transaction_ids.push(id);
                }
            }
            EncryptedDataTypeCommon::Deployment => {
                let deployment: DeploymentPointer<N> =
                    encrypted_struct.decrypt(VIEWSESSION.get_instance::<N>()?)?;
                if let Some(id) = deployment.id {
                    transaction_ids.push(id);
                }
            }
            _ => {}
        };
    }

    Ok(transaction_ids)
}

#[cfg(test)]
mod tx_out_storage_api_tests {
    use super::*;
    use avail_common::models::{
        constants::*,
        encrypted_data::{EventTypeCommon, TransactionState},
    };
    use chrono::Local;
    use snarkvm::prelude::{Address, AleoID, Field, PrivateKey, Testnet3, ToBytes, ViewKey};
    use std::str::FromStr;
    use uuid::Uuid;

    use crate::services::local_storage::{
        encrypted_data::{
            delete_user_encrypted_data, initialize_encrypted_data_table, store_encrypted_data,
        },
        session::view::VIEWSESSION,
    };

    #[test]
    fn test_store_view_session() {
        let pk = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();
        let view_key = ViewKey::<Testnet3>::try_from(&pk).unwrap();

        VIEWSESSION.set_view_session(&view_key.to_string()).unwrap();
    }

    #[test]
    fn test_store_tx_out() {
        delete_user_encrypted_data().unwrap();
        initialize_encrypted_data_table().unwrap();

        let test_transaction_id = AleoID::<Field<Testnet3>, TX_PREFIX>::from_str(
            "at1zux4zw83dayxtndd58skuy7qq7xg0d6ez86ak9zlqh2zru4kgggqjys70g",
        )
        .unwrap();

        let test_transaction_out = TransactionPointer::new(
            Some("Test_User".to_string()),
            Some(test_transaction_id),
            TransactionState::Confirmed,
            Some(100u32),
            Some("test_program_id".to_string()),
            Some("test_function_id".to_string()),
            vec![],
            Local::now(),
            Some(Local::now() + chrono::Duration::seconds(40)),
            None,
            EventTypeCommon::Send,
            None,
            None,
            None,
        );

        let address = Address::<Testnet3>::from_str(TESTNET_ADDRESS).unwrap();
        let id = Uuid::new_v4();

        let encrypted_tx_in = test_transaction_out.to_encrypted_data(address).unwrap();

        store_encrypted_data(encrypted_tx_in).unwrap();
    }

    #[test]
    fn test_get_transactions_out() {
        test_store_tx_out();
        test_store_view_session();

        let test_transaction_id = AleoID::<Field<Testnet3>, TX_PREFIX>::from_str(
            "at1zux4zw83dayxtndd58skuy7qq7xg0d6ez86ak9zlqh2zru4kgggqjys70g",
        )
        .unwrap();

        let test_transaction_out = TransactionPointer::new(
            Some("Test_User".to_string()),
            Some(test_transaction_id),
            TransactionState::Confirmed,
            Some(100u32),
            Some("test_program_id".to_string()),
            Some("test_function_id".to_string()),
            vec![],
            Local::now(),
            Some(Local::now() + chrono::Duration::seconds(40)),
            None,
            EventTypeCommon::Send,
            None,
            None,
            None,
        );

        let transactions_out = get_transactions_exec::<Testnet3>().unwrap();

        assert_eq!(vec![test_transaction_out], transactions_out)
    }
}
