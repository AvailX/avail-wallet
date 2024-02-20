use serde::{ser::SerializeStruct, Deserialize, Serialize};
use snarkvm::prelude::{Address, Network, Testnet3, ViewKey};

pub struct AvailKeys<N: Network> {
    pub view_key: ViewKey<N>,
    pub address: Address<N>,
}

impl Serialize for AvailKeys<Testnet3> {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut state = serializer.serialize_struct("AvailKeys", 2)?;
        state.serialize_field("view_key", &self.view_key.to_string())?;
        state.serialize_field("address", &self.address.to_string())?;
        state.end()
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct AddressRequest {
    pub username: String,
}
