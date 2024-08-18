use std::path::PathBuf;

use avail_common::errors::{AvailError, AvailErrorType, AvailResult};
use iota_stronghold::procedures::Curve;
use snarkvm::console::{
    network::Network,
    program::{Identifier, Plaintext, ProgramID, Record, Value},
};
use snarkvm::prelude::Field;
use tauri_plugin_aleo_stronghold::{
    execute_procedure, remove_secret, save_secret, unsafe_get_secret,
    BytesDto, LocationDto, ProcedureDto, Slip10DeriveInputDto, StrongholdCollection,
};
use zeroize::Zeroizing;

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
        hold: &StrongholdCollection,
        record_path: &str,
        value: &[u8],
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

    pub async fn unsafe_get_secret(
        self,
        hold: &StrongholdCollection,
        record_path: &str,
    ) -> AvailResult<Zeroizing<Vec<u8>>> {
        let path = PathBuf::from(self.path);
        let record_path = BytesDto::Text(record_path.to_string());

        match unsafe_get_secret(hold, path, self.client, self.name, record_path).await
        {
            Ok(x) => Ok(x),
            Err(e) => Err(AvailError::new(
                AvailErrorType::Internal,
                e.to_string(),
                "Failed to get record".to_string(),
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

    pub async fn recover_bip39<N: Network>(
        self,
        hold: &StrongholdCollection,
        record_path: &str,
        mnemonic: String,
    ) -> AvailResult<Vec<u8>> {
        let path = PathBuf::from(self.path);
        let record_path = BytesDto::Text(record_path.to_string());
        let location = LocationDto::Generic {
            vault: self.name,
            record: record_path,
        };
        let procedure = ProcedureDto::<N>::BIP39Recover {
            mnemonic,
            passphrase: None,
            output: location,
        };

        match execute_procedure(hold, path, self.client, procedure).await {
            Ok(x) => Ok(x),
            Err(e) => Err(AvailError::new(
                AvailErrorType::Internal,
                e.to_string(),
                "Failed to recover bip39".to_string(),
            )),
        }
    }

    pub async fn derive_slip10<N: Network>(
        self,
        hold: &StrongholdCollection,
        record_path: &str,
        network: &str,
    ) -> AvailResult<Vec<u8>> {
        let path = PathBuf::from(self.path);
        let record_path_dto = BytesDto::Text(record_path.to_string());
        let seed_path = BytesDto::Text("bip39 seed".to_string());

        let output = LocationDto::Generic {
            vault: self.name,
            record: record_path_dto,
        };

        // This might not be found because it might have initialised another stronghold.
        let location = LocationDto::Generic {
            vault: BytesDto::Text("bip39 seed".to_string()),
            record: seed_path,
        };

        let input = Slip10DeriveInputDto::Seed(location);

        // Parse path and convert it to hardened chain
        let hardened_offset = 0x80000000;
        let hardened_chain = record_path
            .split('/')
            .skip(1) // Skip the leading 'm'
            .map(|s| {
                if s.ends_with('\'') {
                    s.trim_end_matches('\'').parse::<u32>().unwrap() + hardened_offset
                } else {
                    s.parse::<u32>().unwrap() + hardened_offset
                }
            })
            .collect();

        println!("Hardened chain: {:?}", hardened_chain);

        let procedure = ProcedureDto::<N>::SLIP10Derive {
            curve: Curve::Aleo,
            chain: hardened_chain,
            input,
            output,
            network: network.to_string(),
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

    pub async fn aleo_authorize<N: Network>(
        self,
        hold: &StrongholdCollection,
        pk_path: &str,
        program_id: ProgramID<N>,
        function_name: Identifier<N>,
        inputs: Vec<Value<N>>,
    ) -> AvailResult<Vec<u8>> {
        let path = PathBuf::from(self.path);
        let record_path = BytesDto::Text(pk_path.to_string());
        let location = LocationDto::Generic {
            vault: self.name,
            record: record_path,
        };
        let procedure = ProcedureDto::AleoAuthorize {
            private_key: location,
            program_id,
            function_name,
            inputs,
        };

        match execute_procedure(hold, path, self.client, procedure).await {
            Ok(x) => Ok(x),
            Err(e) => Err(AvailError::new(
                AvailErrorType::Internal,
                e.to_string(),
                "Failed to execute Aleo authorize".to_string(),
            )),
        }
    }

    pub async fn aleo_authorize_fee_public<N: Network>(
        self,
        hold: &StrongholdCollection,
        pk_path: &str,
        base_fee_in_microcredits: u64,
        priority_fee_in_microcredits: u64,
        deployment_or_execution_id: Field<N>,
    ) -> AvailResult<Vec<u8>> {
        let path = PathBuf::from(self.path);
        let record_path = BytesDto::Text(pk_path.to_string());
        let location = LocationDto::Generic {
            vault: self.name,
            record: record_path,
        };
        let procedure = ProcedureDto::AleoAuthorizeFeePublic {
            private_key: location,
            base_fee_in_microcredits,
            priority_fee_in_microcredits,
            deployment_or_execution_id,
        };

        match execute_procedure(hold, path, self.client, procedure).await {
            Ok(x) => Ok(x),
            Err(e) => Err(AvailError::new(
                AvailErrorType::Internal,
                e.to_string(),
                "Failed to execute Aleo authorize fee public".to_string(),
            )),
        }
    }

    pub async fn aleo_authorize_fee_private<N: Network>(
        self,
        hold: &StrongholdCollection,
        pk_path: &str,
        credits: Record<N, Plaintext<N>>,
        base_fee_in_microcredits: u64,
        priority_fee_in_microcredits: u64,
        deployment_or_execution_id: Field<N>,
    ) -> AvailResult<Vec<u8>> {
        let path = PathBuf::from(self.path);
        let record_path = BytesDto::Text(pk_path.to_string());
        let location = LocationDto::Generic {
            vault: self.name,
            record: record_path,
        };
        let procedure = ProcedureDto::AleoAuthorizeFeePrivate {
            private_key: location,
            credits,
            base_fee_in_microcredits,
            priority_fee_in_microcredits,
            deployment_or_execution_id,
        };

        match execute_procedure(hold, path, self.client, procedure).await {
            Ok(x) => Ok(x),
            Err(e) => Err(AvailError::new(
                AvailErrorType::Internal,
                e.to_string(),
                "Failed to execute Aleo authorize fee private".to_string(),
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
