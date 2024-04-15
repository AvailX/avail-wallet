pub mod client;
pub mod store;
pub mod vault;

use avail_common::errors::{AvailError, AvailErrorType, AvailResult};
use std::path::PathBuf;
use tauri_plugin_stronghold::{destroy, save, StrongholdCollection};

use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize, Deserialize)]
pub struct Stronghold {
    pub(crate) path: String,
}

impl Stronghold {
    pub fn new(path: &str) -> Self {
        Self {
            path: path.to_string(),
        }
    }

    pub async fn save(&self, collection: &StrongholdCollection) -> AvailResult<()> {
        let path = PathBuf::from(self.path.clone());
        match save(collection, path).await {
            Ok(x) => Ok(x),
            Err(e) => Err(AvailError::new(
                AvailErrorType::Internal,
                e.to_string(),
                "Failed to save stronghold".to_string(),
            )),
        }
    }

    pub async fn destroy(&self, collection: &StrongholdCollection) -> AvailResult<()> {
        let path = PathBuf::from(self.path.clone());
        match destroy(collection, path).await {
            Ok(x) => Ok(x),
            Err(e) => Err(AvailError::new(
                AvailErrorType::Internal,
                e.to_string(),
                "Failed to destroy stronghold".to_string(),
            )),
        }
    }
}
