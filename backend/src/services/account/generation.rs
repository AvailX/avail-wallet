use bip39::{Language, Mnemonic};
use rand::{rngs::StdRng, Rng, SeedableRng};
use snarkvm::{
    console::prelude::*,
    prelude::{Network, PrivateKey, Testnet3, ViewKey},
};
use std::str::FromStr;

use crate::api::user::create_user;
use crate::models::{
    storage::languages::Languages,
    wallet::{AvailSeedWallet, AvailWallet, SeedResult},
};
use crate::services::account::{
    key_management::key_controller::KeyController, utils::generate_discriminant,
};
use crate::services::local_storage::{
    encrypted_data::{get_and_store_all_data, initialize_encrypted_data_table},
    persistent_storage::initial_user_preferences,
    session::{password::PASS, view::VIEWSESSION},
    tokens::init_tokens_table,
};

#[cfg(target_os = "linux")]
use crate::services::account::key_management::key_controller::linuxKeyController;

#[cfg(target_os = "windows")]
use crate::services::account::key_management::key_controller::windowsKeyController;

#[cfg(target_os = "macos")]
use crate::services::account::key_management::key_controller::macKeyController;

use avail_common::{errors::AvailResult, models::user::User};

use super::super::authentication::session::get_session_after_creation;

/// Generates a 12 word seed phrase using bip39 crate
fn generate_seed_phrase() -> AvailResult<SeedResult> {
    let mut rng = StdRng::from_entropy();
    let mut seed = [0u8; 16];

    rng.fill(&mut seed);

    let mnemonic = Mnemonic::from_entropy(&seed, Language::English)?;

    let phrase: &str = mnemonic.phrase();

    let seed_res = SeedResult {
        entropy: mnemonic.entropy().to_vec(),
        seed_phrase: phrase.to_string(),
    };

    Ok(seed_res)
}

/// Generates a 24 word seed phrase using bip39 crate
fn generate_long_seed_phrase() -> AvailResult<SeedResult> {
    let mut rng = StdRng::from_entropy();
    let mut seed = [0u8; 32];

    rng.fill(&mut seed);

    let mnemonic = Mnemonic::from_entropy(&seed, Language::English)?;

    let phrase: &str = mnemonic.phrase();

    let seed_res = SeedResult {
        entropy: mnemonic.entropy().to_vec(),
        seed_phrase: phrase.to_string(),
    };

    Ok(seed_res)
}

///Generates a new aleo account
pub fn create_wallet<N: Network>() -> AvailResult<AvailWallet<N>> {
    let avail_wallet = AvailWallet::<N>::new()?;

    Ok(avail_wallet)
}

/// Generates a new aleo account with a seed phrase
#[tauri::command(rename_all = "snake_case")]
pub fn gen_seeded_wallet<N: Network>() -> AvailResult<AvailSeedWallet<N>> {
    let seed_result = generate_seed_phrase()?;
    let seed_phrase = seed_result.seed_phrase;

    let avail_seed_wallet = AvailSeedWallet::<N>::new(&seed_result.entropy, seed_phrase)?;

    Ok(avail_seed_wallet)
}

#[tauri::command(rename_all = "snake_case")]
pub async fn create_seed_phrase_wallet(
    username: Option<String>,
    password: String,
    access_type: bool,
    backup: bool,
    language: Languages,
) -> AvailResult<String> {
    let avail_wallet = gen_seeded_wallet::<Testnet3>()?;
    let p_key = avail_wallet.private_key;
    let v_key = avail_wallet.view_key;

    let tag = match username {
        Some(_) => Some(generate_discriminant()),
        None => None,
    };

    let user_request = User {
        username: username.clone(),
        address: avail_wallet.address.to_string(),
        tag,
        backup: false,
    };

    create_user(user_request).await?;

    //TODO: Change to mainnet on launch
    initial_user_preferences(
        access_type,
        username,
        tag,
        false,
        backup,
        avail_wallet.address.to_string(),
        language,
    )?;

    init_tokens_table()?;

    initialize_encrypted_data_table()?;

    let key_manager = {
        #[cfg(target_os = "windows")]
        {
            windowsKeyController {}
        }
        #[cfg(target_os = "linux")]
        {
            linuxKeyController {}
        }
        #[cfg(target_os = "macos")]
        {
            macKeyController {}
        }
    };

    key_manager.store_key(&password, access_type, &p_key, &v_key)?;

    VIEWSESSION.set_view_session(&v_key.to_string())?;

    PASS.set_pass_session(&password)?;

    get_session_after_creation(&p_key).await?;

    Ok(avail_wallet.seed_phrase)
}

