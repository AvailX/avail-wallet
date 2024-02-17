use crate::models::storage::persistent::PersistentStorage;
use avail_common::errors::{AvailError, AvailErrorType, AvailResult};
use snarkvm::prelude::*;

pub fn init_tokens_table() -> AvailResult<()> {
    let storage = PersistentStorage::new()?;
    storage.execute_query(
        "CREATE TABLE IF NOT EXISTS ARC20_tokens (
            token_name TEXT PRIMARY KEY,
            program_id TEXT NOT NULL,
            balance_ciphertext TEXT NOT NULL,
            nonce TEXT NOT NULL
        )",
    )?;
    Ok(())
}

pub fn drop_tokens_table() -> AvailResult<()> {
    let storage = PersistentStorage::new()?;
    match storage.execute_query("DROP TABLE IF EXISTS ARC20_tokens"){
        Ok(r) => r,
        Err(e) => match e.error_type {
            AvailErrorType::NotFound => {}
            _ => {
                return Err(AvailError::new(
                    AvailErrorType::Internal,
                    e.internal_msg,
                    "Error deleting tokens table".to_string(),
                ))
            }
        },
    };

    Ok(())
}

pub fn init_token<N: Network>(
    token_name: &str,
    program_id: &str,
    encryption_address: &str,
    balance: &str,
) -> AvailResult<()> {
    let storage = PersistentStorage::new()?;

    storage.execute_query(
        "CREATE TABLE IF NOT EXISTS ARC20_tokens (
            token_name TEXT PRIMARY KEY,
            program_id TEXT NOT NULL,
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
            program_id.to_string(),
            encrypted_balance.to_string(),
            nonce.to_string(),
        ],
        "INSERT INTO ARC20_tokens (token_name, program_id, balance_ciphertext, nonce) VALUES (?1, ?2, ?3, ?4)"
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
    let res = storage.get_all::<String>(&query, 2)?;
    match res.get(0) {
        Some(old_encrypted_balance) => {
            let nonce = Group::<N>::from_str(res[0].get(1).unwrap())?;
            let ciphertext = Ciphertext::<N>::from_str(&old_encrypted_balance[0])?;
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
    let res = storage.get_all::<String>(&query, 2)?;
    match res.get(0) {
        Some(old_encrypted_balance) => {
            let nonce = res[0].get(1).unwrap();
            let old_balance_string = Ciphertext::<N>::decrypt(
                &Ciphertext::<N>::from_str(&old_encrypted_balance[0])?,
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
    let res = storage.get_all::<String>(&query, 2)?;
    match res.get(0) {
        Some(old_encrypted_balance) => {
            let nonce = res[0].get(1).unwrap();
            let old_balance_string = Ciphertext::<N>::decrypt(
                &Ciphertext::<N>::from_str(&old_encrypted_balance[0])?,
                vk,
                Group::<N>::from_str(nonce)?,
            )?
            .to_string();
            Ok(old_balance_string)
        }
        None => Ok("0u64".to_string()),
    }
} // wrap this func and with only token id as param and vk is

pub fn if_token_exists(token_name: &str) -> AvailResult<bool> {
    let storage = PersistentStorage::new()?;
    let query = format!(
        "SELECT balance_ciphertext FROM ARC20_tokens WHERE token_name='{}'",
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

#[tauri::command(rename_all = "snake_case")]
pub fn get_program_id_for_token (token_name: &str) -> AvailResult<String>{
    let storage = PersistentStorage::new()?;
    let query = format!(
        "SELECT program_id FROM ARC20_tokens WHERE token_name='{}'",
        token_name
    );
    // let res = ?;
    let res = storage.get_all::<String>(&query, 1)?;
    match res.get(0) {
        Some(p_id) => {
            Ok(p_id[0].clone())
        }
        None => Ok("".to_string()),
    }
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_stored_tokens() -> AvailResult<Vec<String>> {
    let storage = PersistentStorage::new()?;
    let query = "SELECT token_name FROM ARC20_tokens";
    let res = storage.get_all::<String>(query, 1)?;

    println!("Token ids ====> {:?}", res);

    Ok(res.iter().map(|x| x[0].clone()).collect())
}

pub fn delete_tokens_table() -> AvailResult<()> {
    let storage = PersistentStorage::new()?;
    let query = "DROP TABLE ARC20_tokens";

    match storage.execute_query(query) {
        Ok(r) => r,
        Err(e) => match e.error_type {
            AvailErrorType::NotFound => {}
            _ => {
                return Err(AvailError::new(
                    AvailErrorType::Internal,
                    e.internal_msg,
                    "Error deleting tokens table".to_string(),
                ))
            }
        },
    };

    Ok(())
}

mod test_tokens {
    use super::*;

    use crate::api::aleo_client::{setup_client, setup_local_client};
    use crate::models::event::Network as EventNetwork;
    use avail_common::{aleo_tools::api::AleoAPIClient, models::constants::*};

    #[test]
    fn test_init() {
        let api_client: AleoAPIClient<Testnet3> = setup_client::<Testnet3>().unwrap();
        let pk = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();
        let vk = ViewKey::<Testnet3>::try_from(pk).unwrap();
        let res = init_token::<Testnet3>("testnew111.record", "diff.aleo",TESTNET_ADDRESS, "100u64").unwrap();
    }
    #[test]
    fn test_pid() {
        let api_client: AleoAPIClient<Testnet3> = setup_client::<Testnet3>().unwrap();
        let pk = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();
        let vk = ViewKey::<Testnet3>::try_from(pk).unwrap();
        let res = get_program_id_for_token("testnew111.record").unwrap();
        println!("{:?}", res);
    }
    #[test]
    fn test_add_balance() {
        let pk = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();
        let vk = ViewKey::<Testnet3>::try_from(pk).unwrap();
        let res = add_balance("test_token", "100u64", vk).unwrap();
        println!("{:?}", res);
    }

    #[test]
    fn test_subtract_balance() {
        let api_client: AleoAPIClient<Testnet3> = setup_client::<Testnet3>().unwrap();
        let pk = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();
        let vk = ViewKey::<Testnet3>::try_from(pk).unwrap();
        let res = subtract_balance("token1", "100u64", vk).unwrap();
        println!("{:?}", res);
    }

    #[test]
    fn test_get_balance() {
        let api_client: AleoAPIClient<Testnet3> = setup_client::<Testnet3>().unwrap();
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
        let api_client: AleoAPIClient<Testnet3> = setup_client::<Testnet3>().unwrap();
        let res = if_token_exists("token_not_existing").unwrap();
        println!("{:?}", res);
    }
}
