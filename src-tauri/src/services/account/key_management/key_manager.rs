use std::{ops::Sub, path::PathBuf};

use crate::models::stronghold::{client::Client, vault::Vault, Stronghold};
use app_dirs::*;
use avail_common::errors::{AvailError, AvailErrorType, AvailResult};
use serde::{Deserialize, Serialize};
use snarkvm::{
    prelude::{Address, Network},
    utilities::FromBytes,
    console::account::Signature
};
use snarkvm::ledger::Transaction;
use snarkvm::prelude::{anyhow, Identifier, Plaintext, ProgramID, Record, Value};
use tauri_plugin_aleo_stronghold::{
    create_client, initialize, load_client, BytesDto, PasswordHashFunction, StrongholdCollection,
};

pub async fn init_stronghold(
    password: &str,
) -> AvailResult<(StrongholdCollection, Stronghold, Client)> {
    let path = app_root(
        AppDataType::UserData,
        &AppInfo {
            name: "avail_wallet",
            author: "Avail",
        },
    )?;

    let pbkdf = PasswordHashFunction(Box::new(|password| {
        // Hash the password here with e.g. argon2, blake2b or any other secure algorithm
        // Here is an example implementation using the `rust-argon2` crate for hashing the password

        use argon2::{hash_raw, Config, Variant, Version};

        let config = Config {
            lanes: 4,
            mem_cost: 10_000,
            time_cost: 10,
            variant: Variant::Argon2id,
            version: Version::Version13,
            ..Default::default()
        };

        let salt = "your-salt".as_bytes();

        let key = hash_raw(password.as_ref(), salt, &config).expect("failed to hash password");

        key.to_vec()
    }));

    let vault_path = format! {"{}/vault.hold",path.to_str().unwrap()};
    let vault_path_buf = PathBuf::from(vault_path.clone());
    let hold = StrongholdCollection::default();

    let stronghold =
        match initialize(&hold, pbkdf, vault_path_buf.clone(), password.to_string()).await {
            Ok(_) => Ok(Stronghold::new(&vault_path)),
            Err(e) => Err(AvailError::new(
                AvailErrorType::Internal,
                e.to_string(),
                "Failed to initiliaze key stronghold".to_string(),
            )),
        }?;

    let client_name = BytesDto::Text("com.avail.stronghold".to_string());

    let client = match load_client(&hold, vault_path_buf.clone(), client_name).await {
        Ok(x) => {
            println!("client loaded");
            Ok(Client::new(
                &vault_path,
                BytesDto::Text("com.avail.stronghold".to_string()),
            ))
        }
        Err(_) => match create_client(
            &hold,
            vault_path_buf,
            BytesDto::Text("com.avail.stronghold".to_string()),
        )
        .await
        {
            Ok(_) => {
                println!("client created");
                Ok(Client::new(
                    &vault_path,
                    BytesDto::Text("com.avail.stronghold".to_string()),
                ))
            }
            Err(e) => Err(AvailError::new(
                AvailErrorType::Internal,
                e.to_string(),
                "Failed to create client".to_string(),
            )),
        },
    }?;

    Ok((hold, stronghold, client))
}

pub async fn generate_seed_phrase<N: Network>(password: &str) -> AvailResult<String> {
    let (hold, stronghold, client) = init_stronghold(password).await?;

    let vault = Vault::new(
        stronghold.path.as_str(),
        client.name,
        BytesDto::Text("bip39".to_string()),
    );

    let record_path = "bip39";

    let result = vault.generate_bip39::<N>(&hold, record_path).await?;

    let mnemonic = String::from_utf8(result)?;
    stronghold.save(&hold).await?;
    stronghold.destroy(&hold).await?;
    Ok(mnemonic)
}

pub async fn recover_seed_phrase<N: Network>(mnemonic: String, password: &str) -> AvailResult<()> {
    let (hold, stronghold, client) = init_stronghold(password).await?;

    let vault = Vault::new(
        stronghold.path.as_str(),
        client.name,
        BytesDto::Text("bip39".to_string()),
    );

    let record_path = "bip39";

    let result = vault.recover_bip39::<N>(&hold, record_path, mnemonic).await?;

    println!("Seed bytes: {:?}", result);
    stronghold.save(&hold).await?;
    stronghold.destroy(&hold).await?;
    Ok(())
}

