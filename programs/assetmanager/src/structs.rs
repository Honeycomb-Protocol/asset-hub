use anchor_lang::prelude::*;
/// The Asset.
#[account]
pub struct Asset {
    pub bump: u8,

    /// The asset manager this asset is associated to
    pub owner: Pubkey,

    /// Candy Guard address if any
    pub candy_guard: Option<Pubkey>,

    /// The mint address of this Asset
    pub mint: Pubkey,

    /// Total items minted
    pub items_redeemed: u64,

    /// The uri of the metadata of the Asset
    pub uri: String,
}
impl Asset {
    pub const LEN: usize = 136;
}
