use std::cmp::max;

use rusqlite::params;
use snarkvm::prelude::Network;

use crate::models::pointers::{
    deployment::DeploymentPointer, transaction::TransactionPointer, transition::TransitionPointer,
};
use crate::models::wallet_connect::get_event::GetEventsRequest;
use crate::models::{
    event::{AvailEvent, Event, SuccinctAvailEvent},
    storage::persistent::PersistentStorage,
};
use crate::services::local_storage::{
    encrypted_data::{get_encrypted_data_by_id, handle_encrypted_data_query},
    persistent_storage::{get_address_string, get_network},
};

use avail_common::{
    errors::{AvailError, AvailErrorType, AvailResult},
    models::encrypted_data::EncryptedDataTypeCommon,
};

/// Gets an Event by its encrypted data id
pub fn get_event_raw<N: Network>(id: &str) -> AvailResult<Event> {
    let encrypted_event = get_encrypted_data_by_id(id)?;
    let event = match encrypted_event.flavour {
        EncryptedDataTypeCommon::Transition => {
            TransitionPointer::<N>::decrypt_to_event(encrypted_event)?
        }
        EncryptedDataTypeCommon::Transaction => {
            TransactionPointer::<N>::decrypt_to_event(encrypted_event)?
        }
        EncryptedDataTypeCommon::Deployment => {
            DeploymentPointer::<N>::decrypt_to_event(encrypted_event)?
        }
        _ => {
            return Err(AvailError::new(
                AvailErrorType::Internal,
                "Unknown encrypted data flavour".to_string(),
                "Unknown Transaction Type".to_string(),
            ))
        }
    };

    Ok(event)
}

/// Gets an Avail Event by its encrypted data id
pub fn get_avail_event_raw<N: Network>(id: &str) -> AvailResult<AvailEvent> {
    let encrypted_event = get_encrypted_data_by_id(id)?;
    let event = match encrypted_event.flavour {
        EncryptedDataTypeCommon::Transition => {
            TransitionPointer::<N>::decrypt_to_avail_event(encrypted_event)?
        }
        EncryptedDataTypeCommon::Transaction => {
            TransactionPointer::<N>::decrypt_to_avail_event(encrypted_event)?
        }
        EncryptedDataTypeCommon::Deployment => {
            DeploymentPointer::<N>::decrypt_to_avail_event(encrypted_event)?
        }
        _ => {
            return Err(AvailError::new(
                AvailErrorType::Internal,
                "Unknown encrypted data flavour".to_string(),
                "Unknown Transaction Type".to_string(),
            ))
        }
    };

    Ok(event)
}

///  Gets a Succinct Avail Event by its encrypted data id
pub fn get_succinct_avail_event_raw<N: Network>(id: &str) -> AvailResult<SuccinctAvailEvent> {
    let encrypted_event = get_encrypted_data_by_id(id)?;
    let event = match encrypted_event.flavour {
        EncryptedDataTypeCommon::Transition => {
            TransitionPointer::<N>::decrypt_to_succinct_avail_event(encrypted_event)?
        }
        EncryptedDataTypeCommon::Transaction => {
            TransactionPointer::<N>::decrypt_to_succinct_avail_event(encrypted_event)?
        }
        EncryptedDataTypeCommon::Deployment => {
            DeploymentPointer::<N>::decrypt_to_succinct_avail_event(encrypted_event)?
        }
        _ => {
            return Err(AvailError::new(
                AvailErrorType::Internal,
                "Unknown encrypted data flavour".to_string(),
                "Unknown Transaction Type".to_string(),
            ))
        }
    };

    Ok(event)
}

