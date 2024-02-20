use chrono::{DateTime, Local};
use snarkvm::prelude::{transactions::Transactions, Address, Network, Testnet3};
use std::str::FromStr;

use crate::models::{event::Event, pointers::deployment::DeploymentPointer};
use crate::services::local_storage::encrypted_data::store_encrypted_data;
use crate::services::local_storage::{
    encrypted_data::{get_encrypted_data_by_flavour, get_encrypted_data_by_id},
    persistent_storage::get_network,
    session::view::VIEWSESSION,
};

use avail_common::{
    errors::{AvailError, AvailErrorType, AvailResult},
    models::{
        encrypted_data::{EncryptedData, EncryptedDataTypeCommon, TransactionState},
        network::SupportedNetworks,
    },
};

/* -- Deployments -- */
pub fn find_encrypt_store_deployments<N: Network>(
    transactions: &Transactions<N>,
    height: u32,
    timestamp: DateTime<Local>,
    address: Address<N>,
    stored_transaction_ids: Vec<N::TransactionID>,
) -> AvailResult<Vec<EncryptedData>> {
    let deployment_pointers = transactions
        .iter()
        .map(|tx| {
            if stored_transaction_ids.contains(&tx.id()) {
                return None;
            }
            let deployment = tx.deployment();
            let owner = tx.owner();
            if let Some(deployment) = deployment {
                let owner = owner.unwrap();
                match owner.address() == address {
                    true => {
                        let base_fee = match tx.base_fee_amount() {
                            Ok(fee) => fee,
                            Err(_) => return None,
                        };
                        let priority_fee = match tx.priority_fee_amount() {
                            Ok(fee) => fee,
                            Err(_) => return None,
                        };
                        let fee = *(base_fee + priority_fee) as f64 / 1000000.0;

                        let deployment_pointer = DeploymentPointer::new(
                            Some(tx.id().to_owned()),
                            deployment.program_id().to_string(),
                            fee,
                            TransactionState::Confirmed,
                            Some(height),
                            None,
                            timestamp,
                            Some(timestamp),
                            None,
                        );

                        Some(deployment_pointer)
                    }
                    false => None,
                }
            } else {
                None
            }
        })
        .filter_map(|x| x)
        .collect::<Vec<_>>();

    let encrypted_deployments = deployment_pointers
        .iter()
        .map(|dp| {
            let encrypted_dp = dp.to_encrypted_data(address)?;
            store_encrypted_data(encrypted_dp.clone())?;
            Ok(encrypted_dp)
        })
        .collect::<AvailResult<Vec<EncryptedData>>>()?;

    Ok(encrypted_deployments)
}

pub fn get_deployment_pointer<N: Network>(id: &str) -> AvailResult<DeploymentPointer<N>> {
    let encrypted_deployment = get_encrypted_data_by_id(id)?;

    let deployment = decrypt_deployments::<N>(vec![encrypted_deployment])?;

    Ok(deployment[0].to_owned())
}

// TODO - make generic to all encrypted data with Deserialize trait bound
pub fn decrypt_deployments<N: Network>(
    encrypted_deployments: Vec<EncryptedData>,
) -> AvailResult<Vec<DeploymentPointer<N>>> {
    let network = get_network()?;

    let v_key = match SupportedNetworks::from_str(&network)? {
        SupportedNetworks::Testnet3 => VIEWSESSION.get_instance::<Testnet3>()?,
        _ => VIEWSESSION.get_instance::<Testnet3>()?,
    };

    let deployments = encrypted_deployments
        .iter()
        .map(|x| {
            let encrypted_data = match SupportedNetworks::from_str(&network)? {
                SupportedNetworks::Testnet3 => x.to_enrypted_struct::<Testnet3>()?,
                _ => x.to_enrypted_struct::<Testnet3>()?,
            };

            let deployment: DeploymentPointer<N> = encrypted_data.decrypt(v_key)?;

            Ok(deployment)
        })
        .collect::<AvailResult<Vec<DeploymentPointer<N>>>>()?;

    Ok(deployments)
}

pub fn decrypt_deployment<N: Network>(encrypted_deployment: EncryptedData) -> AvailResult<Event> {
    let v_key = VIEWSESSION.get_instance::<N>()?;

    let db_id = match encrypted_deployment.id {
        Some(id) => id.to_string(),
        None => Err(AvailError::new(
            AvailErrorType::Internal,
            "No id found".to_string(),
            "No Id Found".to_string(),
        ))?,
    };

    let encrypted_data = encrypted_deployment.to_enrypted_struct::<N>()?;

    let deployment: DeploymentPointer<N> = encrypted_data.decrypt(v_key)?;

    deployment.to_event(&db_id)
}

pub fn get_deployment_pointers<N: Network>() -> AvailResult<Vec<DeploymentPointer<N>>> {
    let encrypted_deployments = get_encrypted_data_by_flavour(EncryptedDataTypeCommon::Deployment)?;

    decrypt_deployments(encrypted_deployments)
}

mod deployment_storage_api_test {}
