use snarkvm::prelude::*;
#[cfg(any( target_os = "ios"))]
use tid::{LAContext, LAPolicy};

#[cfg(any( target_os = "ios"))]
use security_framework::passwords::{self,get_generic_password};

//#[cfg(any(target_os = "ios"))]
#[cfg(any( target_os = "ios"))]
use security_framework::passwords_options;

#[cfg(any( target_os = "ios"))]
use security_framework_sys::item::kSecUseAuthenticationContext;
#[cfg(any( target_os = "ios"))]
use core_foundation::{
    base::{CFType, TCFType},
    string::CFString,
};

use crate::models::storage::encryption::Keys;
use crate::models::wallet::BetterAvailWallet;
use crate::services::local_storage::persistent_storage::get_auth_type;

use avail_common::errors::{AvailError, AvailErrorType, AvailResult};
use avail_common::models::local_storage::try_label_to_account_str;

///Accepts a private key and attempts to store it on the user's iOS device.
///Using apple's security framework we set access controls to protect the key entry.
///If biometrics are available we only add the SecAccessControl to the query.
#[cfg(any( target_os = "ios"))]
pub fn store_key_local(
    key: &[u8],
    password: &str,
    access_type: bool,
    key_type: bool,
) -> AvailResult<()> {
    //check if user has biometry enabled
    let mut ctx = LAContext::new();

    let label = match key_type {
        true => "avl-p",
        false => "avl-v",
    };

    let account = match key_type {
        true => "avail-user-private",
        false => "avail-user-view",
    };

    let mut options = passwords_options::PasswordOptions::new_generic_password(
        "com.avail.wallet",
        account,
        label,
    );

    let auth_control;

    if access_type {
        //Change to BIOMETRY_CURRENT_SET (so new biometric sigs don't pass auth)
        auth_control = passwords_options::AccessControlOptions::BIOMETRY_ANY;
    } else {
        auth_control = passwords_options::AccessControlOptions::APPLICATION_PASSWORD;

        ctx.set_credential(password);

        options.query.push((
            unsafe { CFString::wrap_under_get_rule(kSecUseAuthenticationContext) },
            unsafe { CFType::wrap_under_create_rule(ctx.into_ref()) },
        ));
    }

    options.set_access_control_options(auth_control);

    passwords::set_password_internal(&mut options, key)?;

    Ok(())
}

/// stores both the private key and viewing key inside the keychain
#[cfg(any( target_os = "ios"))]
pub fn store_keys_local<N: Network>(
    password: &str,
    access_type: bool,
    p_key: &PrivateKey<N>,
    v_key: &ViewKey<N>,
) -> AvailResult<String> {
    store_key_local(&p_key.to_bytes_le()?, password, access_type, true)?;
    store_key_local(&v_key.to_bytes_le()?, password, access_type, false)?;

    Ok("Key Stored".to_string())
}


/// Accepts user's password if using applicaiton password to authenticate
/// We construct a CFDictionary query to search for the key entry in the keychain.
/// using SecItemCopyMatching we attempt to retrieve the key entry from the keychain.
/// and pass in the context to SecItemCopyMatching.
/// If using biometrics we just pass in the SecAccessControl to the query but then this is blocking (seperate method).
#[cfg(any( target_os = "ios"))]
pub fn search<N: Network>(password: Option<&str>, label: &str) -> AvailResult<Keys<N>> {
    let auth = get_auth_type()?;

    let account = try_label_to_account_str(label)?;

    let context = if auth {
        None
    } else {
        password.map(|password| {
            let mut ctx = LAContext::new();
            ctx.set_credential(password);
            ctx.into_ref() as *const libc::c_void
        })
    };

    let key = get_generic_password("com.avail", &account, auth, context, label)?;

    match label {
        "avl-p" => {
            let wallet = BetterAvailWallet::<N>::from_seed_bytes(&key)?;

            Ok(Keys::PrivateKey(wallet.private_key))
        }
        "avl-v" => {
            let viewing_key = ViewKey::<N>::from_bytes_le(&key)?;

            Ok(Keys::ViewKey(viewing_key))
        }
        _ => Err(AvailError::new(
            AvailErrorType::InvalidData,
            "Invalid label".to_string(),
            "Invalid label".to_string(),
        )),
    }
}

