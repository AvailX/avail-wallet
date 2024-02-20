/* THIS IS TO FACILITATE UPGRADING FROM A SEED PHRASE WALLET TO A NORMAL AVAIL WALLET */

use crate::{
    api::encrypted_data::import_encrypted_data,
    services::local_storage::{encrypted_data::*, persistent_storage::get_address_string},
};
use avail_common::{
    errors::AvailResult,
    models::encrypted_data::{Data, DataRequest, EncryptedDataRecord, EncryptedDataTypeCommon},
};

pub async fn upgrade() -> AvailResult<String> {
    let encrypted_record_pointers = get_encrypted_data_by_flavour(EncryptedDataTypeCommon::Record)?;
    let backup_encrypted_records = encrypted_record_pointers
        .iter()
        .map(|encrypted_record| EncryptedDataRecord::from(encrypted_record.to_owned()))
        .collect::<Vec<EncryptedDataRecord>>();

    let encrypted_transactions =
        get_encrypted_data_by_flavour(EncryptedDataTypeCommon::Transaction)?;
    let backup_encrypted_transactions = encrypted_transactions
        .iter()
        .map(|encrypted_transaction| EncryptedDataRecord::from(encrypted_transaction.to_owned()))
        .collect::<Vec<EncryptedDataRecord>>();

    let encrypted_transitions = get_encrypted_data_by_flavour(EncryptedDataTypeCommon::Transition)?;
    let backup_encrypted_transitions = encrypted_transitions
        .iter()
        .map(|encrypted_transition| EncryptedDataRecord::from(encrypted_transition.to_owned()))
        .collect::<Vec<EncryptedDataRecord>>();

    let encrypted_deployments = get_encrypted_data_by_flavour(EncryptedDataTypeCommon::Deployment)?;
    let backup_encrypted_deployments = encrypted_deployments
        .iter()
        .map(|encrypted_deployment| EncryptedDataRecord::from(encrypted_deployment.to_owned()))
        .collect::<Vec<EncryptedDataRecord>>();

    let data = Data::new(
        backup_encrypted_records,
        backup_encrypted_transactions,
        backup_encrypted_transitions,
        backup_encrypted_deployments,
    );

    let address = get_address_string()?;

    let request = DataRequest { address, data };

    let res = import_encrypted_data(request).await?;

    Ok(res)
}

#[tokio::test]
async fn test_upgrade() {
    let res = upgrade().await.unwrap();
    println!("{:?}", res);
}
