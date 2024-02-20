use crate::api::client::SESSION;
use crate::helpers::utils::HOST;
use crate::models::auth::{CreateSessionRequest, VerifySessionResponse};
use crate::services::local_storage::{
    persistent_storage::{get_address_string, get_network},
    session::password::PASS,
    utils::{sign_message, sign_message_w_key},
};
use snarkvm::prelude::*;
use tauri_plugin_http::reqwest;

use avail_common::{
    errors::{AvailError, AvailErrorType, AvailResult},
    models::{
        network::SupportedNetworks,
        server_auth::{self, VerifySessionRequest},
    },
};

/// Authenticates user both locally and on server.
#[tauri::command(rename_all = "snake_case")]
pub async fn get_session(password: Option<String>) -> AvailResult<String> {
    let address = get_address_string()?;
    let session_request = request_hash(&address).await?;

    let network = get_network()?;

    let (sig, _) = match SupportedNetworks::from_str(&network)? {
        SupportedNetworks::Testnet3 => {
            sign_message::<Testnet3>(&session_request.hash, password.clone())?
        }
        _ => sign_message::<Testnet3>(&session_request.hash, password.clone())?,
    };

    let verify_request = server_auth::VerifySessionRequest {
        signature: sig.to_string(),
        session_id: session_request.session_id,
    };

    let api = env!("API");

    let client = reqwest::Client::new();

    let res = client
        .post(format!("{}/auth/login/", api))
        .json(&verify_request)
        .send()
        .await?;

    if res.status() == 200 {
        let cookie = res.cookies().next();

        let session_cookie = match cookie {
            Some(cookie) => cookie,
            None => {
                return Err(AvailError::new(
                    AvailErrorType::Validation,
                    "Session cookie not found in auth response".to_string(),
                    "Session cookie not found in auth response".to_string(),
                ))
            }
        };

        SESSION.set_session_token(session_cookie.value().to_string());

        let _pass_session = match password {
            Some(password) => PASS.set_pass_session(&password)?,
            None => {}
        };

        Ok(session_request.session_id.to_string())
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Invalid Signature".to_string(),
            "Invalid Signature".to_string(),
        ))
    }
}

pub async fn get_session_after_creation<N: Network>(
    private_key: &PrivateKey<N>,
) -> AvailResult<String> {
    let address = Address::<N>::try_from(private_key)?;
    let session_request = request_hash(&address.to_string()).await?;

    let (sig, _) = sign_message_w_key::<N>(&session_request.hash, private_key)?;

    let verify_request = server_auth::VerifySessionRequest {
        signature: sig.to_string(),
        session_id: session_request.session_id,
    };

    let api = env!("API");

    let res = reqwest::Client::new()
        .post(format!("{}/auth/login/", api))
        .json(&verify_request)
        .send()
        .await?;

    if res.status() == 200 {
        let cookie = res.cookies().next();

        let session_cookie = match cookie {
            Some(cookie) => cookie,
            None => {
                return Err(AvailError::new(
                    AvailErrorType::Validation,
                    "Session cookie not found in auth response".to_string(),
                    "Session cookie not found in auth response".to_string(),
                ))
            }
        };

        SESSION.set_session_token(session_cookie.value().to_string());

        Ok(session_request.session_id.to_string())
    } else {
        if res.status() == 0 {
            return Err(AvailError::new(
                AvailErrorType::Network,
                "No internet connection".to_string(),
                "No internet connection".to_string(),
            ));
        }

        Err(AvailError::new(
            AvailErrorType::External,
            "Invalid Signature".to_string(),
            "Invalid Signature".to_string(),
        ))
    }
}

/// requests the initial hash to sign from server
/// Function 1
pub async fn request_hash(address: &str) -> AvailResult<server_auth::CreateSessionResponse> {
    let client = reqwest::Client::new();

    let request = server_auth::CreateSessionRequest {
        public_key: address.to_owned(),
    };

    let api = env!("API");

    let res = client
        .post(format!("{}/auth/request/", api))
        .header("Content-Type", "application/json")
        .json(&request)
        .send()
        .await?;

    if res.status() == 201 {
        Ok(res.json::<server_auth::CreateSessionResponse>().await?)
    } else {
        if res.status() == 0 {
            return Err(AvailError::new(
                AvailErrorType::Network,
                "No internet connection".to_string(),
                "No internet connection".to_string(),
            ));
        }

        Err(AvailError::new(
            AvailErrorType::External,
            "Error requesting auth token.".to_string(),
            "Error requesting auth token.".to_string(),
        ))
    }
}

