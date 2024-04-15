use crate::models::storage::persistent::PersistentStorage;

pub fn init_dappPrivacySettings_table() -> AvailResult<()> {
    let storage = PersistentStorage::new()?;
    storage.execute_query(
        "CREATE TABLE IF NOT EXISTS dapp_privacy_setting (
            url TEXT PRIMARY KEY,
            trusted BOOLEAN
        )",
    )?;
    Ok(())
}

