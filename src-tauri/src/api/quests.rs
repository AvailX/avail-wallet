use std::str::FromStr;

use avail_common::models::encrypted_data::EncryptedDataTypeCommon;
use chrono::format::format;
use chrono::{DateTime, Utc};
use uuid::Uuid;

use crate::api::client::get_quest_client_with_session;
use crate::models::pointers::{
    deployment::DeploymentPointer, transaction::TransactionPointer, transition::TransitionPointer,
};
use crate::services::authentication::session;
use crate::services::local_storage::persistent_storage::{get_address_string, get_network};
use crate::services::local_storage::session::view::VIEWSESSION;
use crate::services::local_storage::storage_api::transaction::get_transaction_ids_for_quest_verification;
use avail_common::{
    errors::{AvailError, AvailErrorType, AvailResult},
    models::encrypted_data::EventTypeCommon,
    models::network::SupportedNetworks,
    models::quests::*,
};
use tauri_plugin_http::reqwest;

use snarkvm::prelude::{Network, TestnetV0, Transaction};

use super::aleo_client::setup_client;
use super::client::SESSION;

/* GET ALL CAMPAIGNS */
#[tauri::command(rename_all = "snake_case")]
pub async fn get_campaigns() -> AvailResult<Vec<Campaign>> {
    let res = match get_quest_client_with_session(reqwest::Method::GET, "campaigns")?
        .send()
        .await
    {
        Ok(res) => res,
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::External,
                e.to_string(),
                "Error getting campaigns".to_string(),
            ))
        }
    };

    if res.status() == 200 {
        let campaigns: Vec<Campaign> = match res.json().await {
            Ok(res) => res,
            Err(e) => {
                return Err(AvailError::new(
                    AvailErrorType::External,
                    e.to_string(),
                    "Error getting campaigns".to_string(),
                ))
            }
        };

        Ok(campaigns)
    } else if res.status() == 401 {
        Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ))
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error getting campaigns".to_string(),
            "Error getting campaigns".to_string(),
        ))
    }
}

/* GET ALL COLLECTIONS */
#[tauri::command(rename_all = "snake_case")]
pub async fn get_collections() -> AvailResult<Vec<Collection>> {
    let res = match get_quest_client_with_session(reqwest::Method::GET, "collections")?
        .send()
        .await
    {
        Ok(res) => res,
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::External,
                e.to_string(),
                "Error getting Nfts".to_string(),
            ))
        }
    };

    if res.status() == 200 {
        let collections: Vec<Collection> = match res.json().await {
            Ok(campaigns) => campaigns,
            Err(e) => {
                return Err(AvailError::new(
                    AvailErrorType::External,
                    e.to_string(),
                    "Error getting Nfts".to_string(),
                ))
            }
        };
        Ok(collections)
    } else if res.status() == 401 {
        Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ))
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error getting campaigns".to_string(),
            "Error getting campaigns".to_string(),
        ))
    }
}

/* GET ALL QUESTS FOR CAMPAIGN */
#[tauri::command(rename_all = "snake_case")]
pub async fn get_quests_for_campaign(campaign_id: &str) -> AvailResult<Vec<Quest>> {
    let res = match get_quest_client_with_session(
        reqwest::Method::GET,
        &format!("campaign/{}", campaign_id),
    )?
    .send()
    .await
    {
        Ok(res) => res,
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::External,
                e.to_string(),
                "Error getting quests".to_string(),
            ))
        }
    };

    if res.status() == 200 {
        let quests: Vec<Quest> = match res.json().await {
            Ok(res) => res,
            Err(e) => {
                return Err(AvailError::new(
                    AvailErrorType::External,
                    e.to_string(),
                    "Error getting quests".to_string(),
                ))
            }
        };

        Ok(quests)
    } else if res.status() == 401 {
        Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ))
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error getting quests".to_string(),
            "Error getting quests".to_string(),
        ))
    }
}

/* CHECK IF QUEST IS COMPLETE */
#[tauri::command(rename_all = "snake_case")]
pub async fn check_quest_completion(quest_id: &str) -> AvailResult<bool> {
    let res = match get_quest_client_with_session(
        reqwest::Method::GET,
        &format!("confirmed/{}", quest_id),
    )?
    .send()
    .await
    {
        Ok(res) => res,
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::External,
                e.to_string(),
                "Error checking quest completion".to_string(),
            ))
        }
    };

    if res.status() == 200 {
        let completion: VerifyTaskResponse = match res.json().await {
            Ok(res) => res,
            Err(e) => {
                return Err(AvailError::new(
                    AvailErrorType::External,
                    e.to_string(),
                    "Error checking quest completion".to_string(),
                ))
            }
        };

        Ok(completion.verified)
    } else if res.status() == 401 {
        Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ))
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error checking quest completion".to_string(),
            "Error checking quest completion".to_string(),
        ))
    }
}

