use snarkvm::prelude::*;

use chrono::{DateTime, Local};
use serde::{Deserialize, Serialize};
use std::fmt::{Display, Formatter, Result as Res};
use uuid::Uuid;

use crate::models::event::{
    AvailEvent, Event, EventTransition, Network as EventNetwork, SuccinctAvailEvent, Visibility,
};

use crate::{
    api::aleo_client::setup_local_client,
    services::local_storage::{
        encrypted_data::store_encrypted_data,
        persistent_storage::{get_address, get_address_string, get_network},
        session::view::VIEWSESSION,
    },
    services::record_handling::{decrypt_transition::DecryptTransition, utils::get_fee_transition},
};

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

/// Pointer to a transaction that has been executed by the wallet owner
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(bound = "N: Network")]
pub struct TransactionPointer<N: Network> {
    to: Option<String>,
    transaction_id: Option<N::TransactionID>,
    state: TransactionState,
    block_height: Option<u32>,
    executed_program_id: Option<String>,
    executed_function_id: Option<String>,
    transitions: Vec<ExecutedTransition<N>>,
    created: DateTime<Local>,
    finalized: Option<DateTime<Local>>,
    message: Option<String>,
    event_type: EventTypeCommon,
    amount: Option<f64>,
    fee: Option<f64>,
    error: Option<String>,
}

fn decrypt<N: Network>(encrypted_struct: EncryptedStruct<N>) -> AvailResult<TransactionPointer<N>> {
    let view_key = VIEWSESSION.get_instance::<N>()?;
    let transition: TransactionPointer<N> = encrypted_struct.decrypt(view_key)?;

    Ok(transition)
}

impl<N: Network> TransactionPointer<N> {
    #[allow(dead_code)]
    pub fn new(
        to: Option<String>,
        transaction_id: Option<N::TransactionID>,
        state: TransactionState,
        block_height: Option<u32>,
        executed_program_id: Option<String>,
        executed_function_id: Option<String>,
        transitions: Vec<ExecutedTransition<N>>,
        created: DateTime<Local>,
        finalized: Option<DateTime<Local>>,
        message: Option<String>,
        event_type: EventTypeCommon,
        amount: Option<f64>,
        fee: Option<f64>,
        error: Option<String>,
    ) -> Self {
        Self {
            to,
            transaction_id,
            state,
            block_height,
            executed_program_id,
            executed_function_id,
            transitions,
            created,
            finalized,
            message,
            event_type,
            amount,
            fee,
            error,
        }
    }

    #[allow(dead_code)]
    pub fn to(&self) -> Option<String> {
        self.to.clone()
    }

    pub fn transaction_id(&self) -> Option<N::TransactionID> {
        self.transaction_id
    }

    #[allow(dead_code)]
    pub fn state(&self) -> TransactionState {
        self.state.clone()
    }

    #[allow(dead_code)]
    pub fn block_height(&self) -> Option<u32> {
        self.block_height
    }

    #[allow(dead_code)]
    pub fn executed_program_id(&self) -> Option<String> {
        self.executed_program_id.clone()
    }

    #[allow(dead_code)]
    pub fn executed_function_id(&self) -> Option<String> {
        self.executed_function_id.clone()
    }

    #[allow(dead_code)]
    pub fn transitions(&self) -> Vec<ExecutedTransition<N>> {
        self.transitions.clone()
    }

    pub fn created(&self) -> DateTime<Local> {
        self.created
    }

    pub fn finalized(&self) -> Option<DateTime<Local>> {
        self.finalized
    }

    pub fn message(&self) -> Option<String> {
        self.message.clone()
    }

    pub fn event_type(&self) -> EventTypeCommon {
        self.event_type.clone()
    }

    pub fn amount(&self) -> Option<f64> {
        self.amount
    }

    pub fn fee(&self) -> Option<f64> {
        self.fee
    }

    pub fn update_state(&mut self, state: TransactionState) {
        self.state = state;
    }

    pub fn error(&self) -> Option<String> {
        self.error.clone()
    }

    pub fn update_confirmed_transaction(
        &mut self,
        transaction_id: N::TransactionID,
        block_height: u32,
        transitions: Vec<ExecutedTransition<N>>,
        finalized: DateTime<Local>,
        state: TransactionState,
        fee: Option<f64>,
    ) {
        self.transaction_id = Some(transaction_id);
        self.block_height = Some(block_height);
        self.transitions = transitions;
        self.finalized = Some(finalized);
        self.state = state;
        self.fee = fee;
    }

    pub fn update_pending_transaction(&mut self) {
        self.state = TransactionState::Pending;
    }

    pub fn update_failed_transaction(&mut self, error: String) {
        self.state = TransactionState::Failed;
        self.error = Some(error);
        self.fee = None;
    }

    pub fn update_rejected_transaction(
        &mut self,
        error: String,
        transaction_id: Option<N::TransactionID>,
        block_height: u32,
        fee: Option<f64>,
    ) {
        self.state = TransactionState::Rejected;
        self.error = Some(error);
        self.finalized = Some(chrono::Local::now());
        self.transaction_id = transaction_id;
        self.block_height = Some(block_height);
        self.fee = fee;
    }

