use snarkvm::prelude::*;
use std::str::FromStr;
use tauri_plugin_http::reqwest;

use crate::api::client::get_um_client_with_session;
use crate::helpers::utils::HOST;
use crate::helpers::validation::validate_address;
use crate::models::account::AddressRequest;
use crate::services::local_storage::persistent_storage::{
    get_backup_flag, update_local_backup_flag,
};
use crate::services::{
    account::utils::generate_discriminant,
    local_storage::persistent_storage::{get_address_string, update_username_local},
};

use avail_common::{
    errors::{AvailError, AvailErrorType, AvailResult},
    models::user::{UpdateBackupRequest, User},
};

/* --USER SERVICE-- */

// create user online account
pub async fn create_user(request: User) -> AvailResult<String> {
    let client = reqwest::Client::new();

    let res = client
        .post(format!("http://{}:8000/user", HOST))
        .json(&request)
        .send()
        .await?;

    if res.status() == 200 {
        Ok("User created".to_string())
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error creating user".to_string(),
            "Error creating user".to_string(),
        ))
    }
}

// get user online account
pub async fn get_user() -> AvailResult<User> {
    let res = get_um_client_with_session(reqwest::Method::GET, "user")?
        .send()
        .await?;

    if res.status() == 200 {
        let user: User = res.json().await?;

        Ok(user)
    } else if res.status() == 401 {
        Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ))
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error getting user".to_string(),
            "Error getting user".to_string(),
        ))
    }
}

/// delete user on server-side
pub async fn delete_user() -> AvailResult<String> {
    let res = get_um_client_with_session(reqwest::Method::DELETE, "user")?
        .send()
        .await?;

    if res.status() == 200 {
        Ok("User deleted".to_string())
    } else if res.status() == 401 {
        Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ))
    } else if res.status() == 404 {
        Ok("User not found".to_string())
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error deleting user account on server side.".to_string(),
            "Error deleting online account.".to_string(),
        ))
    }
}

//get aleo address from username
pub async fn name_to_address<N: Network>(username: &str) -> AvailResult<Address<N>> {
    let _validation = match validate_address(username) {
        Ok(_) => return Ok(Address::<N>::from_str(username)?),
        Err(_) => false,
    };

    let request = AddressRequest {
        username: username.to_string(),
    };

    let res = get_um_client_with_session(reqwest::Method::GET, &format!("user_address"))?
        .json(&request)
        .send()
        .await?;

    if res.status() == 200 {
        let address: String = res.json().await?;

        print!("{}", address);

        let address = Address::<N>::from_str(&address).unwrap();

        Ok(address)
    } else if res.status() == 401 {
        Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ))
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error getting address".to_string(),
            "Error getting address".to_string(),
        ))
    }
}

pub async fn get_username(address: &str) -> AvailResult<Option<String>> {
    let res = get_um_client_with_session(reqwest::Method::GET, &format!("username/{}", address))?
        .send()
        .await?;

    if res.status() == 200 {
        let username: Option<String> = res.json().await?;

        Ok(username)
    } else if res.status() == 401 {
        Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ))
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error getting username".to_string(),
            "Error getting username".to_string(),
        ))
    }
}

#[tauri::command(rename_all = "snake_case")]
pub async fn update_username(username: &str) -> AvailResult<String> {
    let address = get_address_string()?;
    let backup = get_backup_flag()?;

    let tag = generate_discriminant();

    let res = get_um_client_with_session(reqwest::Method::PUT, "user")?
        .json(&User::new(
            Some(username.to_string()),
            address,
            Some(tag as u32),
            backup,
        ))
        .send()
        .await?;

    if res.status() == 200 {
        update_username_local(username, tag as i32)?;
        Ok("Username updated".to_string())
    } else if res.status() == 401 {
        Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ))
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error updating username".to_string(),
            "Error updating username".to_string(),
        ))
    }
}

#[tauri::command(rename_all = "snake_case")]
pub async fn update_backup_flag(backup_flag: bool) -> AvailResult<()> {
    let request = UpdateBackupRequest {
        backup: backup_flag,
    };

    // TODO - Handle backup flag being false and server side backup being true
    // Should backup get deleted on server side?

    let res = get_um_client_with_session(reqwest::Method::PUT, "backup")?
        .json(&request)
        .send()
        .await?;

    if res.status() == 200 {
        update_local_backup_flag(backup_flag)?;
        Ok(())
    } else if res.status() == 401 {
        Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ))
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error updating username".to_string(),
            "Error updating username".to_string(),
        ))
    }
}

#[cfg(test)]

mod tests {
    use super::*;

    #[tokio::test]
    async fn test_create_user() {
        let address = "aleo1ckcdjd9wned6s9eqprf2km88znlmh2je03jg2ctxat5k4hllzuqq47j3zg".to_string();
        let username = Some("AvailInhabitantX".to_string());
        let tag = 1234;

        let request = User::new(username, address, Some(tag as u32), false);

        // let result = block_on(create_user(request)).unwrap();

        let result = create_user(request).await.unwrap();
        println!("{:?}", result);
    }

    #[tokio::test]
    async fn test_name_to_address() {
        let username = "AvailInhabitantX";

        let result = name_to_address::<Testnet3>(username).await.unwrap();
        println!("{:?}", result);
    }

    #[tokio::test]
    async fn test_delete_user() {
        let result = delete_user().await.unwrap();
        println!("{:?}", result);
    }
}
