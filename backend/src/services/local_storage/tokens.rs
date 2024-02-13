use crate::models::storage::persistent::PersistentStorage;
use avail_common::errors::{AvailError, AvailErrorType, AvailResult};
use snarkvm::prelude::*;

pub fn init_tokens_table() -> AvailResult<()> {
    let storage = PersistentStorage::new()?;
    storage.execute_query(
        "CREATE TABLE IF NOT EXISTS ARC20_tokens (
            token_name TEXT PRIMARY KEY,
            balance_ciphertext TEXT NOT NULL,
            nonce TEXT NOT NULL
        )",
    )?;
    Ok(())
}

pub fn init_token<N: Network>(
    token_name: &str,
    encryption_address: &str,
    balance: &str,
) -> AvailResult<()> {
    let storage = PersistentStorage::new()?;

    storage.execute_query(
        "CREATE TABLE IF NOT EXISTS ARC20_tokens (
            token_name TEXT PRIMARY KEY,
            balance_ciphertext TEXT NOT NULL,
            nonce TEXT NOT NULL
        )",
    )?;

    let rng = &mut rand::thread_rng();
    let scalar = Scalar::<N>::rand(rng);
    let nonce = N::g_scalar_multiply(&scalar);

    let plaintext = Plaintext::<N>::from_str(balance)?;
    let address = Address::<N>::from_str(encryption_address)?;
    let encrypted_balance = plaintext.encrypt(&address, scalar)?;

    storage.save(
        vec![
            token_name.to_string(),
            encrypted_balance.to_string(),
            nonce.to_string(),
        ],
        "INSERT INTO ARC20_tokens (token_name, balance_ciphertext, nonce) VALUES (?1, ?2, ?3)"
            .to_string(),
    )?;

    Ok(())
}

pub fn add_balance<N: Network>(
    token_name: &str,
    balance: &str,
    vk: ViewKey<N>,
) -> AvailResult<String> {
    let storage = PersistentStorage::new()?;
    let query = format!(
        "SELECT balance_ciphertext, nonce FROM ARC20_tokens WHERE token_name='{}' ",
        token_name
    );
    let res = storage.get::<String>(query, 2)?;
    match res.get(0) {
        Some(old_encrypted_balance) => {
            let nonce = Group::<N>::from_str(res.get(1).unwrap())?;
            let ciphertext = Ciphertext::<N>::from_str(old_encrypted_balance)?;
            let old_balance_string = ciphertext.decrypt(vk, nonce)?.to_string();
            let old_balance = old_balance_string.trim_end_matches("u64").parse::<u64>()?;

            let temp_balance = balance.trim_end_matches("u64").parse::<u64>()?;
            let new_balance = match old_balance.checked_add(temp_balance) {
                Some(bal) => Ok(bal),
                None => Err(AvailError::new(
                    AvailErrorType::InvalidData,
                    "err".to_string(),
                    "edd".to_string(),
                )),
            }?;
            let rng = &mut rand::thread_rng();
            let scalar = Scalar::<N>::rand(rng);
            let nonce = N::g_scalar_multiply(&scalar);
            let new_encrypted_balance = Plaintext::<N>::encrypt(
                &Plaintext::<N>::from_str(&format!("{}u64", new_balance))?,
                &vk.to_address(),
                scalar,
            )?;
            storage.save(
                vec![new_encrypted_balance.to_string(), nonce.to_string()],
                format!("UPDATE ARC20_tokens SET balance_ciphertext = ?1, nonce = ?2 WHERE token_name='{}'", token_name),
            )?;
            Ok(new_balance.to_string())
        }
        None => Err(AvailError::new(
            AvailErrorType::LocalStorage,
            "None_found".to_string(),
            "Nonefound".to_string(),
        )),
    }
}