pub fn get_events_raw<N: Network>(request: GetEventsRequest) -> AvailResult<Vec<Event>> {
    let address = get_address_string()?;
    let network = get_network()?;

    let mut transitions_deployments_query = format!(
        "SELECT * FROM encrypted_data WHERE flavour IN ('{}','{}') AND owner='{}' AND network='{}'",
        EncryptedDataTypeCommon::Transition.to_str(),
        EncryptedDataTypeCommon::Deployment.to_str(),
        address,
        network
    );

    let mut transactions_query = format!(
        "SELECT * FROM encrypted_data WHERE flavour='{}' AND owner='{}' AND network='{}'",
        EncryptedDataTypeCommon::Transaction.to_str(),
        address,
        network
    );

    if let Some(filter) = request.filter {
        if let Some(event_type) = filter.event_type {
            transitions_deployments_query
                .push_str(&format!(" AND event_type='{}'", event_type.to_str()));
            transactions_query.push_str(&format!(" AND event_type='{}'", event_type.to_str()));
        }

        if let Some(program_id) = filter.program_id {
            transitions_deployments_query.push_str(&format!(" AND program_ids='{}'", program_id));
            // in the case of transactions_query the program_ids is a json string, so we need to use the json_each function
            transactions_query.push_str(&format!(" AND EXISTS (SELECT 1 FROM json_each(encrypted_data.program_ids) WHERE json_each.value = '{}')", program_id));
        }

        // TODO - Add function_id filter
        if let Some(function_id) = filter.function_id {
            transitions_deployments_query.push_str(&format!(" AND function_ids='{}'", function_id));
            // in the case of transactions_query the function_ids is a json string, so we need to use the json_each function
            transactions_query.push_str(&format!(" AND EXISTS (SELECT 1 FROM json_each(encrypted_data.function_ids) WHERE json_each.value = '{}')", function_id));
        }
    }

    transitions_deployments_query.push_str(" ORDER BY synced_on DESC");
    transactions_query.push_str(" ORDER BY synced_on DESC");

    if let Some(page) = request.page {
        transitions_deployments_query.push_str(&format!(" LIMIT 6 OFFSET {}", page * 6));
        transactions_query.push_str(&format!(" LIMIT 6 OFFSET {}", page * 6));
    }

    let encrypted_transitions_deployments =
        handle_encrypted_data_query(&transitions_deployments_query)?;
    let encrypted_transactions = handle_encrypted_data_query(&transactions_query)?;

    let encrypted_data = [
        &encrypted_transitions_deployments[..],
        &encrypted_transactions[..],
    ]
    .concat();

    let mut events: Vec<Event> = vec![];
    for encrypted_transaction in encrypted_data {
        let event = match encrypted_transaction.flavour {
            EncryptedDataTypeCommon::Transition => {
                TransitionPointer::<N>::decrypt_to_event(encrypted_transaction)?
            }
            EncryptedDataTypeCommon::Transaction => {
                TransactionPointer::<N>::decrypt_to_event(encrypted_transaction)?
            }
            EncryptedDataTypeCommon::Deployment => {
                DeploymentPointer::<N>::decrypt_to_event(encrypted_transaction)?
            }
            _ => {
                return Err(AvailError::new(
                    AvailErrorType::Internal,
                    "Unknown encrypted data flavour".to_string(),
                    "Unknown Transaction Type".to_string(),
                ))
            }
        };

        events.push(event);
    }

    Ok(events)
}

