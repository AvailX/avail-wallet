use avail_common::models::mobile_prover::ProverRequest;
use snarkvm::prelude::*;
use std::str::FromStr;
use tauri_plugin_http::reqwest;

use crate::api::client::{get_prover_client_with_session, get_um_client_with_session};
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

pub async fn delegate_execution(request: ProverRequest) -> AvailResult<String> {
    let api = env!("API");

    let client = reqwest::Client::new();

    let res = get_prover_client_with_session(reqwest::Method::POST, "delegateProving")?
        .json(&request)
        .send()
        .await?;
    println!("Prover Response{:?}", res);
    if res.status() == 200 {
        Ok(res.text().await?)
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error creating user".to_string(),
            "Error creating user".to_string(),
        ))
    }
}

#[cfg(test)]

mod tests {
    use super::*;
}
