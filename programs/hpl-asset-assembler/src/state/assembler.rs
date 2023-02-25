use {
    super::{Creator, TokenStandard},
    anchor_lang::prelude::*,
};

/// Assembler state account
#[account]
pub struct Assembler {
    pub bump: u8,

    /// The wallet that has authority to modify the assembler
    pub project: Pubkey,

    /// The collection address of the assembler generated NFTs
    pub collection: Pubkey,

    /// The collection name to be associated with each nft
    pub collection_name: String,

    /// The collection symbol to be associated with each nft
    pub collection_symbol: String,

    /// The collection description to be associated with each nft
    pub collection_description: String,

    /// The base uri of each nft metadata
    pub nft_base_uri: String,

    /// Action to take for the block SFT while assembling
    pub assembling_action: AssemblingAction,

    /// The number of NFTs created by this assembler
    pub nfts: u16,

    /// Should this assembler allow duplicate NFTs
    pub allow_duplicates: bool,

    /// Default royalty percentage
    pub default_royalty: u16,

    /// Token Standard
    pub token_standard: TokenStandard,

    /// pNFT rule set
    pub rule_set: Option<Pubkey>,

    /// Default creators
    pub default_creators: Vec<Creator>,
}
impl Assembler {
    pub const LEN: usize = 210 + 8 + (40 * 4); // base size + 8 align + string extra
}

/// Assembling Action
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq)]
pub enum AssemblingAction {
    /// burn the block token
    Burn,

    /// Freeze the block token
    Freeze,

    /// Take custody of the block token
    TakeCustody,
}