#[tauri::command(rename_all = "snake_case")]
pub async fn import_wallet(
    username: Option<String>,
    password: String,
    access_type: bool,
    private_key: &str,
    backup: bool,
    language: Languages,
) -> AvailResult<String> {
    let p_key = PrivateKey::<Testnet3>::from_str(private_key)?;

    //let private_key_bytes = private_key.to_bytes_le()?;

    let v_key = ViewKey::<Testnet3>::try_from(p_key)?;

    //let v_key_bytes = v_key.to_bytes_le()?;
    let tag = match username {
        Some(_) => Some(generate_discriminant()),
        None => None,
    };
    let user_request = User {
        username: username.clone(),
        address: v_key.to_address().to_string(),
        tag,
        backup: false,
    };

    create_user(user_request).await?;

    initial_user_preferences(
        access_type,
        username,
        tag,
        false,
        backup,
        v_key.to_address().to_string(),
        language,
    )?;

    init_tokens_table()?;

    initialize_encrypted_data_table()?;

    let key_manager = {
        #[cfg(target_os = "windows")]
        {
            windowsKeyController {}
        }

        #[cfg(target_os = "linux")]
        {
            linuxKeyController {}
        }

        #[cfg(target_os = "macos")]
        {
            macKeyController {}
        }
    };

    let storage = key_manager.store_key(&password, access_type, &p_key, &v_key)?;

    VIEWSESSION.set_view_session(&v_key.to_string())?;

    PASS.set_pass_session(&password)?;

    get_session_after_creation(&p_key).await?;
    get_and_store_all_data().await?;

    Ok(storage)
}

// TODO - Update unit tests for generation
#[cfg(test)]
mod generation_tests {
    use super::*;
    #[test]
    fn test_create_wallet() {
        let avail_wallet = create_wallet::<Testnet3>();

        let avail_wallet = match avail_wallet {
            Ok(a) => a,
            Err(_) => return,
        };

        //print wallet
        print!("private key: {}", avail_wallet.private_key);
        print!("view key: {}", avail_wallet.view_key);
        print!("address: {}", avail_wallet.address);
    }

    #[cfg(any(target_os = "ios"))]
    #[test]
    fn test_create_wallet_ios() {
        create_wallet_ios(Some("test".to_string()), "test".to_string(), false).unwrap();
    }

    #[cfg(any(target_os = "android"))]
    #[test]
    fn test_create_wallet_android() {
        let avail_wallet =
            create_wallet_android(Some("test".to_string()), "test".to_string(), false).unwrap();

        print!("{}", avail_wallet);
    }

    #[test]
    fn test_seed_wallet() {
        let seed_wallet = gen_seeded_wallet::<Testnet3>().unwrap();

        let seed_phrase = seed_wallet.seed_phrase;

        //let seed_wallet_from_bytes = AvailSeedWallet::<Testnet3>::from_bytes(bytes.as_slice()).unwrap();
        let seed_wallet_from_phrase =
            AvailSeedWallet::<Testnet3>::from_seed_phrase(seed_phrase.clone()).unwrap();

        println!("2nd Seed Phrase:: {}", seed_wallet_from_phrase.seed_phrase);
        println!("OG Seed Phrase:: {}", seed_phrase);
        assert_eq!(seed_wallet_from_phrase.private_key, seed_wallet.private_key);
    }

    #[test]
    fn test_seed_phrase_generation() {
        let seed_result = generate_seed_phrase().unwrap();

        let phrase = seed_result.seed_phrase;

        println!("{}", phrase);
    }
}

/* -- Android -- */

// #[cfg(any(target_os = "android"))]
// #[tauri::command(rename_all = "snake_case")]
// pub async fn create_wallet_android(
//     username: Option<String>,
//     password: String,
//     access_type: bool,
//     backup: bool,
//     language: Languages,
// ) -> AvailResult<String> {
//     use crate::models::storage::languages::Languages;

