use avail_common::models::traits::encryptable::EncryptedStruct;
use chrono::{DateTime, Local};
use serde::{Deserialize, Serialize};
use snarkvm::prelude::{Address, Network};
use uuid::Uuid;

use crate::api::aleo_client::setup_local_client;
use crate::api::aleo_client::setup_client;
use crate::models::event::{
    AvailEvent, Event, EventTransition, Network as EventNetwork, SuccinctAvailEvent, Visibility,
};
use crate::services::local_storage::{
    persistent_storage::{get_address, get_address_string, get_network},
    session::view::VIEWSESSION,
};
use crate::services::record_handling::decrypt_transition::DecryptTransition;

use avail_common::{
    errors::{AvailError, AvailErrorType, AvailResult},
    models::{
        encrypted_data::{
            EncryptedData, EncryptedDataRecord, EncryptedDataTypeCommon, EventStatus,
            EventTypeCommon, TransactionState,
        },
        traits::encryptable::Encryptable,
    },
};

// Pointer to a transition the wallet owner has received from or been a part of
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransitionPointer<N: Network> {
    pub id: N::TransitionID,
    pub transaction_id: N::TransactionID,
    pub program_id: String,
    pub function_id: String,
    pub timestamp: DateTime<Local>,
    pub transition_type: TransitionType,
    pub message: Option<String>,
    pub from: Option<String>,
    pub amount: Option<f64>,
    pub block_height: u32,
}

fn decrypt<N: Network>(encrypted_struct: EncryptedStruct<N>) -> AvailResult<TransitionPointer<N>> {
    let view_key = VIEWSESSION.get_instance::<N>()?;
    let transition: TransitionPointer<N> = encrypted_struct.decrypt(view_key)?;

    Ok(transition)
}

impl<N: Network> TransitionPointer<N> {
    pub fn new(
        id: N::TransitionID,
        transaction_id: N::TransactionID,
        program_id: String,
        function_id: String,
        timestamp: DateTime<Local>,
        transition_type: TransitionType,
        message: Option<String>,
        from: Option<String>,
        amount: Option<f64>,
        block_height: u32,
    ) -> Self {
        Self {
            id,
            transaction_id,
            program_id,
            function_id,
            timestamp,
            transition_type,
            message,
            from,
            amount,
            block_height,
        }
    }

