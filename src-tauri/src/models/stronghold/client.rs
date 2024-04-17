use tauri_plugin_aleo_stronghold::BytesDto;

use super::store::Store;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Clone)]
pub struct Client {
    pub path: String,
    pub name: BytesDto,
}

impl Client {
    pub fn new(path: &str, name: BytesDto) -> Self {
        Self {
            path: path.to_string(),
            name,
        }
    }

    pub fn get_store(self) -> Store {
        Store::new(self.path, self.name)
    }
}
