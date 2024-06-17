use chrono::{DateTime, Utc};
use snarkvm::prelude::*;

use crate::models::{event::Network as EventNetwork, storage::languages::Languages};
use crate::{
    api::aleo_client::setup_obscura_client, models::storage::persistent::PersistentStorage,
};

use avail_common::errors::{AvailError, AvailErrorType, AvailResult};

///Definition: Initialises the user preferences table in persistent storage
pub fn initial_user_preferences(
    auth_type: bool,
    username: Option<String>,
    tag: Option<u32>,
    import: bool,
    backup: bool,
    address: String,
    language: Languages,
) -> AvailResult<()> {
    let storage = PersistentStorage::new()?;

    let api_client = setup_obscura_client::<TestnetV0>().unwrap();

    let latest_height = match import {
        true => 0,
        false => api_client.latest_height()?,
    };

    let last_tx_sync = Utc::now();

    storage.execute_query(
        "CREATE TABLE IF NOT EXISTS user_preferences (
            theme TEXT NOT NULL,
            language TEXT NOT NULL,
            network TEXT NOT NULL,
            auth_type BOOLEAN NOT NULL DEFAULT FALSE,
            username TEXT,
            tag TEXT,
            last_sync INTEGER NOT NULL,
            last_tx_sync TIMESTAMP NOT NULL,
            last_backup_sync TIMESTAMP,
            backup BOOLEAN NOT NULL DEFAULT FALSE,
            address TEXT NOT NULL,
            base_url TEXT NOT NULL
        )",
    )?;

    let username = match username {
        Some(username) => username,
        None => "".to_string(),
    };

    let tag = tag.unwrap_or(0);

    storage.save_mixed(
        vec![
            &"dark",
            &language.to_string_short(),
            // TODO - V2 change default to mainnet
            &"testnet3",
            &auth_type,
            &username,
            &tag,
            &latest_height,
            &last_tx_sync,
            &Some(Utc::now()),
            &address,
            &backup,
            &"obscura"
        ],
        "INSERT INTO user_preferences (theme, language, network, auth_type, username, tag, last_sync, last_tx_sync, last_backup_sync, address, backup, base_url) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9,?10, ?11, ?12)".to_string(),
    )?;

    Ok(())
}

///Deletes user preferences table from persistent storage -> This should be reset
#[tauri::command(rename_all = "snake_case")]
pub fn delete_user_preferences() -> AvailResult<()> {
    let storage = PersistentStorage::new()?;
    let query = "DROP TABLE user_preferences";

    match storage.execute_query(query) {
        Ok(r) => r,
        Err(e) => match e.error_type {
            AvailErrorType::NotFound => {}
            _ => {
                return Err(AvailError::new(
                    AvailErrorType::Internal,
                    e.internal_msg,
                    "Error deleting user preferences".to_string(),
                ))
            }
        },
    };

    Ok(())
}

///Switch authentication type between password and biometrics
pub fn change_auth_type() -> AvailResult<()> {
    let storage = PersistentStorage::new()?;

    let query = "SELECT auth_type FROM user_preferences".to_string();

    let res = storage.get_all::<bool>(&query, 1)?;

    let auth_type = res[0][0];

    let new_auth_type = !auth_type;

    storage.save(
        vec![&new_auth_type],
        "UPDATE user_preferences SET auth_type = ?1".to_string(),
    )?;

    Ok(())
}

/// Get authentication type from user preferences
#[tauri::command(rename_all = "snake_case")]
pub fn get_auth_type() -> AvailResult<bool> {
    let storage = PersistentStorage::new()?;

    let query = "SELECT auth_type FROM user_preferences".to_string();

    let res = storage.get_all::<bool>(&query, 1)?;

    let auth_type = res[0][0].clone();

    Ok(auth_type)
}

///get username from user preferences
#[tauri::command(rename_all = "snake_case")]
pub fn get_username() -> AvailResult<String> {
    let storage = PersistentStorage::new()?;

    let query = "SELECT username || '#' || tag AS username_tag FROM user_preferences;".to_string();

    let res = storage.get_all::<String>(&query, 1)?;

    match res.get(0) {
        Some(username) => {
            if username[0] == "#0" {
                return get_address_string();
            } else {
                return Ok(username[0].clone());
            }
        }
        None => Err(AvailError::new(
            AvailErrorType::LocalStorage,
            "No username found".to_string(),
            "No username found".to_string(),
        )),
    }
}

pub fn update_username_local(username: &str, tag: i32) -> AvailResult<()> {
    let storage = PersistentStorage::new()?;

    storage.save(
        vec![Box::new(username.to_string()), Box::new(tag.to_string())],
        "UPDATE user_preferences SET username = ?1, tag = ?2".to_string(),
    )?;

    Ok(())
}

/// Get network from user preferences
#[tauri::command(rename_all = "snake_case")]
pub fn get_network() -> AvailResult<String> {
    let storage = PersistentStorage::new()?;
    let query = "SELECT network FROM user_preferences".to_string();

    let res = storage.get_all::<String>(&query, 1)?;

    match res.get(0) {
        Some(network) => Ok(network[0].clone()),
        None => Err(AvailError::new(
            AvailErrorType::LocalStorage,
            "No network found".to_string(),
            "No network found".to_string(),
        )),
    }
}