/* CHECK IF TASK HAS ALREADY BEEN VERIFIED COMPLETED AND VERIFIED*/
#[tauri::command(rename_all = "snake_case")]
pub async fn is_task_verified(task_id: Uuid) -> AvailResult<bool> {
    let res = match get_quest_client_with_session(
        reqwest::Method::GET,
        &format!("verified/{}", task_id),
    )?
    .send()
    .await
    {
        Ok(res) => res,
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::External,
                e.to_string(),
                "Error checking quest completion".to_string(),
            ))
        }
    };

    if res.status() == 200 {
        let completion: VerifyTaskResponse = match res.json().await {
            Ok(res) => res,
            Err(e) => {
                return Err(AvailError::new(
                    AvailErrorType::External,
                    e.to_string(),
                    "Error checking quest completion".to_string(),
                ))
            }
        };

        Ok(completion.verified)
    } else if res.status() == 401 {
        Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ))
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error checking quest completion".to_string(),
            "Error checking quest completion".to_string(),
        ))
    }
}

#[tauri::command(rename_all = "snake_case")]
pub async fn verify_task(
    start_time: DateTime<Utc>,
    end_time: DateTime<Utc>,
    task_id: &str,
    program_id: &str,
    function_id: &str,
) -> AvailResult<bool> {
    let network = get_network()?;

    match SupportedNetworks::from_str(network.as_str())? {
        SupportedNetworks::Testnet => {
            verify_task_raw::<TestnetV0>(start_time, end_time, task_id, program_id, function_id)
                .await
        }
    }
}

