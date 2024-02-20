#![allow(dead_code)]

use std::fmt::Display;

use snarkvm::{console::prelude::*, prelude::*};

pub enum EncryptedData {
    PrivateKey,
    ViewKey,
}

#[derive(PartialEq, Eq, Debug)]
pub enum Keys<N: Network> {
    PrivateKey(PrivateKey<N>),
    ViewKey(ViewKey<N>),
}

impl<N: Network> Keys<N> {
    pub fn to_bytes_le(&self) -> Result<Vec<u8>, Error> {
        match self {
            Keys::PrivateKey(key) => key.to_bytes_le(),
            Keys::ViewKey(key) => key.to_bytes_le(),
        }
    }

    pub fn is_private_key(&self) -> Option<PrivateKey<N>> {
        match self {
            Keys::PrivateKey(pk) => Some(*pk),
            Keys::ViewKey(_) => None,
        }
    }

    pub fn is_view_key(&self) -> Option<ViewKey<N>> {
        match self {
            Keys::PrivateKey(_) => None,
            Keys::ViewKey(vk) => Some(*vk),
        }
    }
}

impl<N: Network> Display for Keys<N> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Keys::PrivateKey(key) => write!(f, "{}", key),
            Keys::ViewKey(key) => write!(f, "{}", key),
        }
    }
}
