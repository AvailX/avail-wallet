use crate::models::storage::persistent::PersistentStorage;
use avail_common::errors::{AvailError, AvailErrorType, AvailResult};

pub fn create_dappPrivacySettings() -> AvailResult<()> {
    let storage = PersistentStorage::new()?;
    storage.execute_query(
        "CREATE TABLE IF NOT EXISTS DAPP_PRIVACY_SETTINGS (
            url TEXT PRIMARY KEY,
            trusted BOOLEAN
        )",
    )?;
    Ok(())
}

pub fn read_dappPrivacySettings(
    url: &str
) -> AvailResult<()> {
    let storage = PersistentStorage::new()?;
    let query = format!(
        "SELECT url, trusted FROM DAPP_PRIVACY_SETTINGS;",
        url
    );
    let res = storage.get_all::<String>(&query, 1)?;

    println!(res);

    Ok(res.get(1))
}

pub fn update_dappPrivacySettings(
    url: &str,
    trusted: &bool
) -> AvailResult<()> {
    let storage = PersistentStorage::new()?;

    storage.save(
        vec![
            url.to_string(),
            trusted
        ],
        "INSERT OR REPLACE INTO DAPP_PRIVACY_SETTINGS (url, trusted) VALUES (?1, ?2)".to_string(),
    )?;

    Ok(())
}

pub fn drop_dappPrivacySettings() -> AvailResult<()> {
    let storage = PersistentStorage::new()?;
    let query = format!(
        "DROP TABLE DAPP_PRIVACY_SETTINGS"
    );

    match storage.execute_query(query) {
        Ok(r) => r,
        Err(e) => match e.error_type {
            AvailErrorType::NotFound => {}
            _ => {
                return Err(AvailError::new(
                    AvailErrorType::Internal,
                    e.internal_msg,
                    "Error deleting dappPrivacySettings table".to_string(),
                ))
            }
        },
    };

    Ok()
}

/*
mod test_functions {
    use super::*;

    use crate::api::aleo_client::{setup_client, setup_local_client};
    use crate::models::event::Network as EventNetwork;
    use avail_common::{aleo_tools::api::AleoAPIClient, models::constants::*};

    #[test]
    fn test_init() {
        let api_client: AleoAPIClient<Testnet3> = setup_client::<Testnet3>().unwrap();
        let pk = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();
        let vk = ViewKey::<Testnet3>::try_from(pk).unwrap();
        let res =
            init_token::<Testnet3>("testnew111.record", "diff.aleo", TESTNET_ADDRESS, "100u64")
                .unwrap();
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
            ViewKey::<Testnet3>::from_str("AViewKey1fVv19tVg53L7vcUKTUTx2VUJTX69d4TsXGpi6TWAkgYR")
                .unwrap();

        let res = get_balance("credits.record", vk).unwrap();
        println!("{:?}", res);
    }

    #[test]
    fn test_record_exists() {
        let api_client: AleoAPIClient<Testnet3> = setup_client::<Testnet3>().unwrap();
        let res = if_token_exists("credits.record").unwrap();
        println!("{:?}", res);
    }
*/