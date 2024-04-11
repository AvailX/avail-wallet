use std::path::PathBuf;

use app_dirs::*;
use avail_common::errors::{AvailError, AvailErrorType, AvailResult};
use iota_stronghold::procedures::Curve;
use tauri_plugin_stronghold::{
    create_client, destroy, execute_procedure, get_store_record, initialize, load_client,
    remove_secret, remove_store_record, save, save_secret, save_store_record, BytesDto,
    LocationDto, PasswordHashFunction, ProcedureDto, Slip10DeriveInputDto, StrongholdCollection,
};

use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct Client {
    pub path: String,
    pub name: BytesDto,
}

impl Client {
    pub fn new(path: &str, name: BytesDto) -> Self {
        Self {
            path: path.to_string(),
            name,
        }
    }

    pub fn get_store(self) -> Store {
        Store::new(self.path, self.name)
    }
}

/// A key-value storage that allows create, update and delete operations.
/// It does not allow reading the data, so one of the procedures must be used to manipulate
/// the stored data, allowing secure storage of secrets.
pub struct Vault {
    path: String,
    client: BytesDto,
    name: BytesDto,
}

impl Vault {
    pub fn new(path: &str, client: BytesDto, name: BytesDto) -> Self {
        Self {
            path: path.to_string(),
            client,
            name,
        }
    }

    pub async fn insert(
        self,
        value: &[u8],
        hold: &StrongholdCollection,
        record_path: &str,
    ) -> AvailResult<()> {
        let path = PathBuf::from(self.path);
        let record_path = BytesDto::Text(record_path.to_string());

        match save_secret(
            hold,
            path,
            self.client,
            self.name,
            record_path,
            value.to_vec(),
        )
        .await
        {
            Ok(x) => Ok(x),
            Err(e) => Err(AvailError::new(
                AvailErrorType::Internal,
                e.to_string(),
                "Failed to save record".to_string(),
            )),
        }
    }

    pub async fn remove_secret(
        self,
        hold: &StrongholdCollection,
        record_path: &str,
    ) -> AvailResult<()> {
        let path = PathBuf::from(self.path);
        let record_path = BytesDto::Text(record_path.to_string());

        match remove_secret(hold, path, self.client, self.name, record_path).await {
            Ok(x) => Ok(x),
            Err(e) => Err(AvailError::new(
                AvailErrorType::Internal,
                e.to_string(),
                "Failed to save record".to_string(),
            )),
        }
    }

    pub async fn generate_bip39(
        self,
        hold: &StrongholdCollection,
        record_path: &str,
    ) -> AvailResult<Vec<u8>> {
        let path = PathBuf::from(self.path);
        let record_path = BytesDto::Text(record_path.to_string());
        let location = LocationDto::Generic {
            vault: self.name,
            record: record_path,
        };
        let procedure = ProcedureDto::BIP39Generate {
            passphrase: None,
            output: location,
        };

        match execute_procedure(hold, path, self.client, procedure).await {
            Ok(x) => Ok(x),
            Err(e) => Err(AvailError::new(
                AvailErrorType::Internal,
                e.to_string(),
                "Failed to bip39 generate procedure".to_string(),
            )),
        }
    }

    pub async fn derive_slip10_master(
        self,
        hold: &StrongholdCollection,
        record_path: &str,
    ) -> AvailResult<Vec<u8>> {
        let path = PathBuf::from(self.path);
        let record_path = BytesDto::Text(record_path.to_string());
        let seed_path = BytesDto::Text("bip39".to_string());

        let output = LocationDto::Generic {
            vault: self.name,
            record: record_path,
        };

        // This might not be found because it might have initialised another stronghold.
        let location = LocationDto::Generic {
            vault: BytesDto::Text("bip39".to_string()),
            record: seed_path,
        };

        let input = Slip10DeriveInputDto::Seed(location);

        //let hardened_offset = 0x80000000;
        //let chain_code = [0u8; 32];

        let procedure = ProcedureDto::SLIP10Derive {
            curve: Curve::Aleo,
            chain: vec![0x80000000],
            input,
            output,
        };

        match execute_procedure(hold, path, self.client, procedure).await {
            Ok(x) => Ok(x),
            Err(e) => Err(AvailError::new(
                AvailErrorType::Internal,
                e.to_string(),
                "Failed to derive Aleo key".to_string(),
            )),
        }
    }

    pub async fn derive_slip10(
        self,
        hold: &StrongholdCollection,
        record_path: &str,
    ) -> AvailResult<Vec<u8>> {
        let path = PathBuf::from(self.path);
        let record_path = BytesDto::Text(record_path.to_string());
        let seed_path = BytesDto::Text("bip39".to_string());

        let output = LocationDto::Generic {
            vault: self.name,
            record: record_path,
        };

        // This might not be found because it might have initialised another stronghold.
        let location = LocationDto::Generic {
            vault: BytesDto::Text("slip10".to_string()),
            record: BytesDto::Text("m/44'/0'/1'/0'".to_string()),
        };

        let input = Slip10DeriveInputDto::Key(location);

        let hardened_offset = 0x80000000;
        let chain_code = [
            8, 34, 84, 230, 90, 104, 32, 83, 70, 194, 157, 183, 234, 181, 224, 13, 117, 128, 44,
            114, 50, 127, 87, 70, 14, 248, 144, 99, 173, 45, 162, 182,
        ];
        let hardened_chain = chain_code
            .iter()
            .map(|x| x + hardened_offset)
            .collect::<Vec<u32>>();
        let procedure = ProcedureDto::SLIP10Derive {
            curve: Curve::Aleo,
            chain: hardened_chain,
            input,
            output,
        };

        match execute_procedure(hold, path, self.client, procedure).await {
            Ok(x) => Ok(x),
            Err(e) => Err(AvailError::new(
                AvailErrorType::Internal,
                e.to_string(),
                "Failed to derive Aleo key".to_string(),
            )),
        }
    }

