use avail_common::errors::{AvailError, AvailResult};
use once_cell::sync::Lazy;
use std::sync::RwLock;

use avail_common::aleo_tools::api::AleoAPIClient;
use snarkvm::{console::network::Testnet3, prelude::Network};

use crate::helpers::mobile_init::log;
use crate::models::event::Network as EventNetwork;
use crate::services::local_storage::persistent_storage::update_network;

/* --Client Setup functions-- */
pub fn setup_local_client<N: Network>() -> AleoAPIClient<N> {
    let dev_node_ip = env!("DEV_NODE_IP");
    AleoAPIClient::<N>::local_testnet3("3030", dev_node_ip)
}

pub fn setup_client<N: Network>() -> AvailResult<AleoAPIClient<N>> {
    let node_api_obscura = env!("TESTNET_API_OBSCURA");

    let base_url = format!(
        "https://aleo-testnet3.obscura.build/v1/{}",
        node_api_obscura
    );

    let api_client = AleoAPIClient::<N>::new(&base_url, "testnet3")?;

    Ok(api_client)
}

pub fn network_status<N: Network>() -> AvailResult<()> {
    //get block height from https://api.explorer.aleo.org/v1/testnet3/latest/height
    // get block height from obscura client

    // if both are okay and moving forward then it's okay
    // if obscura is not moving forward and aleo is then this should be a warning
    // if both are not moving forward then this should be an error
    let obscura_client = setup_client::<N>()?;
    let aleo_client = AleoAPIClient::<N>::new("https://api.explorer.aleo.org/v1/", "testnet3")?;

    // loop for 5 times with 5 second delays checking the height at every loop of each client
    // if the height is not moving forward then return an error
    let mut obscura_heights: Vec<u32> = vec![];
    let mut aleo_heights: Vec<u32> = vec![];

    for _ in 0..5 {
        let obscura_height = obscura_client.latest_height()?;
        let aleo_height = aleo_client.latest_height()?;

        obscura_heights.push(obscura_height);
        aleo_heights.push(aleo_height);

        std::thread::sleep(std::time::Duration::from_secs(5));
    }

    // check if the heights are moving forward
    let obscura_moving_forward = obscura_heights.windows(2).all(|w| w[0] < w[1]);
    let aleo_moving_forward = aleo_heights.windows(2).all(|w| w[0] < w[1]);

    if !obscura_moving_forward && !aleo_moving_forward {
        // return status Down
        return Err(AvailError::new(
            avail_common::errors::AvailErrorType::Network,
            "Network is not moving forward".to_string(),
            "Network is not moving forward".to_string(),
        ));
    }

    if !obscura_moving_forward && aleo_moving_forward {
        //switch to aleo base_url
        // + add warning signal
        return Err(AvailError::new(
            avail_common::errors::AvailErrorType::Network,
            "Obscura is not moving forward".to_string(),
            "Obscura is not moving forward".to_string(),
        ));
    }

    if obscura_moving_forward && !aleo_moving_forward {
        //switch to obscura base_url
        // + add warning signal
        return Err(AvailError::new(
            avail_common::errors::AvailErrorType::Network,
            "Aleo is not moving forward".to_string(),
            "Aleo is not moving forward".to_string(),
        ));
    }

    if obscura_moving_forward && aleo_moving_forward {
        // return status Up
        // if base_url is aleo, it should switch to obscura
        return Ok(());
    }

    Ok(())
}

/* TODO -Solve Network Generic Global State-- */
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
