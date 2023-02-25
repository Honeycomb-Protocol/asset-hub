pub mod assembler;
pub mod block;
pub mod nft;

pub use {assembler::*, block::*, nft::*};

use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Creator {
    pub address: Pubkey,
    // pub verified: bool,
    pub share: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq)]
pub enum TokenStandard {
    NonFungible,             // This is a master edition
    ProgrammableNonFungible, // NonFungible with programmable configuration
}
