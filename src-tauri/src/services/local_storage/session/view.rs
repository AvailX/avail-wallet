use avail_common::errors::{AvailError, AvailErrorType, AvailResult};
use once_cell::sync::Lazy;
use std::{
    str::FromStr,
    sync::{Arc, RwLock},
};

use snarkvm::prelude::{Network, ViewKey};

pub struct ViewSession {
    view_key: RwLock<Option<String>>,
}

impl ViewSession {
    pub fn new() -> Self {
        Self {
            view_key: RwLock::new(None),
        }
    }

    pub fn set_view_session(&self, view_key: &str) -> AvailResult<()> {
        let mut view_key_lock = self.view_key.write().unwrap();
        *view_key_lock = Some(view_key.to_string());
        Ok(())
    }

    pub fn get_instance<N: Network>(&self) -> AvailResult<ViewKey<N>> {
        let view_key_lock = self.view_key.read().unwrap();
        let view_key = match &*view_key_lock {
            Some(view_key) => view_key,
            None => {
                return Err(AvailError::new(
                    AvailErrorType::Validation,
                    "View Key not found".to_string(),
                    "View Key not found".to_string(),
                ))
            }
        };
        let view_key = ViewKey::<N>::from_str(view_key)?;
        Ok(view_key)
    }
}

pub static VIEWSESSION: Lazy<Arc<ViewSession>> = Lazy::new(|| Arc::new(ViewSession::new()));

mod test_view_session {

    use super::*;
    use avail_common::models::constants::*;
    use snarkvm::prelude::Testnet3;

    #[test]
    fn test_view_session() {
        let view_key = ViewKey::<Testnet3>::from_str(TESTNET3_VIEW_KEY).unwrap();
        VIEWSESSION.set_view_session(&view_key.to_string()).unwrap();
        let view_key = VIEWSESSION.get_instance::<Testnet3>().unwrap();
        assert_eq!(view_key.to_string(), TESTNET3_VIEW_KEY);
    }
}
