use security_framework::passwords_options::{PasswordOptions, AccessControlOptions};
use security_framework::passwords;

#[tauri::command(rename_all = "snake_case")]
pub fn store_password_apple(
    service: &str,
    username: &str,
    password: &str,
) -> Result<(), String> {
    // Set the access control options to require user presence
    let mut options = PasswordOptions::new_generic_password(service, username, "pass");
    options.set_access_control_options(AccessControlOptions::BIOMETRY_ANY);

    // Cast password into array of bytes
    let password: &[u8] = password.as_bytes();

    // Set password with keyring
    match passwords::set_password_internal(&mut options, password) {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_password(service: &str, username: &str) -> Result<String, String> {

    let pass = match passwords::get_generic_password(service, username, true, None, "pass"){
        Ok(pass) => pass,
        Err(e) => return Err(e.to_string())
    };

    let pass_string = match String::from_utf8(pass) {
        Ok(s) => s,
        Err(e) => return Err(e.to_string())
    };

    Ok(pass_string)
}
