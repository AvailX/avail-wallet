use avail_common::errors::{AvailError, AvailErrorType, AvailResult};
use once_cell::sync::Lazy;
use std::{
    sync::{Arc, RwLock},
    time::{Duration, Instant},
};

pub struct PassSession {
    password: RwLock<Option<String>>,
    expiration: RwLock<Instant>,
}

impl PassSession {
    pub fn new() -> Self {
        Self {
            password: RwLock::new(None),
            expiration: RwLock::new(Instant::now()),
        }
    }

    pub fn set_pass_session(&self, password: &str) -> AvailResult<()> {
        let mut password_lock = self.password.write().unwrap();
        let mut expiration_lock = self.expiration.write().unwrap();
        *password_lock = Some(password.to_string());

        // Set expiration to 5 minutes from now
        *expiration_lock = Instant::now() + Duration::from_secs(5 * 60);
        Ok(())
    }

    pub fn extend_session(&self) -> AvailResult<()> {
        let mut expiration_lock = self.expiration.write().unwrap();
        // Extend expiration to 5 minutes from now
        *expiration_lock = Instant::now() + Duration::from_secs(5 * 60);
        Ok(())
    }

    pub fn get_instance(&self) -> AvailResult<String> {
        let expiration_lock = self.expiration.read().unwrap();
        if Instant::now() > *expiration_lock {
            let mut password_lock = self.password.write().unwrap();
            *password_lock = None; // Clear the password as session expired

            return Err(AvailError::new(
                AvailErrorType::Unauthorized,
                "Session expired, please reauthenticate.".to_string(),
                "Session expired, please reauthenticate.".to_string(),
            ));
        }
        drop(expiration_lock); // Release the read lock before acquiring the write lock

        let password_lock = self.password.read().unwrap();
        match &*password_lock {
            Some(password) => Ok(password.to_owned()),
            None => Err(AvailError::new(
                AvailErrorType::Unauthorized,
                "Unauthorized, please reauthenticate.".to_string(),
                "Unauthorized, please reauthenticate.".to_string(),
            )),
        }
    }
}

pub static PASS: Lazy<Arc<PassSession>> = Lazy::new(|| Arc::new(PassSession::new()));

mod test_pass_session {
    use super::*;

    #[test]
    fn test_pass_session() {
        PASS.set_pass_session("password").unwrap();
        let password = PASS.get_instance().unwrap();
        assert_eq!(password, "password");
    }
}
