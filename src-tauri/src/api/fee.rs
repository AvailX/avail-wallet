use tauri_plugin_http::reqwest;

use avail_common::{
    errors::{AvailError, AvailErrorType, AvailResult},
    models::fee_request::FeeRequest,
};

/*
    create_record(request) - A function to handle the API call to the Avail's Fee Estimation Microservice to add Fee Data to the database.
    Inputs - A FeeRequest Struct with execution_object, program_id, function_id, network
*/
pub async fn create_record(request: FeeRequest) -> AvailResult<String> {
    let client = reqwest::Client::new();

    let res = client
        .post(format!("http://localhost:8080/fee/create-record"))
        .json(&request)
        .send()
        .await?;

    if res.status() == 200 {
        let result = res.json().await?;

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
            "Fee record creation FAILED".to_string(),
            "Fee estimation failed.".to_string(),
        ))
    }
}
/*
    fetch_record(pid,fid) - A function to handle the API call to the Avail's Fee Estimation Microservice to fetch Fee Data from the database.
    Inputs - program_id and function_id
    Output - fee
*/
pub async fn fetch_record(pid: String, fid: String) -> AvailResult<Option<i32>> {
    let client = reqwest::Client::new();

    let res = client
        .get(format!(
            "http://localhost:8080/fee/fetch-record/{}/{}",
            pid, fid
        ))
        .send()
        .await?;

    if res.status() == 200 {
        let result: Option<i32> = res.json().await?;

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
            "Error getting fee.".to_string(),
            "Error getting fee.".to_string(),
        ))
    }
}

#[cfg(test)]

mod tests {
    use std::str::FromStr;

    use avail_common::aleo_tools::program_manager::ProgramManager;
    use avail_common::models::{
        constants::{TESTNET3_ADDRESS, TESTNET3_PRIVATE_KEY},
        network::SupportedNetworks,
    };
    use snarkvm::{
        circuit::AleoV0,
        prelude::{Address, Execution, PrivateKey, Testnet3},
    };

    use crate::api::aleo_client::setup_local_client;

    use super::*;

    #[tokio::test]
    async fn test_create_record() {
        let new_exec = get_execution_object().await.unwrap();
        // let new_exec = Execution::<Testnet3>::new();
        let exec_obj: Vec<u8> = FeeRequest::to_bytes_execution_object::<Testnet3>(new_exec)
            .await
            .unwrap();
        // println!("{:?}", exec_obj);
        let req: FeeRequest = FeeRequest::new(
            exec_obj,
            "testing.aleo".to_string(),
            "testing_7".to_string(),
            SupportedNetworks::Testnet3,
        );
        println!("Sending req....");
        let result: String = create_record(req).await.unwrap();

        println!("{:?}", result);
    }

    #[tokio::test]
    async fn test_fetch_fee_record() {
        let result = fetch_record("testing.aleo".to_string(), "testing_6".to_string())
            .await
            .unwrap();
        println!("{:?}", result);
    }

    async fn get_execution_object() -> AvailResult<Execution<Testnet3>> {
        let pk = PrivateKey::<Testnet3>::from_str(TESTNET3_PRIVATE_KEY).unwrap();
        let api_client = setup_local_client::<Testnet3>();
        let recipient = Address::<Testnet3>::from_str(TESTNET3_ADDRESS).unwrap();

        let program = api_client.get_program("credits.aleo").unwrap();

        let program_manager =
            ProgramManager::<Testnet3>::new(Some(pk), None, Some(api_client), None).unwrap();

        let (total, (_, _), execution) = program_manager
            .estimate_execution_fee::<AleoV0>(
                &program,
                "transfer_public_to_private",
                vec![recipient.to_string(), "10000u64".to_string()].iter(),
            )
            .unwrap();
        //println!("{:?} ... {:?}...{:?}",txn.id(),txn.fee_amount(),txn.base_fee_amount());
        //let exec_option =  txn.execution();

        println!("{:?}", total);
        // let exec= exec_option.unwrap();
        //let ex = exec.clone();
        //println!("{:?}", ex.to_execution_id());
        //Ok(ex)
        Ok(execution)
    }

    #[tokio::test]
    async fn test_get_execution_object() {
        let pk = PrivateKey::<Testnet3>::from_str(TESTNET3_PRIVATE_KEY).unwrap();
        let api_client = setup_local_client::<Testnet3>();
        let recipient = Address::<Testnet3>::from_str(TESTNET3_ADDRESS).unwrap();

        let program = api_client.get_program("credits.aleo").unwrap();

        let program_manager =
            ProgramManager::<Testnet3>::new(Some(pk), None, Some(api_client), None).unwrap();

        let (total, (_x, _y), _execution) = program_manager
            .estimate_execution_fee::<AleoV0>(
                &program,
                "transfer_public_to_private",
                vec![recipient.to_string(), "10000u64".to_string()].iter(),
            )
            .unwrap();
        //println!("{:?} ... {:?}...{:?}",txn.id(),txn.fee_amount(),txn.base_fee_amount());
        //let exec_option =  txn.execution();

        println!("{:?}", total);
        // let exec= exec_option.unwrap();
        //let ex = exec.clone();
        //println!("{:?}", ex.to_execution_id());
        //Ok(ex)
    }
}
