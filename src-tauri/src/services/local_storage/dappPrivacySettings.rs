use crate::models::storage::persistent::PersistentStorage;
use avail_common::errors::{AvailError, AvailErrorType, AvailResult};

pub fn init_dapp_privacy_settings() -> AvailResult<()> {
    let storage = PersistentStorage::new()?;
    storage.execute_query(
        "CREATE TABLE IF NOT EXISTS dapp_privacy_settings (
            url TEXT PRIMARY KEY NOT NULL,
            trusted BOOLEAN NOT NULL
        )",
    )?;
    Ok(())
}

pub fn create_dapp_privacy_settings(url: &str, trusted: &bool) -> AvailResult<()> {
    let storage = PersistentStorage::new()?;
    let query = "INSERT INTO dapp_privacy_settings (url, trusted) VALUES ($1, $2);";
    storage.execute_query(query, &[&url, &trusted])?;
    Ok(())
}

pub fn read_dapp_privacy_settings(url: &str) -> AvailResult<Option<bool>> {
    let storage = PersistentStorage::new()?;
    let query = "SELECT trusted FROM dapp_privacy_settings WHERE url = $1;";
    let result = storage.get_one::<bool>(&query, url)?;
    Ok(result)
}

pub fn update_dapp_privacy_settings(url: &str, trusted: &bool) -> AvailResult<()> {
    let storage = PersistentStorage::new()?;
    let query = "UPDATE dapp_privacy_settings SET trusted = $1 WHERE url = $2;";
    storage.execute_query(query, &[&trusted, &url])?;
    Ok(())
}

pub fn drop_dapp_privacy_settings(url: &str) -> AvailResult<()> {
    let storage = PersistentStorage::new()?;
    let query = "DELETE FROM dapp_privacy_settings WHERE url = $1";
    storage.execute_query(query, url)?;
    Ok()
}

#[cfg(test)]
mod test_dapp_privacy_settings {
    use super::*;

    #[test]
    fn test_create_dapp_privacy_settings() {
        // Call init_dapp_privacy_settings
        let result = create_dapp_privacy_settings();

        // Assert that the result is Ok(())
        assert!(result.is_ok());
    }

    #[test]
    fn test_create_dapp_privacy_settings() {
        // Arrange: Define test input
        let url = "example.com";
        let trusted = true;

        // Act: Call the function under test
        let result = create_dapp_privacy_settings(url, trusted);

        // Assert: Verify the result
        assert!(result.is_ok(), "Expected Ok result");
    }

    #[test]
    fn test_read_dapp_privacy_settings() {
        // Assuming URL exists in the table
        let url = "example.com";
        
        // Call read_dapp_privacy_settings
        let result = read_dapp_privacy_settings(url);

        // Assert that the result is Ok(Some(bool))
        assert!(result.is_ok());
    }

    #[test]
    fn test_update_dapp_privacy_settings() {
        // Assuming URL exists in the table
        let url = "example.com";
        let trusted = true;
        
        // Call update_dapp_privacy_settings
        let result = update_dapp_privacy_settings(url, &trusted);

        // Assert that the result is Ok(())
        assert!(result.is_ok());
    }

    #[test]
    fn test_delete_dapp_privacy_settings() {
        // Assuming URL exists in the table
        let url = "example.com";
        
        // Call delete_dapp_privacy_settings
        let result = delete_dapp_privacy_settings(url);

        // Assert that the result is Ok(())
        assert!(result.is_ok());
    }
}
