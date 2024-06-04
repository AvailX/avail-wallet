use avail_common::models::mobile_prover::ProverRequest;
use http::request;
use http::Method;
use snarkvm::prelude::*;
use std::str::FromStr;

use crate::api::client::{get_prover_client_with_session, get_um_client_with_session};
use crate::helpers::utils::HOST;
use crate::helpers::validation::validate_address;
use crate::models::account::AddressRequest;
use crate::services::local_storage::persistent_storage::{
    get_backup_flag, update_local_backup_flag,
};
use tauri_plugin_http::reqwest;

use crate::services::{
    account::utils::generate_discriminant,
    local_storage::persistent_storage::{get_address_string, update_username_local},
};

use avail_common::{
    errors::{AvailError, AvailErrorType, AvailResult},
    models::user::{UpdateBackupRequest, User},
    // service_clients::get_prover_client_with_session,
};

pub async fn delegate_execution(request: ProverRequest) -> AvailResult<String> {
    let res = match get_prover_client_with_session(reqwest::Method::POST, "delegateProving")?
        .json(&request)
        .send()
        .await
    {
        Ok(res) => res,
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::External,
                e.to_string(),
                "Error updating encrypted data record ".to_string(),
            ));
        }
    };
    println!("Prover Response{:?}", res);
    if res.status() == 200 {
        let result = match res.text().await {
            Ok(res) => res,
            Err(e) => {
                return Err(AvailError::new(
                    AvailErrorType::External,
                    e.to_string(),
                    "Error delegating proving".to_string(),
                ));
            }
        };

        Ok(result)
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error delegating data".to_string(),
            "Error delegating data".to_string(),
        ))
    }
}

#[cfg(test)]

mod tests {
    use super::*;
}
