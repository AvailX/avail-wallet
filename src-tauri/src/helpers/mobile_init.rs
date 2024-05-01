use avail_common::aleo_tools::program_manager::TransferType;
use avail_common::aleo_tools::test_utils::HELLO_PROGRAM;
use avail_common::converters::messages::{field_to_fields, utf8_string_to_bits};
use avail_common::errors::AvailResult;
use avail_common::models::constants::TESTNET_ADDRESS;
use avail_common::models::encrypted_data::EncryptedDataTypeCommon;
use avail_common::models::mobile_prover::{self, ProverRequest};
use avail_common::models::user::User;
use avail_common::service_clients::SESSION;
use snarkvm::prelude::Program;

use chrono::{DateTime, Local};
use log::info;
use snarkvm::circuit::Aleo;
use snarkvm::console::network::Testnet3;
use snarkvm::ledger::query::{self, Query};
use snarkvm::ledger::store::helpers::memory::BlockMemory;
use snarkvm::ledger::transactions::ConfirmedTransaction;
use snarkvm::prelude::{
    Address, Ciphertext, Entry, Execution, Field, GraphKey, Identifier, Itertools, Literal,
    Network, Output, Plaintext, ProgramID, Record, RecordType, Transaction, Transition, Value,
    ViewKey,
};
use snarkvm::synthesizer::program::{Command, Instruction, ProgramCore};
use snarkvm::utilities::{ToBits, ToBytes};
use std::collections::HashMap;
use std::ops::Sub;
use std::str::FromStr;
use tauri::{Manager, Window};

use crate::api::user::{create_user, get_user};
use crate::api::{
    aleo_client::{setup_client, setup_local_client},
    encrypted_data::{post_encrypted_data, send_transaction_in},
    fee::{create_record, fetch_record},
    mobile_prover_service::delegate_execution,
    user::name_to_address,
};

use crate::helpers::validation::validate_address_bool;
use crate::models::event::EventTransition;
use crate::models::pointers::{
    deployment::DeploymentPointer,
    message::TransactionMessage,
    record::AvailRecord,
    transaction::{ExecutedTransition, TransactionPointer},
};
use crate::models::storage::languages::Languages;
use crate::models::wallet::BetterAvailWallet;
use crate::models::wallet_connect::balance::Balance;

use crate::models::wallet_connect::records::{GetRecordsRequest, RecordFilterType, RecordsFilter};
use crate::services::account::key_management::key_controller::{
    iOSKeyController, macKeyController, KeyController,
};
use crate::services::authentication::session::{get_session, get_session_after_creation};
use crate::services::local_storage::encrypted_data::{
    get_encrypted_data_by_flavour, initialize_encrypted_data_table,
};
use crate::services::local_storage::persistent_storage::initial_user_preferences;
use crate::services::local_storage::tokens::{
    add_balance, get_balance, get_program_id_for_token, if_token_exists, init_token,
    init_tokens_table,
};
use crate::services::local_storage::{
    encrypted_data::{
        store_encrypted_data, update_encrypted_data_by_id, update_encrypted_data_synced_on_by_id,
        update_encrypted_transaction_confirmed_by_id, update_encrypted_transaction_state_by_id,
    },
    persistent_storage::{
        get_address, get_address_string, get_backup_flag, get_network, get_username,
    },
    session::view::VIEWSESSION,
    storage_api::{
        deployment::get_deployment_pointer,
        records::{
            check_if_record_exists, encrypt_and_store_records, get_record_pointers,
            update_record_spent_local, update_records_spent_backup,
        },
        transaction::get_transaction_pointer,
    },
};
use crate::services::record_handling::transfer::find_confirmed_block_height;
use avail_common::{
    aleo_tools::program_manager::{Credits, ProgramManager},
    errors::{AvailError, AvailErrorType},
    models::encrypted_data::{EncryptedData, EventTypeCommon, RecordTypeCommon, TransactionState},
    models::{fee_request::FeeRequest, network::SupportedNetworks},
};
use chrono::{Datelike, Timelike};
use snarkvm::prelude::PrivateKey;
use std::error::Error;
use std::fmt::Write as FmtWrite;
use std::fs::File;
use std::io::Write;

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
}

pub fn log(window: Window, content: &str) -> AvailResult<()> {
    // let current_datetime = Local::now();
    // let filename = format!(
    //     "avail_mobile_log_{}-{}-{}_{}-{}-{}.txt",
    //     current_datetime.year(),
    //     current_datetime.month(),
    //     current_datetime.day(),
    //     current_datetime.hour(),
    //     current_datetime.minute(),
    //     current_datetime.second()
    // );

    // let mut file = File::create(filename)?;
    // // Write the content to the file
    // file.write_all(content.as_bytes())?;
    // std::thread::spawn(move || loop {
    //     window
    //         .emit(
    //             "consolelog",
    //             Payload {
    //                 message: content.into(),
    //             },
    //         )
    //         .unwrap();
    // });

    Ok(())
}

