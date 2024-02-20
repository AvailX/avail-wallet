use avail_common::aleo_tools::program_manager::TransferType;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TransferRequest {
    recipient: String,
    amount: u64,
    message: Option<String>,
    password: Option<String>,
    transfer_type: u8,
    fee_private: bool,
    fee: u64,
    asset_id: String,
}

impl TransferRequest {
    pub fn new(
        recipient: String,
        amount: u64,
        message: Option<String>,
        password: Option<String>,
        transfer_type: TransferType,
        fee_private: bool,
        fee: u64,
        asset_id: String,
    ) -> Self {
        let transfer_type = match transfer_type {
            TransferType::Public => 0,
            TransferType::Private => 1,
            TransferType::PublicToPrivate => 2,
            TransferType::PrivateToPublic => 3,
        };

        Self {
            recipient,
            amount,
            message,
            password,
            transfer_type,
            fee_private,
            fee,
            asset_id,
        }
    }

    pub fn recipient(&self) -> &String {
        &self.recipient
    }

    pub fn amount(&self) -> &u64 {
        &self.amount
    }

    pub fn message(&self) -> &Option<String> {
        &self.message
    }

    pub fn password(&self) -> &Option<String> {
        &self.password
    }

    pub fn transfer_type(&self) -> &TransferType {
        match &self.transfer_type {
            0 => &TransferType::Public,
            1 => &TransferType::Private,
            2 => &TransferType::PublicToPrivate,
            3 => &TransferType::PrivateToPublic,
            _ => &TransferType::Private,
        }
    }

    pub fn fee_private(&self) -> &bool {
        &self.fee_private
    }

    pub fn fee(&self) -> &u64 {
        &self.fee
    }

    pub fn asset_id(&self) -> &String {
        &self.asset_id
    }
}
