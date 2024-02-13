use crate::models::pointers::record::AvailRecord;
use avail_common::errors::AvailResult;
use serde::{Deserialize, Serialize};
use snarkvm::console::program::Network;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GetRecordsRequest {
    address: Option<String>,
    filter: Option<RecordsFilter>,
    page: Option<i32>,
}

impl GetRecordsRequest {
    pub fn new(address: Option<String>, filter: Option<RecordsFilter>, page: Option<i32>) -> Self {
        Self {
            address,
            filter,
            page,
        }
    }
    pub fn address(&self) -> &Option<String> {
        &self.address
    }

    pub fn filter(&self) -> &Option<RecordsFilter> {
        &self.filter
    }

    pub fn page(&self) -> &Option<i32> {
        &self.page
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct RecordsFilter {
    #[serde(rename = "programIds")]
    program_ids: Vec<String>,
    #[serde(rename = "functionId")]
    function_id: Option<String>,
    #[serde(rename = "type")]
    record_type: String,
    record_name: Option<String>,
}

impl RecordsFilter {
    pub fn new(
        program_ids: Vec<String>,
        function_id: Option<String>,
        record_type: RecordFilterType,
        record_name: Option<String>,
    ) -> Self {
        Self {
            program_ids,
            function_id,
            record_type: record_type.to_string(),
            record_name,
        }
    }

    pub fn program_ids(&self) -> &Vec<String> {
        &self.program_ids
    }

    pub fn function_id(&self) -> &Option<String> {
        &self.function_id
    }

    pub fn record_type(&self) -> &String {
        &self.record_type
    }

    pub fn record_name(&self) -> &Option<String> {
        &self.record_name
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum RecordFilterType {
    All,
    Spent,
    Unspent,
}

impl RecordFilterType {
    pub fn from_str(filter: &str) -> Self {
        match filter {
            "all" => RecordFilterType::All,
            "spent" => RecordFilterType::Spent,
            "unspent" => RecordFilterType::Unspent,
            _ => RecordFilterType::All,
        }
    }

    pub fn to_string(&self) -> String {
        match self {
            RecordFilterType::All => "all".to_string(),
            RecordFilterType::Spent => "spent".to_string(),
            RecordFilterType::Unspent => "unspent".to_string(),
        }
    }

    pub fn from_string(filter: &String) -> &Self {
        match filter.as_str() {
            "all" => &RecordFilterType::All,
            "spent" => &RecordFilterType::Spent,
            "unspent" => &RecordFilterType::Unspent,
            _ => &RecordFilterType::All,
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GetRecordsResponse {
    records: Vec<RecordWithPlaintext>,
    #[serde(rename = "pageCount")]
    page_count: Option<i32>,
    error: Option<String>,
}

impl GetRecordsResponse {
    pub fn new(
        records: Vec<RecordWithPlaintext>,
        page_count: Option<i32>,
        error: Option<String>,
    ) -> Self {
        Self {
            records,
            page_count,
            error,
        }
    }

    pub fn records(&self) -> &Vec<RecordWithPlaintext> {
        &self.records
    }

    pub fn page_count(&self) -> &Option<i32> {
        &self.page_count
    }

    pub fn error(&self) -> &Option<String> {
        &self.error
    }
}

// A new struct for RecordWithPlaintext
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct RecordWithPlaintext {
    pub record: wc_Record,
    pub plaintext: String,
    pub data: std::collections::HashMap<String, String>,
}

impl RecordWithPlaintext {
    pub fn from_record_pointer<N: Network>(
        record_pointer: AvailRecord<N>,
        id: String,
    ) -> AvailResult<Self> {
        let (plaintext, ciphertext, data) = record_pointer.to_record_texts_and_data()?;

        let record = wc_Record {
            _id: id,
            event_id: record_pointer.pointer.transaction_id.to_string(),
            height: record_pointer.pointer.block_height,
            ciphertext,
            program_id: record_pointer.metadata.program_id,
            function_id: record_pointer.metadata.function_id,
            transition_id: record_pointer.pointer.transition_id.to_string(),
            transaction_id: record_pointer.pointer.transaction_id.to_string(),
            owner: record_pointer.pointer.owner,
            spent: record_pointer.metadata.spent,
            serial_number: None,
            name: record_pointer.metadata.name,
        };
        Ok(Self {
            record,
            plaintext,
            data,
        })
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct wc_Record {
    pub _id: String, // transaction id or commitment
    #[serde(rename = "eventId")]
    pub event_id: String, // transaction id
    pub height: u32,
    pub ciphertext: String,
    #[serde(rename = "programId")]
    pub program_id: String,
    #[serde(rename = "functionId")]
    pub function_id: String,
    #[serde(rename = "transitionId")]
    pub transition_id: String,
    #[serde(rename = "transactionId")]
    pub transaction_id: String,
    pub owner: String,
    pub spent: bool,
    #[serde(rename = "serialNumber")]
    pub serial_number: Option<String>, // Fetch in .to_record()
    pub name: String,
}
