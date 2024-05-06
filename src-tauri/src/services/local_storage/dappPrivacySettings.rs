use crate::models::storage::persistent::PersistentStorage;
use avail_common::errors::{AvailError, AvailErrorType, AvailResult};

pub fn create_dapp_privacy_settings() -> AvailResult<()> {
    let storage = PersistentStorage::new()?;
    storage.execute_query(
        "CREATE TABLE IF NOT EXISTS dapp_privacy_settings (
            url TEXT PRIMARY KEY NOT NULL,
            trusted BOOLEAN NOT NULL
        )",
    )?;
    Ok(())
}

pub fn read_dapp_privacy_settings(url: &str) -> AvailResult<Option<bool>> {
    let storage = PersistentStorage::new()?;
    let query = "SELECT trusted FROM dapp_privacy_settings WHERE url = $1;";
    let result = storage.get_one::<bool>(&query, url)?;
    Ok(result)
}

pub fn update_dapp_privacy_settings(url: &str, trusted: &bool) -> AvailResult<()> {
    let storage = PersistentStorage::new()?;

    //Make sure that storage.save() expects the data in this format and properly handles parameterization.
    storage.save( 
        vec![
            url.to_string(),
            trusted.to_string()
        ],
        "UPDATE dapp_privacy_settings SET trusted = ?2 WHERE url = ?1".to_string(),
    )?;
    Ok(())
}

pub fn drop_dapp_privacy_settings(url: &str) -> AvailResult<()> {
    let storage = PersistentStorage::new()?;
    let query = "DELETE FROM dapp_privacy_settings WHERE url = $1";
    storage.execute_query(query, url)?;
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