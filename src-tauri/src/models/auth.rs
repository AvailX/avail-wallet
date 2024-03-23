#![allow(dead_code)]
use chrono::{DateTime, Utc};
use serde::{ser::SerializeStruct, Deserialize, Serialize, Serializer};

use avail_common::models::server_auth::{CreateSessionResponse, VerifySessionRequest};
use uuid::Uuid;

#[allow(non_snake_case)]
pub struct Options {
    pub service: String,
    pub title: String,
    pub subtitle: String,
    pub description: String,
    pub cancel: String,
    pub accessible: String,
    pub accessControl: Option<String>,
    pub storage: Option<String>,
    pub securityLevel: String,
    pub authenticationType: Option<String>,
}
#[allow(non_snake_case)]
impl Options {
    pub fn new(
        service: String,
        title: String,
        subtitle: String,
        description: String,
        cancel: String,
        accessible: String,
        accessControl: Option<String>,
        storage: Option<String>,
        securityLevel: String,
        authenticationType: Option<String>,
    ) -> Options {
        Options {
            service,
            title,
            subtitle,
            description,
            cancel,
            accessible,
            accessControl,
            storage,
            securityLevel,
            authenticationType,
        }
    }

    pub fn default() -> Options {
        Options {
            service: String::from("com.avail"),
            title: String::from("Authentication"),
            subtitle: String::from("Login to your wallet"),
            cancel: String::from("Cancel"),
            description: String::from(""),
            accessible: String::from("AccessibleWhenUnlockedThisDeviceOnly"),
            accessControl: None,
            storage: None,
            securityLevel: String::from("ANY"),
            authenticationType: None,
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct VerifySessionResponse {
    pub signature: String,
    pub session_id: String,
}

impl VerifySessionResponse {
    pub fn to_request(&self) -> VerifySessionRequest {
        VerifySessionRequest {
            signature: self.signature.to_string(),
            session_id: Uuid::parse_str(&self.session_id).unwrap(),
        }
    }
}

impl From<VerifySessionRequest> for VerifySessionResponse {
    fn from(request: VerifySessionRequest) -> Self {
        VerifySessionResponse {
            signature: request.signature,
            session_id: request.session_id.to_string(),
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct CreateSessionRequest {
    pub hash: String,
    pub session_id: String,
    pub expires_on: DateTime<Utc>,
}

impl CreateSessionRequest {
    pub fn to_response(&self) -> CreateSessionResponse {
        CreateSessionResponse {
            hash: self.hash.to_string(),
            session_id: Uuid::parse_str(&self.session_id).unwrap(),
            expires_on: self.expires_on,
        }
    }
}

impl From<CreateSessionResponse> for CreateSessionRequest {
    fn from(response: CreateSessionResponse) -> Self {
        CreateSessionRequest {
            hash: response.hash,
            session_id: response.session_id.to_string(),
            expires_on: response.expires_on,
        }
    }
}
