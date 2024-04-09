use avail_common::errors::AvailResult;

use avail_common::aleo_tools::program_manager::TransferType;
use avail_common::models::encrypted_data::EncryptedDataTypeCommon;
use chrono::{DateTime, Local};
use snarkvm::circuit::Aleo;
use snarkvm::console::network::Testnet3;
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

use crate::api::{
    aleo_client::{setup_client, setup_local_client},
    encrypted_data::{post_encrypted_data, send_transaction_in},
    fee::{create_record, fetch_record},
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
use snarkvm::prelude::PrivateKey;

#[tauri::command(rename_all = "snake_case")]
pub async fn test_transfer_public_mobile() -> AvailResult<String> {
    let api_client = setup_local_client::<Testnet3>();
    let private_key =
        PrivateKey::<Testnet3>::from_str(avail_common::models::constants::TESTNET_PRIVATE_KEY)
            .unwrap();
    println!("Private Key: {:?}", private_key.to_string());
    let program_manager =
        ProgramManager::<Testnet3>::new(Some(private_key), None, Some(api_client.clone()), None)
            .unwrap();

    let program_id = format!("credits.aleo");

    let recipient = Address::<Testnet3>::from_str(
        "aleo1x2s08a2jyvd5aq29dwexqfscqrz7fgssrkhwk7ppselp2292zqfqakg7gn",
    )
    .unwrap();

    let transaction_id = program_manager
        .transfer(
            100000000,
            0,
            recipient,
            TransferType::Public,
            None,
            None,
            None,
            &program_id,
        )
        .unwrap();
    Ok(transaction_id.to_string())
}
