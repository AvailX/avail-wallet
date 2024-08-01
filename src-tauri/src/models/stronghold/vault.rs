use std::path::PathBuf;

use avail_common::errors::{AvailError, AvailErrorType, AvailResult};
use iota_stronghold::procedures::Curve;
use snarkvm::console::{network::Network, program::{ProgramID, Identifier, Value, Record, Plaintext}};
use tauri_plugin_aleo_stronghold::{
    execute_procedure, remove_secret, save_secret, BytesDto, LocationDto, ProcedureDto,
    Slip10DeriveInputDto, StrongholdCollection,
};

/// A key-value storage that allows create, update and delete operations.
/// It does not allow reading the data, so one of the procedures must be used to manipulate
/// the stored data, allowing secure storage of secrets.
#[derive(Clone)]
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

    pub async fn generate_bip39<N: Network>(
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
        let procedure = ProcedureDto::<N>::BIP39Generate {
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

    pub async fn derive_slip10_master<N: Network>(
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

        let network = "mainnet".to_string();

        let procedure = ProcedureDto::<N>::SLIP10Derive {
            curve: Curve::Aleo,
            chain: vec![0x80000000],
            input,
            output,
            network,
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

    pub async fn derive_slip10<N: Network>(
        self,
        hold: &StrongholdCollection,
        record_path: &str,
        chain_code: &[u8],
    ) -> AvailResult<Vec<u8>> {
        let path = PathBuf::from(self.path);
        let record_path = BytesDto::Text(record_path.to_string());

        let output = LocationDto::Generic {
            vault: self.name,
            record: record_path,
        };

        // This might not be found because it might have initialised another stronghold.
        let location = LocationDto::Generic {
            vault: BytesDto::Text("slip10".to_string()),
            record: BytesDto::Text("m/44'/0'/0'/0'".to_string()),
        };

        let input = Slip10DeriveInputDto::Key(location);

        let hardened_offset = 0x80000000;
        // TODO - store chain code related to account index
        //let chain_code = [86, 230, 131, 55, 46, 161, 95, 36, 205, 207, 176, 253, 25, 231, 113, 237, 91, 249, 79, 188, 186, 46, 248, 117, 133, 43, 41, 53, 206, 157, 181, 80];
        let chain_code: Vec<u32> = chain_code.iter().map(|x| *x as u32).collect();
        let hardened_chain = chain_code
            .iter()
            .map(|x| x + hardened_offset)
            .collect::<Vec<u32>>();
        let network = "mainnet".to_string();
        let procedure = ProcedureDto::<N>::SLIP10Derive {
            curve: Curve::Aleo,
            chain: hardened_chain,
            input,
            output,
            network
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

    pub async fn aleo_sign<N: Network>(
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
            ext: Identifier::<N>::try_from("Sign")?,
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

    pub async fn get_address<N: Network>(
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
            ext: Identifier::<N>::try_from("GetAddress")?,
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

    pub async fn aleo_execute<N: Network>(
        self,
        hold: &StrongholdCollection,
        pk_path: &str,
        program_id: ProgramID<N>,
        function_name: Identifier<N>,
        inputs: Vec<Value<N>>,
        priority_fee_in_microcredits: u64,
        fee_record: Option<Record<N, Plaintext<N>>>,
        base_url: String,
    ) -> AvailResult<Vec<u8>> {
        let path = PathBuf::from(self.path);
        let record_path = BytesDto::Text(pk_path.to_string());
        let location = LocationDto::Generic {
            vault: self.name,
            record: record_path,
        };
        let procedure = ProcedureDto::AleoExecute {
            private_key: location,
            program_id,
            function_name,
            inputs,
            fee_record,
            priority_fee_in_microcredits,
            base_url,
        };

        match execute_procedure(hold, path, self.client, procedure).await {
            Ok(x) => Ok(x),
            Err(e) => Err(AvailError::new(
                AvailErrorType::Internal,
                e.to_string(),
                "Failed to execute Aleo transaction".to_string(),
            )),
        }
    }
}
