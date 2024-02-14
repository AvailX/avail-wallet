use std::str::FromStr;

use avail_common::models::constants::VIEW_KEY;
use bip39::Mnemonic;
use snarkvm::prelude::{
    Ciphertext, Field, Identifier, Network, PrivateKey, Signature, Testnet3, ToBytes, ViewKey,
};

use crate::api::encrypted_data::delete_all_server_storage;
use crate::api::user::delete_user;
use crate::models::storage::encryption::{Keys, Keys::PrivateKey as PKey, Keys::ViewKey as VKey};
use crate::services::local_storage::{
    encrypted_data::drop_encrypted_data_table,
    persistent_storage::{delete_user_preferences, get_backup_flag, get_language, get_network},
    session::view::VIEWSESSION,
};

use crate::services::account::key_management::key_controller::KeyController;

use avail_common::{
    aleo_tools::encryptor::Encryptor,
    converters::messages::{field_to_fields, utf8_string_to_bits},
    errors::{AvailError, AvailErrorType, AvailResult},
    models::{constants::PRIVATE_KEY, network::SupportedNetworks},
};

#[cfg(target_os = "macos")]
use crate::services::account::key_management::key_controller::macKeyController;

#[cfg(target_os = "windows")]
use crate::services::account::key_management::key_controller::windowsKeyController;

#[cfg(target_os = "linux")]
use crate::services::account::key_management::key_controller::linuxKeyController;

#[tauri::command(rename_all = "snake_case")]
pub fn get_private_key_tauri(password: Option<String>) -> AvailResult<String> {
    let network = get_network()?;

    match SupportedNetworks::from_str(&network)? {
        SupportedNetworks::Testnet3 => {
            let key = get_private_key::<Testnet3>(password)?;
            Ok(key.to_string())
        }
        _ => Err(AvailError::new(
            AvailErrorType::Internal,
            "Invalid network.".to_string(),
            "Invalid network.".to_string(),
        )),
    }
}