/* --Production-- */
/*
#[cfg(any(target_os = "macos", target_os = "ios"))]
#[tauri::command(rename_all = "snake_case")]
pub fn delete_ios(password: Option<&str>) -> AvailResult<String> {
    let network = get_network()?;
    // verify password is correct before deletion
    let _validation = match SupportedNetworks::from_str(&network)? {
        SupportedNetworks::Testnet3 => search::<Testnet3>(password, "avl-v")?,
    };

    match passwords::delete_generic_password("com.avail", "avail-user-view", "avl-v") {
        Ok(_) => (),
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::InvalidData,
                "Viewing key not found locally".to_string(),
                format!("{:?}", e),
            ))
        }
    };

    match passwords::delete_generic_password("com.avail", "avail-user-private", "avl-p") {
        Ok(_) => (),
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::InvalidData,
                "Private key not found locally".to_string(),
                format!("{:?}", e),
            ))
        }
    };

    delete_user_encrypted_data()?;
    delete_user()?;
    delete_all_server_storage()?;
    remove_view_session()?;
    delete_user_preferences()?;

    Ok("Wallet Deleted".to_string())
}
*/

// TODO - This should only delete key, user deletion should be a separate function call
/* --Testing-- */
#[tauri::command(rename_all = "snake_case")]
pub fn delete_ios(_password: Option<&str>) -> AvailResult<String> {
    match passwords::delete_generic_password("com.avail", "avail-user-view", "avl-v") {
        Ok(_) => (),
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::InvalidData,
                "Viewing key not found locally".to_string(),
                format!("{:?}", e),
            ))
        }
    };

    match passwords::delete_generic_password("com.avail", "avail-user-private", "avl-p") {
        Ok(_) => (),
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::InvalidData,
                "Private key not found locally".to_string(),
                format!("{:?}", e),
            ))
        }
    };
    Ok("Key Deleted".to_string())
}

/// Checks if the user's device has biometrics enabled.
#[tauri::command(rename_all = "snake_case")]
#[cfg(any(target_os = "macos", target_os = "ios"))]
pub fn prepare_context() -> bool {
    let ctx = LAContext::new();
    ctx.can_evaluate_policy(LAPolicy::DeviceOwnerAuthenticationWithBiometrics)
}


//issues with entitlement signing on mac (see way to run all tests for mac with entitlement added)
#[cfg(test)]
mod tests {
    use super::*;
    use avail_common::models::constants::STRONG_PASSWORD;
    use snarkvm::prelude::{PrivateKey, Testnet3};

    #[test]
    fn test_store_key_local_password() {
        let pk = PrivateKey::<Testnet3>::new(&mut rand::thread_rng()).unwrap();
        let seed = pk.to_bytes_le().unwrap();
        let password = STRONG_PASSWORD.to_string();

        store_key_local(&seed, &password, false, true).unwrap();
    }

    #[test]
    fn test_store_key_local_biometrics() {
        let pk = PrivateKey::<Testnet3>::new(&mut rand::thread_rng()).unwrap();
        let seed = pk.to_bytes_le().unwrap();

        store_key_local(&seed, "", true, true).unwrap();
    }

    #[test]
    fn test_context_set_credential() {
        let mut ctx = LAContext::new();
        ctx.set_credential(STRONG_PASSWORD);

        let _cf = unsafe { CFType::wrap_under_get_rule(ctx.into_ref()) };
    }

    #[test]
    fn test_search_password() {
        search::<Testnet3>(Some(STRONG_PASSWORD), "avl-p").unwrap();
    }

    #[test]
    fn test_search_biometrics() {
        search::<Testnet3>(None, "avl-p").unwrap();
    }

    #[tokio::test]
    async fn delete_key() {
        delete_ios(None).await.unwrap();
    }
}
