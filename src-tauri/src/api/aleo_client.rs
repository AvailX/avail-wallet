use avail_common::errors::{AvailError, AvailResult};
use once_cell::sync::Lazy;
use std::sync::RwLock;

use avail_common::aleo_tools::api::AleoAPIClient;
use snarkvm::{console::network::Testnet3, prelude::Network};

use crate::models::event::Network as EventNetwork;
use crate::services::local_storage::persistent_storage::update_network;

/* --Client Setup functions-- */
pub fn setup_local_client<N: Network>() -> AleoAPIClient<N> {
    let dev_node_ip = env!("DEV_NODE_IP");
    let api_client = AleoAPIClient::<N>::local_testnet3("3030", &dev_node_ip);

    api_client
}

pub fn setup_client<N: Network>() -> AvailResult<AleoAPIClient<N>> {
    let node_api_obscura = env!("TESTNET_API_OBSCURA");

    println!("Node API Obscura: {:?}", node_api_obscura);

    let base_url = format!(
        "https://aleo-testnet3.obscura.build/v1/{}",
        node_api_obscura
    );

    let api_client = AleoAPIClient::<N>::new(&base_url, "testnet3")?;

    Ok(api_client)
}

/* --Solve Network Generic Global State-- */
#[derive(Debug, Clone)]
pub struct AleoClient<N: Network> {
    pub client: AleoAPIClient<N>,
}

impl<N: Network> AleoClient<N> {
    pub fn new() -> AvailResult<Self> {
        let node_api_obscura = env!("MAINNET_API_OBSCURA");

        let base_url = format!("https://aleo-mainnet.obscura.build/v1/{}", node_api_obscura);

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

    pub fn testnet3() -> AvailResult<Self> {
        let node_api_obscura = env!("TESTNET_API_OBSCURA");

        let base_url = format!(
            "https://aleo-testnet3.obscura.build/v1/{}",
            node_api_obscura
        );

        Ok(Self {
            client: AleoAPIClient::<N>::new(&base_url, "testnet3")?,
        })
    }

    pub fn switch_network(network: &str) -> AvailResult<()> {
        // Based on the network string, decide which network to switch to
        let new_client = match network {
            "testnet3" => {
                update_network(EventNetwork::AleoTestnet);
                AleoClient::<Testnet3>::testnet3()?
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
            client: AleoAPIClient::local_testnet3("3030", &dev_node_ip),
        })
    }

    pub fn get_instance(&self) -> &AleoAPIClient<N> {
        &self.client
    }
}

pub static ALEO_CLIENT: Lazy<RwLock<AleoClient<Testnet3>>> =
    Lazy::new(|| RwLock::new(AleoClient::<Testnet3>::testnet3().unwrap()));

#[test]
fn test_new_client() {
    let api_client = setup_local_client::<Testnet3>();
    let height = api_client.latest_height().unwrap();

    println!("Height: {:?}", height);
}