// Get Avail Events with filter
pub fn get_avail_events_raw<N: Network>(request: GetEventsRequest) -> AvailResult<Vec<AvailEvent>> {
    let address = get_address_string()?;
    let network = get_network()?;

    let mut transitions_deployments_query = format!(
        "SELECT * FROM encrypted_data WHERE flavour IN ('{}','{}') AND owner='{}' AND network='{}'",
        EncryptedDataTypeCommon::Transition.to_str(),
        EncryptedDataTypeCommon::Deployment.to_str(),
        address,
        network
    );

    let mut transactions_query = format!(
        "SELECT * FROM encrypted_data WHERE flavour='{}' AND owner='{}' AND network='{}'",
        EncryptedDataTypeCommon::Transaction.to_str(),
        address,
        network
    );

    if let Some(filter) = request.filter {
        if let Some(event_type) = filter.event_type {
            transitions_deployments_query
                .push_str(&format!(" AND event_type='{}'", event_type.to_str()));
            transactions_query.push_str(&format!(" AND event_type='{}'", event_type.to_str()));
        }

        if let Some(program_id) = filter.program_id {
            transitions_deployments_query.push_str(&format!(" AND program_ids='{}'", program_id));
            // in the case of transactions_query the program_ids is a json string, so we need to use the json_each function
            transactions_query.push_str(&format!(" AND EXISTS (SELECT 1 FROM json_each(encrypted_data.program_ids) WHERE json_each.value = '{}')", program_id));
        }

        // TODO - Add function_id filter
        if let Some(function_id) = filter.function_id {
            transitions_deployments_query.push_str(&format!(" AND function_ids='{}'", function_id));
            // in the case of transactions_query the function_ids is a json string, so we need to use the json_each function
            transactions_query.push_str(&format!(" AND EXISTS (SELECT 1 FROM json_each(encrypted_data.function_ids) WHERE json_each.value = '{}')", function_id));
        }
    }

    transitions_deployments_query.push_str(" ORDER BY synced_on DESC");
    transactions_query.push_str(" ORDER BY synced_on DESC");

    if let Some(page) = request.page {
        println!("page: {}", page);
        transitions_deployments_query.push_str(&format!(" LIMIT 6 OFFSET {}", page * 6));
        transactions_query.push_str(&format!(" LIMIT 6 OFFSET {}", page * 6));
    }

    let encrypted_transitions_deployments =
        handle_encrypted_data_query(&transitions_deployments_query)?;
    let encrypted_transactions = handle_encrypted_data_query(&transactions_query)?;

    let encrypted_data = [
        &encrypted_transitions_deployments[..],
        &encrypted_transactions[..],
    ]
    .concat();

    let mut events: Vec<AvailEvent> = vec![];

    for encrypted_transaction in encrypted_data {
        let event = match encrypted_transaction.flavour {
            EncryptedDataTypeCommon::Transition => {
                TransitionPointer::<N>::decrypt_to_avail_event(encrypted_transaction)?
            }
            EncryptedDataTypeCommon::Transaction => {
                TransactionPointer::<N>::decrypt_to_avail_event(encrypted_transaction)?
            }
            EncryptedDataTypeCommon::Deployment => {
                DeploymentPointer::<N>::decrypt_to_avail_event(encrypted_transaction)?
            }
            _ => {
                return Err(AvailError::new(
                    AvailErrorType::Internal,
                    "Unknown encrypted data flavour".to_string(),
                    "Unknown Transaction Type".to_string(),
                ))
            }
        };

        events.push(event);
    }

    Ok(events)
}

pub fn get_succinct_avail_events_raw<N: Network>(
    request: GetEventsRequest,
) -> AvailResult<Vec<SuccinctAvailEvent>> {
    let address = get_address_string()?;
    let network = get_network()?;

    let mut transitions_deployments_query = format!(
        "SELECT * FROM encrypted_data WHERE flavour IN ('{}','{}') AND owner='{}' AND network='{}'",
        EncryptedDataTypeCommon::Transition.to_str(),
        EncryptedDataTypeCommon::Deployment.to_str(),
        address,
        network
    );

    let mut transactions_query = format!(
        "SELECT * FROM encrypted_data WHERE flavour='{}' AND owner='{}' AND network='{}'",
        EncryptedDataTypeCommon::Transaction.to_str(),
        address,
        network
    );

    if let Some(filter) = request.filter {
        if let Some(event_type) = filter.event_type {
            transitions_deployments_query
                .push_str(&format!(" AND event_type='{}'", event_type.to_str()));
            transactions_query.push_str(&format!(" AND event_type='{}'", event_type.to_str()));
        }

        if let Some(program_id) = filter.program_id {
            transitions_deployments_query.push_str(&format!(" AND program_ids='{}'", program_id));
            // in the case of transactions_query the program_ids is a json string, so we need to use the json_each function
            transactions_query.push_str(&format!(" AND EXISTS (SELECT 1 FROM json_each(encrypted_data.program_ids) WHERE json_each.value = '{}')", program_id));
        }

        // TODO - Add function_id filter
        if let Some(function_id) = filter.function_id {
            transitions_deployments_query.push_str(&format!(" AND function_ids='{}'", function_id));
            // in the case of transactions_query the function_ids is a json string, so we need to use the json_each function
            transactions_query.push_str(&format!(" AND EXISTS (SELECT 1 FROM json_each(encrypted_data.function_ids) WHERE json_each.value = '{}')", function_id));
        }
    }

    transitions_deployments_query.push_str(" ORDER BY synced_on DESC");
    transactions_query.push_str(" ORDER BY synced_on DESC");

    if let Some(page) = request.page {
        println!("page: {}", page);
        transitions_deployments_query.push_str(&format!(" LIMIT 6 OFFSET {}", page * 6));
        transactions_query.push_str(&format!(" LIMIT 6 OFFSET {}", page * 6));
    }

    let encrypted_transitions_deployments =
        handle_encrypted_data_query(&transitions_deployments_query)?;
    let encrypted_transactions = handle_encrypted_data_query(&transactions_query)?;

    let encrypted_data = [
        &encrypted_transitions_deployments[..],
        &encrypted_transactions[..],
    ]
    .concat();

    let mut events: Vec<SuccinctAvailEvent> = vec![];

    for encrypted_transaction in encrypted_data {
        let event = match encrypted_transaction.flavour {
            EncryptedDataTypeCommon::Transition => {
                TransitionPointer::<N>::decrypt_to_succinct_avail_event(encrypted_transaction)?
            }
            EncryptedDataTypeCommon::Transaction => {
                TransactionPointer::<N>::decrypt_to_succinct_avail_event(encrypted_transaction)?
            }
            EncryptedDataTypeCommon::Deployment => {
                DeploymentPointer::<N>::decrypt_to_succinct_avail_event(encrypted_transaction)?
            }
            _ => {
                return Err(AvailError::new(
                    AvailErrorType::Internal,
                    "Unknown encrypted data flavour".to_string(),
                    "Unknown Transaction Type".to_string(),
                ))
            }
        };

        events.push(event);
    }

    Ok(events)
}