/* ALEO KEY API */

pub async fn derive_aleo_master_key<N: Network>(password: &str) -> AvailResult<()> {
    let (hold, stronghold, client) = init_stronghold(password).await?;

    let vault = Vault::new(
        stronghold.path.as_str(),
        client.name.clone(),
        BytesDto::Text("slip10".to_string()),
    );

    let key_path = "m/44'/0'/0'/0'";

    let cc = vault.derive_slip10_master::<N>(&hold, key_path).await?;
    store_chain_code(0u32, cc, client, &hold).await?;

    stronghold.save(&hold).await?;
    stronghold.destroy(&hold).await?;
    Ok(())
}

pub async fn derive_aleo_key<N: Network>(
    password: &str,
    account_index: u32,
) -> AvailResult<String> {
    let (hold, stronghold, client) = init_stronghold(password).await?;

    let vault = Vault::new(
        stronghold.path.as_str(),
        client.name.clone(),
        BytesDto::Text("slip10".to_string()),
    );

    let key_path = format!("m/44'/0'/{}'/0'", account_index);
    let chain_code = get_chain_code(account_index.sub(1), client.clone(), &hold).await?;

    let cc = vault
        .clone()
        .derive_slip10::<N>(&hold, &key_path, &chain_code)
        .await?;
    store_chain_code(account_index, cc, client, &hold).await?;

    let address = vault.get_address::<N>(&hold, &key_path).await?;
    let aleo_address = Address::<N>::from_bytes_le(&address)?.to_string();

    stronghold.save(&hold).await?;
    stronghold.destroy(&hold).await?;
    Ok(aleo_address)
}

pub async fn delete_aleo_key(password: &str, account_index: u32) -> AvailResult<()> {
    let (hold, stronghold, client) = init_stronghold(password).await?;

    let vault = Vault::new(
        stronghold.path.as_str(),
        client.name,
        BytesDto::Text("slip10".to_string()),
    );

    let key_path = format!("m/44'/0'/{}'/0'", account_index);

    vault.remove_secret(&hold, &key_path).await?;

    stronghold.save(&hold).await?;
    stronghold.destroy(&hold).await?;
    Ok(())
}

pub async fn aleo_sign<N: Network>(
    password: &str,
    account_index: u32,
    message: &str,
) -> AvailResult<Signature<N>> {
    let (hold, stronghold, client) = init_stronghold(password).await.unwrap();
    let vault = Vault::new(
        stronghold.path.as_str(),
        client.name,
        BytesDto::Text("slip10".to_string()),
    );
    let key_path = format!("m/44'/0'/{}'/0'", account_index);

    let res = vault
        .aleo_sign::<N>(&hold, message, &key_path)
        .await
        .unwrap();

    Signature::<N>::from_bytes_le(&res).map_err(AvailError::from)
}

pub async fn aleo_execute<N: Network>(
    password: &str,
    account_index: u32,
    program_id: ProgramID<N>,
    function_name: Identifier<N>,
    inputs: Vec<Value<N>>,
    priority_fee_in_microcredits: u64,
    fee_record: Option<Record<N, Plaintext<N>>>,
    base_url: String,
) -> AvailResult<Transaction<N>> {
    let (hold, stronghold, client) = init_stronghold(password).await.unwrap();
    let vault = Vault::new(
        stronghold.path.as_str(),
        client.name,
        BytesDto::Text("slip10".to_string()),
    );
    // Preparing inputs for key derivation and transaction
    let key_path = format!("m/44'/0'/{}'/0'", account_index);

    // Execute transaction with stronghold vault
    let res = vault
        .aleo_execute::<N>(
            &hold,
            &key_path,
            program_id,
            function_name,
            inputs,
            priority_fee_in_microcredits,
            fee_record,
            base_url,
        )
        .await
        .unwrap();

    Transaction::from_bytes_le(&res).map_err(AvailError::from)
}

/* Chain Code Api */

