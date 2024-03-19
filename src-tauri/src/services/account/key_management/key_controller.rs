use crate::models::{storage::encryption::Keys, wallet::BetterAvailWallet};
use crate::services::local_storage::session::password::PASS;


#[cfg(target_os = "android")]
use super::android::{keystore_delete, keystore_init, keystore_load};

#[cfg(any(target_os = "ios"))]
use super::ios::{delete_ios, search, store_keys_local};

use snarkvm::prelude::{Identifier, Network, PrivateKey, ViewKey};

use super::desktop::{delete_key, read_key, read_seed_phrase, store};
use avail_common::errors::{AvailError, AvailErrorType, AvailResult};

/// This trait is used as a standard interface for the key management service.
/// The key_type field refers to the private key type when true and the viewing key type when false.
pub trait KeyController<N: Network> {
    fn store_key(&self, password: &str, wallet: &BetterAvailWallet<N>) -> AvailResult<String>;

    fn delete_key(&self, password: Option<&str>, ext: Identifier<N>) -> AvailResult<String>;
    fn read_key(&self, password: Option<&str>, key_type: &str) -> AvailResult<Keys<N>>;
    fn read_phrase(&self, password: &str, ext: Identifier<N>) -> AvailResult<String>;
}

pub struct AndroidKeyController;

#[cfg(target_os = "android")]
impl<N: Network> KeyController<N> for AndroidKeyController {
    fn store_key(&self, password: &str, wallet: &BetterAvailWallet<N>) -> AvailResult<String> {
        keystore_init(password, true, &wallet.private_key, &wallet.view_key)
    }

    //TODO authenticate using read_key
    fn delete_key(&self, password: Option<&str>, ext: Identifier<N>) -> AvailResult<String> {
        keystore_delete(password)
    }

    fn read_key(&self, password: Option<&str>, key_type: &str) -> AvailResult<Keys<N>> {
        keystore_load(password, key_type)
    }

    fn read_phrase(&self, password: &str, ext: Identifier<N>) -> AvailResult<String> {
        read_seed_phrase::<N>(password)
    }
}

pub struct iOSKeyController;

#[cfg(target_os = "ios")]
impl<N: Network> KeyController<N> for iOSKeyController {
    fn store_key(&self, password: &str, wallet: &BetterAvailWallet<N>) -> AvailResult<String> {
        store_keys_local(password, true, &wallet.private_key, &wallet.view_key)
    }

    //TODO authenticate using read_key
    fn delete_key(&self, password: Option<&str>, ext: Identifier<N>) -> AvailResult<String> {
        delete_ios(password)
    }

    fn read_key(&self, password: Option<&str>, key_type: &str) -> AvailResult<Keys<N>> {
        search(password, key_type)
    }

    fn read_phrase(&self, password: &str, ext: Identifier<N>) -> AvailResult<String> {
        read_seed_phrase(password, ext)
    }
}

pub struct macKeyController;

#[cfg(target_os = "macos")]
impl<N: Network> KeyController<N> for macKeyController {
    fn store_key(&self, password: &str, wallet: &BetterAvailWallet<N>) -> AvailResult<String> {
        store(wallet, password)
    }

    fn delete_key(&self, password: Option<&str>, _ext: Identifier<N>) -> AvailResult<String> {
        match password {
            Some(password) => delete_key::<N>(password),
            None => {
                Err(AvailError::new(
                    AvailErrorType::InvalidData,
                    "Password is required".to_string(),
                    "Password is required".to_string(),
                ))
            }
        }
    }

    fn read_key(&self, password: Option<&str>, key_type: &str) -> AvailResult<Keys<N>> {
        match password {
            Some(password) => read_key(password, key_type),
            None => {
                let password = match PASS.get_instance() {
                    Ok(password) => password,
                    Err(e) => return Err(e),
                };

                read_key(&password, key_type)
            }
        }
    }

    fn read_phrase(&self, password: &str, ext: Identifier<N>) -> AvailResult<String> {
        read_seed_phrase::<N>(password)
    }
}

pub struct linuxKeyController;

impl<N: Network> KeyController<N> for linuxKeyController {
    fn store_key(&self, password: &str, wallet: &BetterAvailWallet<N>) -> AvailResult<String> {
        store(wallet, password)
    }

    //TODO authenticate using read_key
    fn delete_key(&self, password: Option<&str>, _ext: Identifier<N>) -> AvailResult<String> {
        match password {
            Some(password) => delete_key::<N>(password),
            None => {
                return Err(AvailError::new(
                    AvailErrorType::InvalidData,
                    "Password is required".to_string(),
                    "Password is required".to_string(),
                ))
            }
        }
    }

    fn read_key(&self, password: Option<&str>, key_type: &str) -> AvailResult<Keys<N>> {
        match password {
            Some(password) => read_key(password, key_type),
            None => {
                let password = match PASS.get_instance() {
                    Ok(password) => password,
                    Err(e) => return Err(e),
                };

                read_key(&password, key_type)
            }
        }
    }

    fn read_phrase(&self, password: &str, ext: Identifier<N>) -> AvailResult<String> {
        read_seed_phrase::<N>(password)
    }
}

pub struct windowsKeyController;

#[cfg(target_os = "windows")]
impl<N: Network> KeyController<N> for windowsKeyController {
    fn store_key(&self, password: &str, wallet: &BetterAvailWallet<N>) -> AvailResult<String> {
        store(wallet, password)
    }

    //TODO authenticate using read_key
    fn delete_key(&self, password: Option<&str>, ext: Identifier<N>) -> AvailResult<String> {
        match password {
            Some(password) => delete_key::<N>(password),
            None => {
                return Err(AvailError::new(
                    AvailErrorType::InvalidData,
                    "Password is required".to_string(),
                    "Password is required".to_string(),
                ))
            }
        }
    }

    fn read_key(&self, password: Option<&str>, key_type: &str) -> AvailResult<Keys<N>> {
        match password {
            Some(password) => read_key(password, key_type),
            None => {
                let password = match PASS.get_instance() {
                    Ok(password) => password,
                    Err(e) => return Err(e),
                };

                read_key(&password, key_type)
            }
        }
    }

    fn read_phrase(&self, password: &str, ext: Identifier<N>) -> AvailResult<String> {
        read_seed_phrase::<N>(password)
    }
}