/* --Utilities-- */

/// Calculates how many pages of events are available
pub fn transaction_pages_available() -> AvailResult<i64> {
    let storage = PersistentStorage::new()?;

    let address = get_address_string()?;
    let network = get_network()?;

    let events_per_page = 6;
    let count_query = "
    SELECT COUNT(*) FROM encrypted_data
    WHERE flavour IN (?,?,?)
    AND owner = ?
    AND network = ?";

    let total_count: i64 = storage.conn.query_row(
        count_query,
        params![
            EncryptedDataTypeCommon::Transition.to_str(),
            EncryptedDataTypeCommon::Transaction.to_str(),
            EncryptedDataTypeCommon::Deployment.to_str(),
            address,
            network
        ],
        |row| row.get(0),
    )?;
    // Calculate the number of pages
    let total_pages = max(
        1,
        (total_count as f64 / events_per_page as f64).ceil() as i64,
    );
    Ok(total_pages)
}

#[cfg(test)]
mod events_tests {
    use std::str::FromStr;

    use super::*;
    use snarkvm::prelude::{PrivateKey, Testnet3, ToBytes, ViewKey};

    use crate::{
        models::wallet_connect::get_event::EventsFilter,
        services::local_storage::persistent_storage::update_address,
    };
    use avail_common::models::constants::TESTNET_PRIVATE_KEY;

    #[test]
    fn test_get_event_raw() {
        let event = get_event_raw::<Testnet3>(
            String::from("5aa9d8f2-7d74-40fc-ae64-457dc188d598").as_str(),
        )
        .unwrap();
        println!("{:?}", event);
    }

    #[test]
    fn test_get_avail_event_raw() {
        let event = get_avail_event_raw::<Testnet3>(
            String::from("5aa9d8f2-7d74-40fc-ae64-457dc188d598").as_str(),
        )
        .unwrap();
        println!("{:?}", event);
    }

    #[test]
    fn test_get_events_raw() {
        let event_filter = EventsFilter {
            event_type: None,
            program_id: None,
            function_id: Some("transfer_public_to_private".to_string()),
        };
        let request = GetEventsRequest {
            filter: Some(event_filter),
            page: Some(0),
        };

        let event = get_events_raw::<Testnet3>(request).unwrap();
        println!("{:?}", event);
    }

    #[test]
    fn test_get_avail_events_raw() {
        let event = get_avail_events_raw::<Testnet3>(GetEventsRequest::default()).unwrap();
        println!("{:?}", event);
    }

    #[test]
    fn test_transaction_pages_available() {
        let event_pages = transaction_pages_available().unwrap();
        println!("{:?}", event_pages);
    }
}
