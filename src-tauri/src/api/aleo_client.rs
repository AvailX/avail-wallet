use avail_common::errors::{AvailError, AvailResult};
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::sync::RwLock;
// https://aleo-testnetbeta.obscura.network/v1/92acf30f-5cea-4679-880c-f06e9a7e8465/testnet/latest/height
use avail_common::aleo_tools::api::AleoAPIClient;
use snarkvm::{
    console::network::{MainnetV0, TestnetV0},
    prelude::Network,
};

use crate::models::event::Network as EventNetwork;
use crate::services::local_storage::persistent_storage::{
    get_base_url, update_base_url, update_network,
};

/* --Client Setup functions-- */
pub fn setup_local_client<N: Network>() -> AleoAPIClient<N> {
    let dev_node_ip = env!("DEV_NODE_IP");
    AleoAPIClient::<N>::local_testnet("3030", dev_node_ip)
}

pub fn setup_client<N: Network>() -> AvailResult<AleoAPIClient<N>> {
    let node_api_obscura = env!("TESTNET_API_OBSCURA");
    let base_url = match get_base_url()?.as_str() {
        "obscura" => format!(
            "https://aleo-testnetbeta.obscura.network/v1/{}",
            node_api_obscura
        ),
        "aleo" => "https://api.explorer.aleo.org/v1".to_string(),
        _ => {
            return Err(AvailError::new(
                avail_common::errors::AvailErrorType::Network,
                "Invalid base_url".to_string(),
                "Invalid base_url".to_string(),
            ))
        }
    };

    println!("Base URL: {:?}", base_url);

    let api_client = AleoAPIClient::<N>::new(&base_url, "testnet")?;

    Ok(api_client)
}

pub fn setup_obscura_client<N: Network>() -> AvailResult<AleoAPIClient<N>> {
    let node_api_obscura = env!("TESTNET_API_OBSCURA");

    let base_url = format!(
        "https://aleo-testnetbeta.obscura.network/v1/{}",
        node_api_obscura
    );

    let api_client = AleoAPIClient::<N>::new(&base_url, "testnet")?;

    Ok(api_client)
}

pub fn setup_aleo_client<N: Network>() -> AvailResult<AleoAPIClient<N>> {
    let aleo_client = AleoAPIClient::<N>::new("https://api.explorer.aleo.org/v1", "testnet")?;
    Ok(aleo_client)
}

pub fn network_status<N: Network>() -> AvailResult<Status> {
    let obscura_client = setup_obscura_client::<N>()?;
    let aleo_client = AleoAPIClient::<N>::new("https://api.explorer.aleo.org/v1", "testnet")?;

    let mut obscura_heights: Vec<u32> = vec![];
    //let mut aleo_heights: Vec<u32> = vec![];

    for _ in 0..4 {
        let obscura_height = obscura_client.latest_height().unwrap_or(0);
        println!("Obscura Height: {:?}", obscura_height);

        //let aleo_height = aleo_client.latest_height().unwrap_or(0);
        //println!("Aleo Height: {:?}", aleo_height);

        obscura_heights.push(obscura_height);
        //aleo_heights.push(aleo_height);

        std::thread::sleep(std::time::Duration::from_secs(3));
    }

    // check if at least once th height has moved forward
    let obscura_moving_forward = obscura_heights.windows(2).any(|w| w[0] < w[1]);
    //let aleo_moving_forward = aleo_heights.windows(2).any(|w| w[0] < w[1]);

    if obscura_moving_forward {
        if &get_base_url()? != "obscura" {
            update_base_url("obscura")?;
        }
        Ok(Status::Up)
    } else {
        update_base_url("obscura")?;
        return Ok(Status::Warning);
    }
}

#[tauri::command(rename_all = "snake_case")]
pub fn switch_to_obscura() -> AvailResult<()> {
    if &get_base_url()? != "obscura" {
        update_base_url("obscura")
    } else {
        Ok(())
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub enum Status {
    Up,
    Down,
    Warning,
}

/* TODO -Solve Network Generic Global State-- */
#[derive(Debug, Clone)]
pub struct AleoClient<N: Network> {
    pub client: AleoAPIClient<N>,
}

impl<N: Network> AleoClient<N> {
    pub fn new() -> AvailResult<Self> {
        let node_api_obscura = env!("MAINNET_API_OBSCURA");

        let base_url = format!(
            "https://aleo-mainnet.obscura.network/v1/{}",
            node_api_obscura
        );

        Ok(Self {
            client: AleoAPIClient::<N>::new(&base_url, "mainnet")?,
        })
    }

    pub fn devnet() -> AvailResult<Self> {
        let node_api_obscura = env!("DEVNET_API_OBSCURA");

        let base_url = format!("https://aleo-devnet.obscura.build/v1/{}", node_api_obscura);

        Ok(Self {
            client: AleoAPIClient::<N>::new(&base_url, "devnet")?,
        })
    }

    pub fn testnet() -> AvailResult<Self> {
        let node_api_obscura = env!("TESTNET_API_OBSCURA");

        let base_url = format!(
            "https://aleo-testnetbeta.obscura.network/v1/{}",
            node_api_obscura
        );

        Ok(Self {
            client: AleoAPIClient::<N>::new(&base_url, "testnet")?,
        })
    }

    pub fn switch_network(network: &str) -> AvailResult<()> {
        // Based on the network string, decide which network to switch to
        let new_client = match network {
            "testnet" => {
                update_network(EventNetwork::AleoTestnet);
                AleoClient::<TestnetV0>::testnet()?
            }
            //"devnet" => AleoClient::<Devnet>::devnet()?,
            //"mainnet" => AleoClient::<Mainnet>::mainnet()?,
            _ => {
                return Err(AvailError::new(
                    avail_common::errors::AvailErrorType::Network,
                    "Invalid network".to_string(),
                    "Invalid network".to_string(),
                ))
            }
        };

        // Acquire a write lock and update the ALEO_CLIENT
        let mut aleo_client = ALEO_CLIENT.write().unwrap();
        *aleo_client = new_client;

        Ok(())
    }

    pub fn local_dev() -> AvailResult<Self> {
        let dev_node_ip = env!("DEV_NODE_IP");

        Ok(Self {
            client: AleoAPIClient::local_testnet("3030", dev_node_ip),
        })
    }

    pub fn get_instance(&self) -> &AleoAPIClient<N> {
        &self.client
    }
}

//TODO - Make this compatible with different network types for mainnet.
pub static ALEO_CLIENT: Lazy<RwLock<AleoClient<TestnetV0>>> =
    Lazy::new(|| RwLock::new(AleoClient::<TestnetV0>::testnet().unwrap()));

#[test]
fn test_new_client() {
    let api_client = setup_local_client::<TestnetV0>();
    let height = api_client.latest_height().unwrap();

    println!("Height: {:?}", height);
}

#[test]
fn test_network_status() {
    let status = network_status::<TestnetV0>().unwrap();
    println!("Status: {:?}", status);
}
