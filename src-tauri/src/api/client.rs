use std::sync::{Arc, RwLock};

use avail_common::errors::{AvailError, AvailErrorType, AvailResult};
use once_cell::sync::Lazy;

use crate::helpers::utils::HOST;
use tauri_plugin_http::reqwest;

pub fn get_rm_client_with_session(
    method: reqwest::Method,
    path: &str,
) -> AvailResult<reqwest::RequestBuilder> {
    let api = env!("API");

    let client = reqwest::Client::new();
    let cookie_name = "id";

    let session = match SESSION.get_session_token() {
        Some(session) => session,
        None => {
            return Err(AvailError::new(
                AvailErrorType::Validation,
                "Session not found".to_string(),
                "Session not found".to_string(),
            ))
        }
    };

    let cookie_value = format!("{}={}", cookie_name, session);
    let url = format!("{}/encrypted_data/{}", api, path);

    let request = client
        .request(method, url)
        .header(reqwest::header::COOKIE, cookie_value);
    Ok(request)
}

pub fn get_backup_client_with_session(
    method: reqwest::Method,
    path: &str,
) -> AvailResult<reqwest::RequestBuilder> {
    let api = env!("API");

    let client = reqwest::Client::new();
    let cookie_name = "id";

    let session = match SESSION.get_session_token() {
        Some(session) => session,
        None => {
            return Err(AvailError::new(
                AvailErrorType::Validation,
                "Session not found".to_string(),
                "Session not found".to_string(),
            ))
        }
    };

    let cookie_value = format!("{}={}", cookie_name, session);
    let url = format!("{}/backup-recovery/{}", api, path);
    println!("URL: {:?}", url);
    let request = client
        .request(method, url)
        .header(reqwest::header::COOKIE, cookie_value);
    Ok(request)
}

pub fn get_um_client_with_session(
    method: reqwest::Method,
    path: &str,
) -> AvailResult<reqwest::RequestBuilder> {
    let api = env!("API");

    let client = reqwest::Client::new();
    let cookie_name = "id";

    let session = match SESSION.get_session_token() {
        Some(session) => session,
        None => {
            return Err(AvailError::new(
                AvailErrorType::Validation,
                "Session not found".to_string(),
                "Session not found".to_string(),
            ))
        }
    };

    let cookie_value = format!("{}={}", cookie_name, session);

    let url = format!("{}/{}", api, path);
    let request = client
        .request(method, url)
        .header(reqwest::header::COOKIE, cookie_value);

    Ok(request)
}

// create a global state of a session string called SESSION

#[derive(Debug)]
pub struct Session {
    pub session: RwLock<Option<String>>,
}

impl Session {
    pub fn new() -> Self {
        Self {
            session: RwLock::new(None),
        }
    }

    pub fn set_session_token(&self, token: String) {
        let mut token_write = self.session.write().unwrap();
        *token_write = Some(token);
    }

    pub fn get_session_token(&self) -> Option<String> {
        let token_read = self.session.read().unwrap();
        token_read.clone()
    }
}

pub static SESSION: Lazy<Arc<Session>> = Lazy::new(|| Arc::new(Session::new()));

#[test]
fn test_session() {
    SESSION.set_session_token("test".to_string());
    let token = SESSION.get_session_token();
    assert_eq!(token, Some("test".to_string()));
}