//     let avail_wallet = AvailWallet::<Testnet3>::new()?;
//     let p_key = avail_wallet.private_key;
//     let v_key = avail_wallet.view_key;
//     let tag = match username {
//         Some(_) => Some(generate_discriminant()),
//         None => None,
//     };

//     let user_request = User {
//         username: username.clone(),
//         address: avail_wallet.address.to_string(),
//         tag,
//         backup: false,
//     };

//     create_user(user_request).await?;

//     initial_user_preferences(
//         access_type,
//         username,
//         tag,
//         false,
//         backup,
//         avail_wallet.address.to_string(),
//         backup,
//         language,
//     )?;
//     initialize_encrypted_data_table()?;

//     let key_manager = AndroidKeyController {};
//     let storage = key_manager.store_key(&password, access_type, &p_key, &v_key)?;

//     VIEWSESSION.set_view_session(&v_key.to_string())?;

//     PASS.set_pass_session(&password)?;

//     get_session_after_creation(&p_key).await?;

//     Ok(storage)
// }

// #[cfg(any(target_os = "android"))]
// #[tauri::command(rename_all = "snake_case")]
// pub async fn create_seed_phrase_wallet_android(
//     username: Option<String>,
//     password: String,
//     access_type: bool,
//     backup: bool,
//     language: Languages,
// ) -> AvailResult<String> {
//     let avail_wallet = create_seed_phrase_wallet::<Testnet3>()?;
//     let p_key = avail_wallet.private_key;
//     let v_key = avail_wallet.view_key;
//     let tag = match username {
//         Some(_) => Some(generate_discriminant()),
//         None => None,
//     };

//     let user_request = User {
//         username: username.clone(),
//         address: avail_wallet.address.to_string(),
//         tag,
//     };

//     create_user(user_request).await?;

//     initial_user_preferences(
//         access_type,
//         username,
//         tag,
//         false,
//         backup,
//         avail_wallet.address.to_string(),
//         backup,
//         language,
//     )?;
//     initialize_encrypted_data_table()?;

//     let key_manager = AndroidKeyController {};
//     let _storage = key_manager.store_key(&password, access_type, &p_key, &v_key)?;

//     VIEWSESSION.set_view_session(&v_key.to_string())?;

//     PASS.set_pass_session(&password)?;

//     get_session_after_creation(&p_key).await?;

//     Ok(avail_wallet.seed_phrase)
// }

// /// Accepts a string representation of a private key to import an existing Aleo account
// #[cfg(any(target_os = "android"))]
// #[tauri::command(rename_all = "snake_case")]
// pub async fn import_wallet_android(
//     username: Option<String>,
//     password: String,
//     access_type: bool,
//     private_key: &str,
//     backup: bool,
//     language: Languages,
// ) -> AvailResult<String> {
//     let p_key = PrivateKey::<Testnet3>::from_str(private_key)?;

//     //let private_key_bytes = private_key.to_bytes_le()?;

//     let v_key = ViewKey::<Testnet3>::try_from(p_key)?;

//     //let v_key_bytes = v_key.to_bytes_le()?;
//     let tag = match username {
//         Some(_) => Some(generate_discriminant()),
//         None => None,
//     };
//     let user_request = User {
//         username: username.clone(),
//         address: v_key.to_address().to_string(),
//         tag,
//     };

//     //TODO - CHECK IF USER EXISTS
//     create_user(user_request).await?;

//     initial_user_preferences(
//         access_type,
//         username,
//         tag,
//         false,
//         backup,
//         v_key.to_address().to_string(),
//         language,
//     )?;
//     initialize_encrypted_data_table()?;
//     store_view_session(v_key.to_bytes_le()?)?;

//     // NOTE - might have issues with JNI since function is async
//     let key_manager = AndroidKeyController {};
//     let storage = key_manager.store_key(&password, access_type, &p_key, &v_key)?;

//     VIEWSESSION.set_view_session(&v_key.to_string())?;

//     PASS.set_pass_session(&password)?;

//     get_session_after_creation(&p_key).await?;
//     get_and_store_all_data().await?;

//     Ok(storage)
// }

/* -- iOS -- */

