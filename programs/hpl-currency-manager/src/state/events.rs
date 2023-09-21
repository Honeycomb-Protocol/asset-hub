use anchor_lang::prelude::*;
use hpl_events::{event, invoke, Instruction, ProgramResult};

use super::{Currency, HolderAccount};

#[event]
pub enum Event {
    NewCurrency {
        address: Pubkey,
        state: Vec<u8>,
        timestamp: i64,
    },
    UpdateCurrency {
        address: Pubkey,
        state: Vec<u8>,
        timestamp: i64,
    },
    NewHolderAccount {
        address: Pubkey,
        state: Vec<u8>,
        timestamp: i64,
    },
    UpdateHolderAccount {
        address: Pubkey,
        state: Vec<u8>,
        timestamp: i64,
    },
}

impl Event {
    pub fn new_currency(address: Pubkey, state: &Currency, clock: &Clock) -> Self {
        Self::NewCurrency {
            address,
            state: state.try_to_vec().unwrap(),
            timestamp: clock.unix_timestamp,
        }
    }
    pub fn update_currency(address: Pubkey, state: &Currency, clock: &Clock) -> Self {
        Self::UpdateCurrency {
            address,
            state: state.try_to_vec().unwrap(),
            timestamp: clock.unix_timestamp,
        }
    }
    pub fn new_holder_account(address: Pubkey, state: &HolderAccount, clock: &Clock) -> Self {
        Self::NewHolderAccount {
            address,
            state: state.try_to_vec().unwrap(),
            timestamp: clock.unix_timestamp,
        }
    }
    pub fn update_holder_account(address: Pubkey, state: &HolderAccount, clock: &Clock) -> Self {
        Self::UpdateHolderAccount {
            address,
            state: state.try_to_vec().unwrap(),
            timestamp: clock.unix_timestamp,
        }
    }
}