/* CHECK IF TASK IS COMPLETE */
async fn verify_task_raw<N: Network>(
    start_time: DateTime<Utc>,
    end_time: DateTime<Utc>,
    task_id: &str,
    program_id: &str,
    function_id: &str,
) -> AvailResult<bool> {
    let view_key = VIEWSESSION.get_instance::<N>()?;
    let task_id = Uuid::parse_str(task_id)?;
    let is_task_verified = is_task_verified(task_id).await?;

    println!("is_task_verified: {}", is_task_verified);
    if is_task_verified {
        return Ok(true);
    }

    let encrypted_transactions = get_transaction_ids_for_quest_verification::<N>(
        start_time,
        end_time,
        program_id,
        function_id,
    )?;

    if encrypted_transactions.is_empty() {
        return Ok(false);
    }

    println!("PAST THE DEMON!");

    let mut transaction_ids: Vec<N::TransactionID> = vec![];
    let mut block_heights: Vec<u32> = vec![];
    let aleo_client = setup_client::<N>()?;

    for encrypted_transaction in encrypted_transactions {
        // check if the encypted_transaction created_at date is in between the start_time and end_time
        println!("Checking time {}", encrypted_transaction.created_at);
        println!("Start time {}", start_time);
        println!("End time {}", end_time);
        if encrypted_transaction.created_at < start_time
            || encrypted_transaction.created_at > end_time
        {
            println!("Failed time check");
            continue;
        }

        println!("Into the Dungeon!");
        let encrypted_struct = encrypted_transaction.to_enrypted_struct::<N>()?;

        match encrypted_transaction.flavour {
            EncryptedDataTypeCommon::Transition => {
                let transition: TransitionPointer<N> = encrypted_struct.decrypt(view_key)?;
                transaction_ids.push(transition.transaction_id);
                block_heights.push(transition.block_height);
            }
            EncryptedDataTypeCommon::Transaction => {
                let tx_exec: TransactionPointer<N> =
                    encrypted_struct.decrypt(VIEWSESSION.get_instance::<N>()?)?;

                if let Some(tx_id) = tx_exec.transaction_id() {
                    transaction_ids.push(tx_id);
                }
                block_heights.push(tx_exec.block_height().unwrap_or(0));
            }
            EncryptedDataTypeCommon::Deployment => {
                let deployment: DeploymentPointer<N> =
                    encrypted_struct.decrypt(VIEWSESSION.get_instance::<N>()?)?;
                if let Some(tx_id) = deployment.id {
                    transaction_ids.push(tx_id);
                }
                block_heights.push(deployment.block_height.unwrap_or(0));
            }
            _ => {}
        };
    }

    if !transaction_ids.is_empty() {
        let transaction = aleo_client.get_transaction(transaction_ids[0])?;

        println!("Transaction: {:?}", transaction);

        for transition in transaction.transitions() {
            println!("Transition program id: {:?}", transition.program_id());
            println!("Program id: {:?}", program_id);
            println!("Transition function name: {:?}", transition.function_name());
            println!("Function id: {:?}", function_id);
            if transition.program_id().to_string().as_str() == program_id
                && transition.function_name().to_string().as_str() == function_id
            {
                let tpk = transition.tpk();
                let scalar = *view_key;
                let tvk = (*tpk * scalar).to_x_coordinate();

                let request = VerifyTaskRequest::<N> {
                    task_id,
                    confirmation_height: block_heights[0],
                    transaction_id: transaction.id(),
                    transition_id: *transition.id(),
                    tvk,
                };

                println!("TASK VERIF Request: {:?}", request);
                let res = match get_quest_client_with_session(reqwest::Method::POST, "verify")?
                    .json(&request)
                    .send()
                    .await
                {
                    Ok(res) => res,
                    Err(e) => {
                        return Err(AvailError::new(
                            AvailErrorType::External,
                            e.to_string(),
                            "Error checking verifying taks.".to_string(),
                        ))
                    }
                };

                if res.status() == 200 {
                    let completion: VerifyTaskResponse = match res.json().await {
                        Ok(res) => res,
                        Err(e) => {
                            return Err(AvailError::new(
                                AvailErrorType::External,
                                e.to_string(),
                                "Error checking verifying taks.".to_string(),
                            ))
                        }
                    };

                    println!("TASK VERIF Response: {:?}", completion.verified);

                    return Ok(completion.verified);
                } else if res.status() == 401 {
                    return Err(AvailError::new(
                        AvailErrorType::Unauthorized,
                        "User session has expired.".to_string(),
                        "Your session has expired, please authenticate again.".to_string(),
                    ));
                } else {
                    return Err(AvailError::new(
                        AvailErrorType::External,
                        "Error checking quest completion".to_string(),
                        "Error checking quest completion".to_string(),
                    ));
                }
            }
        }
    }

    Ok(false)
}

/* GET USER'S POINTS */
#[tauri::command(rename_all = "snake_case")]
pub async fn get_points() -> AvailResult<Vec<PointsResponse>> {
    let res = match get_quest_client_with_session(reqwest::Method::GET, "points")?
        .send()
        .await
    {
        Ok(res) => res,
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::External,
                e.to_string(),
                "Error getting points".to_string(),
            ))
        }
    };

    if res.status() == 200 {
        let points: Vec<PointsResponse> = match res.json().await {
            Ok(res) => res,
            Err(e) => {
                return Err(AvailError::new(
                    AvailErrorType::External,
                    e.to_string(),
                    "Error getting points".to_string(),
                ))
            }
        };

        Ok(points)
    } else if res.status() == 401 {
        Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ))
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error getting points".to_string(),
            "Error getting points".to_string(),
        ))
    }
}

/* GET USER'S WHITELIST */
#[tauri::command(rename_all = "snake_case")]
pub async fn get_whitelists() -> AvailResult<Vec<WhitelistResponse>> {
    let res = match get_quest_client_with_session(reqwest::Method::GET, "whitelists")?
        .send()
        .await
    {
        Ok(res) => res,
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::External,
                e.to_string(),
                "Error getting whitelists".to_string(),
            ))
        }
    };

    if res.status() == 200 {
        let whitelists: Vec<WhitelistResponse> = match res.json().await {
            Ok(res) => res,
            Err(e) => {
                return Err(AvailError::new(
                    AvailErrorType::External,
                    e.to_string(),
                    "Error getting whitelists".to_string(),
                ))
            }
        };

        Ok(whitelists)
    } else if res.status() == 401 {
        Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ))
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error getting whitelists".to_string(),
            "Error getting whitelists".to_string(),
        ))
    }
}

