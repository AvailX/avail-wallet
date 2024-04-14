use chrono::{DateTime, Utc};
use uuid::Uuid;

use crate::models::wallet_connect::get_event::{EventsFilter, GetEventsRequest};
use crate::services::local_storage::storage_api::event::get_events_raw;
use crate::{api::client::get_quest_client_with_session, models::event};
use avail_common::{
    errors::{AvailError, AvailErrorType, AvailResult},
    models::encrypted_data::EventTypeCommon,
    models::quests::*,
};
use tauri_plugin_http::reqwest;

use snarkvm::prelude::Testnet3;

#[tauri::command(rename_all = "snake_case")]
pub async fn get_campaigns() -> AvailResult<Vec<Campaign>> {
    let res = get_quest_client_with_session(reqwest::Method::GET, "campaigns")?
        .send()
        .await?;

    if res.status() == 200 {
        let campaigns: Vec<Campaign> = res.json().await?;

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

#[tauri::command(rename_all = "snake_case")]
pub async fn get_quests_for_campaign(campaign_id: &str) -> AvailResult<Vec<Quest>> {
    let res = get_quest_client_with_session(reqwest::Method::GET, campaign_id)?
        .send()
        .await?;

    if res.status() == 200 {
        let quests: Vec<Quest> = res.json().await?;

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

#[tauri::command(rename_all = "snake_case")]
pub async fn check_quest_completion(quest_id: &str) -> AvailResult<bool> {
    let res =
        get_quest_client_with_session(reqwest::Method::GET, &format!("confirmed/{}", quest_id))?
            .send()
            .await?;

    if res.status() == 200 {
        let completion: VerifyTaskResponse = res.json().await?;

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
pub async fn is_task_verified(task_id: &Uuid) -> AvailResult<bool> {
    let res =
        get_quest_client_with_session(reqwest::Method::GET, &format!("verified/{}", task_id))?
            .send()
            .await?;

    if res.status() == 200 {
        let completion: VerifyTaskResponse = res.json().await?;

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
) -> AvailResult<()> {
    // required data: start_time, end_time (from quest), task_id, program_id, function_id
    // with this data we can then query transaction pointers for a match
    //
    let task_id = Uuid::parse_str(task_id)?;
    let is_task_verified = is_task_verified(&task_id).await?;

    if is_task_verified {
        return Ok(());
    }

    let event_filter = EventsFilter::new(
        Some(EventTypeCommon::Execute),
        Some(program_id.to_string()),
        Some(function_id.to_string()),
    );

    let request = GetEventsRequest {
        filter: Some(event_filter),
        page: None,
    };

    let events = get_events_raw::<Testnet3>(request)?;

    // if events is not empty, then we can verify the task

    /*
    if !events.is_empty(){
        let request = VerifyTaskRequest {
            task_id,
            confirmation_height: 0,
            transaction_id: events[0].transaction_id,
            transition_id: events[0].transition_id,
            tvk: events[0].tvk,
        };

    }
    */
    // TODO
    // create function that specifically targets the transactions that match what we need
    // then loops to transitions matching them w the program_id and function_id
    // if it's the match this is the transition, and then we get the transition view key.
    // return boolean, tx_id, transition_id, tvk
    // then post verification

    Ok(())
}

#[tauri::command(rename_all = "snake_case")]
pub async fn get_points() -> AvailResult<i32> {
    let res = get_quest_client_with_session(reqwest::Method::GET, "points")?
        .send()
        .await?;

    if res.status() == 200 {
        let points: PointsResponse = res.json().await?;

        Ok(points.points)
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

#[tauri::command(rename_all = "snake_case")]
pub async fn get_whitelists() -> AvailResult<WhitelistResponse> {
    let res = get_quest_client_with_session(reqwest::Method::GET, "whitelists")?
        .send()
        .await?;

    if res.status() == 200 {
        let whitelists: WhitelistResponse = res.json().await?;

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
