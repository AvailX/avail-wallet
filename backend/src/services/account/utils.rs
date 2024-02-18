use avail_common::errors::{AvailError, AvailErrorType, AvailResult};
use rand::Rng;
use std::process::Command;

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
        Ok(_) => return Ok(()),
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::Internal,
                format!("Error opening url: {}", e),
                "Error opening url".to_string(),
            ))
        }
    };

    #[cfg(target_os = "macos")]
    match Command::new("open").arg(url).spawn() {
        Ok(_) => return Ok(()),
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::Internal,
                format!("Error opening url: {}", e),
                "Error opening url".to_string(),
            ))
        }
    };

    #[cfg(target_os = "linux")]
    match Command::new("xdg-open").arg(url).spawn() {
        Ok(_) => return Ok(()),
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::Internal,
                format!("Error opening url: {}", e),
                "Error opening url".to_string(),
            ))
        }
    };
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