pub async fn test_transfer_public_mobile() -> AvailResult<String> {
    // log("Transfer Public Mobile");
    let api_client = setup_client::<Testnet3>()?;

    // log("API Client Setup");
    let private_key = PrivateKey::<Testnet3>::from_str(
        "APrivateKey1zkpEa57WrhvNVagKkja6mzU5waS4xFXidKtBNMweupft7JX",
    )
    .unwrap();
    // log(format!("Private Key: {:?}", private_key.to_string()).as_str());
    let mut program_manager =
        ProgramManager::<Testnet3>::new(Some(private_key), None, Some(api_client.clone()), None)
            .unwrap();

    let program_id = format!("credits.aleo");

    let recipient = Address::<Testnet3>::from_str(
        "aleo17uwd9yfdlusx2u2pr2nummcx8gst694w2nfm3hxkfeccqrv9yczqnvhq0c",
    )
    .unwrap();
    let amount = 100000000;

    // let transaction_id = program_manager.transfer(
    //     100000000,
    //     0,
    //     recipient,
    //     TransferType::Public,
    //     None,
    //     None,
    //     None,
    //     &program_id,
    // )?;
    // Ok(transaction_id.to_string())
    let session_get = get_session(Some("tylerDurden@0xf5".to_string())).await?;
    println!("Session: {:?}", session_get);
    SESSION.set_session_token(session_get);
    // let authorization = {
    //     let rng = &mut rand::thread_rng();
    //     let query: Query<Testnet3, BlockMemory<Testnet3>> = Query::from(api_client.base_url());

    //     // Initialize a VM
    //     let store = snarkvm::ledger::store::ConsensusStore::<
    //         Testnet3,
    //         snarkvm::ledger::store::helpers::memory::ConsensusMemory<Testnet3>,
    //     >::open(None)?;
    //     let vm = snarkvm::synthesizer::VM::from(store)?;
    //     let transfer_type = TransferType::Public;
    //     // Prepare the inputs for a transfer.
    //     let transfer_function = "transfer_public";

    //     let inputs = vec![
    //         Value::from_str(&recipient.to_string())?,
    //         Value::from_str(&format!("{}u64", amount))?,
    //     ];

    //     // Create a new transaction.
    //     vm.authorize(
    //         &private_key,
    //         program_id,
    //         transfer_function,
    //         inputs.iter(),
    //         rng,
    //     )?
    // };
    // println!("Auth: {:?}", authorization);
    // let auth_bytes = ProverRequest::to_bytes_auth_object(authorization).await?;
    // let prover_request = ProverRequest::new(
    //     "aleo9789517609".to_string(),
    //     auth_bytes,
    //     SupportedNetworks::Testnet3,
    //     None,
    // );
    // let execution = delegate_execution(prover_request).await?;
    // let res = program_manager
    //     .transfer(
    //         amount,
    //         10000u64,
    //         recipient,
    //         TransferType::Public,
    //         None,
    //         None,
    //         None,
    //         &program_id,
    //         TESTNET_ADDRESS.to_string(),
    //         SupportedNetworks::Testnet3,
    //         true,
    //     )
    //     .await?;
    const RECORD_MAINNET: &str = r"{owner:aleo18lmhpa6znqe4eqgnhqccze9awqtutlkh0aukd05k7pl52uu8cvysxqwurp.private,microcredits:5000000u64.private,_nonce:8225702631067250884087834370560624180419459511593007256346751473925039784459group.public}";

    let fee_record =
        Some(Record::<Testnet3, Plaintext<Testnet3>>::from_str(RECORD_MAINNET).unwrap()); //Some(Record::from_str(r"{owner: aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px.private,microcredits: 1000000u64.private,_nonce: 6359981118440619636307465025861597379883101966015424940295774216783421394007group.public}").unwrap());

    let res = program_manager
        .execute_program(
            "credits.aleo",
            "transfer_public",
            vec![recipient.to_string(), "10000u64".to_string()].iter(),
            10000u64,
            fee_record,
            None,
            TESTNET_ADDRESS.to_string(),
            SupportedNetworks::Testnet3,
            true,
        )
        .await?;

    // program_manager.broadcast_transaction(execution.clone())?;

    Ok(res.to_string())
}
#[tauri::command(rename_all = "snake_case")]

pub fn test_snarkvm_mobile() -> AvailResult<String> {
    let api_client = setup_local_client::<Testnet3>();
    let private_key =
        PrivateKey::<Testnet3>::from_str(avail_common::models::constants::TESTNET_PRIVATE_KEY)
            .unwrap();
    let block_height = api_client.latest_block().unwrap();
    let rng = &mut rand::thread_rng();

    let msg = utf8_string_to_bits("TESTING AVAIL MOBILE SNARKVM");
    let msg_field = Testnet3::hash_bhp512(&msg)?;
    let msg = field_to_fields(&msg_field)?;

    let signature = private_key.sign(&msg, rng)?;

    Ok(format!(
        "PK : {} |||| Block Height: {} |||| api: {} |||| Sign : {:?}",
        private_key,
        block_height.height(),
        api_client.base_url(),
        signature.to_string()
    )
    .to_string())
}