// ======= QaaS API =======
#[tauri::command(rename_all = "snake_case")]
pub async fn create_campaign(
    title: String,
    subtitle: String,
    desc_1: String,
    desc_main: String,
    desc_2: String,
    inner_desc: String,
    box_image: String,
    bg_image: String,
    profile_image: String,
    color: String,
    points_image: String,
    project_name: String,
) -> AvailResult<Campaign> {
    let campaign = Campaign {
        id: Uuid::new_v4(),
        title,
        subtitle,
        description: CampaignDescription {
            part1: desc_1,
            main: desc_main,
            part2: desc_2,
        },
        inner_description: inner_desc,
        box_image,
        bg_image,
        profile_image,
        color,
        points_image,
        project_name,
        owner: get_address_string()?,
    };

    let res = match get_quest_client_with_session(reqwest::Method::POST, "campaign")?
        .json(&campaign)
        .send()
        .await
    {
        Ok(res) => res,
        Err(e) => {
            println!("Error creating campaign: {:?}", e);
            return Err(AvailError::new(
                AvailErrorType::External,
                e.to_string(),
                "Error creating campaign".to_string(),
            ));
        }
    };
    println!("Response: {:?}", res);
    if res.status() == 200 {
        println!("Campaign created successfully! \n RESPONSE - {:?}", res);
        Ok(campaign)
    } else if res.status() == 401 {
        Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ))
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error creating campaign".to_string(),
            "Error creating campaign".to_string(),
        ))
    }
}

#[tauri::command(rename_all = "snake_case")]
pub async fn update_campaign(
    id: &str,
    title: String,
    subtitle: String,
    desc_1: String,
    desc_main: String,
    desc_2: String,
    inner_desc: String,
    box_image: String,
    bg_image: String,
    profile_image: String,
    color: String,
    points_image: String,
    project_name: String,
) -> AvailResult<Campaign> {
    let campaign = Campaign {
        id: Uuid::parse_str(id)?,
        title,
        subtitle,
        description: CampaignDescription {
            part1: desc_1,
            main: desc_main,
            part2: desc_2,
        },
        inner_description: inner_desc,
        box_image,
        bg_image,
        profile_image,
        color,
        points_image,
        project_name,
        owner: get_address_string()?,
    };
    let path = format!("campaign/{}", campaign.id);
    let res = match get_quest_client_with_session(reqwest::Method::PUT, &path)?
        .json(&campaign)
        .send()
        .await
    {
        Ok(res) => res,
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::External,
                e.to_string(),
                "Error updating campaign".to_string(),
            ))
        }
    };
    if res.status() == 200 {
        let campaign: Campaign = match res.json().await {
            Ok(res) => res,
            Err(e) => {
                return Err(AvailError::new(
                    AvailErrorType::External,
                    e.to_string(),
                    "Error updating campaign".to_string(),
                ))
            }
        };

        Ok(campaign)
    } else if res.status() == 401 {
        Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ))
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error updating campaign".to_string(),
            "Error updating campaign".to_string(),
        ))
    }
}

#[tauri::command(rename_all = "snake_case")]
pub async fn delete_campaign(campaign_id: &str) -> AvailResult<()> {
    let path = format!("campaign/{}", campaign_id);
    let res = match get_quest_client_with_session(reqwest::Method::DELETE, &path)?
        .send()
        .await
    {
        Ok(res) => res,
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::External,
                e.to_string(),
                "Error deleting campaign".to_string(),
            ))
        }
    };
    if res.status() == 200 {
        Ok(())
    } else if res.status() == 401 {
        Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ))
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error deleting campaign".to_string(),
            "Error deleting campaign".to_string(),
        ))
    }
}