// #[cfg(any(target_os = "ios"))]
// #[tauri::command(rename_all = "snake_case")]
// pub async fn create_wallet_ios(
//     username: Option<String>,
//     password: String,
//     access_type: bool,
//     backup: bool,
//     language: Languages,
// ) -> AvailResult<String> {
//     let avail_wallet = AvailWallet::<Testnet3>::new()?;

//     let p_key = avail_wallet.private_key;

//     let v_key = avail_wallet.view_key;

//     let v_key_bytes = v_key.to_bytes_le()?;

//     let tag = username.clone().map(|_| generate_discriminant());
//     let user_request = User {
//         username: username.clone(),
//         address: avail_wallet.address.to_string(),
//         tag,
//         backup: false,
//     };

//     create_user(user_request).await?;

//     //TODO: Change to mainnet on launch
//     initial_user_preferences(
//         access_type,
//         username,
//         tag,
//         false,
//         backup,
//         avail_wallet.address.to_string(),
//         language,
//     )?;
//     initialize_encrypted_data_table()?;

//     let key_manager = iOSKeyController {};
//     let storage = key_manager.store_key(&password, access_type, &p_key, &v_key)?;

//     VIEWSESSION.set_view_session(&v_key.to_string())?;

//     PASS.set_pass_session(&password)?;

//     get_session_after_creation(&p_key).await?;

//     Ok(storage)
// }

// #[cfg(any(target_os = "ios"))]
// #[tauri::command(rename_all = "snake_case")]
// pub async fn create_seed_phrase_wallet_ios(
//     username: Option<String>,
//     password: String,
//     access_type: bool,
//     backup: bool,
//     language: Languages,
// ) -> AvailResult<String> {
//     let avail_wallet = create_seed_phrase_wallet::<Testnet3>()?;

//     let p_key = avail_wallet.private_key;

//     let v_key = avail_wallet.view_key;

//     let v_key_bytes = v_key.to_bytes_le()?;
//     let tag = match username {
//         Some(_) => Some(generate_discriminant()),
//         None => None,
//     };

//     let user_request = User {
//         username: username.clone(),
//         address: avail_wallet.address.to_string(),
//         tag,
//     };

//     create_user(user_request).await?;

//     //TODO: Change to mainnet on launch
//     initial_user_preferences(
//         access_type,
//         username,
//         tag,
//         false,
//         backup,
//         avail_wallet.address.to_string(),
//         backup,
//         language,
//     )?;
//     initialize_encrypted_data_table()?;

//     let key_manager = iOSKeyController {};
//     let _storage = key_manager.store_key(&password, access_type, &p_key, &v_key)?;

//     VIEWSESSION.set_view_session(&v_key.to_string())?;

//     PASS.set_pass_session(&password)?;

//     get_session_after_creation(&p_key).await?;

//     Ok(avail_wallet.seed_phrase)
// }

// #[cfg(any(target_os = "ios"))]
// #[tauri::command(rename_all = "snake_case")]
// pub async fn import_wallet_ios(
//     username: Option<String>,
//     password: String,
//     access_type: bool,
//     private_key: &str,
//     backup: bool,
//     language: Languages,
// ) -> AvailResult<()> {
//     let p_key = PrivateKey::<Testnet3>::from_str(private_key)?;

//     let v_key = ViewKey::<Testnet3>::try_from(p_key)?;
//     let tag = match username {
//         Some(_) => Some(generate_discriminant()),
//         None => None,
//     };

//     let user_request = User {
//         username: username.clone(),
//         address: v_key.to_address().to_string(),
//         tag,
//     };

//     create_user(user_request).await?;

//     //Change to mainnet on launch
//     initial_user_preferences(
//         access_type,
//         username,
//         tag,
//         false,
//         backup,
//         v_key.to_address().to_string(),
//         language,
//     )?;
//     initialize_encrypted_data_table()?;

//     let key_manager = iOSKeyController {};
//     let _storage = key_manager.store_key(&password, access_type, &p_key, &v_key)?;

//     VIEWSESSION.set_view_session(&v_key.to_string())?;

//     PASS.set_pass_session(&password)?;

//     get_session_after_creation(&p_key).await?;
//     get_and_store_all_data().await?;

//     Ok(())
// }
