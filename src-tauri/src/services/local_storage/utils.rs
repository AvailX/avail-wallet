use std::str::FromStr;

use crate::api::encrypted_data::delete_all_server_storage;
use crate::api::user::delete_user;
use crate::models::storage::encryption::{Keys, Keys::PrivateKey as PKey, Keys::ViewKey as VKey};
use crate::models::storage::languages::Languages;
use crate::models::wallet::BetterAvailWallet;
use crate::services::local_storage::{
    encrypted_data::drop_encrypted_data_table,
    persistent_storage::{delete_user_preferences, get_backup_flag, get_language, get_network},
    session::view::VIEWSESSION,
    tokens::drop_tokens_table,
};
use avail_common::models::constants::VIEW_KEY;
use snarkvm::prelude::{
    Ciphertext, Field, Identifier, Network, PrivateKey, Signature, Testnet3, ViewKey,
};

use crate::services::account::key_management::key_controller::{
    linuxKeyController, macKeyController, windowsKeyController, KeyController,
};

use avail_common::{
    aleo_tools::encryptor::Encryptor,
    converters::messages::{field_to_fields, utf8_string_to_bits},
    errors::{AvailError, AvailErrorType, AvailResult},
    models::{constants::PRIVATE_KEY, network::SupportedNetworks},
};

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
    let key_manager = {
        #[cfg(target_os = "macos")]
        {
            macKeyController
        }
        #[cfg(target_os = "windows")]
        {
            windowsKeyController
        }
        #[cfg(target_os = "linux")]
        {
            linuxKeyController
        }
    };

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

    match SupportedNetworks::from_str(&network)? {
        SupportedNetworks::Testnet3 => {
            let key_manager = {
                #[cfg(target_os = "macos")]
                {
                    macKeyController
                }
                #[cfg(target_os = "windows")]
                {
                    windowsKeyController
                }
                #[cfg(target_os = "linux")]
                {
                    linuxKeyController
                }
            };

            let val: Identifier<Testnet3> = Identifier::<Testnet3>::from_str("test")?;

            let seed_phrase = match password {
                Some(password) => key_manager.read_phrase(&password, val),
                None => {
                    return Err(AvailError::new(
                        AvailErrorType::Internal,
                        "Password is required.".to_string(),
                        "Password is required.".to_string(),
                    ))
                }
            }?;

            Ok(seed_phrase)
        }
    }
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
    }
}

pub fn get_view_key<N: Network>(password: Option<String>) -> AvailResult<ViewKey<N>> {
    let key_manager = {
        #[cfg(target_os = "macos")]
        {
            macKeyController
        }
        #[cfg(target_os = "windows")]
        {
            windowsKeyController
        }
        #[cfg(target_os = "linux")]
        {
            linuxKeyController
        }
    };

    let key = match password {
        Some(password) => key_manager.read_key(Some(&password), VIEW_KEY),
        None => key_manager.read_key(None, VIEW_KEY),
    }?;

    let viewing_key = match key {
        Keys::ViewKey(v) => v,
        _ => {
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
    key: &Keys<N>,
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

pub fn encrypt_private_key_with_password<N: Network>(
    password: &str,
    private_key: &PrivateKey<N>,
) -> AvailResult<Ciphertext<N>> {
    Ok(Encryptor::encrypt_private_key_with_secret(
        private_key,
        password,
    )?)
}

pub fn encrypt_view_key_with_password<N: Network>(
    password: &str,
    view_key: &ViewKey<N>,
) -> AvailResult<Ciphertext<N>> {
    Ok(Encryptor::encrypt_view_key_with_secret(view_key, password)?)
}

#[tauri::command(rename_all = "snake_case")]
pub async fn delete_util(password: &str) -> AvailResult<String> {
    let backup = get_backup_flag()?;

    let key_manager = {
        #[cfg(target_os = "macos")]
        {
            macKeyController
        }
        #[cfg(target_os = "windows")]
        {
            windowsKeyController
        }
        #[cfg(target_os = "linux")]
        {
            linuxKeyController
        }
    };

    let val: Identifier<Testnet3> = Identifier::<Testnet3>::from_str("test")?;

    match key_manager.delete_key(Some(password), val) {
        Ok(_) => {}
        Err(e) => {}
    };

    // delete encrypted data
    drop_encrypted_data_table()?;

    // delete user preferences
    delete_user_preferences()?;

    // delete tokens
    drop_tokens_table()?;

    // if backup delete server side storage
    if backup {
        delete_all_server_storage().await?;
    }

    // delete server user
    delete_user().await?;

    Ok("Deleted.".to_string())
}

#[tauri::command(rename_all = "snake_case")]
pub fn delete_local_for_recovery(password: &str) -> AvailResult<()> {
    let key_manager = {
        #[cfg(target_os = "macos")]
        {
            macKeyController
        }
        #[cfg(target_os = "windows")]
        {
            windowsKeyController
        }
        #[cfg(target_os = "linux")]
        {
            linuxKeyController
        }
    };

    let val: Identifier<Testnet3> = Identifier::<Testnet3>::from_str("test")?;

    match key_manager.delete_key(Some(password), val) {
        Ok(_) => {}
        Err(e) => {}
    };

    // delete encrypted data
    drop_encrypted_data_table()?;

    // delete user preferences
    delete_user_preferences()?;

    // delete tokens
    drop_tokens_table()?;

    Ok(())
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
    use snarkvm::utilities::ToBytes;

    #[tokio::test]
    async fn test_delete() {
        delete_util(STRONG_PASSWORD).await.unwrap();
    }

    #[test]
    fn test_several_pk_bytes() {
        let pk1 = PrivateKey::<Testnet3>::new(&mut rand::thread_rng()).unwrap();

        let pk2 = PrivateKey::<Testnet3>::new(&mut rand::thread_rng()).unwrap();

        let pk1_bytes = pk1.to_bytes_le().unwrap();

        let pk2_bytes = pk2.to_bytes_le().unwrap();

        print!("PK1: {:?}", pk1_bytes);
        print!("PK2 {:?}", pk2_bytes);
    }
}
