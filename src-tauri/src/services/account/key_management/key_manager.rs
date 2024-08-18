use std::{ops::Sub, path::PathBuf};
use std::ops::Deref;

use crate::models::stronghold::{client::Client, vault::Vault, Stronghold};
use app_dirs::*;
use avail_common::errors::{AvailError, AvailErrorType, AvailResult};
use iota_stronghold::engine::runtime::ZeroizeOnDrop;
use serde::{Deserialize, Serialize};
use snarkvm::{
    prelude::{Address, Network, Field, anyhow, Authorization, Identifier, Plaintext, ProgramID, Record, Value, PrivateKey},
    utilities::FromBytes,
    console::account::Signature,
    ledger::Transaction
};
use snarkvm::prelude::{Environment, ToBytes};
use tauri_plugin_aleo_stronghold::{
    create_client, initialize, load_client, BytesDto, PasswordHashFunction, StrongholdCollection,
};
use zeroize::Zeroizing;
use snarkvm::fields::PrimeField;

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
        BytesDto::Text("bip39 seed".to_string()),
    );

    let record_path = "bip39 seed";

    let result = vault.generate_bip39::<N>(&hold, record_path).await?;
    let mnemonic = String::from_utf8(result)?;
    store_mnemonic(mnemonic.clone(), password).await?;

    Ok(mnemonic)
}

pub async fn recover_seed_phrase<N: Network>(mnemonic: String, password: &str) -> AvailResult<()> {
    let (hold, stronghold, client) = init_stronghold(password).await?;

    let vault = Vault::new(
        stronghold.path.as_str(),
        client.name,
        BytesDto::Text("bip39 seed".to_string()),
    );

    let record_path = "bip39 seed";

    vault.recover_bip39::<N>(&hold, record_path, mnemonic.clone()).await?;
    store_mnemonic(mnemonic, password).await?;

    Ok(())
}

pub async fn store_mnemonic(mnemonic: String, password: &str) -> AvailResult<()> {
    let (hold, stronghold, client) = init_stronghold(password).await?;

    let vault = Vault::new(
        stronghold.path.as_str(),
        client.name.clone(),
        BytesDto::Text("bip39 mnemonic".to_string()),
    );

    let record_path = "bip39 mnemonic";

    vault.insert(&hold, record_path, mnemonic.as_bytes()).await?;

    stronghold.save(&hold).await?;
    stronghold.destroy(&hold).await?;
    Ok(())
}

pub async fn unsafe_get_mnemonic(password: &str) -> AvailResult<Zeroizing<String>> {
    let (hold, stronghold, client) = init_stronghold(password).await?;

    let vault = Vault::new(
        stronghold.path.as_str(),
        client.name.clone(),
        BytesDto::Text("bip39 mnemonic".to_string()),
    );

    let record_path = "bip39 mnemonic";

    let res = vault.unsafe_get_secret(&hold, record_path).await?;
    let deref = res.deref();
    let mnemonic = String::from_utf8(deref.to_vec())?;

    stronghold.save(&hold).await?;
    stronghold.destroy(&hold).await?;
    Ok(mnemonic.into())
}

/* ALEO KEY API */

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

    vault.clone().derive_slip10::<N>(&hold, &key_path, "testnet").await?;

    let address = vault.get_address::<N>(&hold, &key_path).await?;
    let aleo_address = Address::<N>::from_bytes_le(&address)?.to_string();

    stronghold.save(&hold).await?;
    stronghold.destroy(&hold).await?;
    Ok(aleo_address)
}

