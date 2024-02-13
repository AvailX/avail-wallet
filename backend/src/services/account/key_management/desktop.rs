use keyring::Entry;
use snarkvm::prelude::{Ciphertext, FromStr, Network, PrivateKey, ViewKey};

use crate::{
    helpers::validation::validate_secret_password,
    services::local_storage::utils::encrypt_with_password,
};

use crate::models::storage::encryption::{Keys, Keys::PrivateKey as PKey, Keys::ViewKey as VKey};
use avail_common::{
    aleo_tools::encryptor::Encryptor,
    errors::{AvailError, AvailErrorType, AvailResult},
};
pub fn store<N: Network>(
    password: &str,
    _access_type: bool,
    p_key: &PrivateKey<N>,
    v_key: &ViewKey<N>,
) -> AvailResult<String> {
    //encrypt keys with password
    if validate_secret_password(password).is_err() {
        return Err(AvailError::new(
            AvailErrorType::Validation,
            "Invalid password".to_string(),
            "Invalid password".to_string(),
        ));
    }

    let ciphertext_p = encrypt_with_password::<N>(password, PKey(*p_key))?;

    let ciphertext_v = encrypt_with_password::<N>(password, VKey(*v_key))?;

    //private-key storage
    let p_entry = Entry::new("com.avail.wallet.p", "avl-p")?;
    let encrypted_private_key = ciphertext_p.to_string();
    p_entry.set_password(&encrypted_private_key)?;

    //view-key storage
    let v_entry = Entry::new("com.avail.wallet.v", "avl-v")?;
    let encrypted_viewing_key = ciphertext_v.to_string();
    v_entry.set_password(&encrypted_viewing_key)?;

    Ok("Key Stored".to_string())
}

pub fn read_key<N: Network>(password: &str, key_type: &str) -> AvailResult<Keys<N>> {
    let entry = match key_type {
        "avl-p" => Entry::new("com.avail.wallet.p", key_type)?,
        "avl-v" => Entry::new("com.avail.wallet.v", key_type)?,
        _ => {
            return Err(AvailError::new(
                AvailErrorType::InvalidData,
                "Invalid Key Type".to_string(),
                "Invalid Key Type".to_string(),
            ))
        }
    };
    let key = entry.get_password()?;

    match key_type {
        "avl-p" => {
            let pkey_ciphertext = Ciphertext::<N>::from_str(&key)?;
            let pkey = Encryptor::<N>::decrypt_private_key_with_secret(&pkey_ciphertext, password)?;

            Ok(Keys::PrivateKey(pkey))
        }
        "avl-v" => {
            let vkey_ciphertext = Ciphertext::<N>::from_str(&key)?;
            let vkey = Encryptor::<N>::decrypt_view_key_with_secret(&vkey_ciphertext, password)?;

            Ok(Keys::ViewKey(vkey))
        }
        _ => Err(AvailError::new(
            AvailErrorType::InvalidData,
            "Invalid label".to_string(),
            "Invalid label".to_string(),
        )),
    }
}

pub fn delete_key<N: Network>(password: &str) -> AvailResult<String> {
    // verify password is correct before deletion
    read_key::<N>(password, "avl-v")?;

    let p_entry = Entry::new("com.avail.wallet.p", "avl-p")?;
    p_entry.delete_password()?;

    let v_entry = Entry::new("com.avail.wallet.v", "avl-v")?;
    v_entry.delete_password()?;

    Ok("Key Deleted".to_string())
}

#[cfg(test)]
mod windows_linux_key_management_tests {
    use super::*;
    use rand::thread_rng;
    use snarkvm::console::network::Testnet3;

    use avail_common::models::constants::{STRONG_PASSWORD, WEAK_PASSWORD};

    #[test]
    fn test_store_strong_password() {
        let mut rng = thread_rng();
        let p_key = PrivateKey::<Testnet3>::new(&mut rng).unwrap();
        let v_key = ViewKey::<Testnet3>::try_from(&p_key).unwrap();

        let access_type = true;

        store::<Testnet3>(STRONG_PASSWORD, access_type, &p_key, &v_key).unwrap();
    }

    #[test]
    fn test_store_weak_password() {
        let mut rng = thread_rng();
        let p_key = PrivateKey::<Testnet3>::new(&mut rng).unwrap();
        let v_key = ViewKey::<Testnet3>::try_from(&p_key).unwrap();

        let access_type = true;

        store::<Testnet3>(WEAK_PASSWORD, access_type, &p_key, &v_key).unwrap();
    }

    #[test]
    fn read_key_test() {
        let mut rng = thread_rng();
        let p_key = PrivateKey::<Testnet3>::new(&mut rng).unwrap();
        let v_key = ViewKey::<Testnet3>::try_from(&p_key).unwrap();

        println!("Original Private Key: {:?}", p_key);
        println!("Original Viewing Key: {:?}", v_key);

        store::<Testnet3>(STRONG_PASSWORD, false, &p_key, &v_key).unwrap();

        let read_p_key = read_key::<Testnet3>(STRONG_PASSWORD, "avl-p")
            .unwrap()
            .is_private_key()
            .unwrap();
        let read_v_key = read_key::<Testnet3>(STRONG_PASSWORD, "avl-v")
            .unwrap()
            .is_view_key()
            .unwrap();

        delete_key::<Testnet3>(STRONG_PASSWORD).unwrap();

        println!("Fetched Private Key: {:?}", read_p_key);
        println!("Fetched Viewing Key: {:?}", read_v_key);

        assert_eq!(p_key, read_p_key);
        assert_eq!(v_key, read_v_key);
    }

    #[test]
    fn delete_key_test() {
        let mut rng = thread_rng();
        let p_key = PrivateKey::<Testnet3>::new(&mut rng).unwrap();
        let v_key = ViewKey::<Testnet3>::try_from(&p_key).unwrap();

        store::<Testnet3>(STRONG_PASSWORD, false, &p_key, &v_key).unwrap();

        delete_key::<Testnet3>(STRONG_PASSWORD).unwrap();
    }
}
