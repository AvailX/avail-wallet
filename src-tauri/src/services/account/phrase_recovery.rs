use chrono::{DateTime, Local, Utc};
use snarkvm::prelude::{Testnet3, ToBytes};

use crate::{
    api::backup_recovery::{get_backup_timestamp, get_sync_height},
    models::storage::languages::Languages,
    services::local_storage::{
        encrypted_data::{initialize_encrypted_data_table, process_private_tokens},
        persistent_storage::{initial_user_preferences, update_last_backup_sync, update_last_sync},
        session::view::VIEWSESSION,
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
use avail_common::models::user::User;

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

    get_session_after_creation::<Testnet3>(&avail_wallet.private_key).await?;

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
        println!("Backup is true");
        let data = get_and_store_all_data().await?;
        process_private_tokens(data)?;
        // get last_sync_height and last_backup_timestamp from the server and store it in the local storage
        let sync_height = get_sync_height(avail_wallet.get_address().to_string()).await?;
        let backup_ts = get_backup_timestamp(avail_wallet.get_address().to_string()).await?;
        let last_sync = sync_height.parse::<u32>().unwrap();
        let backup = backup_ts.to_string().parse::<DateTime<Utc>>().unwrap();
        update_last_sync(last_sync)?;
        update_last_backup_sync(backup)?;
    }

    Ok(())
}

// write a test for a custom function

#[cfg(test)]
#[tokio::test]
async fn test_fn() {
    use chrono::Utc;
    let api_client = crate::api::aleo_client::setup_local_client::<Testnet3>();

    let sender_address =
        crate::services::local_storage::persistent_storage::get_address::<Testnet3>().unwrap();

    let private_key = crate::services::local_storage::utils::get_private_key::<Testnet3>(Some(
        "tylerDurden@0xf5".to_string(),
    ))
    .unwrap();

    //extend session auth
    let _session_task = get_session_after_creation::<Testnet3>(&private_key)
        .await
        .unwrap();
    crate::api::backup_recovery::update_sync_height("0x123".to_string(), "8000".to_string())
        .await
        .unwrap();
    let sync_height = get_sync_height("0x123".to_string()).await.unwrap();
    let backup_ts = get_backup_timestamp("0x123".to_string()).await.unwrap();
    let last_sync = sync_height.parse::<u32>().unwrap();
    let backup = backup_ts.to_string().parse::<DateTime<Utc>>().unwrap();
    println!("Last Sync: {:?}", last_sync);
    println!("Last Backup Sync: {:?}", backup);
    update_last_sync(last_sync).unwrap();
    update_last_backup_sync(backup.into()).unwrap();
}