#[tauri::command(rename_all = "snake_case")]
pub async fn create_quest(
    title: String,
    description: String,
    display_image: String,
    tasks: String,
    reward_collection_name: String,
    reward_amount: String,
    reward_method: String,
    expires_on: DateTime<Utc>,
    created_on: DateTime<Utc>,
    campaign_id: String,
) -> AvailResult<Quest> {
    println!("Tasks: {:?}", tasks);
    let json = preprocess_json(&tasks)?;
    println!("Preprocessed JSON: {:?}", json);
    let tasks: Vec<Task> = serde_json::from_str(&json)?;
    println!("Tasks: {:?}", tasks);
    let reward = Reward {
        id: Uuid::new_v4(),
        collection_name: reward_collection_name,
        amount: i32::from_str(&reward_amount)?,
        method: match reward_method.as_str() {
            "LuckyDraw" => RewardMethodCommon::LuckyDraw,
            "FCFS" => RewardMethodCommon::FCFS,
            "LeaderBoard" => RewardMethodCommon::LeaderBoard,
            _ => RewardMethodCommon::LuckyDraw,
        },
    };
    println!("Reward: {:?}", reward);
    let quest = Quest {
        id: Uuid::new_v4(),
        title,
        description,
        display_image,
        tasks,
        reward,
        expires_on,
        created_on,
        campaign_id: Uuid::parse_str(&campaign_id)?,
    };
    let res = match get_quest_client_with_session(reqwest::Method::POST, "create")?
        .json(&quest)
        .send()
        .await
    {
        Ok(res) => res,
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::External,
                e.to_string(),
                "Error creating quest".to_string(),
            ))
        }
    };
    if res.status() == 200 {
        let quest: Quest = match res.json().await {
            Ok(res) => res,
            Err(e) => {
                return Err(AvailError::new(
                    AvailErrorType::External,
                    e.to_string(),
                    "Error creating quest".to_string(),
                ))
            }
        };

        Ok(quest)
    } else if res.status() == 401 {
        Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ))
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error creating quest".to_string(),
            "Error creating quest".to_string(),
        ))
    }
}

fn preprocess_json(json_str: &str) -> Result<String, serde_json::Error> {
    let mut tasks: Vec<serde_json::Value> = serde_json::from_str(json_str)?;

    for task in &mut tasks {
        // Convert "transaction" field from string to bool
        if let Some(transaction) = task.get_mut("transaction") {
            if let serde_json::Value::String(s) = transaction {
                *transaction = serde_json::Value::Bool(s == "true");
            }
        }

        // Convert "points" field from string to i32
        if let Some(points) = task.get_mut("points") {
            if let serde_json::Value::String(s) = points {
                if let Ok(n) = s.parse::<i32>() {
                    *points = serde_json::Value::Number(n.into());
                }
            }
        }

        // Add "id" field as a new UUID
        task.as_object_mut().unwrap().insert(
            "id".to_string(),
            serde_json::Value::String(Uuid::new_v4().to_string()),
        );
    }

    serde_json::to_string(&tasks)
}

#[tauri::command(rename_all = "snake_case")]
pub async fn update_quest(
    id: Uuid,
    title: String,
    description: String,
    display_image: String,
    tasks: Vec<Task>,
    reward: Reward,
    expires_on: DateTime<Utc>,
    created_on: DateTime<Utc>,
    campaign_id: Uuid,
) -> AvailResult<Quest> {
    let path = format!("update/{}", id);
    let quest = Quest {
        id,
        title,
        description,
        display_image,
        tasks,
        reward,
        expires_on,
        created_on,
        campaign_id,
    };

    let res = match get_quest_client_with_session(reqwest::Method::PUT, &path)?
        .json(&quest)
        .send()
        .await
    {
        Ok(res) => res,
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::External,
                e.to_string(),
                "Error updating quest".to_string(),
            ))
        }
    };
    if res.status() == 200 {
        let quest: Quest = match res.json().await {
            Ok(res) => res,
            Err(e) => {
                return Err(AvailError::new(
                    AvailErrorType::External,
                    e.to_string(),
                    "Error updating quest".to_string(),
                ))
            }
        };

        Ok(quest)
    } else if res.status() == 401 {
        Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ))
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error updating quest".to_string(),
            "Error updating quest".to_string(),
        ))
    }
}

#[tauri::command(rename_all = "snake_case")]
pub async fn delete_quest(quest_id: &str) -> AvailResult<()> {
    let path = format!("delete/{}", quest_id);
    let res = match get_quest_client_with_session(reqwest::Method::DELETE, &path)?
        .send()
        .await
    {
        Ok(res) => res,
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::External,
                e.to_string(),
                "Error deleting quest".to_string(),
            ))
        }
    };
    if res.status() == 200 {
        Ok(())
    } else if res.status() == 401 {
        Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ))
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error deleting quest".to_string(),
            "Error deleting quest".to_string(),
        ))
    }
}

