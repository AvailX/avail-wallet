use chrono::{DateTime, Local};
use serde::{Deserialize, Serialize};
use snarkvm::prelude::{confirmed::ConfirmedTransaction, Address, Network};
use uuid::Uuid;

use crate::helpers::utils::get_timestamp_from_i64;
use crate::services::local_storage::{
    persistent_storage::get_network, storage_api::transaction::get_transaction_ids,
};
use avail_common::{
    aleo_tools::api::AleoAPIClient,
    errors::AvailResult,
    models::{
        encrypted_data::{EncryptedData, EncryptedDataTypeCommon},
        traits::encryptable::Encryptable,
    },
};

/// Encrypted and sent to the address the wallet owner interacted with in the transaction to avoid scanning times
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct TransactionMessage<N: Network> {
    id: N::TransactionID,
    confirmed_height: u32,
    from: String,
    message: Option<String>,
}

impl<N: Network> TransactionMessage<N> {
    pub fn new(
        id: N::TransactionID,
        confirmed_height: u32,
        from: String,
        message: Option<String>,
    ) -> Self {
        Self {
            id,
            confirmed_height,
            from,
            message,
        }
    }

    pub fn id(&self) -> N::TransactionID {
        self.id
    }

    pub fn confirmed_height(&self) -> u32 {
        self.confirmed_height
    }

    pub fn from(&self) -> String {
        self.from.to_owned()
    }

    pub fn message(&self) -> Option<String> {
        self.message.to_owned()
    }

    pub fn to_encrypted_data(&self, encrypt_for: Address<N>) -> AvailResult<EncryptedData> {
        let encrypted_tx_message = self.encrypt_for(encrypt_for)?;
        let network = get_network()?;

        let _id = Uuid::new_v4();
        let flavour = EncryptedDataTypeCommon::TransactionMessage;
        let created_at = chrono::Utc::now();

        let encrypted_data = EncryptedData::new(
            None,
            encrypt_for.to_string(),
            encrypted_tx_message.cipher_text.to_string(),
            encrypted_tx_message.nonce.to_string(),
            flavour,
            None,
            None,
            None,
            created_at,
            None,
            None,
            network,
            None,
            None,
            None,
            None,
            None,
        );

        Ok(encrypted_data)
    }

    /// Checks if the transaction has been stored before and checks if the transaction is found at the confirmed block height
    pub fn verify(&self) -> AvailResult<(Option<ConfirmedTransaction<N>>, DateTime<Local>)> {
        /*
        let node_api_obscura = match std::env::var("TESTNET_API_OBSCURA") {
            Ok(val) => val,
            Err(_e) => "".to_string(),
        };
         let base_url = format!("https://aleo-testnet3.obscura.build/v1/{}", node_api_obscura);
         let api_client = AleoAPIClient::<N>::new(&base_url, network_str)?;
        */

        let dev_node_ip = match std::env::var("DEV_NODE_IP") {
            Ok(val) => val,
            Err(_e) => "".to_string(),
        };

        let api_client = AleoAPIClient::<N>::local_testnet3("3030", &dev_node_ip);

        let block = api_client.get_block(self.confirmed_height)?;
        let timestamp = get_timestamp_from_i64(block.timestamp())?;

        let stored_transaction_ids = get_transaction_ids::<N>()?;
        if stored_transaction_ids.contains(&self.id) {
            return Ok((None, timestamp));
        }

        let tx_check = block.transactions().get(&self.id);

        match tx_check {
            Some(tx) => {
                return Ok((Some(tx.to_owned()), timestamp));
            }
            None => {
                return Ok((None, timestamp));
            }
        }
    }
}
