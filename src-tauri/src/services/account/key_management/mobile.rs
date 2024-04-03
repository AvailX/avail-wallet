use std::path::PathBuf;

use avail_common::errors::{AvailError, AvailErrorType, AvailResult};
use tauri::State;
use tauri_plugin_stronghold::{
    create_client, execute_procedure, get_store_record, initialize, load_client, remove_secret,
    remove_store_record, save_secret, save_store_record, BytesDto, LocationDto,
    PasswordHashFunction, ProcedureDto, StrongholdCollection,
};

use app_dirs::*;
use snarkvm::prelude::{Address, PrivateKey, Signature, Testnet3};
use snarkvm::utilities::{TestRng, Uniform};

pub struct Client {
    pub path: String,
    pub name: BytesDto,
}

impl Client {
    pub fn new(path: String, name: BytesDto) -> Self {
        Self { path, name }
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
        hold: State<'_, StrongholdCollection>,
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
        hold: State<'_, StrongholdCollection>,
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
        hold: State<'_, StrongholdCollection>,
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
                "Failed to save record".to_string(),
            )),
        }
    }

    pub async fn aleo_sign(
        self,
        hold: State<'_, StrongholdCollection>,
        record_path: &str,
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
                "Failed to save record".to_string(),
            )),
        }
    }
}

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
        hold: State<'_, StrongholdCollection>,
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
        hold: State<'_, StrongholdCollection>,
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
        hold: State<'_, StrongholdCollection>,
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

pub async fn init_stronghold(
    password: &str,
    hold: State<'_, StrongholdCollection>,
    pbkdf: State<'_, PasswordHashFunction>,
) -> AvailResult<()> {
    let path = app_root(
        AppDataType::UserData,
        &AppInfo {
            name: "avail_wallet",
            author: "Avail",
        },
    )?;

    match initialize(hold, pbkdf, path, password.to_string()).await {
        Ok(_) => Ok(()),
        Err(e) => Err(AvailError::new(
            AvailErrorType::Internal,
            e.to_string(),
            "Failed to initiliaze key stronghold".to_string(),
        )),
    }?;

    let client_name = BytesDto::Text("com.avail.stronghold".to_string());

    /*
    match load_client(hold, path, client_name).await {
        Ok() => {

        },
        Err(e) => return Err(AvailError::new(AvailErrorType::Internal, e.to_string(), "Failed to load client".to_string())),
    }*/

    Ok(())
}

#[cfg(test)]
mod test_helpers {
    use super::*;

    type CurrentNetwork = Testnet3;

    /// Samples a random signature.
    pub(super) fn sample_signature(
        num_fields: u64,
        rng: &mut TestRng,
    ) -> Signature<CurrentNetwork> {
        // Sample an address and a private key.
        let private_key = PrivateKey::<CurrentNetwork>::new(rng).unwrap();
        let address = Address::try_from(&private_key).unwrap();

        // Generate a signature.
        let message: Vec<_> = (0..num_fields).map(|_| Uniform::rand(rng)).collect();
        let signature = Signature::sign(&private_key, &message, rng).unwrap();
        assert!(signature.verify(&address, &message));
        signature
    }
}

#[cfg(test)]
mod tests {
    use snarkvm::{circuit::traits::SizeInBits, console::program::SizeInBytes};

    use super::*;

    const ITERATIONS: u64 = 100;

    #[test]
    fn test_from() {
        let mut rng = TestRng::default();

        for i in 0..ITERATIONS {
            // Sample a new signature.
            let signature = test_helpers::sample_signature(i, &mut rng);

            // Check that the signature can be reconstructed from its parts.
            let candidate = Signature::from((
                signature.challenge(),
                signature.response(),
                signature.compute_key(),
            ));
        }
    }

    #[test]
    fn address_size() {
        println!("{}", Address::<Testnet3>::size_in_bytes());
    }

    #[test]
    fn test_size_in_bytes() {
        println!(
            "Signature size in bytes: {}",
            Signature::<Testnet3>::size_in_bytes()
        );
        assert_eq!(Signature::<Testnet3>::size_in_bytes(), 128);
    }

    #[test]
    fn test_size_in_bits() {
        println!(
            "Signature size in bits: {}",
            Signature::<Testnet3>::size_in_bits()
        );
        assert_eq!(Signature::<Testnet3>::size_in_bits(), 1008);
    }
}
