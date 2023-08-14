use anchor_lang::prelude::*;
use borsh::{BorshDeserialize, BorshSerialize};
use hpl_compression::{event, invoke, spl_noop, ProgramResult};

use super::{Currency, HolderAccount};

#[event]
pub enum Event {
    NewCurrency {
        address: Pubkey,
        info: Vec<u8>,
        timestamp: i64,
    },
    UpdateCurrency {
        address: Pubkey,
        info: Vec<u8>,
        timestamp: i64,
    },
    NewHolderAccount {
        address: Pubkey,
        info: Vec<u8>,
        timestamp: i64,
    },
    UpdateHolderAccount {
        address: Pubkey,
        info: Vec<u8>,
        timestamp: i64,
    },
}

impl Event {
    pub fn new_currency(address: Pubkey, state: &Currency, clock: &Clock) -> Self {
        Self::NewCurrency {
            address,
            info: state.try_to_vec().unwrap(),
            timestamp: clock.unix_timestamp,
        }
    }
    pub fn update_currency(address: Pubkey, state: &Currency, clock: &Clock) -> Self {
        Self::UpdateCurrency {
            address,
            info: state.try_to_vec().unwrap(),
            timestamp: clock.unix_timestamp,
        }
    }
    pub fn new_holder_account(address: Pubkey, state: &HolderAccount, clock: &Clock) -> Self {
        Self::NewHolderAccount {
            address,
            info: state.try_to_vec().unwrap(),
            timestamp: clock.unix_timestamp,
        }
    }
    pub fn update_holder_account(address: Pubkey, state: &HolderAccount, clock: &Clock) -> Self {
        Self::UpdateHolderAccount {
            address,
            info: state.try_to_vec().unwrap(),
            timestamp: clock.unix_timestamp,
        }
    }
}
