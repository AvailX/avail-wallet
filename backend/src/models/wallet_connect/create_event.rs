use avail_common::models::encrypted_data::EventTypeCommon;
use serde::{Deserialize, Serialize};
/* Create Event Interfaces */

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateEventRequest {
    address: Option<String>,
    #[serde(rename = "type")]
    event_type: EventTypeCommon,
    #[serde(rename = "programId")]
    program_id: String,
    #[serde(rename = "functionId")]
    function_id: String,
    fee: f64,
    inputs: Vec<String>,
}

impl CreateEventRequest {
    pub fn new(
        address: Option<String>,
        event_type: EventTypeCommon,
        program_id: String,
        function_id: String,
        fee: f64,
        inputs: Vec<String>,
    ) -> Self {
        Self {
            address,
            event_type,
            program_id,
            function_id,
            fee,
            inputs,
        }
    }

    pub fn address(&self) -> Option<&String> {
        self.address.as_ref()
    }

    pub fn event_type(&self) -> &EventTypeCommon {
        &self.event_type
    }

    pub fn program_id(&self) -> &String {
        &self.program_id
    }

    pub fn function_id(&self) -> &String {
        &self.function_id
    }

    pub fn fee(&self) -> f64 {
        self.fee
    }

    pub fn inputs(&self) -> &Vec<String> {
        &self.inputs
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateEventResponse {
    event_id: Option<String>,
    error: Option<String>,
}

impl CreateEventResponse {
    pub fn new(event_id: Option<String>, error: Option<String>) -> Self {
        Self { event_id, error }
    }

    pub fn event_id(&self) -> Option<&String> {
        self.event_id.as_ref()
    }

    pub fn error(&self) -> Option<&String> {
        self.error.as_ref()
    }
}
