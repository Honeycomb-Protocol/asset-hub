use anchor_lang::prelude::*;
use hpl_events::{event, invoke, Instruction, ProgramResult};

// use super::{Currency, HolderAccount};

#[event]
pub enum Event {
    NewCurrency { address: Pubkey, state: Vec<u8> },
    UpdateCurrency { address: Pubkey, state: Vec<u8> },
    NewHolderAccount { address: Pubkey, state: Vec<u8> },
    UpdateHolderAccount { address: Pubkey, state: Vec<u8> },
}
