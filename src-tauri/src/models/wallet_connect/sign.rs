use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SignatureRequest {
    message: String,
    address: Option<String>,
}

impl SignatureRequest {
    pub fn new(message: String, address: Option<String>) -> Self {
        Self { message, address }
    }

    pub fn get_message(&self) -> String {
        self.message.clone()
    }

    pub fn get_address(&self) -> Option<String> {
        self.address.clone()
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SignatureResponse {
    signature: Option<String>,
    #[serde(rename = "messageFields")]
    message_fields: Option<String>,
    error: Option<String>,
}

impl SignatureResponse {
    pub fn new(
        signature: Option<String>,
        message_fields: Option<String>,
        error: Option<String>,
    ) -> Self {
        Self {
            signature,
            message_fields,
            error,
        }
    }

    pub fn get_signature(&self) -> Option<String> {
        self.signature.clone()
    }

    pub fn get_message_fields(&self) -> Option<String> {
        self.message_fields.clone()
    }

    pub fn get_error(&self) -> Option<String> {
        self.error.clone()
    }
}