#[tauri::command(rename_all = "snake_case")]
pub async fn create_collection(
    name: String,
    whitelist_img: String,
    description: String,
    inner_img: Option<String>,
    twitter_link: Option<String>,
    discord_link: Option<String>,
) -> AvailResult<Collection> {
    let collection = Collection {
        id: Uuid::new_v4(),
        name,
        whitelist_img,
        description,
        inner_img,
        twitter_link,
        discord_link,
    };
    let res = match get_quest_client_with_session(reqwest::Method::POST, "collection")?
        .json(&collection)
        .send()
        .await
    {
        Ok(res) => res,
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::External,
                e.to_string(),
                "Error creating collection".to_string(),
            ))
        }
    };
    if res.status() == 200 {
        let collection: Collection = match res.json().await {
            Ok(res) => res,
            Err(e) => {
                return Err(AvailError::new(
                    AvailErrorType::External,
                    e.to_string(),
                    "Error creating collection".to_string(),
                ))
            }
        };

        Ok(collection)
    } else if res.status() == 401 {
        Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ))
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error creating collection".to_string(),
            "Error creating collection".to_string(),
        ))
    }
}

#[tauri::command(rename_all = "snake_case")]
pub async fn update_collection(
    id: Uuid,
    name: String,
    whitelist_img: String,
    description: String,
    inner_img: Option<String>,
    twitter_link: Option<String>,
    discord_link: Option<String>,
) -> AvailResult<Collection> {
    let collection = Collection {
        id,
        name,
        whitelist_img,
        description,
        inner_img,
        twitter_link,
        discord_link,
    };
    let path = format!("collection/{}", id);
    let res = match get_quest_client_with_session(reqwest::Method::PUT, &path)?
        .json(&collection)
        .send()
        .await
    {
        Ok(res) => res,
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::External,
                e.to_string(),
                "Error updating collection".to_string(),
            ))
        }
    };
    if res.status() == 200 {
        let collection: Collection = match res.json().await {
            Ok(res) => res,
            Err(e) => {
                return Err(AvailError::new(
                    AvailErrorType::External,
                    e.to_string(),
                    "Error updating collection".to_string(),
                ))
            }
        };

        Ok(collection)
    } else if res.status() == 401 {
        Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ))
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error updating collection".to_string(),
            "Error updating collection".to_string(),
        ))
    }
}

#[tauri::command(rename_all = "snake_case")]
pub async fn delete_collection(collection_id: &str) -> AvailResult<()> {
    let path = format!("collection/{}", collection_id);
    let res = match get_quest_client_with_session(reqwest::Method::DELETE, &path)?
        .send()
        .await
    {
        Ok(res) => res,
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::External,
                e.to_string(),
                "Error deleting collection".to_string(),
            ))
        }
    };
    if res.status() == 200 {
        Ok(())
    } else if res.status() == 401 {
        Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ))
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error deleting collection".to_string(),
            "Error deleting collection".to_string(),
        ))
    }
}

#[tauri::command(rename_all = "snake_case")]
pub async fn distribute_rewards(quest_id: &str) -> AvailResult<()> {
    let path = format!("reward/{}", quest_id);
    let res = match get_quest_client_with_session(reqwest::Method::POST, &path)?
        .send()
        .await
    {
        Ok(res) => res,
        Err(e) => {
            return Err(AvailError::new(
                AvailErrorType::External,
                e.to_string(),
                "Error distributing rewards".to_string(),
            ))
        }
    };
    if res.status() == 200 {
        Ok(())
    } else if res.status() == 401 {
        Err(AvailError::new(
            AvailErrorType::Unauthorized,
            "User session has expired.".to_string(),
            "Your session has expired, please authenticate again.".to_string(),
        ))
    } else {
        Err(AvailError::new(
            AvailErrorType::External,
            "Error distributing rewards".to_string(),
            "Error distributing rewards".to_string(),
        ))
    }
}

// #[tauri::command(rename_all = "snake_case")]
// pub async fn airdrop_nfts(collection_name: String, addresses: Vec<String>) -> AvailResult<()> {
//     // create a json reuesy with the collection name and addresses

//     let request =
//     let res = match get_quest_client_with_session(reqwest::Method::POST, "airdrop")?
//         .json(request)
//         .send()
//         .await
//     {
//         Ok(res) => res,
//         Err(e) => {
//             return Err(AvailError::new(
//                 AvailErrorType::External,
//                 e.to_string(),
//                 "Error airdropping NFTs".to_string(),
//             ))
//         }
//     };
//     if res.status() == 200 {
//         Ok(())
//     } else if res.status() == 401 {
//         Err(AvailError::new(
//             AvailErrorType::Unauthorized,
//             "User session has expired.".to_string(),
//             "Your session has expired, please authenticate again.".to_string(),
//         ))
//     } else {
//         Err(AvailError::new(
//             AvailErrorType::External,
//             "Error airdropping NFTs".to_string(),
//             "Error airdropping NFTs".to_string(),
//         ))
//     }
// }

