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
    models::encrypted_data::{EncryptedData, EncryptedDataTypeCommon},
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

    // Query for transitions and deployments
    let transitions_deployments_query = format!(
        "SELECT *, '[]' as json_program_ids, '[]' as json_function_ids FROM encrypted_data WHERE flavour IN ('{}','{}') AND owner='{}' AND network='{}'",
        EncryptedDataTypeCommon::Transition.to_str(),
        EncryptedDataTypeCommon::Deployment.to_str(),
        address,
        network
    );

    // Query for transactions
    let transactions_query = format!(
        "SELECT *, program_ids as json_program_ids, function_ids as json_function_ids FROM encrypted_data WHERE flavour='{}' AND owner='{}' AND network='{}'",
        EncryptedDataTypeCommon::Transaction.to_str(),
        address,
        network
    );

    // Applying filters
    let mut common_filter_conditions = String::new();
    if let Some(filter) = request.filter {
        if let Some(event_type) = filter.event_type {
            common_filter_conditions
                .push_str(&format!(" AND event_type='{}'", event_type.to_str()));
        }

        if let Some(program_id) = filter.program_id {
            // Adjust this to handle both cases (string equality for transitions/deployments and JSON array contains for transactions)
            common_filter_conditions.push_str(&format!(
                " AND (program_ids='{}' OR JSON_EXTRACT(json_program_ids, '$') LIKE '%{}%')",
                program_id, program_id
            ));
        }

        if let Some(function_id) = filter.function_id {
            // Similar adjustment for function_ids
            common_filter_conditions.push_str(&format!(
                " AND (function_ids='{}' OR JSON_EXTRACT(json_function_ids, '$') LIKE '%{}%')",
                function_id, function_id
            ));
        }
    }

    let transitions_deployments_query_with_filters = format!(
        "{} {}",
        transitions_deployments_query, common_filter_conditions
    );

    let transactions_query_with_filters =
        format!("{} {}", transactions_query, common_filter_conditions);

    let mut combined_query = format!(
        "{} UNION ALL {} ORDER BY created_at DESC",
        transitions_deployments_query_with_filters, transactions_query_with_filters
    );

    let mut encrypted_data: Vec<EncryptedData> = vec![];

    if let Some(page) = request.page {
        let fetch_limit = (page * 6) + 6;

        combined_query = format!(
            "{} UNION ALL {} ORDER BY created_at DESC  LIMIT {}",
            transitions_deployments_query_with_filters,
            transactions_query_with_filters,
            fetch_limit
        );

        let page_start = (page * 6) as usize;
        let page_end = page_start + 6;

        let encrypted_data_result = handle_encrypted_data_query(&combined_query)?;
        let page_encrypted_data = encrypted_data_result[page_start.min(encrypted_data_result.len())
            ..page_end.min(encrypted_data_result.len())]
            .to_vec();
        encrypted_data = page_encrypted_data;
    } else {
        encrypted_data = handle_encrypted_data_query(&combined_query)?;
    }

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

    // Query for transitions and deployments
    let transitions_deployments_query = format!(
        "SELECT *, '[]' as json_program_ids, '[]' as json_function_ids FROM encrypted_data WHERE flavour IN ('{}','{}') AND owner='{}' AND network='{}'",
        EncryptedDataTypeCommon::Transition.to_str(),
        EncryptedDataTypeCommon::Deployment.to_str(),
        address,
        network
    );

    // Query for transactions
    let transactions_query = format!(
        "SELECT *, program_ids as json_program_ids, function_ids as json_function_ids FROM encrypted_data WHERE flavour='{}' AND owner='{}' AND network='{}'",
        EncryptedDataTypeCommon::Transaction.to_str(),
        address,
        network
    );

    // Applying filters
    let mut common_filter_conditions = String::new();
    if let Some(filter) = request.filter {
        if let Some(event_type) = filter.event_type {
            common_filter_conditions
                .push_str(&format!(" AND event_type='{}'", event_type.to_str()));
        }

        if let Some(program_id) = filter.program_id {
            // Adjust this to handle both cases (string equality for transitions/deployments and JSON array contains for transactions)
            common_filter_conditions.push_str(&format!(
                " AND (program_ids='{}' OR JSON_EXTRACT(json_program_ids, '$') LIKE '%{}%')",
                program_id, program_id
            ));
        }

        if let Some(function_id) = filter.function_id {
            // Similar adjustment for function_ids
            common_filter_conditions.push_str(&format!(
                " AND (function_ids='{}' OR JSON_EXTRACT(json_function_ids, '$') LIKE '%{}%')",
                function_id, function_id
            ));
        }
    }

    let transitions_deployments_query_with_filters = format!(
        "{} {}",
        transitions_deployments_query, common_filter_conditions
    );

    let transactions_query_with_filters =
        format!("{} {}", transactions_query, common_filter_conditions);

    let mut combined_query = format!(
        "{} UNION ALL {} ORDER BY created_at DESC",
        transitions_deployments_query_with_filters, transactions_query_with_filters
    );

    let mut encrypted_data: Vec<EncryptedData> = vec![];

    if let Some(page) = request.page {
        let fetch_limit = (page * 6) + 6;

        combined_query = format!(
            "{} UNION ALL {} ORDER BY created_at DESC  LIMIT {}",
            transitions_deployments_query_with_filters,
            transactions_query_with_filters,
            fetch_limit
        );

        let page_start = (page * 6) as usize;
        let page_end = page_start + 6;

        let encrypted_data_result = handle_encrypted_data_query(&combined_query)?;
        let page_encrypted_data = encrypted_data_result[page_start.min(encrypted_data_result.len())
            ..page_end.min(encrypted_data_result.len())]
            .to_vec();
        encrypted_data = page_encrypted_data;
    } else {
        encrypted_data = handle_encrypted_data_query(&combined_query)?;
    }

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

    // Query for transitions and deployments
    let transitions_deployments_query = format!(
        "SELECT *, '[]' as json_program_ids, '[]' as json_function_ids FROM encrypted_data WHERE flavour IN ('{}','{}') AND owner='{}' AND network='{}'",
        EncryptedDataTypeCommon::Transition.to_str(),
        EncryptedDataTypeCommon::Deployment.to_str(),
        address,
        network
    );

    // Query for transactions
    let transactions_query = format!(
        "SELECT *, program_ids as json_program_ids, function_ids as json_function_ids FROM encrypted_data WHERE flavour='{}' AND owner='{}' AND network='{}'",
        EncryptedDataTypeCommon::Transaction.to_str(),
        address,
        network
    );

    // Applying filters
    let mut common_filter_conditions = String::new();
    if let Some(filter) = request.filter {
        if let Some(event_type) = filter.event_type {
            common_filter_conditions
                .push_str(&format!(" AND event_type='{}'", event_type.to_str()));
        }

        if let Some(program_id) = filter.program_id {
            // Adjust this to handle both cases (string equality for transitions/deployments and JSON array contains for transactions)
            common_filter_conditions.push_str(&format!(
                " AND (program_ids='{}' OR JSON_EXTRACT(json_program_ids, '$') LIKE '%{}%')",
                program_id, program_id
            ));
        }

        if let Some(function_id) = filter.function_id {
            // Similar adjustment for function_ids
            common_filter_conditions.push_str(&format!(
                " AND (function_ids='{}' OR JSON_EXTRACT(json_function_ids, '$') LIKE '%{}%')",
                function_id, function_id
            ));
        }
    }

    let transitions_deployments_query_with_filters = format!(
        "{} {}",
        transitions_deployments_query, common_filter_conditions
    );

    let transactions_query_with_filters =
        format!("{} {}", transactions_query, common_filter_conditions);

    let mut combined_query = format!(
        "{} UNION ALL {} ORDER BY created_at DESC",
        transitions_deployments_query_with_filters, transactions_query_with_filters
    );

    let mut encrypted_data: Vec<EncryptedData> = vec![];

    if let Some(page) = request.page {
        let fetch_limit = (page * 6) + 6;

        combined_query = format!(
            "{} UNION ALL {} ORDER BY created_at DESC  LIMIT {}",
            transitions_deployments_query_with_filters,
            transactions_query_with_filters,
            fetch_limit
        );

        let page_start = (page * 6) as usize;
        let page_end = page_start + 6;

        let encrypted_data_result = handle_encrypted_data_query(&combined_query)?;
        let page_encrypted_data = encrypted_data_result[page_start.min(encrypted_data_result.len())
            ..page_end.min(encrypted_data_result.len())]
            .to_vec();
        encrypted_data = page_encrypted_data;
    } else {
        encrypted_data = handle_encrypted_data_query(&combined_query)?;
    }

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
        services::local_storage::{persistent_storage::update_address, session::view::VIEWSESSION},
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
        VIEWSESSION
            .set_view_session("AViewKey1dRUJgozQcBf2rntQqoGYfViNy4A3Khx9RZVwuX3kSNCx")
            .unwrap();
        let event = get_avail_events_raw::<Testnet3>(GetEventsRequest::default()).unwrap();
        println!("{:?}", event);
    }

    #[test]
    fn test_get_succinct_avail_events_raw() {
        VIEWSESSION
            .set_view_session("AViewKey1dRUJgozQcBf2rntQqoGYfViNy4A3Khx9RZVwuX3kSNCx")
            .unwrap();
        let event = get_succinct_avail_events_raw::<Testnet3>(GetEventsRequest::default()).unwrap();
        println!("{:?}", event);
    }

    #[test]
    fn test_transaction_pages_available() {
        let event_pages = transaction_pages_available().unwrap();
        println!("{:?}", event_pages);
    }
}
