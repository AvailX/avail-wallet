use snarkvm::prelude::{Testnet3, ToBytes};

use crate::{
    models::storage::languages::Languages,
    services::local_storage::{
        encrypted_data::initialize_encrypted_data_table,
        persistent_storage::initial_user_preferences, session::view::VIEWSESSION,
    },
};

use avail_common::errors::AvailResult;

use crate::api::user::{create_user, get_user};
use crate::models::wallet::AvailSeedWallet;
use crate::services::account::key_management::key_controller::KeyController;
use crate::services::authentication::session::get_session_after_creation;
use crate::services::local_storage::{
    encrypted_data::get_and_store_all_data, tokens::init_tokens_table,
};
use avail_common::models::user::User;
/*  reconstruct wallet from seed phrase and store in local storage */

#[cfg(target_os = "macos")]
use crate::services::account::key_management::key_controller::macKeyController;

#[cfg(target_os = "windows")]
use crate::services::account::key_management::key_controller::windowsKeyController;

#[cfg(target_os = "linux")]
use crate::services::account::key_management::key_controller::linuxKeyController;

#[tauri::command(rename_all = "snake_case")]
pub async fn recover_wallet_from_seed_phrase(
    seed_phrase: &str,
    password: &str,
    access_type: bool,
    language: Languages,
) -> AvailResult<()> {
    let avail_wallet = AvailSeedWallet::<Testnet3>::from_seed_phrase(seed_phrase.to_string())?;
    let address = avail_wallet.address.to_string();

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

    key_manager.store_key(
        password,
        access_type,
        &avail_wallet.private_key,
        &avail_wallet.view_key,
    )?;

    get_session_after_creation::<Testnet3>(&avail_wallet.private_key).await?;

    let (username, tag, backup) = match get_user().await {
        Ok(user) => (user.username, user.tag, user.backup),
        Err(_) => {
            let request = User {
                username: None,
                address: address.clone(),
                tag: None,
                backup: false,
            };
            create_user(request).await?;
            (None, None, false)
        }
    };

    let _v_key = avail_wallet.view_key.to_bytes_le()?;

    //TODO: Change to mainnet on launch
    initial_user_preferences(access_type, username, tag, true, backup, address, language)?;

    init_tokens_table()?;

    initialize_encrypted_data_table()?;
    VIEWSESSION
        .set_view_session(&avail_wallet.view_key.to_string())
        .unwrap();

    if backup {
        get_and_store_all_data().await?;
    }

    Ok(())
}

// #[cfg(any(target_os = "android"))]
// #[tauri::command(rename_all = "snake_case")]
// pub fn recover_wallet_from_seed_phrase_android(
//     seed_phrase: &str,
//     password: &str,
//     access_type: bool,
//     language: Languages,
// ) -> AvailResult<()> {
//     let avail_wallet = AvailSeedWallet::<Testnet3>::from_seed_phrase(seed_phrase.to_string())?;
//     let address = avail_wallet.address.to_string();

//     let key_manager = AndroidKeyController;

//     key_manager.store_key(
//         password,
//         access_type,
//         &avail_wallet.private_key,
//         &avail_wallet.view_key,
//     )?;

//     get_session_after_creation::<Testnet3>(&avail_wallet.private_key).await?;

//     let (username, tag, backup) = match get_user().await {
//         Ok(user) => (user.username, user.tag, user.backup),
//         Err(_) => {
//             let request = User {
//                 username: None,
//                 address: address.clone(),
//                 tag: None,
//                 backup: false,
//             };
//             create_user(request).await?;
//             (None, None, false)
//         }
//     };

//     let v_key = avail_wallet.view_key.to_bytes_le()?;

//     //TODO: Change to mainnet on launch
//     initial_user_preferences(access_type, username, tag, true, backup, address, language)?;
//     initialize_encrypted_data_table()?;
//     VIEWSESSION
//         .set_view_session(&avail_wallet.view_key.to_string())
//         .unwrap();

//     if backup {
//         get_and_store_all_data().await?;
//     }

//     Ok(())
// }

// #[cfg(any(target_os = "ios"))]
// #[tauri::command(rename_all = "snake_case")]
// pub fn recover_wallet_from_seed_phrase_ios(
//     seed_phrase: &str,
//     password: &str,
//     access_type: bool,
//     language: Languages,
// ) -> AvailResult<()> {
//     let avail_wallet = AvailSeedWallet::<Testnet3>::from_seed_phrase(seed_phrase.to_string())?;
//     let address = avail_wallet.address.to_string();

//     let key_manager = iOSKeyController;

//     key_manager.store_key(
//         password,
//         access_type,
//         &avail_wallet.private_key,
//         &avail_wallet.view_key,
//     )?;

//     get_session_after_creation::<Testnet3>(&avail_wallet.private_key).await?;

//     let (username, tag, backup) = match get_user().await {
//         Ok(user) => (user.username, user.tag, user.backup),
//         Err(_) => {
//             let request = User {
//                 username: None,
//                 address: address.clone(),
//                 tag: None,
//                 backup: false,
//             };
//             create_user(request).await?;
//             (None, None, false)
//         }
//     };

//     let v_key = avail_wallet.view_key.to_bytes_le()?;

//     //TODO: Change to mainnet on launch
//     initial_user_preferences(access_type, username, tag, true, backup, address, language)?;
//     initialize_encrypted_data_table()?;
//     VIEWSESSION
//         .set_view_session(&avail_wallet.view_key.to_string())
//         .unwrap();

//     if backup {
//         get_and_store_all_data().await?;
//     }

//     Ok(())
// }
