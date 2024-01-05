use anchor_lang::{
    prelude::*,
    solana_program::{entrypoint::ProgramResult, instruction::Instruction, program::invoke},
};
use hpl_events::event;

#[event]
pub enum Event {
    NewCharacterModel { address: Pubkey, state: Vec<u8> },
}