    pub fn to_encrypted_data(&self, encrypt_for: Address<N>) -> AvailResult<EncryptedData> {
        let encrypted_record_pointer = self.encrypt_for(encrypt_for)?;

        let network = get_network()?;
        let id = Uuid::new_v4();
        let flavour = EncryptedDataTypeCommon::Transition;
        let created_at = chrono::Utc::now();

        let encrypted_data = EncryptedData::new(
            Some(id),
            encrypt_for.to_string(),
            encrypted_record_pointer.cipher_text.to_string(),
            encrypted_record_pointer.nonce.to_string(),
            flavour,
            None,
            Some(self.program_id.clone()),
            Some(self.function_id.clone()),
            created_at,
            None,
            None,
            network,
            None,
            None,
            Some(self.transition_type.to_event_type()),
            None,
            None,
        );

        Ok(encrypted_data)
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

    pub fn to_event(&self, id: &str) -> AvailResult<Event> {
        let address = get_address_string()?;
        let network = get_network()?;
        let event_network = match EventNetwork::from_str(&network) {
            Some(network) => network,
            None => {
                return Err(AvailError::new(
                    AvailErrorType::Internal,
                    "Network not found".to_string(),
                    "Network not found".to_string(),
                ))
            }
        };

        let api_client = setup_local_client::<N>();
        let transaction = api_client.get_transaction(self.transaction_id)?;

        let transition = match transaction.find_transition(&self.id) {
            Some(transition) => transition,
            None => {
                return Err(AvailError::new(
                    AvailErrorType::Internal,
                    "Transition not found".to_string(),
                    "Transition not found".to_string(),
                ))
            }
        };

        let view_key = VIEWSESSION.get_instance::<N>()?;

        let (inputs, outputs) = DecryptTransition::decrypt_inputs_outputs(view_key, transition)?;

        let event_transition = EventTransition::new(
            self.id.to_string(),
            self.program_id.clone(),
            self.function_id.clone(),
            inputs.clone(),
            outputs,
        );

        let event = Event::new(
            id.to_string(),
            self.transition_type.to_event_type(),
            address,
            EventStatus::Settled,
            self.timestamp,
            None,
            None,
            None,
            event_network,
            Some(self.transaction_id.to_string()),
            Some(self.program_id.clone()),
            Some(self.function_id.clone()),
            inputs,
            vec![event_transition],
            None,
            None,
            None,
            None,
            Visibility::Private,
            None,
        );

        Ok(event)
    }

    pub fn to_avail_event(&self, id: &str) -> AvailResult<AvailEvent> {
        let address = get_address_string()?;
        let network = get_network()?;
        let event_network = match EventNetwork::from_str(&network) {
            Some(network) => network,
            None => {
                return Err(AvailError::new(
                    AvailErrorType::Internal,
                    "Network not found".to_string(),
                    "Network not found".to_string(),
                ))
            }
        };

        let api_client = setup_local_client::<N>();

        let transaction = api_client.get_transaction(self.transaction_id)?;

        let transition = match transaction.find_transition(&self.id) {
            Some(transition) => transition,
            None => {
                return Err(AvailError::new(
                    AvailErrorType::Internal,
                    "Transition not found".to_string(),
                    "Transition not found".to_string(),
                ))
            }
        };

        let view_key = VIEWSESSION.get_instance::<N>()?;

        let (inputs, outputs) = DecryptTransition::decrypt_inputs_outputs(view_key, transition)?;

        let event_transition = EventTransition::new(
            self.id.to_string(),
            self.program_id.clone(),
            self.function_id.clone(),
            inputs.clone(),
            outputs,
        );

        //TODO - Fix Visibility
        let event = AvailEvent::new(
            id.to_string(),
            self.transition_type.to_event_type(),
            address,
            TransactionState::Confirmed,
            self.timestamp,
            None,
            None,
            None,
            event_network,
            Some(self.transaction_id.to_string()),
            Some(self.program_id.clone()),
            Some(self.function_id.clone()),
            inputs,
            vec![event_transition],
            None,
            None,
            None,
            None,
            Visibility::Private,
            None,
            self.message.clone(),
            None,
            self.from.clone(),
            self.amount.clone(),
        );

        Ok(event)
    }

    pub fn to_succinct_avail_event(&self, id: &str) -> AvailResult<SuccinctAvailEvent> {
        let event = SuccinctAvailEvent::new(
            id.to_string(),
            None,
            self.from.clone(),
            self.amount.clone(),
            None,
            self.message.clone(),
            self.transition_type.to_event_type(),
            TransactionState::Confirmed,
            self.timestamp,
            Some(self.program_id.clone()),
            Some(self.function_id.clone()),
        );

        Ok(event)
    }

    pub fn decrypt_to_event(encrypted_transition: EncryptedData) -> AvailResult<Event> {
        let v_key = VIEWSESSION.get_instance::<N>()?;

        let db_id = match encrypted_transition.id {
            Some(id) => id.to_string(),
            None => Err(AvailError::new(
                AvailErrorType::Internal,
                "No id found".to_string(),
                "No Id Found".to_string(),
            ))?,
        };

        let encrypted_data = encrypted_transition.to_enrypted_struct::<N>()?;

        let transition: TransitionPointer<N> = encrypted_data.decrypt(v_key)?;

        transition.to_event(&db_id)
    }

    pub fn decrypt_to_avail_event(encrypted_transition: EncryptedData) -> AvailResult<AvailEvent> {
        let v_key = VIEWSESSION.get_instance::<N>()?;

        let db_id = match encrypted_transition.id {
            Some(id) => id.to_string(),
            None => Err(AvailError::new(
                AvailErrorType::Internal,
                "No id found".to_string(),
                "No Id Found".to_string(),
            ))?,
        };

        let encrypted_data = encrypted_transition.to_enrypted_struct::<N>()?;

        let transition: TransitionPointer<N> = encrypted_data.decrypt(v_key)?;

        transition.to_avail_event(&db_id)
    }

    pub fn decrypt_to_succinct_avail_event(
        encrypted_transition: EncryptedData,
    ) -> AvailResult<SuccinctAvailEvent> {
        let v_key = VIEWSESSION.get_instance::<N>()?;

        let db_id = match encrypted_transition.id {
            Some(id) => id.to_string(),
            None => Err(AvailError::new(
                AvailErrorType::Internal,
                "No id found".to_string(),
                "No Id Found".to_string(),
            ))?,
        };

        let encrypted_data = encrypted_transition.to_enrypted_struct::<N>()?;

        let transition: TransitionPointer<N> = encrypted_data.decrypt(v_key)?;

        transition.to_succinct_avail_event(&db_id)
    }

    pub fn is_fee(&self) -> bool {
        match self.transition_type {
            TransitionType::Fee => true,
            _ => false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TransitionType {
    Input,
    Output,
    Event,
    Fee,
}

impl TransitionType {
    pub fn to_event_type(&self) -> EventTypeCommon {
        match self {
            TransitionType::Input => EventTypeCommon::Send,
            TransitionType::Output => EventTypeCommon::Receive,
            _ => EventTypeCommon::Execute, // fees
        }
    }
}
