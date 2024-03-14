use bs58;
use snarkvm::prelude::bech32;

use avail_common::errors::{AvailError, AvailErrorType, AvailResult};

/// Validates an aleo private key checking it's length and prefix.
pub fn validate_private_key(pk: &String) -> AvailResult<()> {
    if pk.len() != 59 {
        return Err(AvailError::new(
            AvailErrorType::InvalidData,
            format!("Invalid private key with length {} != 59", pk.len()),
            "Invalid private key".to_string(),
        ));
    }

    if &pk[0..12] != "APrivateKey1" {
        return Err(AvailError::new(
            AvailErrorType::InvalidData,
            format!("Invalid private key starting with {}", &pk[0..12]),
            "Invalid private key".to_string(),
        ));
    }

    let base58 = &pk[12..59];
    let _base58_res = bs58::decode(base58).into_vec()?;

    Ok(())
}

pub fn validate_address(address: &str) -> AvailResult<bool> {
    if address.len() != 63 {
        return Err(AvailError::new(
            AvailErrorType::InvalidData,
            format!("Invalid address with length {} != 63", address.len()),
            "Invalid address".to_string(),
        ));
    }

    if &address[0..5] != "aleo1" {
        return Err(AvailError::new(
            AvailErrorType::InvalidData,
            format!("Invalid address starting with {}", &address[0..5]),
            "Invalid address".to_string(),
        ));
    }

    let _bech32_res = bech32::decode(address)?;

    Ok(true)
}

pub fn validate_address_bool(address: &str) -> bool {
    if address.len() != 63 {
        println!("Invalid address with length {} != 63", address.len());
        return false;
    }

    if &address[0..5] != "aleo1" {
        println!("Invalid address starting with {}", &address[0..5]);
        return false;
    }

    let _bech32_res = bech32::decode(address);

    match _bech32_res {
        Ok(_) => true,
        Err(e) => {
            println!("Invalid bech32 address: {}", e);
            false
        }
    }
}

pub fn validate_secret_password(secret: &str) -> AvailResult<()> {
    if secret.len() < 12 {
        return Err(AvailError::new(
            AvailErrorType::Validation,
            format!("Invalid secret with length {} < 12", secret.len()),
            "Invalid secret".to_string(),
        ));
    }

    let mut has_num = false;
    let mut has_cap = false;
    let mut has_special = false;

    for c in secret.chars() {
        if c.is_numeric() {
            has_num = true;
        } else if c.is_uppercase() {
            has_cap = true;
        } else if c.is_ascii_punctuation() {
            has_special = true;
        }
    }

    if !has_num || !has_cap || !has_special {
        return Err(AvailError::new(
            AvailErrorType::Validation,
            "Password too weak, must include at least one number, one uppercase character and one symbol.".to_string(),
            "Password too weak, must include at least one number, one uppercase character and one symbol.".to_string(),
        ));
    }

    // TODO: Entropy check
    Ok(())
}

#[test]
fn test_validate_private_key() {
    let pk_str = "APrivateKey1zkp4X9ApjTb7Rv8EABfZRugXBhbPzCL245GyNtYJP5GYY2k";

    let _res = validate_private_key(&pk_str.to_string()).unwrap();
}

#[test]
fn test_validate_private_key_invalid() {
    let pk_str = "APrivateKey1zkp4THISISNOTAPRIVATEKEYPzCL245GyNtYJP5GYY2k22";

    let _res = validate_private_key(&pk_str.to_string()).unwrap_err();
}

#[test]
fn test_validate_address() {
    let add_str = "aleo1dg722m22fzpz6xjdrvl9tzu5t68zmypj5p74khlqcac0gvednygqxaax0j";

    let _res = validate_address(&add_str.to_string()).unwrap();
}

#[test]
fn test_validate_address_invalid() {
    let add_str = "aleo2dg722m22fzpz6xjdrvl9tzu5t68zmypj5p74khlqcac0gvednygqxaax0";

    let _res = validate_address(&add_str.to_string()).unwrap_err();
}

#[test]
fn test_validate_secret_password_safe() {
    //entropy should invalidate this in the future
    let password = "Password123!";

    let _res = validate_secret_password(&password.to_string()).unwrap();
}

#[test]
fn test_validate_secret_password_unsafe() {
    let password = "password";

    let _res = validate_secret_password(&password.to_string()).unwrap_err();
}
