use snarkvm::prelude::{Address, Network};

use chrono::{DateTime, Local};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::models::event::{
    AvailEvent, Event, Network as EventNetwork, SuccinctAvailEvent, Visibility,
};
use crate::services::local_storage::{
    encrypted_data::store_encrypted_data,
    persistent_storage::{get_address, get_address_string, get_network},
    session::view::VIEWSESSION,
};
use crate::services::record_handling::utils::get_fee_transition;

use avail_common::{
    errors::{AvailError, AvailErrorType, AvailResult},
    models::{
        encrypted_data::{
            EncryptedData, EncryptedDataRecord, EncryptedDataTypeCommon, EventTypeCommon,
            TransactionState,
        },
        traits::encryptable::{Encryptable, EncryptedStruct},
    },
};

/// Deployment pointers are used to keep track of leo program deployment history
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeploymentPointer<N: Network> {
    pub id: Option<N::TransactionID>,
    pub program_id: String,
    pub fee: f64,
    pub state: TransactionState,
    pub block_height: Option<u32>,
    pub spent_fee_nonce: Option<String>,
    pub created: DateTime<Local>,
    pub finalized: Option<DateTime<Local>>,
    pub error: Option<String>,
}

fn decrypt<N: Network>(encrypted_struct: EncryptedStruct<N>) -> AvailResult<DeploymentPointer<N>> {
    let view_key = VIEWSESSION.get_instance::<N>()?;
    let transition: DeploymentPointer<N> = encrypted_struct.decrypt(view_key)?;
    println!("Transition: {:?}", transition);
    Ok(transition)
}

impl<N: Network> DeploymentPointer<N> {
    pub fn decrypt_x(encrypted_struct: EncryptedStruct<N>) -> AvailResult<DeploymentPointer<N>> {
        let view_key = VIEWSESSION.get_instance::<N>()?;
        let transition: DeploymentPointer<N> = encrypted_struct.decrypt(view_key)?;

        Ok(transition)
    }

    pub fn new(
        id: Option<N::TransactionID>,
        program_id: String,
        fee: f64,
        state: TransactionState,
        block_height: Option<u32>,
        spent_fee_nonce: Option<String>,
        created: DateTime<Local>,
        finalized: Option<DateTime<Local>>,
        error: Option<String>,
    ) -> Self {
        Self {
            id,
            program_id,
            fee,
            state,
            block_height,
            spent_fee_nonce,
            created,
            finalized,
            error,
        }
    }

    pub fn encrypt_and_store(&self, address: Address<N>) -> AvailResult<String> {
        let encrypted_transaction = self.to_encrypted_data(address)?;
        let id = match encrypted_transaction.id {
            Some(id) => id.to_string(),
            None => Err(AvailError::new(
                AvailErrorType::Internal,
                "No id found".to_string(),
                "No Id Found".to_string(),
            ))?,
        };

        store_encrypted_data(encrypted_transaction)?;
        Ok(id)
    }

    pub fn update_confirmed_deployment(
        &mut self,
        transaction_id: N::TransactionID,
        block_height: u32,
        fee: Option<f64>,
    ) {
        self.id = Some(transaction_id);
        self.state = TransactionState::Confirmed;
        self.block_height = Some(block_height);
        self.finalized = Some(chrono::Local::now());
        self.fee = fee.unwrap_or(self.fee);
    }

    pub fn update_pending_deployment(&mut self) {
        self.state = TransactionState::Pending;
    }

    pub fn update_failed_deployment(&mut self, error: String) {
        self.state = TransactionState::Failed;
        self.error = Some(error);
    }

    pub fn update_rejected_deployment(
        &mut self,
        error: String,
        transaction_id: Option<N::TransactionID>,
        block_height: u32,
        fee: Option<f64>,
    ) {
        self.state = TransactionState::Rejected;
        self.error = Some(error);
        self.finalized = Some(chrono::Local::now());
        self.id = transaction_id;
        self.block_height = Some(block_height);
        self.fee = fee.unwrap_or(self.fee);
    }

    pub fn update_aborted_deployment(
        &mut self,
        error: String,
        transaction_id: N::TransactionID,
        block_height: u32,
    ) {
        self.state = TransactionState::Aborted;
        self.error = Some(error);
        self.finalized = Some(chrono::Local::now());
        self.id = Some(transaction_id);
        self.block_height = Some(block_height);
    }

