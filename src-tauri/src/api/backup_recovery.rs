use snarkvm::{console::program::Itertools, prelude::Network};
use std::str::FromStr;
use tauri_plugin_http::reqwest;
use uuid::Uuid;

use crate::{
    api::client::get_backup_client_with_session,
    models::pointers::message::TransactionMessage,
    services::local_storage::{
        persistent_storage::{get_address_string, get_last_tx_sync, update_last_tx_sync},
        session::view::VIEWSESSION,
    },
};

use avail_common::{
    errors::{AvError, AvailError, AvailErrorType, AvailResult},
    models::{
        encrypted_data::{
            Data, DataRequest, EncryptedData, EncryptedDataRecord, EncryptedDataSyncRequest,
            EncryptedDataUpdateRequest, PageRequest,
        },
        traits::encryptable::EncryptedStruct,
    },
};

pub async fn update_sync_height(address: String, sync_height: String) -> AvailResult<String> {
    let path = format!(
        "sync_height/{address}/{height}",
        address = address,
        height = sync_height
    );
    let res = match get_backup_client_with_session(reqwest::Method::POST, &path)?
        .send()
        .await
    {
        Ok(res) => res,
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::External,
                "Error updating sync height ".to_string(),
                e.to_string(),
            ));
        }
    };

    if res.status() == 200 {
        let _result = match res.text().await {
            Ok(res) => res,
            Err(e) => {
                return Err(AvailError::new(
                    AvailErrorType::External,
                    "Error updating sync height ".to_string(),
                    e.to_string(),
                ));
            }
        };
    } else if res.status() == 401 {
        return Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ));
    } else {
        return Err(AvailError::new(
            AvailErrorType::External,
            "Error updating sync height ".to_string(),
            "Error updating sync height".to_string(),
        ));
    }

    Ok("Updated Succesfully".to_string())
}

pub async fn update_backup_timestamp(address: String, timestamp: i64) -> AvailResult<String> {
    let path = format!(
        "backup_timestamp/{address}/{timestamp}",
        address = address,
        timestamp = timestamp
    );
    let res = match get_backup_client_with_session(reqwest::Method::POST, &path)?
        .send()
        .await
    {
        Ok(res) => res,
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::External,
                "Error updating timestamp ".to_string(),
                e.to_string(),
            ));
        }
    };

    if res.status() == 200 {
        let _result = match res.text().await {
            Ok(res) => res,
            Err(e) => {
                return Err(AvailError::new(
                    AvailErrorType::External,
                    "Error updating timestamp ".to_string(),
                    e.to_string(),
                ));
            }
        };
    } else if res.status() == 401 {
        return Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ));
    } else {
        return Err(AvailError::new(
            AvailErrorType::External,
            "Error updating timestamp ".to_string(),
            "Error updating timestamp".to_string(),
        ));
    }

    Ok("Updated Succesfully".to_string())
}

pub async fn get_sync_height(address: String) -> AvailResult<String> {
    let path = format!("get_sync_height/{address}", address = address);
    let res = match get_backup_client_with_session(reqwest::Method::GET, &path)?
        .send()
        .await
    {
        Ok(res) => res,
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::External,
                "Error getting sync height ".to_string(),
                e.to_string(),
            ));
        }
    };

    if res.status() == 200 {
        let result = match res.json::<String>().await {
            Ok(res) => res,
            Err(e) => {
                return Err(AvailError::new(
                    AvailErrorType::External,
                    "Error getting sync height ".to_string(),
                    e.to_string(),
                ));
            }
        };
        Ok(result)
    } else if res.status() == 401 {
        return Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ));
    } else {
        return Err(AvailError::new(
            AvailErrorType::External,
            "Error getting encrypted data ".to_string(),
            "Error getting encrypted data".to_string(),
        ));
    }
}

pub async fn get_backup_timestamp(address: String) -> AvailResult<i64> {
    let path = format!("get_backup_timestamp/{address}", address = address);
    let res = match get_backup_client_with_session(reqwest::Method::GET, &path)?
        .send()
        .await
    {
        Ok(res) => res,
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::External,
                "Error getting backup timestamp ".to_string(),
                e.to_string(),
            ));
        }
    };

    if res.status() == 200 {
        let result = match res.json::<i64>().await {
            Ok(res) => res,
            Err(e) => {
                return Err(AvailError::new(
                    AvailErrorType::External,
                    "Error getting backup timestamp ".to_string(),
                    e.to_string(),
                ));
            }
        };

        Ok(result)
    } else if res.status() == 401 {
        return Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ));
    } else {
        return Err(AvailError::new(
            AvailErrorType::External,
            "Error getting encrypted data ".to_string(),
            "Error getting encrypted data".to_string(),
        ));
    }
}
