use crate::models::{storage::encryption::Keys, wallet::BetterAvailWallet};
use crate::services::local_storage::session::password::PASS;

#[cfg(target_os = "android")]
use super::android::{keystore_delete, keystore_init, keystore_load};

#[cfg(target_os = "ios")]
use super::iOS::{delete_ios, search, store_keys_local};

use snarkvm::prelude::{Identifier, Network, PrivateKey, ViewKey, FromStr};

use super::desktop::{delete_key, delete_key_for_recovery, read_key, read_seed_phrase, store};
use avail_common::errors::{AvailError, AvailErrorType, AvailResult};
use avail_common::models::constants::{PRIVATE_KEY, VIEW_KEY};
#[cfg(target_os = "ios")]
use super::faceid::{store_keys_ios, delete_key_ios, get_key_ios};
#[cfg(target_os = "ios")]
use crate::services::local_storage::persistent_storage::get_address_string;
#[cfg(target_os = "ios")]
use crate::services::local_storage::persistent_storage::update_address;

/// This trait is used as a standard interface for the key management service.
/// The key_type field refers to the private key type when true and the viewing key type when false.
pub trait KeyController<N: Network> {
    fn store_key(&self, password: &str, wallet: &BetterAvailWallet<N>) -> AvailResult<String>;
    fn delete_key(&self, password: Option<&str>, ext: Identifier<N>) -> AvailResult<String>;
    fn delete_key_for_recovery(
        &self,
        password: Option<&str>,
        ext: Identifier<N>,
    ) -> AvailResult<String>;
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
        //TODO: Seed phrase storage on mobile (read_seed_phrase(password))
        Ok("seed_phrase".to_string())
    }
}

pub struct iOSKeyController;

#[cfg(target_os = "ios")]
impl<N: Network> KeyController<N> for iOSKeyController {
    fn store_key(&self, _password: &str, wallet: &BetterAvailWallet<N>) -> AvailResult<String> {
        let address = &wallet.address.to_string();
        update_address(address)?;
        if (address != &get_address_string()?) {
            return Err(AvailError::new(
                AvailErrorType::InvalidData,
                format!("{} != {}", address, &get_address_string()?),
                "Address is different".to_string(),
            ));
        }
        match store_keys_ios("com.avail.wallet.p", &wallet.address.to_string(), &wallet.private_key.to_string(), PRIVATE_KEY) {
            Ok(_) => {}
            Err(e) => return Err(e),
        };
        match store_keys_ios("com.avail.wallet.v", &wallet.address.to_string(), &wallet.view_key.to_string(), VIEW_KEY) {
            Ok(_) => {}
            Err(e) => return Err(AvailError::new(
                AvailErrorType::InvalidData,
                e.to_string(),
                "Failed at storing view key".to_string(),
            )),
        };
        match store_keys_ios("com.avail.wallet.phrase", &wallet.address.to_string(), &wallet.mnemonic.clone().unwrap().phrase(), "avl-s") {
            Ok(_) => {}
            Err(e) => return Err(AvailError::new(
                AvailErrorType::InvalidData,
                e.to_string(),
                "Failed at storing seed phrase".to_string(),
            )),
        };
        Ok("Keys Stored".to_string())
    }

    // Delete private key, viewing key and seed phrase for current account
    fn delete_key(&self, _password: Option<&str>, _ext: Identifier<N>) -> AvailResult<String> {
        // Get address from local storage
        let address = get_address_string()?;
        match delete_key_ios("com.avail.wallet.p", &address, PRIVATE_KEY) {
            Ok(_) => {}
            Err(e) => return Err(e),
        };
        match delete_key_ios("com.avail.wallet.v", &address, VIEW_KEY) {
            Ok(_) => {}
            Err(e) => return Err(e),
        };
        match delete_key_ios("com.avail.wallet.phrase", &address, "avl-s") {
            Ok(_) => {}
            Err(e) => return Err(e),
        };
        Ok("Keys Deleted".to_string())
    }

    fn read_key(&self, _password: Option<&str>, key_type: &str) -> AvailResult<Keys<N>> {
        let address = get_address_string()?;
        match key_type {
            PRIVATE_KEY => {
                let private_key = get_key_ios("com.avail.wallet.p", &address, key_type)?;
                Ok(Keys::PrivateKey(PrivateKey::from_str(&private_key)?))
            }
            VIEW_KEY => {
                let view_key = get_key_ios("com.avail.wallet.v", &address, key_type)?;
                Ok(Keys::ViewKey(ViewKey::from_str(&view_key)?))
            }
            _ => Err(AvailError::new(
                AvailErrorType::InvalidData,
                "Invalid label".to_string(),
                "Invalid label".to_string(),
            )),
        }
    }

    fn read_phrase(&self, _password: &str, _ext: Identifier<N>) -> AvailResult<String> {
        let address = get_address_string()?;
        get_key_ios("com.avail.wallet.phrase", &address, "avl-s")
    }
}

// #[cfg(target_os = "ios")]
// impl<N: Network> KeyController<N> for iOSKeyController {
//     fn store_key(&self, password: &str, wallet: &BetterAvailWallet<N>) -> AvailResult<String> {
//         store_keys_local(password, true, &wallet.private_key, &wallet.view_key)
//     }
//
//     //TODO authenticate using read_key
//     fn delete_key(&self, password: Option<&str>, ext: Identifier<N>) -> AvailResult<String> {
//         delete_ios(password)
//     }
//
//     fn read_key(&self, password: Option<&str>, key_type: &str) -> AvailResult<Keys<N>> {
//         search(password, key_type)
//     }
//
//     fn read_phrase(&self, password: &str, ext: Identifier<N>) -> AvailResult<String> {
//         //TODO: Seed phrase storage on mobile (read_seed_phrase(password))
//         Ok("seed_phrase".to_string())
//     }
// }

pub struct macKeyController;

#[cfg(target_os = "macos")]
impl<N: Network> KeyController<N> for macKeyController {
    fn store_key(&self, password: &str, wallet: &BetterAvailWallet<N>) -> AvailResult<String> {
        store(wallet, password)
    }

    fn delete_key(&self, password: Option<&str>, _ext: Identifier<N>) -> AvailResult<String> {
        match password {
            Some(password) => delete_key::<N>(password),
            None => Err(AvailError::new(
                AvailErrorType::InvalidData,
                "Password is required".to_string(),
                "Password is required".to_string(),
            )),
        }
    }

    fn delete_key_for_recovery(
        &self,
        password: Option<&str>,
        _ext: Identifier<N>,
    ) -> AvailResult<String> {
        match password {
            Some(password) => delete_key_for_recovery::<N>(password),
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

    fn delete_key_for_recovery(
        &self,
        password: Option<&str>,
        _ext: Identifier<N>,
    ) -> AvailResult<String> {
        match password {
            Some(password) => delete_key_for_recovery::<N>(password),
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

    fn delete_key_for_recovery(
        &self,
        password: Option<&str>,
        _ext: Identifier<N>,
    ) -> AvailResult<String> {
        match password {
            Some(password) => delete_key_for_recovery::<N>(password),
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
