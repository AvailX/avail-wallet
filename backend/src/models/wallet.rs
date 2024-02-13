#![allow(dead_code)]

use bip39::{Language, Mnemonic};
use serde::{ser::SerializeStruct, Serialize};
use snarkvm::{
    console::{network::Environment, prelude::*},
    prelude::{Address, PrivateKey, Testnet3, ViewKey},
};

use avail_common::errors::{AvError, AvailError, AvailErrorType, AvailResult};

pub struct AvailWallet<N: Network> {
    pub private_key: PrivateKey<N>,
    pub view_key: ViewKey<N>,
    pub address: Address<N>,
}

impl<N: Network> AvailWallet<N> {
    ///Generates a new wallet
    pub fn new() -> Result<Self, AvError> {
        let private_key = PrivateKey::<N>::new(&mut rand::thread_rng())?;

        let view_key = ViewKey::<N>::try_from(&private_key)?;
        let address = Address::<N>::try_from(&private_key)?;

        Ok(AvailWallet::<N> {
            private_key,
            view_key,
            address,
        })
    }

    ///Generates a wallet from the byte representation of a private key
    pub fn from_bytes(bytes: &[u8]) -> Result<Self, AvError> {
        let seed: [u8; 32] = bytes.try_into().map_err(|_| {
            AvailError::new(
                AvailErrorType::InvalidData,
                "Error generating seed phrase".to_string(),
                "Error generating seed phrase".to_string(),
            )
        })?;

        let field = <N as Environment>::Field::from_bytes_le_mod_order(&seed);

        //handle errors
        let private_key =
            PrivateKey::<N>::try_from(FromBytes::read_le(&*field.to_bytes_le().unwrap()).unwrap())?;

        let view_key = ViewKey::<N>::try_from(&private_key)?;
        let address = Address::<N>::try_from(&private_key)?;

        let seed_wallet = AvailWallet::<N> {
            private_key,
            view_key,
            address,
        };

        Ok(seed_wallet)
    }
}

///This is to be removed as will not be sent out to frontend using IPC
impl Serialize for AvailWallet<Testnet3> {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut state = serializer.serialize_struct("AvailWallet", 3)?;
        state.serialize_field("private_key", &self.private_key.to_string())?;
        state.serialize_field("view_key", &self.view_key.to_string())?;
        state.serialize_field("address", &self.address.to_string())?;
        state.end()
    }
}

pub struct AvailSeedWallet<N: Network> {
    pub seed_phrase: String,
    pub private_key: PrivateKey<N>,
    pub view_key: ViewKey<N>,
    pub address: Address<N>,
}

impl<N: Network> AvailSeedWallet<N> {
    ///Generates a new wallet with seed phrase
    pub fn new(entropy: &[u8], seed_phrase: String) -> Result<Self, AvError> {
        let field = <Testnet3 as Environment>::Field::from_bytes_le_mod_order(entropy);
        let binding = field.to_bytes_le()?;
        let private_key = PrivateKey::<N>::try_from(FromBytes::read_le(binding.as_slice())?)?;

        let view_key = ViewKey::<N>::try_from(&private_key)?;
        let address = Address::<N>::try_from(&private_key)?;
        let seed_wallet = AvailSeedWallet::<N> {
            seed_phrase,
            private_key,
            view_key,
            address,
        };
        Ok(seed_wallet)
    }

    /// Generates a seed phrase wallet from the byte representation of a private key
    pub fn from_bytes(seed: &[u8]) -> AvailResult<Self> {
        let mnemonic = Mnemonic::from_entropy(seed, Language::English)?;

        let seed: [u8; 32] = seed.try_into().map_err(|_| {
            AvailError::new(
                AvailErrorType::InvalidData,
                "Error generating seed phrase".to_string(),
                "Error generating seed phrase".to_string(),
            )
        })?;

        let field = <N as Environment>::Field::from_bytes_le_mod_order(&seed);
        let binding = field.to_bytes_le()?;
        let field_bytes = binding.as_slice();

        let private_key = PrivateKey::<N>::try_from(FromBytes::read_le(field_bytes)?)?;

        let view_key = ViewKey::<N>::try_from(&private_key)?;
        let address = Address::<N>::try_from(&private_key)?;

        let seed_wallet = AvailSeedWallet::<N> {
            seed_phrase: mnemonic.phrase().to_string(),
            private_key,
            view_key,
            address,
        };

        Ok(seed_wallet)
    }

    ///Generates a seed phrase wallet from the seed phrase
    pub fn from_seed_phrase(seed_phrase: String) -> AvailResult<Self> {
        let mnemonic = Mnemonic::from_phrase(&seed_phrase, Language::English)?;

        let field = <Testnet3 as Environment>::Field::from_bytes_le_mod_order(mnemonic.entropy());
        let binding = field.to_bytes_le()?;
        let private_key = PrivateKey::<N>::try_from(FromBytes::read_le(binding.as_slice())?)?;

        let view_key = ViewKey::<N>::try_from(&private_key)?;
        let address = Address::<N>::try_from(&private_key)?;

        let seed_wallet = AvailSeedWallet::<N> {
            seed_phrase: mnemonic.phrase().to_string(),
            private_key,
            view_key,
            address,
        };

        Ok(seed_wallet)
    }
}

///This is to be removed as will not be sent out to frontend using IPC
impl Serialize for AvailSeedWallet<Testnet3> {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut state = serializer.serialize_struct("AvailSeedWallet", 4)?;
        state.serialize_field("seed_phrase", &self.seed_phrase)?;
        state.serialize_field("private_key", &self.private_key.to_string())?;
        state.serialize_field("view_key", &self.view_key.to_string())?;
        state.serialize_field("address", &self.address.to_string())?;
        state.end()
    }
}

pub struct SeedResult {
    pub entropy: Vec<u8>,
    pub seed_phrase: String,
}