async fn store_chain_code(
    account_index: u32,
    chain_code: Vec<u8>,
    client: Client,
    hold: &StrongholdCollection,
) -> AvailResult<()> {
    let store = client.get_store();
    store
        .insert(account_index.to_string(), chain_code, hold)
        .await?;
    Ok(())
}

async fn get_chain_code(
    account_index: u32,
    client: Client,
    hold: &StrongholdCollection,
) -> AvailResult<Vec<u8>> {
    let store = client.get_store();
    let chain_code = store.get(account_index.to_string(), hold).await?;

    match chain_code {
        Some(cc) => Ok(cc),
        None => Err(AvailError::new(
            AvailErrorType::Internal,
            "Chain code not found".to_string(),
            "Chain code not found".to_string(),
        )),
    }
}

async fn remove_chain_code(
    account_index: u32,
    client: Client,
    hold: &StrongholdCollection,
) -> AvailResult<()> {
    let store = client.get_store();
    store.remove(account_index.to_string(), hold).await?;
    Ok(())
}

#[cfg(test)]
mod test_helpers {
    use super::*;
    use snarkvm::prelude::{anyhow, TestnetV0, Transaction, Value};

    #[tokio::test]
    async fn test_generate_bip39() {
        type N = TestnetV0;

        let password = "password";
        let mnemonic = generate_seed_phrase::<N>(password).await.unwrap();
        println!("{}", mnemonic);


    }

    #[tokio::test]
    async fn test_recover_bip39() {
        type N = TestnetV0;

        let password = "password";
        let mnemonic = "";
        let res = recover_seed_phrase::<N>(mnemonic.to_string(), password).await;
        assert!(res.is_ok());
    }

    #[tokio::test]
    async fn derive_aleo_master() {
        type N = TestnetV0;

        let password = "password";
        derive_aleo_master_key::<N>(password).await.unwrap();
    }

    #[tokio::test]
    async fn derive_aleo_slip10_key() {
        type N = TestnetV0;

        let password = "password";
        let account_index = 1;
        let address = derive_aleo_key::<N>(password, account_index).await.unwrap();
        let address2 = derive_aleo_key::<N>(password, account_index + 1u32)
            .await
            .unwrap();
        println!("{}", address);
        println!("{}", address2);
    }

    #[tokio::test]
    async fn test_aleo_sign() {
        type N = TestnetV0;

        let res = aleo_sign::<N>("password", 1, "tester").await.unwrap();
        println!("{:?}", res);
    }

    #[tokio::test]
    async fn test_delete_key() {
        let password = "password";
        let account_index = 1;
        delete_aleo_key(password, account_index).await.unwrap();
    }

    #[tokio::test]
    async fn test_aleo_execute() {
        type N = TestnetV0;

        // Preparing inputs for key derivation and transaction
        let account_index = 1;
        let key_path = format!("m/44'/0'/{}'/0'", account_index);
        let base_url = format!(
            "https://aleo-testnetbeta.obscura.network/v1/{}",
            env!("TESTNET_API_OBSCURA")
        );
        let program_id = "credits.aleo"
            .try_into()
            .map_err(|_| anyhow!("Invalid program id"))
            .unwrap();
        let function_name = "transfer_public"
            .try_into()
            .map_err(|_| anyhow!("Invalid function name"))
            .unwrap();
        let recipient = "aleo1h7k3ttm6avttrgujp75wxfd5jf3ztmf9xcr4k6h6j9wj8z65uy9scuqkv8";
        let inputs: Vec<String> = [recipient.to_string(), "1000000u64".to_string()].to_vec();

        // Convert inputs to Value
        let mut inputs_values: Vec<Value<N>> = vec![];
        for i in inputs {
            inputs_values.push(Value::<N>::try_from(i).unwrap());
        }

        let txn = aleo_execute(
            "password",
            1,
            program_id,
            function_name,
            inputs_values,
            0,
            None,
            base_url,
        ).await.unwrap();

        // // Broadcast transaction to network
        // let client = ureq::Agent::new();
        // let url = format!("https://aleo-testnetbeta.obscura.network/v1/{}/testnet/transaction/broadcast", env!("TESTNET_API_OBSCURA"));
        // let res2 = client.post(&url).send_json(&txn).unwrap();
        // println!("result: {:?}", res2);
    }
}
