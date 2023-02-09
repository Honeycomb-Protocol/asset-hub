pub mod assembler;
pub mod block;
pub mod nft;

pub use {assembler::*, block::*, nft::*};

use anchor_lang::prelude::*;

/// Delegate Authority
#[account]
pub struct DelegateAuthority {
    pub bump: u8,

    /// The delegate authority
    pub authority: Pubkey,

    /// The permission of the delegate authority
    pub permission: DelegateAuthorityPermission,
}
impl DelegateAuthority {
    pub const LEN: usize = 34 + 8; // base size + 8 align
}

/// Delegate Authority Permission
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq)]
pub enum DelegateAuthorityPermission {
    /// Master authority
    Master,

    /// The delegate authority can update the assembler
    UpdateAssembler,

    /// The delegate authority can update the block
    UpdateBlock,

    /// The delegate authority can update the block definition
    UpdateBlockDefinition,

    /// The delegate authority can update the NFT
    UpdateNFT,

    /// The delegate sets the initial data of the NFT
    InitialArtGeneration,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Creator {
    pub address: Pubkey,
    pub verified: bool,
    pub share: u8,
}


#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq)]
pub enum TokenStandard {
    NonFungible,             // This is a master edition
    ProgrammableNonFungible, // NonFungible with programmable configuration
}