pub fn subtract_balance<N: Network>(
    token_name: &str,
    balance: &str,
    vk: ViewKey<N>,
) -> AvailResult<String> {
    let storage = PersistentStorage::new()?;
    let query = format!(
        "SELECT balance_ciphertext, nonce FROM ARC20_tokens WHERE token_name='{}' ",
        token_name
    );
    let res = storage.get::<String>(query, 2)?;
    match res.get(0) {
        Some(old_encrypted_balance) => {
            let nonce = res.get(1).unwrap();
            let old_balance_string = Ciphertext::<N>::decrypt(
                &Ciphertext::<N>::from_str(old_encrypted_balance)?,
                vk,
                Group::<N>::from_str(nonce)?,
            )?
            .to_string();
            let old_balance = old_balance_string.trim_end_matches("u64").parse::<u64>()?;

            let temp_balance = balance.trim_end_matches("u64").parse::<u64>()?;
            let new_balance = match old_balance.checked_sub(temp_balance) {
                Some(bal) => Ok(bal),
                None => Err(AvailError::new(
                    AvailErrorType::InvalidData,
                    "err".to_string(),
                    "edd".to_string(),
                )),
            }?;
            let rng = &mut rand::thread_rng();
            let scalar = Scalar::<N>::rand(rng);
            let nonce = N::g_scalar_multiply(&scalar);
            let new_encrypted_balance = Plaintext::<N>::encrypt(
                &Plaintext::<N>::from_str(&format!("{}u64", new_balance))?,
                &vk.to_address(),
                scalar,
            )?;
            storage.save(
                vec![new_encrypted_balance.to_string(), nonce.to_string()],
                format!("UPDATE ARC20_tokens SET balance_ciphertext = ?1, nonce = ?2 WHERE token_name='{}'", token_name),
            )?;
            Ok(new_balance.to_string())
        }
        None => Err(AvailError::new(
            AvailErrorType::LocalStorage,
            "None_found".to_string(),
            "Nonefound".to_string(),
        )),
    }
}

pub fn get_balance<N: Network>(token_name: &str, vk: ViewKey<N>) -> AvailResult<String> {
    let storage = PersistentStorage::new()?;
    let query = format!(
        "SELECT balance_ciphertext, nonce FROM ARC20_tokens WHERE token_name='{}' ",
        token_name
    );
    let res = storage.get::<String>(query, 2)?;
    match res.get(0) {
        Some(balance) => {
            let nonce = res.get(1).unwrap();
            let balance_string = Ciphertext::<N>::decrypt(
                &Ciphertext::<N>::from_str(balance)?,
                vk,
                Group::<N>::from_str(nonce)?,
            )?
            .to_string();
            Ok(balance_string)
        }
        None => Err(AvailError::new(
            AvailErrorType::LocalStorage,
            "None_found".to_string(),
            "Nonefound".to_string(),
        )),
    }
} // wrap this func and with only token id as param and vk is

// if_exists fn
pub fn if_token_exists(token_name: &str) -> AvailResult<bool> {
    let storage = PersistentStorage::new()?;
    let query = format!(
        "SELECT balance_ciphertext FROM ARC20_tokens WHERE token_name='{}' ",
        token_name
    );
    // let res = ?;
    match storage.get_all::<String>(&query, 1) {
        Ok(balance) => {
            println!("====> {:?}", balance);
            if balance.is_empty() {
                Ok(false)
            } else {
                Ok(true)
            }
        }
        Err(_) => Ok(false),
    }
}

mod test_tokens {
    use super::*;

    use crate::api::aleo_client::{setup_client, setup_local_client};
    use crate::models::event::Network as EventNetwork;
    use avail_common::{aleo_tools::api::AleoAPIClient, models::constants::*};

    #[test]
    fn test_init() {
        let api_client: AleoAPIClient<Testnet3> = setup_local_client::<Testnet3>();
        let pk = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();
        let vk = ViewKey::<Testnet3>::try_from(pk).unwrap();
        let res = init_token::<Testnet3>("token_avl_4.record", TESTNET_ADDRESS, "100u64").unwrap();
    }
    #[test]
    fn test_add_balance() {
        let api_client: AleoAPIClient<Testnet3> = setup_local_client::<Testnet3>();
        let pk = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();
        let vk = ViewKey::<Testnet3>::try_from(pk).unwrap();
        let res = add_balance("test_token", "100u64", vk).unwrap();
        println!("{:?}", res);
    }

    #[test]
    fn test_subtract_balance() {
        let api_client: AleoAPIClient<Testnet3> = setup_local_client::<Testnet3>();
        let pk = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();
        let vk = ViewKey::<Testnet3>::try_from(pk).unwrap();
        let res = subtract_balance("token1", "100u64", vk).unwrap();
        println!("{:?}", res);
    }

    #[test]
    fn test_get_balance() {
        let api_client: AleoAPIClient<Testnet3> = setup_local_client::<Testnet3>();
        let pk = PrivateKey::<Testnet3>::from_str(TESTNET3_PRIVATE_KEY).unwrap();
        //let vk = ViewKey::<Testnet3>::try_from(pk).unwrap();

        let vk =
            ViewKey::<Testnet3>::from_str("AViewKey1rWpxoch574dTmVu9zRovZ5UKyhZeBv9ftP2MkEy6TJRF")
                .unwrap();

        let res = get_balance("credits.record", vk).unwrap();
        println!("{:?}", res);
    }

    #[test]
    fn test_record_exists() {
        let api_client: AleoAPIClient<Testnet3> = setup_local_client::<Testnet3>();
        let res = if_token_exists("token_not_existing").unwrap();
        println!("{:?}", res);
    }
}
