use std::{ops::Sub, path::PathBuf};

use app_dirs::*;
use avail_common::errors::{AvailError, AvailErrorType, AvailResult};
use iota_stronghold::procedures::Curve;
use tauri_plugin_stronghold::{
    create_client, destroy, execute_procedure, get_store_record, initialize, load_client,
    remove_secret, remove_store_record, save, save_secret, save_store_record, BytesDto,
    LocationDto, PasswordHashFunction, ProcedureDto, Slip10DeriveInputDto, StrongholdCollection,
};

use serde::{Deserialize, Serialize};

use crate::models::stronghold::{client::Client, store::Store, vault::Vault, Stronghold};
use snarkvm::{
    prelude::{Address, Testnet3},
    utilities::FromBytes,
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

pub async fn generate_seed_phrase(password: &str) -> AvailResult<String> {
    let (hold, stronghold, client) = init_stronghold(password).await?;

    let vault = Vault::new(
        stronghold.path.as_str(),
        client.name,
        BytesDto::Text("bip39".to_string()),
    );

    let record_path = "bip39";

    let result = vault.generate_bip39(&hold, record_path).await?;

    let mnemonic = String::from_utf8(result)?;
    stronghold.save(&hold).await?;
    stronghold.destroy(&hold).await?;
    Ok(mnemonic)
}

/* ALEO KEY API */

pub async fn derive_aleo_master_key(password: &str) -> AvailResult<Vec<u8>> {
    let (hold, stronghold, client) = init_stronghold(password).await?;

    let vault = Vault::new(
        stronghold.path.as_str(),
        client.name,
        BytesDto::Text("slip10".to_string()),
    );

    let key_path = "m/44'/0'/0'/0'";

    let cc = vault.derive_slip10_master(&hold, key_path).await?;

    stronghold.save(&hold).await?;
    stronghold.destroy(&hold).await?;
    Ok(cc)
}

pub async fn derive_aleo_key(password: &str, account_index: u32) -> AvailResult<String> {
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
        .derive_slip10(&hold, &key_path, &chain_code)
        .await?;
    store_chain_code(account_index, cc, client, &hold).await?;

    let address = vault.get_address(&hold, &key_path).await?;
    let aleo_address = Address::<Testnet3>::from_bytes_le(&address)?.to_string();

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
    use snarkvm::circuit::prelude::PrimeField;
    use snarkvm::prelude::{PrivateKey, Testnet3};
    use snarkvm::utilities::{FromBytes, ToBytes};

    #[tokio::test]
    async fn test_generate_bip39() {
        let (hold, stronghold, client) = init_stronghold("password").await.unwrap();

        let vault = Vault::new(
            stronghold.path.as_str(),
            client.name,
            BytesDto::Text("bip39".to_string()),
        );

        let record_path = "bip39";

        let result = vault.generate_bip39(&hold, record_path).await.unwrap();

        let mnemonic = String::from_utf8(result).unwrap();
        stronghold.save(&hold).await.unwrap();
        println!("{}", mnemonic);
    }

    #[tokio::test]
    async fn derive_aleo_master() {
        let (hold, stronghold, client) = init_stronghold("password").await.unwrap();
        let vault = Vault::new(
            stronghold.path.as_str(),
            client.name,
            BytesDto::Text("slip10".to_string()),
        );

        let key_path = "m/44'/0'/0'/0'";

        let cc = vault.derive_slip10_master(&hold, key_path).await.unwrap();

        stronghold.save(&hold).await.unwrap();
        println!("{:?}", cc);
    }

    #[tokio::test]
    async fn derive_aleo_slip10_key() {
        let (hold, stronghold, client) = init_stronghold("password").await.unwrap();
        let vault = Vault::new(
            stronghold.path.as_str(),
            client.name.clone(),
            BytesDto::Text("slip10".to_string()),
        );

        let account_index = 2;
        let key_path = format!("m/44'/0'/{}'/0'", account_index);

        let chain_code = get_chain_code(account_index.sub(1u32), client.clone(), &hold)
            .await
            .unwrap();
        let cc = vault
            .derive_slip10(&hold, &key_path, &chain_code)
            .await
            .unwrap();

        stronghold.save(&hold).await.unwrap();
        println!("{:?}", cc);
    }

    #[tokio::test]
    async fn test_aleo_sign() {
        let (hold, stronghold, client) = init_stronghold("password").await.unwrap();
        let vault = Vault::new(
            stronghold.path.as_str(),
            client.name,
            BytesDto::Text("slip10".to_string()),
        );

        let account_index = 2;
        let key_path = format!("m/44'/0'/{}'/0'", account_index);

        let res = vault.aleo_sign(&hold, "tester", &key_path).await.unwrap();

        println!("{:?}", res);
    }

    #[tokio::test]
    async fn test_delete_key() {
        let (hold, stronghold, client) = init_stronghold("password").await.unwrap();
        let vault = Vault::new(
            stronghold.path.as_str(),
            client.name,
            BytesDto::Text("slip10".to_string()),
        );

        let account_index = 2;
        let key_path = format!("m/44'/0'/{}'/0'", account_index);

        vault.remove_secret(&hold, &key_path).await.unwrap();

        stronghold.save(&hold).await.unwrap();
        stronghold.destroy(&hold).await.unwrap();

        println!("Key deleted");
    }

    #[test]
    fn test_aleo_pk_from_derived_bytes() {
        /*
        let seed: [u8; 32] = bytes.try_into().map_err(|_| {
            AvailError::new(
                AvailErrorType::InvalidData,
                "Error generating seed phrase".to_string(),
                "Error generating seed phrase".to_string(),
            )
        })?;

        let field = <N as Environment>::Field::from_bytes_le_mod_order(&seed);
        let private_key =
            PrivateKey::<N>::try_from(FromBytes::read_le(&*field.to_bytes_le().unwrap()).unwrap())?;
            */

        let seed = [
            169, 226, 137, 240, 19, 47, 167, 103, 64, 212, 123, 234, 219, 186, 179, 112, 144, 24,
            65, 102, 18, 107, 54, 137, 214, 96, 59, 120, 192, 92, 102, 123, 86, 230, 131, 55, 46,
            161, 95, 36, 205, 207, 176, 253, 25, 231, 113, 237, 91, 249, 79, 188, 186, 46, 248,
            117, 133, 43, 41, 53, 206, 157, 181, 80,
        ];
        let field = <snarkvm::prelude::Testnet3 as snarkvm::prelude::Environment>::Field::from_bytes_le_mod_order(&seed);
        let private_key = PrivateKey::<Testnet3>::try_from(
            FromBytes::read_le(&*field.to_bytes_le().unwrap()).unwrap(),
        )
        .unwrap();
        //let private_key = PrivateKey::<Testnet3>::from_bytes_le(&[146, 124, 48, 116, 162, 48, 39, 8, 140, 187, 133, 43, 229, 167, 140, 221, 27, 7, 222, 118, 206, 188, 3, 195, 141, 34, 99, 31, 191, 189, 241, 33, 133, 44, 230, 88, 13, 2, 119, 8, 116, 151, 106, 204, 91, 193, 218, 153, 144, 146, 235, 176, 201, 46, 164, 188, 68, 9, 160, 236, 248, 11, 4, 188]).unwrap();
        print!("Private Key {}", private_key.to_string());
    }
}
