use chrono::{DateTime, Local};
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
use crate::models::wallet::BetterAvailWallet;
use crate::services::account::key_management::key_controller::{
    linuxKeyController, macKeyController, windowsKeyController, KeyController,
};
use crate::services::authentication::session::get_session_after_creation;
use crate::services::local_storage::{
    encrypted_data::get_and_store_all_data, tokens::init_tokens_table,
};
use avail_common::models::user::User; // Add import statement

#[tauri::command(rename_all = "snake_case")]
/// This function provides the tauri bindings to recover an avail wallet from a seed phrase.
pub async fn recover_wallet_from_seed_phrase(
    seed_phrase: &str,
    password: &str,
    access_type: bool,
    language: Languages,
) -> AvailResult<()> {
    let avail_wallet = BetterAvailWallet::<Testnet3>::from_seed_phrase(
        seed_phrase,
        Languages::to_bip39_language(&language),
    )?;

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

    key_manager.store_key(password, &avail_wallet)?;

    let session_string = get_session_after_creation::<Testnet3>(&avail_wallet.private_key).await?;
    println!("session_string: {}", session_string);
    let (username, tag, backup) = match get_user().await {
        Ok(user) => (user.username, user.tag, user.backup),
        Err(_) => {
            let request = User {
                username: None,
                address: avail_wallet.get_address(),
                tag: None,
                backup: false,
            };
            create_user(request).await?;
            (None, None, false)
        }
    };

    let _v_key = avail_wallet.view_key.to_bytes_le()?;

    //let mut last_sync = 0u32;

    initial_user_preferences(
        access_type,
        username,
        tag,
        true,
        backup,
        avail_wallet.get_address(),
        language,
    )?;

    init_tokens_table()?;

    // some function

    initialize_encrypted_data_table()?;
    VIEWSESSION
        .set_view_session(&avail_wallet.get_view_key())
        .unwrap();

    if backup {
        println!("session_string: {}", session_string);
        get_and_store_all_data().await?;
    }

    Ok(())
}

// Write a test for the recover_wallet_from_seed_phrase function
// The test should check that the function returns the expected result
// when called with valid input
// The test should check that the function returns the expected result
// when called with invalid input

#[cfg(test)]
mod tests {
    use crate::{
        models::storage::languages::Languages,
        services::account::phrase_recovery::recover_wallet_from_seed_phrase,
    };

    #[tokio::test]
    async fn test_recover_wallet_from_seed_phrase() {
        let seed_phrase = "apart old today below fruit milk among frozen toe absurd approve soon";
        let password = "tylerDurden@0xf5";
        let access_type = true;
        let language = Languages::English;
        let result = recover_wallet_from_seed_phrase(seed_phrase, password, access_type, language)
            .await
            .unwrap();
        println!("{:?}", result);
    }
}