#[tauri::command(rename_all = "snake_case")]
pub fn test_snarkvm_mobile_deploy() -> AvailResult<String> {
    let api_client = setup_local_client::<Testnet3>();
    let private_key =
        PrivateKey::<Testnet3>::from_str(avail_common::models::constants::TESTNET_PRIVATE_KEY)?;
    let mut program_manager =
        ProgramManager::<Testnet3>::new(Some(private_key), None, Some(api_client.clone()), None)?;
    let hello_program = Program::<Testnet3>::from_str(HELLO_PROGRAM)?;
    program_manager.add_program(&hello_program);
    let program_id = "hello.aleo";
    let deployement_id = program_manager.deploy_program(program_id, 10000u64, None, None)?;

    Ok(deployement_id.to_string())
}

#[tauri::command(rename_all = "snake_case")]
pub async fn init_user_mobile() -> AvailResult<String> {
    let avail_wallet = BetterAvailWallet::<Testnet3>::from_seed_phrase(
        "unusual squeeze advance legend sign drink buffalo until craft record carpet shuffle
        ",
        Languages::to_bip39_language(&Languages::English),
    )
    .unwrap();

    // let key_manager = {
    //     #[cfg(target_os = "macos")]
    //     {
    //         macKeyController
    //     }
    //     #[cfg(target_os = "windows")]
    //     {
    //         windowsKeyController
    //     }
    //     #[cfg(target_os = "linux")]
    //     {
    //         linuxKeyController
    //     }
    //     #[cfg(target_os = "android")]
    //     {
    //         AndroidKeyController {}
    //     }
    //     #[cfg(target_os = "ios")]
    //     {
    //         iOSKeyController {}
    //     }
    // };

    // key_manager
    //     .store_key("tylerDurden@0xf5", &avail_wallet)
    //     .unwrap();

    get_session_after_creation::<Testnet3>(&avail_wallet.private_key)
        .await
        .unwrap();

    let (username, tag, backup) = match get_user().await {
        Ok(user) => (user.username, user.tag, user.backup),
        Err(_) => {
            let request = User {
                username: None,
                address: avail_wallet.get_address(),
                tag: None,
                backup: false,
            };
            create_user(request).await.unwrap();
            (None, None, false)
        }
    };

    let _v_key = avail_wallet.view_key.to_bytes_le().unwrap();

    //let mut last_sync = 0u32;

    initial_user_preferences(
        true,
        username,
        tag,
        true,
        backup,
        false,
        avail_wallet.get_address(),
        Languages::English,
    )
    .unwrap();

    init_tokens_table().unwrap();

    // some function

    initialize_encrypted_data_table().unwrap();
    VIEWSESSION
        .set_view_session(&avail_wallet.get_view_key())
        .unwrap();
    Ok(format!(
        "User Initialized with address: {} || PK: {}",
        avail_wallet.get_address(),
        avail_wallet.get_private_key()
    ))
}

// write a test case for the test_transfer_public_mobile function

#[tokio::test]
async fn test_mobile() {
    // let st = get_session(Some("tylerDurden@0xf5".to_string()))
    //     .await
    //     .unwrap();
    // SESSION.set_session_token(st);

    let result = test_transfer_public_mobile().await.unwrap();
    println!("{:?}", result);
}

#[tokio::test]
async fn test_init_user() {
    let avail_wallet = BetterAvailWallet::<Testnet3>::from_seed_phrase(
        "unusual squeeze advance legend sign drink buffalo until craft record carpet shuffle
        ",
        Languages::to_bip39_language(&Languages::English),
    )
    .unwrap();

    // let key_manager = {
    //     #[cfg(target_os = "macos")]
    //     {
    //         macKeyController
    //     }
    //     #[cfg(target_os = "windows")]
    //     {
    //         windowsKeyController
    //     }
    //     #[cfg(target_os = "linux")]
    //     {
    //         linuxKeyController
    //     }
    //     #[cfg(target_os = "android")]
    //     {
    //         AndroidKeyController {}
    //     }
    //     #[cfg(target_os = "ios")]
    //     {
    //         iOSKeyController {}
    //     }
    // };

    // key_manager
    //     .store_key("tylerDurden@0xf5", &avail_wallet)
    //     .unwrap();

    get_session_after_creation::<Testnet3>(&avail_wallet.private_key)
        .await
        .unwrap();

    let (username, tag, backup) = match get_user().await {
        Ok(user) => (user.username, user.tag, user.backup),
        Err(_) => {
            let request = User {
                username: None,
                address: avail_wallet.get_address(),
                tag: None,
                backup: false,
            };
            create_user(request).await.unwrap();
            (None, None, false)
        }
    };

    let _v_key = avail_wallet.view_key.to_bytes_le().unwrap();

    //let mut last_sync = 0u32;

    initial_user_preferences(
        true,
        username,
        tag,
        true,
        backup,
        false,
        avail_wallet.get_address(),
        Languages::English,
    )
    .unwrap();

    init_tokens_table().unwrap();

    // some function

    initialize_encrypted_data_table().unwrap();
    VIEWSESSION
        .set_view_session(&avail_wallet.get_view_key())
        .unwrap();
}
