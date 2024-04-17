use std::path::PathBuf;

use avail_common::errors::{AvailError, AvailErrorType, AvailResult};
use tauri_plugin_aleo_stronghold::{
    get_store_record, remove_store_record, save_store_record, BytesDto, StrongholdCollection,
};

pub struct Store {
    path: String,
    client: BytesDto,
}

impl Store {
    pub fn new(path: String, client: BytesDto) -> Self {
        Self { path, client }
    }

    pub async fn get(
        self,
        key: String,
        hold: &StrongholdCollection,
    ) -> AvailResult<Option<Vec<u8>>> {
        let path = PathBuf::from(self.path);
        match get_store_record(hold, path, self.client, key).await {
            Ok(record) => Ok(record),
            Err(e) => Err(AvailError::new(
                AvailErrorType::Internal,
                e.to_string(),
                "Failed to get record".to_string(),
            )),
        }
    }

    pub async fn insert(
        self,
        key: String,
        value: Vec<u8>,
        hold: &StrongholdCollection,
    ) -> AvailResult<Option<Vec<u8>>> {
        let path = PathBuf::from(self.path);

        match save_store_record(hold, path, self.client, key, value, None).await {
            Ok(record) => Ok(record),
            Err(e) => Err(AvailError::new(
                AvailErrorType::Internal,
                e.to_string(),
                "Failed to save record".to_string(),
            )),
        }
    }

    pub async fn remove(
        self,
        key: String,
        hold: &StrongholdCollection,
    ) -> AvailResult<Option<Vec<u8>>> {
        let path = PathBuf::from(self.path);

        match remove_store_record(hold, path, self.client, key).await {
            Ok(record) => Ok(record),
            Err(e) => Err(AvailError::new(
                AvailErrorType::Internal,
                e.to_string(),
                "Failed to save record".to_string(),
            )),
        }
    }
}
