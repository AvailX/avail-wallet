use avail_common::models::encrypted_data::{EventStatus, EventTypeCommon, TransactionState};
use chrono::{DateTime, Local};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct Event {
    _id: String,
    #[serde(rename = "type")]
    event_type: EventTypeCommon,
    owner: String,
    status: EventStatus,
    created: DateTime<Local>,
    broadcast: Option<DateTime<Local>>, // finalized
    #[serde(rename = "broadcastHeight")]
    broadcast_height: Option<u32>, // finalized height
    settled: Option<DateTime<Local>>,   // i.e confirmed
    network: Network,
    #[serde(rename = "transactionId")]
    transaction_id: Option<String>,
    #[serde(rename = "programId")]
    program_id: Option<String>,
    #[serde(rename = "functionId")]
    function_id: Option<String>,
    inputs: Vec<String>,
    transitions: Vec<EventTransition>,
    fee_transition: Option<EventTransition>,
    height: Option<u32>,
    description: Option<String>,
    fee: Option<f64>,
    visibility: Visibility, // public or private
    error: Option<String>,
}

impl Event {
    pub fn new(
        _id: String,
        event_type: EventTypeCommon,
        owner: String,
        status: EventStatus,
        created: DateTime<Local>,
        broadcast: Option<DateTime<Local>>,
        broadcast_height: Option<u32>,
        settled: Option<DateTime<Local>>,
        network: Network,
        transaction_id: Option<String>,
        program_id: Option<String>,
        function_id: Option<String>,
        inputs: Vec<String>,
        transitions: Vec<EventTransition>,
        fee_transition: Option<EventTransition>,
        height: Option<u32>,
        description: Option<String>,
        fee: Option<f64>,
        visibility: Visibility,
        error: Option<String>,
    ) -> Self {
        Self {
            _id,
            event_type,
            owner,
            status,
            created,
            broadcast,
            broadcast_height,
            settled,
            network,
            transaction_id,
            program_id,
            function_id,
            inputs,
            transitions,
            fee_transition,
            height,
            description,
            fee,
            visibility,
            error,
        }
    }

    pub fn to_avail_event(&self) -> AvailEvent {
        AvailEvent::new(
            self._id.clone(),
            self.event_type.clone(),
            self.owner.clone(),
            self.status.clone().to_transaction_state(),
            self.created.clone(),
            self.broadcast.clone(),
            self.broadcast_height.clone(),
            self.settled.clone(),
            self.network.clone(),
            self.transaction_id.clone(),
            self.program_id.clone(),
            self.function_id.clone(),
            self.inputs.clone(),
            self.transitions.clone(),
            self.fee_transition.clone(),
            self.height.clone(),
            self.description.clone(),
            self.fee.clone(),
            self.visibility.clone(),
            self.error.clone(),
            None,
            None,
            None,
            None,
        )
    }

