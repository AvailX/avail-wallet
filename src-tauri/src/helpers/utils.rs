use super::validation;
use chrono::{DateTime, Local, NaiveDateTime, Utc};
use snarkvm::prelude::{Ciphertext, Network, PrivateKey};

use avail_common::{
    aleo_tools::encryptor::Encryptor,
    errors::{AvailError, AvailErrorType, AvailResult},
};

/// This should be moved to utils and will most likely be deprecated.
/// Deprication depends on android local storage.
pub fn encrypt_key<N: Network>(key: PrivateKey<N>, secret: &str) -> AvailResult<Ciphertext<N>> {
    validation::validate_private_key(&key.to_string())?;
    validation::validate_secret_password(secret)?;

    let encrypted_private_key = Encryptor::<N>::encrypt_private_key_with_secret(&key, secret)?;

    Ok(encrypted_private_key)
}

///This should be moved to utils and will most likely be deprecated.
/// Deprication depends on android local storage.
pub fn decrypt_key<N: Network>(
    ciphertext: &Ciphertext<N>,
    secret: &str,
) -> AvailResult<PrivateKey<N>> {
    let decrypted_private_key =
        Encryptor::<N>::decrypt_private_key_with_secret(ciphertext, secret)?;

    Ok(decrypted_private_key)
}

pub fn get_timestamp_from_i64(i: i64) -> AvailResult<DateTime<Local>> {
    let naive_time = match NaiveDateTime::from_timestamp_opt(i, 0) {
        Some(naive_time) => naive_time,
        None => {
            return Err(AvailError::new(
                AvailErrorType::InvalidData,
                "Invalid block timestamp".to_string(),
                "Invalid block timestamp".to_string(),
            ))
        }
    };

    let timestamp_datetime: DateTime<Local> =
        DateTime::<Local>::from_naive_utc_and_offset(naive_time, Local::now().offset().to_owned());
    Ok(timestamp_datetime)
}

pub fn get_timestamp_from_i64_utc(i: i64) -> AvailResult<DateTime<Utc>> {
    let naive_time = match NaiveDateTime::from_timestamp_opt(i, 0) {
        Some(naive_time) => naive_time,
        None => {
            return Err(AvailError::new(
                AvailErrorType::InvalidData,
                "Invalid block timestamp".to_string(),
                "Invalid block timestamp".to_string(),
            ))
        }
    };

    let utc_timestamp = DateTime::<Utc>::from_utc(naive_time, Utc);

    Ok(utc_timestamp)
}

pub const HOST: &str = "localhost";
