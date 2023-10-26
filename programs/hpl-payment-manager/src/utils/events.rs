use anchor_lang::prelude::*;
use hpl_events::{event, invoke, Instruction, ProgramResult};

#[event]
pub enum Event {
    NewPaymentStructure { address: Pubkey, state: Vec<u8> },
    DeletePaymentStructure { address: Pubkey, state: Vec<u8> },
    NewPaymentSession { address: Pubkey, state: Vec<u8> },
    MakePayment { address: Pubkey, state: Vec<u8> },
    ClosePaymentSession { address: Pubkey, state: Vec<u8> },
}