    pub fn get_created(&self) -> DateTime<Local> {
        self.created
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct EventTransition {
    #[serde(rename = "transitionId")]
    transition_id: String,
    #[serde(rename = "programId")]
    program_id: String,
    #[serde(rename = "functionId")]
    function_id: String,
    inputs: Vec<String>,
    outputs: Vec<String>,
}

impl EventTransition {
    pub fn new(
        transition_id: String,
        program_id: String,
        function_id: String,
        inputs: Vec<String>,
        outputs: Vec<String>,
    ) -> Self {
        Self {
            transition_id,
            program_id,
            function_id,
            inputs,
            outputs,
        }
    }

    pub fn program_id(&self) -> &String {
        &self.program_id
    }

    pub fn function_id(&self) -> &String {
        &self.function_id
    }

    pub fn inputs(&self) -> Vec<String> {
        self.inputs.clone()
    }
}

/// Internal avail event used to display transaction history in a list
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct SuccinctAvailEvent {
    id: String,
    to: Option<String>,
    from: Option<String>,
    amount: Option<f64>,
    fee: Option<f64>,
    message: Option<String>,
    #[serde(rename = "type")]
    event_type: EventTypeCommon,
    status: TransactionState,
    created: DateTime<Local>,
    #[serde(rename = "programId")]
    program_id: Option<String>,
    #[serde(rename = "functionId")]
    function_id: Option<String>,
}

impl SuccinctAvailEvent {
    pub fn new(
        id: String,
        to: Option<String>,
        from: Option<String>,
        amount: Option<f64>,
        fee: Option<f64>,
        message: Option<String>,
        event_type: EventTypeCommon,
        status: TransactionState,
        created: DateTime<Local>,
        program_id: Option<String>,
        function_id: Option<String>,
    ) -> Self {
        Self {
            id,
            to,
            from,
            amount,
            fee,
            message,
            event_type,
            status,
            created,
            program_id,
            function_id,
        }
    }

    pub fn get_created(&self) -> DateTime<Local> {
        self.created
    }
}

/// Internal avail event used to display a full event
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct AvailEvent {
    _id: String,
    #[serde(rename = "type")]
    event_type: EventTypeCommon,
    owner: String,
    status: TransactionState,
    created: DateTime<Local>,
    broadcast: Option<DateTime<Local>>, // finalized
    #[serde(rename = "broadcastHeight")]
    broadcast_height: Option<u32>, // finalized height
    settled: Option<DateTime<Local>>,   // i.e confirmed
    network: Network,
    #[serde(rename = "transactionId")]
    transaction_id: Option<String>,
    #[serde(rename = "programId")]
    program_id: Option<String>,
    #[serde(rename = "functionId")]
    function_id: Option<String>,
    inputs: Vec<String>,
    transitions: Vec<EventTransition>,
    fee_transition: Option<EventTransition>,
    height: Option<u32>,
    description: Option<String>,
    fee: Option<f64>,
    visibility: Visibility, // public or private
    error: Option<String>,
    message: Option<String>,
    to: Option<String>,
    from: Option<String>,
    amount: Option<f64>,
}

impl AvailEvent {
    pub fn new(
        _id: String,
        event_type: EventTypeCommon,
        owner: String,
        status: TransactionState,
        created: DateTime<Local>,
        broadcast: Option<DateTime<Local>>,
        broadcast_height: Option<u32>,
        settled: Option<DateTime<Local>>,
        network: Network,
        transaction_id: Option<String>,
        program_id: Option<String>,
        function_id: Option<String>,
        inputs: Vec<String>,
        transitions: Vec<EventTransition>,
        fee_transition: Option<EventTransition>,
        height: Option<u32>,
        description: Option<String>,
        fee: Option<f64>,
        visibility: Visibility,
        error: Option<String>,
        message: Option<String>,
        to: Option<String>,
        from: Option<String>,
        amount: Option<f64>,
    ) -> Self {
        Self {
            _id,
            event_type,
            owner,
            status,
            created,
            broadcast,
            broadcast_height,
            settled,
            network,
            transaction_id,
            program_id,
            function_id,
            inputs,
            transitions,
            fee_transition,
            height,
            description,
            fee,
            visibility,
            error,
            message,
            to,
            from,
            amount,
        }
    }

    pub fn get_created(&self) -> DateTime<Local> {
        self.created
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub enum Network {
    AleoTestnet,
    AleoDevnet,
    AleoMainnet,
}

impl Network {
    pub fn to_string(&self) -> String {
        match self {
            Network::AleoTestnet => "testnet3".to_string(),
            Network::AleoDevnet => "devnet".to_string(),
            Network::AleoMainnet => "mainnet".to_string(),
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "testnet3" => Some(Network::AleoTestnet),
            "devnet" => Some(Network::AleoDevnet),
            "mainnet" => Some(Network::AleoMainnet),
            _ => None,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub enum Visibility {
    Private,
    Public,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TxScanResponse {
    pub txs: bool,
    pub block_height: u32,
}

impl TxScanResponse {
    pub fn new(txs: bool, block_height: u32) -> Self {
        Self { txs, block_height }
    }
}