/* -- Not used -- */

///Function 2
pub fn sign_hash(
    request: CreateSessionRequest,
    password: Option<String>,
) -> AvailResult<VerifySessionRequest> {
    let network = get_network()?;

    let (sig, _) = match SupportedNetworks::from_str(&network)? {
        SupportedNetworks::Testnet3 => sign_message::<Testnet3>(&request.hash, password)?,
        _ => sign_message::<Testnet3>(&request.hash, password)?,
    };

    let verify_request = server_auth::VerifySessionRequest {
        signature: sig.to_string(),
        session_id: request.to_response().session_id,
    };

    Ok(verify_request)
}

///Function 3
pub async fn get_session_only(request: VerifySessionResponse) -> AvailResult<String> {
    let client = reqwest::Client::new();

    let res = client
        .post("https://test-api.avail.global/auth/login/")
        .json(&request.to_request())
        .send()
        .await?;

    if res.status() == 200 {
        res.json::<String>().await?;
        // store session id in local storage (cookies)
        Ok(request.session_id.to_string())
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Invalid Signature".to_string(),
            "Invalid Signature".to_string(),
        ))
    }
}

#[cfg(test)]
mod tests {

    use super::*;

    use crate::api::encrypted_data::get_new_transaction_messages;
    use crate::api::user::create_user;
    use crate::models::storage::languages::Languages;
    use crate::models::wallet::BetterAvailWallet;
    use crate::services::account::key_management::desktop::{delete_key, store};
    use crate::services::account::utils::generate_discriminant;
    use crate::services::local_storage::encrypted_data::delete_user_encrypted_data;
    use crate::services::local_storage::persistent_storage::{
        delete_user_preferences, initial_user_preferences,
    };
    use crate::services::local_storage::session::view::VIEWSESSION;
    use avail_common::models::constants::{STRONG_PASSWORD, TESTNET_PRIVATE_KEY};
    use avail_common::models::user::User;
    use snarkvm::prelude::Testnet3;

    use avail_common::converters::messages::{field_to_fields, utf8_string_to_bits};

    #[tokio::test]
    async fn test_setup_prerequisites() {
        match delete_key::<Testnet3>(STRONG_PASSWORD) {
            Ok(_) => println!("Key Deleted"),
            Err(_) => println!("No key found"),
        }

        // delete_user().await.unwrap();
        delete_user_encrypted_data().unwrap();
        delete_user_preferences().unwrap();

        let p_key = PrivateKey::<Testnet3>::new(&mut rand::thread_rng()).unwrap();
        let wallet = BetterAvailWallet::<Testnet3>::try_from(p_key.to_string()).unwrap();

        let v_key = ViewKey::<Testnet3>::try_from(&p_key).unwrap();

        let tag = generate_discriminant();

        initial_user_preferences(
            false,
            Some("Karp".to_string()),
            Some(tag),
            false,
            false,
            v_key.to_address().to_string(),
            Languages::English,
        )
        .unwrap();

        VIEWSESSION.set_view_session(&v_key.to_string()).unwrap();

        let user_request = User {
            address: v_key.to_address().to_string(),
            username: Some("Karp".to_string()),
            tag: Some(tag),
            backup: false,
        };

        create_user(user_request).await.unwrap();

        store::<Testnet3>(&wallet, STRONG_PASSWORD).unwrap();
    }

    #[tokio::test]
    async fn test_get_session_password() {
        //let username = get_username().unwrap();
        // test_setup_prerequisites();
        let session = get_session(Some(STRONG_PASSWORD.to_string()))
            .await
            .unwrap();
        print!("{}", session);

        get_new_transaction_messages::<Testnet3>().await.unwrap();

        println!("Successful fetch");

        //let address =name_to_address::<Testnet3>(&username).await.unwrap();
        //let user = get_user().await.unwrap();
    }

    #[tokio::test]
    async fn test_request_hash() {
        let address = get_address_string().unwrap();

        let hash = request_hash(&address).await;
        print!("{}", hash.unwrap().hash);
        // assert!(hash.is_ok());
    }

    #[test]
    fn test_sign_hash() {
        let sig = {
            let key = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();

            //get private key from local storage

            let rng = &mut rand::thread_rng();

            let msg = utf8_string_to_bits("KEqj6BDUl0Nh0izyOsXuW916qSoGxtfE");
            let msg_field = Testnet3::hash_bhp512(&msg).unwrap();
            let msg = field_to_fields(&msg_field).unwrap();

            key.sign(&msg, rng).unwrap()
        };

        print!("{}", sig.to_string());
    }
}