    pub fn update_aborted_transaction(
        &mut self,
        error: String,
        transaction_id: N::TransactionID,
        block_height: u32,
    ) {
        self.state = TransactionState::Aborted;
        self.error = Some(error);
        self.finalized = Some(chrono::Local::now());
        self.transaction_id = Some(transaction_id);
        self.block_height = Some(block_height);
        self.fee = None;
    }

    pub fn update_cancelled_transaction(&mut self) {
        self.state = TransactionState::Cancelled;
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
        let network = get_network()?;
        let encrypted_tx = self.encrypt_for(encrypt_for)?;

        let id = Uuid::new_v4();
        let flavour = EncryptedDataTypeCommon::Transaction;
        let created_at = chrono::Utc::now();

        let program_ids = self
            .transitions
            .iter()
            .map(|x| x.program_id.clone())
            .collect::<Vec<String>>();
        let function_ids = self
            .transitions
            .iter()
            .map(|x| x.function_id.clone())
            .collect::<Vec<String>>();
        let json_program_ids = serde_json::to_string(&program_ids)?;
        let json_function_ids = serde_json::to_string(&function_ids)?;

        let encrypted_data = EncryptedData::new(
            Some(id),
            encrypt_for.to_string(),
            encrypted_tx.cipher_text.to_string(),
            encrypted_tx.nonce.to_string(),
            flavour,
            None,
            Some(json_program_ids),
            Some(json_function_ids),
            created_at,
            None,
            None,
            network,
            None,
            None,
            Some(self.event_type.clone()),
            None,
            Some(self.state.clone()),
        );

        Ok(encrypted_data)
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

        let v_key = VIEWSESSION.get_instance::<N>()?;

        let api_client = setup_local_client::<N>();

        let event_transaction = match self.transaction_id {
            Some(id) => match api_client.get_transaction(id) {
                Ok(tx) => Some(tx),
                Err(_) => {
                    return Err(AvailError::new(
                        AvailErrorType::Node,
                        "Transaction not found".to_string(),
                        "Transaction not found".to_string(),
                    ))
                }
            },
            None => None,
        };

        let transitions = match event_transaction {
            Some(event_transaction) => match self
                .transitions
                .iter()
                .map(|x| x.to_event_transition(v_key, &event_transaction))
                .collect::<AvailResult<Vec<EventTransition>>>()
            {
                Ok(event_transitions) => event_transitions,
                Err(e) => return Err(e),
            },
            None => vec![],
        };

        let fee_transition = match self.transaction_id {
            Some(id) => match get_fee_transition::<N>(id) {
                Ok(fee_transition) => Some(fee_transition),
                Err(e) => return Err(e),
            },
            None => None,
        };

        let tx_id_str = match self.transaction_id {
            Some(id) => Some(id.to_string()),
            None => None,
        };

        let root_inputs = match &self.executed_function_id {
            Some(function_id) => {
                match &self.executed_program_id {
                    Some(program_id) => {
                        // check if program id and function id match an event_transition and fetch the inputs as root_inputs
                        match transitions.iter().find(|x| {
                            x.program_id() == program_id && x.function_id() == function_id
                        }) {
                            Some(event_transition) => event_transition.inputs().clone(),
                            None => vec![],
                        }
                    }
                    None => vec![],
                }
            }
            None => vec![],
        };

        let event = Event::new(
            id.to_string(),
            self.event_type.clone(),
            address,
            self.state.to_event_status(),
            self.created,
            None,
            None,
            self.finalized,
            event_network,
            tx_id_str,
            self.executed_program_id.clone(),
            self.executed_function_id.clone(),
            root_inputs,
            transitions,
            fee_transition,
            self.block_height,
            None,
            self.fee.clone(),
            // TODO - Deduce visibility from transaction
            Visibility::Private,
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

        let v_key = VIEWSESSION.get_instance::<N>()?;

        let api_client = setup_local_client::<N>();

        let event_transaction = match self.transaction_id {
            Some(id) => match api_client.get_transaction(id) {
                Ok(tx) => Some(tx),
                Err(_) => {
                    return Err(AvailError::new(
                        AvailErrorType::Node,
                        "Transaction not found".to_string(),
                        "Transaction not found".to_string(),
                    ))
                }
            },
            None => None,
        };

        let transitions = match event_transaction {
            Some(event_transaction) => match self
                .transitions
                .iter()
                .map(|x| x.to_event_transition(v_key, &event_transaction))
                .collect::<AvailResult<Vec<EventTransition>>>()
            {
                Ok(event_transitions) => event_transitions,
                Err(e) => return Err(e),
            },
            None => vec![],
        };

        let fee_transition = match self.transaction_id {
            Some(id) => match get_fee_transition::<N>(id) {
                Ok(fee_transition) => Some(fee_transition),
                Err(e) => return Err(e),
            },
            None => None,
        };

        let tx_id_str = match self.transaction_id {
            Some(id) => Some(id.to_string()),
            None => None,
        };

        let root_inputs = match &self.executed_function_id {
            Some(function_id) => {
                match &self.executed_program_id {
                    Some(program_id) => {
                        // check if program id and function id match an event_transition and fetch the inputs as root_inputs
                        match transitions.iter().find(|x| {
                            x.program_id() == program_id && x.function_id() == function_id
                        }) {
                            Some(event_transition) => event_transition.inputs().clone(),
                            None => vec![],
                        }
                    }
                    None => vec![],
                }
            }
            None => vec![],
        };

        let event = AvailEvent::new(
            id.to_string(),
            self.event_type.clone(),
            address,
            self.state.clone(),
            self.created,
            None,
            None,
            self.finalized,
            event_network,
            tx_id_str,
            self.executed_program_id.clone(),
            self.executed_function_id.clone(),
            root_inputs,
            transitions,
            fee_transition,
            self.block_height,
            None,
            self.fee.clone(),
            Visibility::Private,
            self.error.clone(),
            self.message.clone(),
            self.to.clone(),
            None,
            self.amount.clone(),
        );

        Ok(event)
    }

    pub fn to_succinct_avail_event(&self, id: &str) -> AvailResult<SuccinctAvailEvent> {
        let event = SuccinctAvailEvent::new(
            id.to_string(),
            self.to.clone(),
            None,
            self.amount.clone(),
            self.fee.clone(),
            self.message.clone(),
            self.event_type.clone(),
            self.state.clone(),
            self.created,
            self.executed_program_id.clone(),
            self.executed_function_id.clone(),
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

        let transition: TransactionPointer<N> = encrypted_data.decrypt(v_key)?;

        transition.to_event(&db_id)
    }

    pub fn decrypt_to_avail_event(encrypted_transaction: EncryptedData) -> AvailResult<AvailEvent> {
        let v_key = VIEWSESSION.get_instance::<N>()?;

        let db_id = match encrypted_transaction.id {
            Some(id) => id.to_string(),
            None => Err(AvailError::new(
                AvailErrorType::Internal,
                "No id found".to_string(),
                "No Id Found".to_string(),
            ))?,
        };

        let encrypted_data = encrypted_transaction.to_enrypted_struct::<N>()?;

        let transaction: TransactionPointer<N> = encrypted_data.decrypt(v_key)?;

        transaction.to_avail_event(&db_id)
    }

    pub fn decrypt_to_succinct_avail_event(
        encrypted_transaction: EncryptedData,
    ) -> AvailResult<SuccinctAvailEvent> {
        let v_key = VIEWSESSION.get_instance::<N>()?;

        let db_id = match encrypted_transaction.id {
            Some(id) => id.to_string(),
            None => Err(AvailError::new(
                AvailErrorType::Internal,
                "No id found".to_string(),
                "No Id Found".to_string(),
            ))?,
        };

        let encrypted_data = encrypted_transaction.to_enrypted_struct::<N>()?;

        let transaction: TransactionPointer<N> = encrypted_data.decrypt(v_key)?;

        transaction.to_succinct_avail_event(&db_id)
    }
}

/// A transition executed by the wallet owner in a transaction
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct ExecutedTransition<N: Network> {
    program_id: String,
    function_id: String,
    transition_id: N::TransitionID,
}

impl<N: Network> ExecutedTransition<N> {
    pub fn new(program_id: String, function_id: String, transition_id: N::TransitionID) -> Self {
        Self {
            program_id,
            function_id,
            transition_id,
        }
    }

    pub fn program_id(&self) -> String {
        self.program_id.clone()
    }

    pub fn function_id(&self) -> String {
        self.function_id.clone()
    }

    pub fn transition_id(&self) -> N::TransitionID {
        self.transition_id.clone()
    }

    pub fn to_event_transition(
        &self,
        view_key: ViewKey<N>,
        transaction: &transaction::Transaction<N>,
    ) -> AvailResult<EventTransition> {
        let transition = match transaction.find_transition(&self.transition_id) {
            Some(transition) => transition,
            None => {
                return Err(AvailError::new(
                    AvailErrorType::Internal,
                    "Transition not found".to_string(),
                    "Transition not found".to_string(),
                ))
            }
        };

        let (inputs, outputs) = DecryptTransition::decrypt_inputs_outputs(view_key, transition)?;

        let event_transition = EventTransition::new(
            self.transition_id.to_string(),
            self.program_id(),
            self.function_id(),
            inputs,
            outputs,
        );

        Ok(event_transition)
    }
}

#[derive(Debug, Clone)]
pub struct TransferResponse<N: Network> {
    pub(crate) transaction_id: N::TransactionID,
    pub(crate) block_height: u32,
    pub(crate) spent_input_commitment: String,
    pub(crate) spent_fee_commitment: String,
    pub(crate) pending_tx_id: String,
}

impl<N: Network> Display for TransferResponse<N> {
    fn fmt(&self, f: &mut Formatter<'_>) -> Res {
        write!(f, "tx_id: {} \n block_height: {} \n spent_input_commitment: {} \n spent_fee_commitment: {}", self.transaction_id,self.block_height,self.spent_input_commitment,self.spent_fee_commitment)
    }
}
