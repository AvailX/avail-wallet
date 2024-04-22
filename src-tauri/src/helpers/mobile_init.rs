use avail_common::aleo_tools::test_utils::HELLO_PROGRAM;
use avail_common::converters::messages::{field_to_fields, utf8_string_to_bits};
use avail_common::errors::AvailResult;
use snarkvm::prelude::Program;

use avail_common::aleo_tools::program_manager::TransferType;
use avail_common::models::encrypted_data::EncryptedDataTypeCommon;
use avail_common::models::mobile_prover::{self, ProverRequest};

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
use snarkvm::utilities::ToBits;
use std::collections::HashMap;
use std::ops::Sub;
use std::str::FromStr;
use tauri::{Manager, Window};

use crate::api::client::SESSION;
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
use crate::models::wallet_connect::balance::Balance;

use crate::models::wallet_connect::records::{GetRecordsRequest, RecordFilterType, RecordsFilter};
use crate::services::authentication::session::get_session;
use crate::services::local_storage::encrypted_data::get_encrypted_data_by_flavour;
use crate::services::local_storage::tokens::{
    add_balance, get_balance, get_program_id_for_token, if_token_exists, init_token,
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

#[tauri::command(rename_all = "snake_case")]
pub async fn test_transfer_public_mobile() -> AvailResult<String> {
    // log("Transfer Public Mobile");
    let api_client = setup_local_client::<Testnet3>();

    // log("API Client Setup");
    let private_key =
        PrivateKey::<Testnet3>::from_str(avail_common::models::constants::TESTNET_PRIVATE_KEY)
            .unwrap();
    // log(format!("Private Key: {:?}", private_key.to_string()).as_str());
    let program_manager =
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
    SESSION.set_session_token(session_get);
    let authorization = {
        let rng = &mut rand::thread_rng();
        let query: Query<Testnet3, BlockMemory<Testnet3>> = Query::from(api_client.base_url());

        // Initialize a VM
        let store = snarkvm::ledger::store::ConsensusStore::<
            Testnet3,
            snarkvm::ledger::store::helpers::memory::ConsensusMemory<Testnet3>,
        >::open(None)?;
        let vm = snarkvm::synthesizer::VM::from(store)?;
        let transfer_type = TransferType::Public;
        // Prepare the inputs for a transfer.
        let transfer_function = "transfer_public";

        let inputs = vec![
            Value::from_str(&recipient.to_string())?,
            Value::from_str(&format!("{}u64", amount))?,
        ];

        // Create a new transaction.
        vm.authorize(
            &private_key,
            program_id,
            transfer_function,
            inputs.iter(),
            rng,
        )?
    };
    println!("Auth: {:?}", authorization);
    let auth_bytes = ProverRequest::to_bytes_auth_object(authorization).await?;
    let prover_request = ProverRequest::new(
        "aleo9789517609".to_string(),
        auth_bytes,
        SupportedNetworks::Testnet3,
        None,
    );
    let execution = delegate_execution(prover_request).await?;

    // program_manager.broadcast_transaction(execution.clone())?;

    Ok(execution.to_string())
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

// write a test case for the test_transfer_public_mobile function

#[tokio::test]
async fn test_mobile() {
    let result = test_transfer_public_mobile().await.unwrap();
    println!("{:?}", result);
}
