use snarkvm::{console::prelude::*, prelude::Testnet3};

use crate::models::storage::languages::Languages;
use crate::services::account::{
    key_management::key_controller::KeyController, utils::generate_discriminant,
};
use crate::services::authentication::session::get_session_after_creation;
use crate::services::local_storage::persistent_storage::get_language;
use crate::services::local_storage::{
    encrypted_data::{get_and_store_all_data, initialize_encrypted_data_table},
    persistent_storage::initial_user_preferences,
    session::{password::PASS, view::VIEWSESSION},
    tokens::init_tokens_table,
};
use crate::{api::user::create_user, models::wallet::BetterAvailWallet};

#[cfg(target_os = "linux")]
use crate::services::account::key_management::key_controller::linuxKeyController;

#[cfg(target_os = "windows")]
use crate::services::account::key_management::key_controller::windowsKeyController;

#[cfg(target_os = "macos")]
use crate::services::account::key_management::key_controller::macKeyController;

use avail_common::{errors::AvailResult, models::user::User};

#[tauri::command(rename_all = "snake_case")]
pub async fn create_seed_phrase_wallet(
    username: Option<String>,
    password: String,
    access_type: bool,
    backup: bool,
    language: Languages,
    length: usize,
) -> AvailResult<String> {
    let avail_wallet = BetterAvailWallet::<Testnet3>::new(length, &language)?;

    let tag = username.clone().map(|_| generate_discriminant());

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
        language.clone(),
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

    key_manager.store_key(&password, &avail_wallet)?;

    VIEWSESSION.set_view_session(&avail_wallet.get_view_key())?;

    PASS.set_pass_session(&password)?;

    get_session_after_creation(&avail_wallet.private_key).await?;

    // NOTE: We can safely unwrap here because we created
    // the wallet using the [`BetterAvailWallet::new`] method
    let seed_phrase = avail_wallet.mnemonic.unwrap().phrase().to_string();

    Ok(seed_phrase)
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
    let avail_wallet = BetterAvailWallet::<Testnet3>::try_from(private_key.to_string())?;

    let tag = username.clone().map(|_| generate_discriminant());

    let user_request = User {
        username: username.clone(),
        address: avail_wallet.address.to_string(),
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

    let storage = key_manager.store_key(&password, &avail_wallet)?;

    VIEWSESSION.set_view_session(&avail_wallet.view_key.to_string())?;

    PASS.set_pass_session(&password)?;

    get_session_after_creation(&avail_wallet.private_key).await?;

    get_and_store_all_data().await?;

    Ok(storage)
}
