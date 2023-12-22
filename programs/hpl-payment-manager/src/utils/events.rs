use anchor_lang::{
    prelude::*,
    solana_program::{entrypoint::ProgramResult, instruction::Instruction, program::invoke},
};
use hpl_events::event;

#[event]
pub enum Event {
    NewPaymentStructure { address: Pubkey, state: Vec<u8> },
    DeletePaymentStructure { address: Pubkey, state: Vec<u8> },
    NewPaymentSession { address: Pubkey, state: Vec<u8> },
    MakePayment { address: Pubkey, state: Vec<u8> },
    ClosePaymentSession { address: Pubkey, state: Vec<u8> },
}
