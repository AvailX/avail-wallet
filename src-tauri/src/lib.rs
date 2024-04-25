pub mod api;
pub mod helpers;
pub mod models;
pub mod services;

use crate::helpers::mobile_init::init_user_mobile;
use crate::helpers::mobile_init::test_snarkvm_mobile;
use crate::helpers::mobile_init::test_snarkvm_mobile_deploy;
use crate::helpers::mobile_init::test_transfer_public_mobile;
use crate::services::record_handling::utils::get_all_nft_data;
use api::user::{update_backup_flag, update_username};
use log::LevelFilter;
use log::{error, info};
use services::account::generation::create_seed_phrase_wallet;
use services::account::generation::import_wallet;
use services::account::phrase_recovery::recover_wallet_from_seed_phrase;
use services::account::utils::{open_url, os_type};
use services::authentication::session::get_session;
use services::local_storage::persistent_storage::{
    get_address_string, get_auth_type, get_backup_flag, get_language, get_last_sync, get_network,
    get_username, update_language,
};
use services::local_storage::{
    encrypted_data::get_and_store_all_data,
    tokens::get_stored_tokens,
    utils::{
        delete_local_for_recovery, delete_util, get_private_key_tauri, get_seed_phrase,
        get_view_key_tauri,
    },
};
use simplelog::*;
use std::fs::File;
use std::io::prelude::*;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread;
use std::time::Duration; // Add the missing import statement for simplelog

// record handliong services
use services::record_handling::{
    sync::{blocks_sync, sync_backup, txs_sync},
    transfer::{pre_install_inclusion_prover, transfer},
};
use simplelog::CombinedLogger;
use simplelog::WriteLogger; // Add the missing import statement for WriteLogger and LevelFilter
use tauri::Config;
use tauri::Manager;
use tauri_plugin_deep_link::DeepLinkExt; // Add the missing import statement for CombinedLogger // Add the missing import statement for the transfer function
                                         // wallet connect services
use crate::services::wallet_connect_api::{
    decrypt_records, get_avail_event, get_avail_events, get_balance, get_event, get_events,
    get_records, get_succinct_avail_event, get_succinct_avail_events, request_create_event, sign,
    verify,
};
#[derive(Clone, serde::Deserialize, serde::Serialize)]
struct DeepLinkPayload {
    uri: String,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // let devtools = tauri_plugin_devtools::init();
    tauri::Builder::default()
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_process::init())
        // .plugin(devtools)
        .setup(|app| {
            #[cfg(desktop)]
            let handle = app.handle().clone();

            #[cfg(desktop)]
            app.handle()
                .plugin(tauri_plugin_updater::Builder::new().build())?;

            #[cfg(desktop)]
            app.listen("deep-link://new-url", move |event| {
                deep_link_print(event, handle.clone())
            });

            // Remove the on_scheme method call
            #[cfg(desktop)]
            println!("Deep link: {:?}", app.deep_link().get_current());
            // NOTE: Updater is only supported on desktop platforms

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
            os_type,
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
            get_all_nft_data,
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
            pre_install_inclusion_prover,
            test_transfer_public_mobile,
            test_snarkvm_mobile,
            test_snarkvm_mobile_deploy,
            init_user_mobile,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
fn deep_link_print(event: tauri::Event, handle: tauri::AppHandle) {
    let uri = event.payload().to_string();
    handle
        .emit("deep-link-wc", DeepLinkPayload { uri })
        .unwrap();
}