pub async fn unsafe_get_aleo_private_key<N: Network>(password: &str, account_index: u32) -> AvailResult<Zeroizing<PrivateKey<N>>> {
    use hex;

    let (hold, stronghold, client) = init_stronghold(password).await?;

    let vault = Vault::new(
        stronghold.path.as_str(),
        client.name.clone(),
        BytesDto::Text("slip10".to_string()),
    );
    let key_path = format!("m/44'/0'/{}'/0'", account_index);

    let res = vault.unsafe_get_secret(&hold, &key_path).await?;
    let deref = &res.deref()[..32]; // first 32 bytes for private key from extended bytes

    let hexs = hex::encode(deref);
    println!("Seed: {}", hexs);

    let field = <N as Environment>::Field::from_bytes_le_mod_order(deref);
    let private_key = PrivateKey::<N>::try_from(FromBytes::read_le(&*field.to_bytes_le().unwrap()).unwrap())?;

    stronghold.save(&hold).await?;
    stronghold.destroy(&hold).await?;
    Ok(private_key.into())
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

pub async fn aleo_authorize<N: Network>(
    password: &str,
    account_index: u32,
    program_id: ProgramID<N>,
    function_name: Identifier<N>,
    inputs: Vec<Value<N>>,
) -> AvailResult<Authorization<N>> {
    let (hold, stronghold, client) = init_stronghold(password).await.unwrap();
    let vault = Vault::new(
        stronghold.path.as_str(),
        client.name,
        BytesDto::Text("slip10".to_string()),
    );
    // Preparing inputs for key derivation and transaction
    let key_path = format!("m/44'/0'/{}'/0'", account_index);

    // Authorize transaction with stronghold vault
    let res = vault
        .aleo_authorize::<N>(
            &hold,
            &key_path,
            program_id,
            function_name,
            inputs,
        )
        .await
        .unwrap();

    Authorization::from_bytes_le(&res).map_err(AvailError::from)
}

pub async fn aleo_authorize_fee_public<N: Network>(
    password: &str,
    account_index: u32,
    base_fee_in_microcredits: u64,
    priority_fee_in_microcredits: u64,
    deployment_or_execution_id: Field<N>,
) -> AvailResult<Authorization<N>> {
    let (hold, stronghold, client) = init_stronghold(password).await.unwrap();
    let vault = Vault::new(
        stronghold.path.as_str(),
        client.name,
        BytesDto::Text("slip10".to_string()),
    );
    // Preparing inputs for key derivation and transaction
    let key_path = format!("m/44'/0'/{}'/0'", account_index);

    // Authorize transaction with stronghold vault
    let res = vault
        .aleo_authorize_fee_public::<N>(
            &hold,
            &key_path,
            base_fee_in_microcredits,
            priority_fee_in_microcredits,
            deployment_or_execution_id,
        )
        .await
        .unwrap();

    Authorization::from_bytes_le(&res).map_err(AvailError::from)
}

pub async fn aleo_authorize_fee_private<N: Network>(
    password: &str,
    account_index: u32,
    credits: Record<N, Plaintext<N>>,
    base_fee_in_microcredits: u64,
    priority_fee_in_microcredits: u64,
    deployment_or_execution_id: Field<N>,
) -> AvailResult<Authorization<N>> {
    let (hold, stronghold, client) = init_stronghold(password).await.unwrap();
    let vault = Vault::new(
        stronghold.path.as_str(),
        client.name,
        BytesDto::Text("slip10".to_string()),
    );
    // Preparing inputs for key derivation and transaction
    let key_path = format!("m/44'/0'/{}'/0'", account_index);

    // Authorize transaction with stronghold vault
    let res = vault
        .aleo_authorize_fee_private::<N>(
            &hold,
            &key_path,
            credits,
            base_fee_in_microcredits,
            priority_fee_in_microcredits,
            deployment_or_execution_id,
        )
        .await
        .unwrap();

    Authorization::from_bytes_le(&res).map_err(AvailError::from)
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

        assert!(store_mnemonic(mnemonic, password).await.is_ok());
    }

    #[tokio::test]
    async fn test_unsafe_get_mnemonic() {
        let password = "password";
        let mnemonic = unsafe_get_mnemonic(password).await.unwrap();
        println!("{}", mnemonic.deref());

        assert!(!mnemonic.deref().is_empty());
    }

    #[tokio::test]
    async fn test_recover_bip39() {
        type N = TestnetV0;

        let password = "password";
        let mnemonic = "exercise suggest fence speed spring silly smoke gauge october wet pony rookie slow curious assume earth drama truth castle put blanket happy train identify";
        let res = recover_seed_phrase::<N>(mnemonic.to_string(), password).await;
        assert!(res.is_ok());
    }

    #[tokio::test]
    async fn test_derive_aleo_key() {
        type N = TestnetV0;

        let password = "password";
        let account_index = 0;
        let address = derive_aleo_key::<N>(password, account_index).await.unwrap();
        let address2 = derive_aleo_key::<N>(password, account_index + 1u32)
            .await
            .unwrap();
        println!("{}", address);
        println!("{}", address2);
    }

    #[tokio::test]
    async fn test_unsafe_get_private_key() {
        type N = TestnetV0;

        let password = "password";
        let account_index = 0;
        let res = unsafe_get_aleo_private_key::<N>(password, account_index).await.unwrap();
        let private_key = res.deref();

        println!("{}", private_key);
    }

    #[tokio::test]
    async fn test_aleo_sign() {
        type N = TestnetV0;

        let res = aleo_sign::<N>("password", 0, "test message").await.unwrap();
        println!("{:?}", res);
    }

    #[tokio::test]
    async fn test_aleo_authorize() {
        type N = TestnetV0;

        let account_index = 0;
        let program_id = "credits.aleo"
            .try_into()
            .map_err(|_| anyhow!("Invalid program id"))
            .unwrap();
        let function_name = "transfer_public"
            .try_into()
            .map_err(|_| anyhow!("Invalid function name"))
            .unwrap();
        let inputs: Vec<String> = ["aleo1h7k3ttm6avttrgujp75wxfd5jf3ztmf9xcr4k6h6j9wj8z65uy9scuqkv8".to_string(), "1000000u64".to_string()].to_vec();

        // Convert inputs to Value
        let mut inputs_values: Vec<Value<N>> = vec![];
        for i in inputs {
            inputs_values.push(Value::<N>::try_from(i).unwrap());
        }

        let res = aleo_authorize::<N>(
            "password",
            account_index,
            program_id,
            function_name,
            inputs_values
        ).await.unwrap();

        println!("{:?}", res);
    }

    #[tokio::test]
    async fn test_aleo_execute() {
        type N = TestnetV0;

        // Preparing inputs for key derivation and transaction
        let account_index = 0;
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

        let txn = aleo_execute::<N>(
            "password",
            account_index,
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