/// Update network in user preferences
#[tauri::command(rename_all = "snake_case")]
pub fn update_network(network: EventNetwork) {
    let storage = PersistentStorage::new().unwrap();

    storage
        .save(
            vec![Box::new(network.to_string())],
            "UPDATE user_preferences SET network = ?1".to_string(),
        )
        .unwrap();
}

///get last sync height from user preferences
#[tauri::command(rename_all = "snake_case")]
pub fn get_last_sync() -> AvailResult<u32> {
    let storage = PersistentStorage::new()?;

    let query = "SELECT last_sync FROM user_preferences".to_string();

    let res = storage.get_all::<u32>(&query, 1)?;

    match res.get(0) {
        Some(last_sync) => Ok(last_sync[0].to_owned()),
        None => Err(AvailError::new(
            AvailErrorType::LocalStorage,
            "No last sync height found".to_string(),
            "No last sync height found".to_string(),
        )),
    }
}

///update last sync height in user preferences
pub fn update_last_sync(height: u32) -> AvailResult<()> {
    let storage = PersistentStorage::new()?;

    storage.save(
        vec![&height],
        "UPDATE user_preferences SET last_sync = ?1".to_string(),
    )?;

    Ok(())
}

fn handle_no_backup_found() -> AvailResult<DateTime<Utc>> {
    let backup_flag = get_backup_flag()?;

    match backup_flag {
        true => {
            // TODO - store everything since the creation of time and then update backup height

            Err(AvailError::new(
                AvailErrorType::LocalStorage,
                "No last backup height found, your encrypted data is being backed up.".to_string(),
                "No last backup height found, your encrypted data is being backed up".to_string(),
            ))
        }
        false => Ok(Utc::now()),
    }
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_last_backup_sync() -> AvailResult<DateTime<Utc>> {
    let storage = PersistentStorage::new()?;

    let query = "SELECT last_backup_sync FROM user_preferences".to_string();

    let res = storage.get_all::<Option<DateTime<Utc>>>(&query, 1)?;

    match res.get(0) {
        Some(last_backup) => match last_backup[0] {
            Some(last_backup) => Ok(last_backup.to_owned()),
            None => handle_no_backup_found(),
        },
        None => handle_no_backup_found(),
    }
}

#[tauri::command(rename_all = "snake_case")]
pub fn update_last_backup_sync(timestamp: DateTime<Utc>) -> AvailResult<()> {
    let storage = PersistentStorage::new()?;

    storage.save(
        vec![&timestamp],
        "UPDATE user_preferences SET last_backup_sync = ?1".to_string(),
    )?;

    Ok(())
}

/// get last transactions sync time from user preferences
pub fn get_last_tx_sync() -> AvailResult<i64> {
    let storage = PersistentStorage::new()?;

    let query = "SELECT last_tx_sync FROM user_preferences".to_string();

    let res = storage.get_all::<DateTime<Utc>>(&query, 1)?;

    let last_tx_sync = res[0][0].clone().timestamp();

    Ok(last_tx_sync)
}

/// update last transactions sync time in user preferences
pub fn update_last_tx_sync(timestamp: DateTime<Utc>) -> AvailResult<()> {
    let storage = PersistentStorage::new()?;

    storage.save(
        vec![&timestamp],
        "UPDATE user_preferences SET last_tx_sync = ?1".to_string(),
    )?;

    Ok(())
}

/// get public address from view session
pub fn get_address<N: Network>() -> AvailResult<Address<N>> {
    let storage = PersistentStorage::new()?;
    let query = "SELECT address FROM user_preferences".to_string();

    let res = storage.get_all::<String>(&query, 1)?;

    match res.get(0) {
        Some(address) => Ok(Address::<N>::from_str(&address[0])?),
        None => Err(AvailError::new(
            AvailErrorType::LocalStorage,
            "No address found".to_string(),
            "No address found".to_string(),
        )),
    }
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_address_string() -> AvailResult<String> {
    let storage = PersistentStorage::new()?;
    let query = "SELECT address FROM user_preferences".to_string();

    let res = storage.get_all::<String>(&query, 1)?;

    match res.get(0) {
        Some(address) => Ok(address[0].clone()),
        None => Err(AvailError::new(
            AvailErrorType::LocalStorage,
            "No address found".to_string(),
            "No address found".to_string(),
        )),
    }
}

pub fn update_address(address: &str) -> AvailResult<()> {
    let storage = PersistentStorage::new()?;

    storage.save(
        vec![Box::new(address.to_string())],
        "UPDATE user_preferences SET address = ?1".to_string(),
    )?;

    Ok(())
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_backup_flag() -> AvailResult<bool> {
    let storage = PersistentStorage::new()?;

    let query = "SELECT backup FROM user_preferences".to_string();

    let res = storage.get_all::<bool>(&query, 1)?;

    let backup = res[0].clone();

    Ok(backup[0])
}

#[tauri::command(rename_all = "snake_case")]
pub fn update_local_backup_flag(backup: bool) -> AvailResult<()> {
    let storage = PersistentStorage::new()?;

    storage.save(
        vec![&backup],
        "UPDATE user_preferences SET backup = ?1".to_string(),
    )?;

    Ok(())
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_language() -> AvailResult<Languages> {
    let storage = PersistentStorage::new()?;

    let query = "SELECT language FROM user_preferences".to_string();

    let res = storage.get_all::<String>(&query, 1)?;

    let language = match Languages::from_string_short(&res[0][0]) {
        Some(language) => language,
        None => Languages::English,
    };

    Ok(language)
}

#[tauri::command(rename_all = "snake_case")]
pub fn update_language(language: Languages) -> AvailResult<()> {
    let storage = PersistentStorage::new()?;

    storage.save(
        vec![Box::new(language.to_string_short())],
        "UPDATE user_preferences SET language = ?1".to_string(),
    )?;

    Ok(())
}

pub fn get_base_url() -> AvailResult<String> {
    let storage = PersistentStorage::new()?;

    let query = "SELECT base_url FROM user_preferences".to_string();

    let res = match storage.get_all::<String>(&query, 1) {
        Ok(res) => res,
        Err(e) => {
            update_base_url("obscura")?;
            return Ok("obscura".to_string());
        }
    };

    match res.first() {
        Some(base_url) => Ok(base_url[0].clone()),
        None => Err(AvailError::new(
            AvailErrorType::LocalStorage,
            "Error getting base url".to_string(),
            "Error getting base url".to_string(),
        )),
    }
}

pub fn update_base_url(base_url: &str) -> AvailResult<()> {
    let storage = PersistentStorage::new()?;

    // if storage.save fails add the base_url column to the user_preferences table
    match storage.save(
        vec![Box::new(base_url.to_string())],
        "UPDATE user_preferences SET base_url = ?1".to_string(),
    ) {
        Ok(_) => Ok(()),
        Err(_) => {
            storage.execute_query(
                "ALTER TABLE user_preferences ADD COLUMN base_url TEXT NOT NULL DEFAULT 'obscura'",
            )?;

            Ok(())
        }
    }
}

#[test]
fn test_initial_user_preferences() {
    initial_user_preferences(
        true,
        Some("Test".to_string()),
        Some(1234),
        false,
        false,
        "address".to_string(),
        Languages::English,
    )
    .unwrap();

    let storage = PersistentStorage::new().unwrap();

    let query = "SELECT auth_type FROM user_preferences".to_string();

    let res = storage.get_all::<String>(&query, 1).unwrap();

    print!("{:?}", res[0][0]);
    assert_eq!(res[0][0], "true".to_string());
}

#[test]
fn test_delete_user_preferences() {
    delete_user_preferences().unwrap();
}

#[test]
fn test_change_auth_type() {
    change_auth_type().unwrap();

    let res = get_auth_type().unwrap();

    assert_eq!(res, false);
}

#[test]
fn test_get_last_sync() {
    let res = get_last_sync().unwrap();

    print!("{}", res);
}

#[test]
fn test_update_last_sync() {
    update_last_sync(88329u32).unwrap();
}

#[test]
fn test_get_username() {
    let res = get_username().unwrap();

    print!("{}", res);
}

#[test]
fn test_get_network() {
    let res = get_network().unwrap();

    print!("{}", res);
    assert_eq!(res, "testnet3".to_string());
}

#[test]
fn test_get_address() {
    let address = get_address::<TestnetV0>().unwrap();

    print!("{}", address);
}

#[test]
fn test_get_address_string() {
    let address = get_address_string().unwrap();

    print!("{}", address);
}

#[test]
fn test_get_backup_flag() {
    let backup = get_backup_flag().unwrap();

    print!("{}", backup);
}

#[test]
fn test_update_backup_flag() {
    update_local_backup_flag(true).unwrap();
}

#[test]
fn test_update_base_url() {
    update_base_url("obscura").unwrap();
}

#[test]
fn test_get_base_url() {
    let base_url = get_base_url().unwrap();

    print!("{}", base_url);
}

#[tokio::test]
async fn test_timestamp_to_blockheight() {
    let timestamp = Utc::now();
    let timestamp = timestamp - chrono::Duration::days(10);

    let obscura_api_key = env!("OBSCURA_SDK");

    let client = tauri_plugin_http::reqwest::Client::new();
    let query = format!(
        "https://aleo-testnetbeta.obscura.network/api/{}/blocks/timestamps?start={}&end={}
    ",
        obscura_api_key,
        timestamp.timestamp(),
        timestamp.timestamp()
    );

    let response = client.get(query).send().await.unwrap();
    println!("{:?}", response);
    let response: Vec<Block<TestnetV0>> = response.json().await.unwrap();
    let latest_height = response[0].height();

    println!("Latest height: {}", latest_height);
}