// write test cases for all the abve functions
// write test cases for all the abve functions

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;
    use session::get_session;
    use snarkvm::prelude::TestnetV0;

    async fn session_setup() {
        let sessiontoken = get_session(Some("tylerDurden@0xf5".to_string()))
            .await
            .unwrap();
        println!("Session Token: {:?}", sessiontoken);
        SESSION.set_session_token(sessiontoken);
    }

    #[tokio::test]
    async fn test_verify_task() {
        let start_time = Utc::now();
        let end_time = Utc::now();
        let task_id = "f1b3b3b3-1b3b-4b3b-8b3b-1b3b3b3b3b3b";
        let program_id = "f1b3b3b3-1b3b-4b3b-8b3b-1b3b3b3b3b3b";
        let function_id = "f1b3b3b3-1b3b-4b3b-8b3b-1b3b3b3b3b3b";

        let result = verify_task(start_time, end_time, task_id, program_id, function_id)
            .await
            .unwrap();

        println!("Result: {:?}", result);
    }

    #[tokio::test]
    async fn test_get_campaigns() {
        session_setup().await;
        let result = get_campaigns().await.unwrap();
        println!("Result: {:?}", result);
    }

    #[tokio::test]
    async fn test_get_collections() {
        let result = get_collections().await.unwrap();
        println!("Result: {:?}", result);
    }

    #[tokio::test]
    async fn test_get_quests_for_campaign() {
        let campaign_id = "f1b3b3b3-1b3b-4b3b-8b3b-1b3b3b3b3b3b";
        let result = get_quests_for_campaign(campaign_id).await.unwrap();
        println!("Result: {:?}", result);
    }

    #[tokio::test]
    async fn test_check_quest_completion() {
        let quest_id = "f1b3b3b3-1b3b-4b3b-8b3b-1b3b3b3b3b3b";
        let result = check_quest_completion(quest_id).await.unwrap();
        println!("Result: {:?}", result);
    }

    #[tokio::test]
    async fn test_is_task_verified() {
        let task_id = Uuid::new_v4();
        let result = is_task_verified(task_id).await.unwrap();
        println!("Result: {:?}", result);
    }

    #[tokio::test]
    async fn test_get_points() {
        let result = get_points().await.unwrap();
        println!("Result: {:?}", result);
    }

    #[tokio::test]
    async fn test_get_whitelists() {
        let result = get_whitelists().await.unwrap();
        println!("Result: {:?}", result);
    }

    #[tokio::test]
    async fn test_create_campaign() {
        session_setup().await;

        let title = "Qaas T1".to_string();
        let subtitle = "Test Creation".to_string();
        let desc_1 = "Test".to_string();
        let desc_main = "Test".to_string();
        let desc_2 = "Test".to_string();
        let inner_desc = "Test".to_string();
        let box_image = "Test".to_string();
        let bg_image = "Test".to_string();
        let profile_image = "Test".to_string();
        let color = "Test".to_string();
        let points_image = "Test".to_string();
        let project_name = "Test".to_string();

        let result = create_campaign(
            title,
            subtitle,
            desc_1,
            desc_main,
            desc_2,
            inner_desc,
            box_image,
            bg_image,
            profile_image,
            color,
            points_image,
            project_name,
        )
        .await
        .unwrap();

        println!("Result: {:?}", result);
    }

    #[tokio::test]
    async fn test_update_campaign() {
        let id = Uuid::new_v4();
        let title = "Test Campaign".to_string();
        let subtitle = "Test Campaign".to_string();
        let desc_1 = "Test Campaign".to_string();
        let desc_main = "Test Campaign".to_string();
        let desc_2 = "Test Campaign".to_string();
        let inner_desc = "Test Campaign".to_string();
        let box_image = "Test Campaign".to_string();
        let bg_image = "Test Campaign".to_string();
        let profile_image = "Test Campaign".to_string();
        let color = "Test Campaign".to_string();
        let points_image = "Test Campaign".to_string();
        let project_name = "Test Campaign".to_string();

        // let result = update_campaign(
        //     id,
        //     title,
        //     subtitle,
        //     desc_1,
        //     desc_main,
        //     desc_2,
        //     inner_desc,
        //     box_image,
        //     bg_image,
        //     profile_image,
        //     color,
        //     points_image,
        //     project_name,
        // )
        // .await
        // .unwrap();

        // println!("Result: {:?}", result);
    }

    #[tokio::test]
    async fn test_delete_campaign() {
        let campaign_id = "f1b3b3b3-1b3b-4b3b-8b3b-1b3b3b3b3b3b";
        let result = delete_campaign(campaign_id).await.unwrap();
        println!("Result: {:?}", result);
    }
    // #[tokio::test]
    // async fn test_create_quest() {
    //     let title = "Test Quest".to_string();
    //     let description = "Test Quest".to_string();
    //     let display_image = "Test Quest".to_string();
    //     let tasks = vec![];
    //     let reward = Reward {
    //         id: Uuid::new_v4(),
    //         collection_name: "Test collection".to_string(),
    //         amount: 10i32,
    //         method: RewardMethodCommon::FCFS,
    //     };
    //     let expires_on = Utc::now();
    //     let created_on = Utc::now();
    //     let campaign_id = Uuid::new_v4();

    //     // let result = create_quest(
    //     //     title,
    //     //     description,
    //     //     display_image,
    //     //     tasks,
    //     //     reward,
    //     //     expires_on,
    //     //     created_on,
    //     //     campaign_id,
    //     // )
    //     // .await
    //     // .unwrap();

    //     // println!("Result: {:?}", result);
    // }

    #[tokio::test]

    async fn test_update_quest() {
        let id = Uuid::new_v4();
        let title = "Test Quest".to_string();
        let description = "Test Quest".to_string();
        let display_image = "Test Quest".to_string();
        let tasks = vec![];
        let reward = Reward {
            id: Uuid::new_v4(),
            collection_name: "Test collection".to_string(),
            amount: 10i32,
            method: RewardMethodCommon::FCFS,
        };
        let expires_on = Utc::now();
        let created_on = Utc::now();
        let campaign_id = Uuid::new_v4();

        let result = update_quest(
            id,
            title,
            description,
            display_image,
            tasks,
            reward,
            expires_on,
            created_on,
            campaign_id,
        )
        .await
        .unwrap();

        println!("Result: {:?}", result);
    }

    #[tokio::test]
    async fn test_delete_quest() {
        let quest_id = "f1b3b3b3-1b3b-4b3b-8b3b-1b3b3b3b3b3b";
        let result = delete_quest(quest_id).await.unwrap();
        println!("Result: {:?}", result);
    }

    #[tokio::test]
    async fn test_create_collection() {
        let name = "Test Collection".to_string();
        let whitelist_img = "Test Collection".to_string();
        let description = "Test Collection".to_string();
        let inner_img = Some("Test Collection".to_string());
        let twitter_link = Some("Test Collection".to_string());
        let discord_link = Some("Test Collection".to_string());

        let result = create_collection(
            name,
            whitelist_img,
            description,
            inner_img,
            twitter_link,
            discord_link,
        )
        .await
        .unwrap();

        println!("Result: {:?}", result);
    }

    #[tokio::test]
    async fn test_update_collection() {
        let id = Uuid::new_v4();
        let name = "Test Collection".to_string();
        let whitelist_img = "Test Collection".to_string();
        let description = "Test Collection".to_string();
        let inner_img = Some("Test Collection".to_string());
        let twitter_link = Some("Test Collection".to_string());
        let discord_link = Some("Test Collection".to_string());

        let result = update_collection(
            id,
            name,
            whitelist_img,
            description,
            inner_img,
            twitter_link,
            discord_link,
        )
        .await
        .unwrap();

        println!("Result: {:?}", result);
    }

    #[tokio::test]
    async fn test_delete_collection() {
        let collection_id = "f1b3b3b3-1b3b-4b3b-8b3b-1b3b3b3b3b3b";
        let result = delete_collection(collection_id).await.unwrap();
        println!("Result: {:?}", result);
    }

    #[tokio::test]
    async fn test_distribute_rewards() {
        let quest_id = "f1b3b3b3-1b3b-4b3b-8b3b-1b3b3b3b3b3b";
        let result = distribute_rewards(quest_id).await.unwrap();
        println!("Result: {:?}", result);
    }

    // #[tokio::test]
}