pub fn get_private_key<N: Network>(password: Option<String>) -> AvailResult<PrivateKey<N>> {
    #[cfg(target_os = "android")]
    let key_manager = AndroidKeyController {};

    #[cfg(target_os = "ios")]
    let key_manager = iOSKeyController {};

    #[cfg(target_os = "macos")]
    let key_manager = macKeyController {};

    #[cfg(target_os = "windows")]
    let key_manager = windowsKeyController {};

    #[cfg(target_os = "linux")]
    let key_manager = linuxKeyController {};

    let key = match password {
        Some(password) => key_manager.read_key(Some(&password), PRIVATE_KEY),
        None => key_manager.read_key(None, PRIVATE_KEY),
    }?;

    let private_key = match key {
        Keys::PrivateKey(p) => p,
        Keys::ViewKey(_) => {
            return Err(AvailError::new(
                AvailErrorType::Internal,
                "Invalid key type.".to_string(),
                "Invalid key type.".to_string(),
            ))
        }
    };

    Ok(private_key)
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_seed_phrase(password: Option<String>) -> AvailResult<String> {
    let network = get_network()?;
    let language = get_language()?.to_bip39_language();

    let key = match SupportedNetworks::from_str(&network)? {
        SupportedNetworks::Testnet3 => {
            let key = get_private_key::<Testnet3>(password)?;
            key
        }
        _ => {
            return Err(AvailError::new(
                AvailErrorType::Internal,
                "Invalid network.".to_string(),
                "Invalid network.".to_string(),
            ))
        }
    };

    let key_bytes = key.to_bytes_le()?;

    let mnemonic = Mnemonic::from_entropy(&key_bytes, language)?;

    Ok(mnemonic.to_string())
}

/// Get viewing key from keychain, also used as local authentication
#[tauri::command(rename_all = "snake_case")]
pub fn get_view_key_tauri(password: Option<String>) -> AvailResult<String> {
    let network = get_network()?;

    match SupportedNetworks::from_str(&network)? {
        SupportedNetworks::Testnet3 => {
            let key = get_view_key::<Testnet3>(password)?;
            VIEWSESSION.set_view_session(&key.to_string())?;

            Ok(key.to_string())
        }
        _ => Err(AvailError::new(
            AvailErrorType::Internal,
            "Invalid network".to_string(),
            "Invalid network.".to_string(),
        )),
    }
}

pub fn get_view_key<N: Network>(password: Option<String>) -> AvailResult<ViewKey<N>> {
    #[cfg(target_os = "android")]
    let key_manager = AndroidKeyController {};

    #[cfg(target_os = "ios")]
    let key_manager = iOSKeyController {};

    #[cfg(target_os = "macos")]
    let key_manager = macKeyController {};

    #[cfg(target_os = "windows")]
    let key_manager = windowsKeyController {};

    #[cfg(target_os = "linux")]
    let key_manager = linuxKeyController {};

    let key = match password {
        Some(password) => key_manager.read_key(Some(&password), VIEW_KEY),
        None => key_manager.read_key(None, VIEW_KEY),
    }?;

    let viewing_key = match key {
        Keys::ViewKey(v) => v,
        Keys::PrivateKey(_) => {
            return Err(AvailError::new(
                AvailErrorType::Internal,
                "Invalid key type.".to_string(),
                "Invalid key type.".to_string(),
            ))
        }
    };

    Ok(viewing_key)
}

pub fn encrypt_with_password<N: Network>(
    password: &str,
    key: Keys<N>,
) -> AvailResult<Ciphertext<N>> {
    match key {
        PKey(private_key) => Ok(Encryptor::encrypt_private_key_with_secret(
            &private_key,
            password,
        )?),
        VKey(view_key) => Ok(Encryptor::encrypt_view_key_with_secret(
            &view_key, password,
        )?),
    }
}

#[tauri::command(rename_all = "snake_case")]
pub async fn delete_util(password: &str) -> AvailResult<String> {
    let backup = get_backup_flag()?;

    #[cfg(target_os = "android")]
    let key_manager = AndroidKeyController {};

    #[cfg(target_os = "ios")]
    let key_manager = iOSKeyController {};

    #[cfg(target_os = "macos")]
    let key_manager = macKeyController {};

    #[cfg(target_os = "windows")]
    let key_manager = windowsKeyController {};

    #[cfg(target_os = "linux")]
    let key_manager = linuxKeyController {};

    let val: Identifier<Testnet3> = Identifier::<Testnet3>::from_str("test")?;

    key_manager.delete_key(Some(password), val)?;

    // delete encrypted data
    drop_encrypted_data_table()?;

    // delete user preferences
    delete_user_preferences()?;

    // if backup delete server side storage
    if backup {
        //delete_all_server_storage().await?;
    }

    // delete server user
    //delete_user().await?;

    Ok("Deleted.".to_string())
}

// Sign any string
pub fn sign_message<N: Network>(
    message: &str,
    password: Option<String>,
) -> AvailResult<(Signature<N>, Field<N>)> {
    let key = get_private_key::<N>(password)?;

    let v_key = ViewKey::<N>::try_from(key)?;
    VIEWSESSION.set_view_session(&v_key.to_string())?;

    let rng = &mut rand::thread_rng();

    let msg = utf8_string_to_bits(message);
    let msg_field = N::hash_bhp512(&msg)?;
    let msg = field_to_fields(&msg_field)?;

    let signature = key.sign(&msg, rng)?;

    Ok((signature, msg_field))
}

// Sign any string with provided private key
pub fn sign_message_w_key<N: Network>(
    message: &str,
    private_key: &PrivateKey<N>,
) -> AvailResult<(Signature<N>, Field<N>)> {
    let rng = &mut rand::thread_rng();

    let msg = utf8_string_to_bits(message);
    let msg_field = N::hash_bhp512(&msg)?;
    let msg = field_to_fields(&msg_field)?;

    let signature = private_key.sign(&msg, rng)?;

    Ok((signature, msg_field))
}

mod test_utils {
    use super::*;
    use avail_common::models::constants::STRONG_PASSWORD;

    #[tokio::test]
    async fn test_delete() {
        delete_util(STRONG_PASSWORD).await.unwrap();
    }
}
