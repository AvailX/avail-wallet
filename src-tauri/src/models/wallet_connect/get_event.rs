use crate::models::event::{AvailEvent, Event};
use avail_common::models::encrypted_data::EventTypeCommon;
use serde::{Deserialize, Serialize};

/* Get Event Interfaces */
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GetEventRequest {
    pub id: String,
    pub address: Option<String>,
}

impl GetEventRequest {
    pub fn new(id: String, address: Option<String>) -> Self {
        Self { id, address }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GetEventResponse {
    pub event: Option<Event>,
    pub error: Option<String>,
}

impl GetEventResponse {
    pub fn new(event: Option<Event>, error: Option<String>) -> Self {
        Self { event, error }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GetAvailEventResponse {
    pub event: Option<AvailEvent>,
    pub error: Option<String>,
}

impl GetAvailEventResponse {
    pub fn new(event: Option<AvailEvent>, error: Option<String>) -> Self {
        Self { event, error }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GetEventsRequest {
    pub filter: Option<EventsFilter>,
    pub page: Option<u16>,
}

impl GetEventsRequest {
    pub fn default() -> Self {
        Self {
            filter: Some(EventsFilter::default()),
            page: Some(0),
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct EventsFilter {
    #[serde(rename = "type")]
    pub event_type: Option<EventTypeCommon>,
    #[serde(rename = "programId")]
    pub program_id: Option<String>,
    #[serde(rename = "functionId")]
    pub function_id: Option<String>,
}

impl EventsFilter {
    pub fn new(
        event_type: Option<EventTypeCommon>,
        program_id: Option<String>,
        function_id: Option<String>,
    ) -> Self {
        Self {
            event_type,
            program_id,
            function_id,
        }
    }

    pub fn default() -> Self {
        Self {
            event_type: None,
            program_id: None,
            function_id: None,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GetEventsResponse {
    pub events: Vec<Event>,
    #[serde(rename = "pageCount")]
    pub page_count: Option<u16>,
    pub error: Option<String>,
}

impl GetEventsResponse {
    pub fn new(events: Vec<Event>, page_count: Option<u16>, error: Option<String>) -> Self {
        Self {
            events,
            page_count,
            error,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GetAvailEventsResponse {
    pub events: Vec<AvailEvent>,
    #[serde(rename = "pageCount")]
    pub page_count: Option<u16>,
    pub error: Option<String>,
}

impl GetAvailEventsResponse {
    pub fn new(events: Vec<AvailEvent>, page_count: Option<u16>, error: Option<String>) -> Self {
        Self {
            events,
            page_count,
            error,
        }
    }
}
