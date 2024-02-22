use bip39::Mnemonic;
use keyring::Entry;
use snarkvm::console::program::{FromFields, Itertools, ToFields};
use snarkvm::prelude::{
    Ciphertext, Field, FromStr, Literal, Network, Plaintext, PrivateKey, StringType, ViewKey,
};

use crate::{
    helpers::validation::validate_secret_password,
    models::wallet::BetterAvailWallet,
    services::local_storage::utils::{
        encrypt_private_key_with_password, encrypt_view_key_with_password,
    },
};

use crate::models::storage::encryption::{Keys, Keys::PrivateKey as PKey, Keys::ViewKey as VKey};
use avail_common::{
    aleo_tools::encryptor::Encryptor,
    errors::{AvailError, AvailErrorType, AvailResult},
};

fn encrypt_seed_phrase_with_password<N: Network>(
    password: &str,
    seed_phrase: &str,
) -> AvailResult<Ciphertext<N>> {
    let pass_field = Field::<N>::new_domain_separator(password);

    let seed_phrase = Plaintext::<N>::Literal(
        Literal::String(StringType::<N>::new(seed_phrase)),
        once_cell::sync::OnceCell::new(),
    );

    let cipher = seed_phrase.encrypt_symmetric(pass_field)?;

    Ok(cipher)
}

fn decrypt_seed_phrase_with_password<N: Network>(
    ciphertext: Ciphertext<N>,
    password: &str,
) -> AvailResult<String> {
    let pass_field = Field::<N>::new_domain_separator(password);
    let seed_phrase = ciphertext.decrypt_symmetric(pass_field)?;

    //the seed phrase string currently looks like  "\"light soon prepare wire blade charge female stage ridge happy pony chief\""
    // but needs to be "light soon prepare wire blade charge female stage ridge happy pony chief"
    let seed_phrase = seed_phrase.to_string().replace("\"", "");

    Ok(seed_phrase)
}

pub fn store<N: Network>(wallet: &BetterAvailWallet<N>, password: &str) -> AvailResult<String> {
    //encrypt keys with password
    if validate_secret_password(password).is_err() {
        return Err(AvailError::new(
            AvailErrorType::Validation,
            "Invalid password".to_string(),
            "Invalid password".to_string(),
        ));
    }

    let ciphertext_p = encrypt_private_key_with_password::<N>(password, &wallet.private_key)?;

    let ciphertext_v = encrypt_view_key_with_password::<N>(password, &wallet.view_key)?;

    if let Some(mnemonic) = &wallet.mnemonic {
        let ciphertext_seed = encrypt_seed_phrase_with_password::<N>(password, mnemonic.phrase())?;
        //seed-phrase storage
        let s_entry = Entry::new("com.avail.wallet.phrase", "avl-s")?;
        let encrypted_seed_phrase = ciphertext_seed.to_string();
        s_entry.set_password(&encrypted_seed_phrase)?;
    }

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

pub fn read_seed_phrase<N: Network>(password: &str) -> AvailResult<String> {
    let entry = Entry::new("com.avail.wallet.phrase", "avl-s")?;
    let seed_phrase = entry.get_password()?;

    let seed_phrase_ciphertext = Ciphertext::<N>::from_str(&seed_phrase)?;
    let seed_phrase = decrypt_seed_phrase_with_password::<N>(seed_phrase_ciphertext, password)?;

    Ok(seed_phrase)
}

pub fn delete_key<N: Network>(password: &str) -> AvailResult<String> {
    // verify password is correct before deletion
    read_key::<N>(password, "avl-v")?;

    let p_entry = Entry::new("com.avail.wallet.p", "avl-p")?;
    p_entry.delete_password()?;

    let v_entry = Entry::new("com.avail.wallet.v", "avl-v")?;
    v_entry.delete_password()?;

    let s_entry = Entry::new("com.avail.wallet.phrase", "avl-s")?;
    s_entry.delete_password()?;

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

        let avail_wallet = BetterAvailWallet::<Testnet3>::try_from(p_key).unwrap();

        store::<Testnet3>(&avail_wallet, STRONG_PASSWORD).unwrap();
    }

    #[test]
    fn test_store_weak_password() {
        let mut rng = thread_rng();
        let p_key = PrivateKey::<Testnet3>::new(&mut rng).unwrap();
        let v_key = ViewKey::<Testnet3>::try_from(&p_key).unwrap();
        let avail_wallet = BetterAvailWallet::<Testnet3>::try_from(p_key.to_string()).unwrap();
        let access_type = true;

        store::<Testnet3>(&avail_wallet, WEAK_PASSWORD).unwrap();
    }

    #[test]
    fn read_key_test() {
        let mut rng = thread_rng();
        let p_key = PrivateKey::<Testnet3>::new(&mut rng).unwrap();
        let v_key = ViewKey::<Testnet3>::try_from(&p_key).unwrap();
        let avail_wallet = BetterAvailWallet::<Testnet3>::try_from(p_key.to_string()).unwrap();
        println!("Original Private Key: {:?}", p_key);
        println!("Original Viewing Key: {:?}", v_key);

        store::<Testnet3>(&avail_wallet, STRONG_PASSWORD).unwrap();

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
        let avail_wallet = BetterAvailWallet::<Testnet3>::try_from(p_key.to_string()).unwrap();

        store::<Testnet3>(&avail_wallet, STRONG_PASSWORD).unwrap();

        delete_key::<Testnet3>(STRONG_PASSWORD).unwrap();
    }

    #[test]
    fn test_encrypt_seed_phrase_with_password() {
        let seed_phrase =
            "light soon prepare wire blade charge female stage ridge happy pony chief";
        let password = "password";

        let ciphertext =
            encrypt_seed_phrase_with_password::<Testnet3>(password, seed_phrase).unwrap();
        let decrypted_seed_phrase =
            decrypt_seed_phrase_with_password::<Testnet3>(ciphertext, password).unwrap();

        assert_eq!(seed_phrase, decrypted_seed_phrase);
    }
}
