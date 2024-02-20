use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DecryptRequest {
    pub ciphertexts: Vec<String>,
}

impl DecryptRequest {
    pub fn new(ciphertexts: Vec<String>) -> Self {
        Self { ciphertexts }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DecryptResponse {
    plaintexts: Vec<String>,
    error: Option<String>,
}

impl DecryptResponse {
    pub fn new(plaintexts: Vec<String>, error: Option<String>) -> Self {
        Self { plaintexts, error }
    }
}
