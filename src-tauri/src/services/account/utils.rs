use avail_common::errors::{AvailError, AvailErrorType, AvailResult};
use rand::Rng;
use std::process::Command;
use std::str::FromStr;

use crate::api::aleo_client::{network_status, Status};
use crate::services::local_storage::persistent_storage::get_network;
use avail_common::models::network::SupportedNetworks;

use snarkvm::prelude::TestnetV0;

pub fn generate_discriminant() -> u32 {
    let mut rng = rand::thread_rng();
    let mut discriminant: u32 = 0;
    for _ in 0..4 {
        discriminant = discriminant * 10 + rng.gen_range(0..10);
    }
    discriminant
}

#[tauri::command(rename_all = "snake_case")]
pub fn open_url(url: &str) -> AvailResult<()> {
    #[cfg(target_os = "windows")]
    match Command::new("cmd").args(&["/c", "start", url]).spawn() {
        Ok(_) => Ok(()),
        Err(e) => Err(AvailError::new(
            AvailErrorType::Internal,
            format!("Error opening url: {}", e),
            "Error opening url".to_string(),
        )),
    }

    #[cfg(target_os = "macos")]
    match Command::new("open").arg(url).spawn() {
        Ok(_) => Ok(()),
        Err(e) => Err(AvailError::new(
            AvailErrorType::Internal,
            format!("Error opening url: {}", e),
            "Error opening url".to_string(),
        )),
    }

    #[cfg(target_os = "linux")]
    match Command::new("xdg-open").arg(url).spawn() {
        Ok(_) => Ok(()),
        Err(e) => Err(AvailError::new(
            AvailErrorType::Internal,
            format!("Error opening url: {}", e),
            "Error opening url".to_string(),
        )),
    }
}

#[tauri::command(rename_all = "snake_case")]
pub fn os_type() -> AvailResult<String> {
    #[cfg(target_os = "windows")]
    return Ok("windows".to_string());

    #[cfg(target_os = "macos")]
    return Ok("macos".to_string());

    #[cfg(target_os = "linux")]
    return Ok("linux".to_string());
}

#[tauri::command(rename_all = "snake_case")]
pub async fn network_status_check() -> AvailResult<(Status)> {
    let network = get_network()?;

    match SupportedNetworks::from_str(network.as_str())? {
        SupportedNetworks::Testnet => network_status::<TestnetV0>(),
    }
}

#[test]
fn test_generate_discriminant() {
    let discriminant = generate_discriminant();
    print!("discriminant: {}", discriminant);
    assert!(discriminant > 999 && discriminant < 10000);
}

#[test]
fn test_open_url() {
    let result = open_url("https://discord.gg/A6N5X2yX");
    assert!(result.is_ok());
}
