use anchor_lang::{
    prelude::*,
    solana_program::{entrypoint::ProgramResult, instruction::Instruction, program::invoke},
};
use hpl_events::event;

// use super::{Currency, HolderAccount};

#[event]
pub enum Event {
    NewCurrency { address: Pubkey, state: Vec<u8> },
    UpdateCurrency { address: Pubkey, state: Vec<u8> },
    NewHolderAccount { address: Pubkey, state: Vec<u8> },
    UpdateHolderAccount { address: Pubkey, state: Vec<u8> },
}
