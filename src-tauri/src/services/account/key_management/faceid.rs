use avail_common::errors::{AvailResult, AvailError, AvailErrorType};
use security_framework::passwords_options::{PasswordOptions, AccessControlOptions};
use security_framework::passwords;

#[tauri::command(rename_all = "snake_case")]
pub fn store_keys_ios(
    service: &str,
    account: &str,
    key: &str,
    label: &str,
) -> AvailResult<String> {
    // Set the access control options to require user presence
    let mut options = PasswordOptions::new_generic_password(service, account, label);
    options.set_access_control_options(AccessControlOptions::BIOMETRY_ANY);

    // Cast key into array of bytes
    let key_bytes: &[u8] = key.as_bytes();

    // Set password with keyring
    match passwords::set_password_internal(&mut options, key_bytes) {
        Ok(_) => Ok("Password stored".to_string()),
        Err(e) => Err(AvailError::new(
            AvailErrorType::InvalidData,
            e.to_string(),
            "Failed to store keys".to_string(),
        )),
    }
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_key_ios(
    service: &str,
    account: &str,
    label: &str
) -> AvailResult<String> {

    let pass = match passwords::get_generic_password(service, account, true, None, label){
        Ok(pass) => pass,
        Err(e) => return Err(AvailError::new(
            AvailErrorType::InvalidData,
            e.to_string(),
            "Failed to get key".to_string(),
        ))
    };

    let pass_string = match String::from_utf8(pass) {
        Ok(s) => s,
        Err(e) => return Err(AvailError::new(
            AvailErrorType::InvalidData,
            e.to_string(),
            "Failed to convert key to string".to_string(),
        ))
    };

    Ok(pass_string)
}

#[tauri::command(rename_all = "snake_case")]
pub fn delete_key_ios(
    service: &str,
    account: &str,
    label:&str
) -> AvailResult<String> {
    match passwords::delete_generic_password(service, account, label) {
        Ok(_) => Ok("Key deleted".to_string()),
        Err(e) => Err(AvailError::new(
            AvailErrorType::InvalidData,
            e.to_string(),
            "Failed to delete key".to_string(),
        ))
    }
}
