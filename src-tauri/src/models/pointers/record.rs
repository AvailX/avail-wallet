use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use snarkvm::prelude::{Address, Field, FromStr, Network, Plaintext, Record};
use uuid::Uuid;

use avail_common::{
    errors::{AvailError, AvailErrorType, AvailResult},
    models::{
        encrypted_data::{
            EncryptedData, EncryptedDataRecord, EncryptedDataTypeCommon, RecordTypeCommon,
        },
        traits::encryptable::{Encryptable, EncryptedStruct},
    },
};

use crate::api::aleo_client::setup_client;
use crate::api::aleo_client::setup_local_client;

use crate::services::{
    local_storage::{
        persistent_storage::{get_address, get_network},
        session::view::VIEWSESSION,
    },
    record_handling::utils::transition_to_record,
};

/// The record struct represents a pointer to a single record on the Aleo blockchain owned by the wallet account.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(bound = "N: Network")]
pub struct AvailRecord<N: Network> {
    pub pointer: Pointer<N>,
    pub metadata: Metadata,
}

fn decrypt<N: Network>(encrypted_struct: EncryptedStruct<N>) -> AvailResult<AvailRecord<N>> {
    let view_key = VIEWSESSION.get_instance::<N>()?;
    let record: AvailRecord<N> = encrypted_struct.decrypt(view_key)?;
    Ok(record)
}

impl<N: Network> AvailRecord<N> {
    pub fn new(pointer: Pointer<N>, metadata: Metadata) -> Self {
        Self { pointer, metadata }
    }

    pub fn to_encrypted_data_from_record(
        encrypted_data_record: EncryptedDataRecord,
    ) -> AvailResult<EncryptedData> {
        let address = get_address::<N>()?;
        let encrypted_struct = encrypted_data_record.to_enrypted_struct::<N>()?;
        let record = decrypt::<N>(encrypted_struct)?;
        let encrypted_data = record.to_encrypted_data(address)?;
        Ok(encrypted_data)
    }

    pub fn to_encrypted_data(&self, encrypt_for: Address<N>) -> AvailResult<EncryptedData> {
        let encrypted_record_pointer = self.encrypt_for(encrypt_for)?;
        let network = get_network()?;

        let id = Uuid::new_v4();
        let flavour = EncryptedDataTypeCommon::Record;
        let created_at = chrono::Utc::now();

        let encrypted_data = EncryptedData::new(
            Some(id),
            encrypt_for.to_string(),
            encrypted_record_pointer.cipher_text.to_string(),
            encrypted_record_pointer.nonce.to_string(),
            flavour,
            Some(self.metadata.record_type.clone()),
            Some(self.metadata.program_id.clone()),
            Some(self.metadata.function_id.clone()),
            created_at,
            None,
            None,
            network,
            Some(self.metadata.name.clone()),
            Some(self.metadata.spent),
            None,
            Some(self.metadata.nonce.clone()),
            None,
        );

        Ok(encrypted_data)
    }

    pub fn from_record(
        commitment: Field<N>,
        record: &Record<N, Plaintext<N>>,
        sk_tag: Field<N>,
        record_type: RecordTypeCommon,
        program_id: &str,
        block_height: u32,
        transaction_id: N::TransactionID,
        transition_id: N::TransitionID,
        function_id: &str,
        name: String,
        index: u8,
        owner: &str,
    ) -> AvailResult<Self> {
        let tag =
            match Record::<N, Plaintext<N>>::tag(sk_tag, commitment) {
                Ok(tag) => tag,
                Err(e) => return Err(AvailError::new(
                    AvailErrorType::InvalidData,
                    "Error computing the record tag from sk_tag and commitment using record::tag()"
                        .to_string()
                        + &e.to_string(),
                    "Error forming record pointer, scan will restart at this height.".to_string(),
                )),
            };

        let pointer = Pointer::new(
            block_height,
            transaction_id,
            transition_id,
            &commitment.to_string(),
            &tag.to_string(),
            index,
            owner,
        );

        //TODO: V2-update to RecordTypeCommon::Tokens and have a token identification system (in progress)
        let metadata = Metadata::new(
            record_type,
            program_id.to_string(),
            function_id.to_string(),
            false,
            name,
            record.nonce().to_string(),
        );

        Ok(Self::new(pointer, metadata))
    }

    pub fn to_record(&self) -> AvailResult<Record<N, Plaintext<N>>> {
        let api_client = setup_local_client::<N>();

        let record_transaction = api_client.get_transaction(self.pointer.transaction_id)?;

        let transition = match record_transaction.find_transition(&self.pointer.transition_id) {
            Some(transition) => transition,
            None => {
                return Err(AvailError::new(
                    AvailErrorType::NotFound,
                    "Transition not found".to_string(),
                    "Transition not found".to_string(),
                ))
            }
        };

        let (record_plaintext, _record_ciphertext, _data) =
            transition_to_record(transition, &self.pointer.commitment, self.pointer.index)?;

        Ok(record_plaintext)
    }

    pub fn to_record_texts_and_data(
        &self,
    ) -> AvailResult<(String, String, HashMap<String, String>)> {
        let api_client = setup_local_client::<N>();

        let record_transaction = api_client.get_transaction(self.pointer.transaction_id)?;

        let transition = match record_transaction.find_transition(&self.pointer.transition_id) {
            Some(transition) => transition,
            None => {
                return Err(AvailError::new(
                    AvailErrorType::NotFound,
                    "Transition not found".to_string(),
                    "Transition not found".to_string(),
                ))
            }
        };

        let (record_plaintext, record_ciphertext, data) =
            transition_to_record(transition, &self.pointer.commitment, self.pointer.index)?;
        Ok((
            record_plaintext.to_string(),
            record_ciphertext.to_string(),
            data,
        ))
    }

    pub fn is_spent(&self) -> AvailResult<bool> {
        Ok(self.metadata.spent)
    }

    pub fn tag(&self) -> AvailResult<Field<N>> {
        Ok(Field::<N>::from_str(&self.pointer.tag)?)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Pointer<N: Network> {
    pub block_height: u32,
    pub transaction_id: N::TransactionID,
    pub transition_id: N::TransitionID,
    pub commitment: String,
    pub tag: String,
    pub index: u8,
    pub owner: String,
}

impl<N: Network> Pointer<N> {
    pub fn new(
        block_height: u32,
        transaction_id: N::TransactionID,
        transition_id: N::TransitionID,
        commitment: &str,
        tag: &str,
        index: u8,
        owner: &str,
    ) -> Self {
        Self {
            block_height,
            transaction_id,
            transition_id,
            commitment: commitment.to_string(),
            tag: tag.to_string(),
            index,
            owner: owner.to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Metadata {
    pub record_type: RecordTypeCommon,
    pub program_id: String,
    pub function_id: String,
    pub spent: bool,
    pub name: String,
    pub nonce: String,
}

impl Metadata {
    pub fn new(
        record_type: RecordTypeCommon,
        program_id: String,
        function_id: String,
        spent: bool,
        name: String,
        nonce: String,
    ) -> Self {
        Self {
            record_type,
            program_id,
            function_id,
            spent,
            name,
            nonce,
        }
    }
}
