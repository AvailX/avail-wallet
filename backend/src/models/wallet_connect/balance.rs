use serde::{Deserialize, Serialize};

/* Balance Interfaces */

#[derive(Serialize, Deserialize, Debug)]
pub struct Balance {
    public: f64,
    private: f64,
}

impl Balance {
    pub fn public(&self) -> f64 {
        self.public
    }

    pub fn private(&self) -> f64 {
        self.private
    }

    pub fn total(&self) -> f64 {
        self.public + self.private
    }

    pub fn total_string(&self) -> String {
        self.total().to_string()
    }

    pub fn new(public: f64, private: f64) -> Self {
        Self { public, private }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct BalanceResponse {
    balances: Vec<Balance>,
    error: Option<String>,
}

impl BalanceResponse {
    pub fn new(balances: Vec<Balance>, error: Option<String>) -> Self {
        Self { balances, error }
    }

    pub fn balances(&self) -> &Vec<Balance> {
        &self.balances
    }

    pub fn error(&self) -> Option<&String> {
        self.error.as_ref()
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct BalanceRequest {
    asset_id: Option<String>,
    address: Option<String>,
}

impl BalanceRequest {
    pub fn new(asset_id: Option<&str>, address: Option<&str>) -> Self {
        let asset_id = match asset_id {
            Some(asset_id) => Some(asset_id.to_string()),
            None => None,
        };

        let address = match address {
            Some(address) => Some(address.to_string()),
            None => None,
        };

        Self { asset_id, address }
    }

    pub fn asset_id(&self) -> Option<String> {
        self.asset_id.clone()
    }

    pub fn address(&self) -> Option<String> {
        self.address.clone()
    }
}
