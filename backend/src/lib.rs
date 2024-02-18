pub mod api;
pub mod helpers;
pub mod models;
pub mod services;

use services::account::generation::create_seed_phrase_wallet;
use services::account::generation::import_wallet;
use services::account::phrase_recovery::recover_wallet_from_seed_phrase;
use services::account::utils::open_url;
use services::authentication::session::get_session;
use services::local_storage::persistent_storage::{
    get_address_string, get_auth_type, get_backup_flag, get_language, get_last_sync, get_network,
    get_username, update_language,
};

#[cfg(any(target_os = "macos", target_os = "ios"))]
use services::account::key_management::ios::prepare_context;

use api::user::{update_backup_flag, update_username};
use services::local_storage::{
    encrypted_data::get_and_store_all_data,
    tokens::get_stored_tokens,
    utils::{
        delete_local_for_recovery, delete_util, get_private_key_tauri, get_seed_phrase,
        get_view_key_tauri,
    },
};

// record handliong services
// use crate::services::record_handling::utils::get_all_nft_data;
use services::record_handling::{
    sync::{blocks_sync, sync_backup, txs_sync},
    transfer::{pre_install_inclusion_prover, transfer},
};
// wallet connect services
use crate::services::wallet_connect_api::{
    decrypt_records, get_avail_event, get_avail_events, get_balance, get_event, get_events,
    get_records, get_succinct_avail_event, get_succinct_avail_events, request_create_event, sign,
    verify,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(target_os = "macos")]
    tauri::Builder::default()
        .plugin(tauri_plugin_deep_link::init())
        .setup(|app| {
            let handle = app.handle().clone();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            /* Account Management */
            create_seed_phrase_wallet,
            recover_wallet_from_seed_phrase,
            update_username,
            import_wallet,
            get_username,
            delete_util,
            delete_local_for_recovery,
            get_private_key_tauri,
            get_view_key_tauri,
            get_seed_phrase,
            get_and_store_all_data,
            get_address_string,
            get_last_sync,
            get_backup_flag,
            update_backup_flag,
            get_network,
            get_language,
            update_language,
            get_stored_tokens,
            open_url,
            /* Authentication */
            get_session,
            get_auth_type,
            prepare_context,
            /* Scanning */
            txs_sync,
            blocks_sync,
            sync_backup,
            /* Avail Services */
            get_avail_event,
            get_avail_events,
            // get_all_nft_data,
            transfer,
            /* --Wallet Connect Api */
            get_event,
            get_events,
            get_records,
            request_create_event,
            sign,
            decrypt_records,
            get_balance,
            get_succinct_avail_event,
            get_succinct_avail_events,
            verify,
            /* Aleo Helpers */
            pre_install_inclusion_prover
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    #[cfg(target_os = "linux")]
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle().clone();

            let _ = tauri_plugin_deep_link::register("avail", move |request| {
                dbg!(&request);
                handle.emit("wc-request-received", request).unwrap();
            });

            if let Some(url) = std::env::args().nth(1) {
                app.emit("scheme-request-received", url).unwrap();
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            /* Account Management */
            create_seed_phrase_wallet,
            recover_wallet_from_seed_phrase,
            update_username,
            get_username,
            delete_util,
            delete_local_for_recovery,
            get_private_key_tauri,
            get_view_key_tauri,
            get_seed_phrase,
            get_and_store_all_data,
            get_address_string,
            get_last_sync,
            import_wallet,
            get_backup_flag,
            update_backup_flag,
            get_network,
            get_language,
            update_language,
            get_stored_tokens,
            open_url,
            /* Authentication */
            get_session,
            get_auth_type,
            /* Scanning */
            txs_sync,
            blocks_sync,
            sync_backup,
            /* Avail Services */
            get_avail_event,
            get_avail_events,
            transfer,
            /* --Wallet Connect Api */
            get_event,
            get_events,
            get_records,
            request_create_event,
            sign,
            decrypt_records,
            get_balance,
            get_succinct_avail_event,
            get_succinct_avail_events,
            verify,
            /* Aleo Helpers */
            pre_install_inclusion_prover
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    #[cfg(target_os = "windows")]
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle().clone();

            let _ = tauri_plugin_deep_link::register("avail", move |request| {
                dbg!(&request);
                handle.emit("wc-request-received", request).unwrap();
            });

            if let Some(url) = std::env::args().nth(1) {
                app.emit("scheme-request-received", url).unwrap();
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            /* Account Management */
            create_seed_phrase_wallet,
            recover_wallet_from_seed_phrase,
            update_username,
            get_username,
            delete_util,
            delete_local_for_recovery,
            get_private_key_tauri,
            get_view_key_tauri,
            get_seed_phrase,
            get_and_store_all_data,
            get_address_string,
            get_last_sync,
            import_wallet,
            get_backup_flag,
            update_backup_flag,
            get_network,
            get_language,
            update_language,
            get_stored_tokens,
            open_url,
            /* Authentication */
            get_session,
            get_auth_type,
            /* Scanning */
            txs_sync,
            blocks_sync,
            sync_backup,
            /* Avail Services */
            get_avail_event,
            get_avail_events,
            transfer,
            /* --Wallet Connect Api */
            get_event,
            get_events,
            get_records,
            request_create_event,
            sign,
            decrypt_records,
            get_balance,
            get_succinct_avail_event,
            get_succinct_avail_events,
            verify,
            /* Aleo Helpers */
            pre_install_inclusion_prover
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
