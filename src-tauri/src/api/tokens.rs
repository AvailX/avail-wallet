use tauri_plugin_http::reqwest;

use crate::helpers::utils::HOST;

use avail_common::{
    errors::{AvailError, AvailErrorType, AvailResult},
    models::tokens::Token,
};
//TODO - Update for V2

/* --TOKENS-- */

/// Fetches list of tokens to be listed to user in ui, for example for swaps.
#[tokio::main(flavor = "current_thread")]
pub async fn get_token_list() -> AvailResult<Vec<Token>> {
    let client = reqwest::Client::new();

    let res = client
        .get(format!("http://{}:8100/token", HOST))
        .send()
        .await?;

    if res.status() == 200 {
        let result: Vec<Token> = res.json().await?;

        Ok(result)
    } else if res.status() == 401 {
        Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ))
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error getting token list.".to_string(),
            "Error getting token list.".to_string(),
        ))
    }
}

#[cfg(test)]

mod tests {
    use super::*;

    #[test]
    fn test_get_token_list() {
        let result = get_token_list().unwrap();
        println!("{:?}", result);
    }
}