    pub fn update_cancelled_deployment(&mut self) {
        self.state = TransactionState::Cancelled;
    }

    pub fn to_encrypted_data_from_record(
        encrypted_data_record: EncryptedDataRecord,
    ) -> AvailResult<EncryptedData> {
        let address = get_address::<N>()?;
        println!("Address: {:?}", address);
        let encrypted_struct = encrypted_data_record.to_enrypted_struct::<N>()?;
        println!("Encrypted Struct: {:?}", encrypted_struct);
        let record = decrypt::<N>(encrypted_struct)?;
        println!("Record: {:?}", record);
        let encrypted_data = record.to_encrypted_data(address)?;
        println!("Encrypted Data: {:?}", encrypted_data);
        Ok(encrypted_data)
    }

    pub fn to_encrypted_data(&self, encrypt_for: Address<N>) -> AvailResult<EncryptedData> {
        let encrypted_record_pointer = self.encrypt_for(encrypt_for)?;
        println!("INSIDE TO ENCRYPTED DATA: {:?}", encrypted_record_pointer);
        let network = get_network()?;
        let id = Uuid::new_v4();
        let flavour = EncryptedDataTypeCommon::Deployment;
        let created_at = chrono::Utc::now();

        let encrypted_data = EncryptedData::new(
            Some(id),
            encrypt_for.to_string(),
            encrypted_record_pointer.cipher_text.to_string(),
            encrypted_record_pointer.nonce.to_string(),
            flavour,
            None,
            Some(self.program_id.clone()),
            None,
            created_at,
            None,
            None,
            network,
            None,
            None,
            Some(EventTypeCommon::Deploy),
            None,
            Some(self.state.clone()),
        );
        println!("ENCRYPTED DATA: {:?}", encrypted_data);
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

        let tx_id = match &self.id {
            Some(id) => Some(id.to_string()),
            None => None,
        };

        let fee_transition = match &self.id {
            Some(id) => match get_fee_transition::<N>(*id) {
                Ok(fee_transition) => Some(fee_transition),
                Err(e) => return Err(e),
            },
            None => None,
        };

        let event = Event::new(
            id.to_string(),
            EventTypeCommon::Deploy,
            address,
            self.state.to_event_status(),
            self.created,
            None,
            None,
            self.finalized,
            event_network,
            tx_id,
            Some(self.program_id.clone()),
            None,
            vec![],
            vec![],
            fee_transition,
            self.block_height,
            None,
            Some(self.fee),
            Visibility::Public,
            self.error.clone(),
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

        let tx_id = match &self.id {
            Some(id) => Some(id.to_string()),
            None => None,
        };

        let fee_transition = match &self.id {
            Some(id) => match get_fee_transition::<N>(*id) {
                Ok(fee_transition) => Some(fee_transition),
                Err(e) => return Err(e),
            },
            None => None,
        };

        let event = AvailEvent::new(
            id.to_string(),
            EventTypeCommon::Deploy,
            address,
            self.state.clone(),
            self.created,
            None,
            None,
            self.finalized,
            event_network,
            tx_id,
            Some(self.program_id.clone()),
            None,
            vec![],
            vec![],
            fee_transition,
            self.block_height,
            None,
            Some(self.fee),
            Visibility::Public,
            self.error.clone(),
            None,
            None,
            None,
            None,
        );

        Ok(event)
    }

    pub fn to_succinct_avail_event(&self, id: &str) -> AvailResult<SuccinctAvailEvent> {
        let event = SuccinctAvailEvent::new(
            id.to_string(),
            None,
            None,
            None,
            Some(self.fee),
            None,
            EventTypeCommon::Deploy,
            self.state.clone(),
            self.created,
            Some(self.program_id.clone()),
            None,
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

        let transition: DeploymentPointer<N> = encrypted_data.decrypt(v_key)?;

        transition.to_event(&db_id)
    }

    pub fn decrypt_to_avail_event(encrypted_deployment: EncryptedData) -> AvailResult<AvailEvent> {
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

        deployment.to_avail_event(&db_id)
    }

    pub fn decrypt_to_succinct_avail_event(
        encrypted_deployment: EncryptedData,
    ) -> AvailResult<SuccinctAvailEvent> {
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

        deployment.to_succinct_avail_event(&db_id)
    }
}