    pub async fn aleo_sign(
        self,
        hold: &StrongholdCollection,
        message: &str,
        pk_path: &str,
    ) -> AvailResult<Vec<u8>> {
        let path = PathBuf::from(self.path);
        let record_path = BytesDto::Text(pk_path.to_string());
        let location = LocationDto::Generic {
            vault: self.name,
            record: record_path,
        };
        let procedure = ProcedureDto::AleoSign {
            private_key: location,
            msg: message.to_string(),
        };

        match execute_procedure(hold, path, self.client, procedure).await {
            Ok(x) => Ok(x),
            Err(e) => Err(AvailError::new(
                AvailErrorType::Internal,
                e.to_string(),
                "Failed to sign with Aleo key.".to_string(),
            )),
        }
    }

    pub async fn get_address(
        self,
        hold: &StrongholdCollection,
        record_path: &str,
    ) -> AvailResult<Vec<u8>> {
        let path = PathBuf::from(self.path);
        let record_path = BytesDto::Text(record_path.to_string());
        let location = LocationDto::Generic {
            vault: self.name,
            record: record_path,
        };
        let procedure = ProcedureDto::GetAleoAddress {
            private_key: location,
        };

        match execute_procedure(hold, path, self.client, procedure).await {
            Ok(x) => Ok(x),
            Err(e) => Err(AvailError::new(
                AvailErrorType::Internal,
                e.to_string(),
                "Failed to get address.".to_string(),
            )),
        }
    }
}

// TODO - store key location paths in Store
pub struct Store {
    path: String,
    client: BytesDto,
}

impl Store {
    pub fn new(path: String, client: BytesDto) -> Self {
        Self { path, client }
    }

    pub async fn get(
        self,
        key: String,
        hold: &StrongholdCollection,
    ) -> AvailResult<Option<Vec<u8>>> {
        let path = PathBuf::from(self.path);
        match get_store_record(hold, path, self.client, key).await {
            Ok(record) => Ok(record),
            Err(e) => Err(AvailError::new(
                AvailErrorType::Internal,
                e.to_string(),
                "Failed to get record".to_string(),
            )),
        }
    }

    pub async fn insert(
        self,
        key: String,
        value: Vec<u8>,
        hold: &StrongholdCollection,
    ) -> AvailResult<Option<Vec<u8>>> {
        let path = PathBuf::from(self.path);

        match save_store_record(hold, path, self.client, key, value, None).await {
            Ok(record) => Ok(record),
            Err(e) => Err(AvailError::new(
                AvailErrorType::Internal,
                e.to_string(),
                "Failed to save record".to_string(),
            )),
        }
    }

    pub async fn remove(
        self,
        key: String,
        hold: &StrongholdCollection,
    ) -> AvailResult<Option<Vec<u8>>> {
        let path = PathBuf::from(self.path);

        match remove_store_record(hold, path, self.client, key).await {
            Ok(record) => Ok(record),
            Err(e) => Err(AvailError::new(
                AvailErrorType::Internal,
                e.to_string(),
                "Failed to save record".to_string(),
            )),
        }
    }
}

#[derive(Clone, Serialize, Deserialize)]
pub struct Stronghold {
    path: String,
}

impl Stronghold {
    pub fn new(path: &str) -> Self {
        Self {
            path: path.to_string(),
        }
    }

    pub async fn save(&self, collection: &StrongholdCollection) -> AvailResult<()> {
        let path = PathBuf::from(self.path.clone());
        match save(collection, path).await {
            Ok(x) => Ok(x),
            Err(e) => Err(AvailError::new(
                AvailErrorType::Internal,
                e.to_string(),
                "Failed to save stronghold".to_string(),
            )),
        }
    }

    pub async fn destroy(&self, collection: &StrongholdCollection) -> AvailResult<()> {
        let path = PathBuf::from(self.path.clone());
        match destroy(collection, path).await {
            Ok(x) => Ok(x),
            Err(e) => Err(AvailError::new(
                AvailErrorType::Internal,
                e.to_string(),
                "Failed to destroy stronghold".to_string(),
            )),
        }
    }
}

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
            client.name,
            BytesDto::Text("slip10".to_string()),
        );

        let key_path = "m/44'/0'/2'/0'";

        println!("pre derive");
        let cc = vault.derive_slip10(&hold, key_path).await.unwrap();

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

        let key_path = "m/44'/0'/1'/0'";

        let res = vault.aleo_sign(&hold, "tester", key_path).await.unwrap();

        println!("{:?}", res);
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
            146, 124, 48, 116, 162, 48, 39, 8, 140, 187, 133, 43, 229, 167, 140, 221, 27, 7, 222,
            118, 206, 188, 3, 195, 141, 34, 99, 31, 191, 189, 241, 33, 133, 44, 230, 88, 13, 2,
            119, 8, 116, 151, 106, 204, 91, 193, 218, 153, 144, 146, 235, 176, 201, 46, 164, 188,
            68, 9, 160, 236, 248, 11, 4, 188,
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
