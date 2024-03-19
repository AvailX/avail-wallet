use snarkvm::prelude::{Testnet3, ToBytes};
use std::str::FromStr;

use crate::{
    models::storage::encryption::Keys,
    services::{
        account::key_management::android::keystore_load,
        local_storage::persistent_storage::get_network,
    },
};

use avail_common::{
    errors::{AvailError, AvailErrorType, AvailResult},
    models::network::SupportedNetworks,
};

#[tauri::command(rename_all = "snake_case")]
pub fn android_auth(password: Option<&str>, _key_type: &str) -> AvailResult<()> {
    let network = get_network()?;

    let result = match SupportedNetworks::from_str(&network)? {
        SupportedNetworks::Testnet3 => keystore_load::<Testnet3>(password, "avl-v")?,
    };

    let view_key_bytes = match result {
        Keys::ViewKey(key) => key.to_bytes_le()?,
        Keys::PrivateKey(_) => {
            return Err(AvailError::new(
                AvailErrorType::InvalidData,
                "Invalid Key Type".to_string(),
                "Invalid Key Type".to_string(),
            ))
        }
    };

    //TODO - Store view key session

    Ok(())
}
