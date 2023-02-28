use anchor_lang::prelude::*;

#[account]
pub struct AssetManager {
    pub bump: u8,
    pub project: Pubkey,
}
impl AssetManager {
    pub const LEN: usize = 33 + 8;
}

/// The Asset.
#[account]
pub struct Asset {
    pub bump: u8,

    /// The asset manager this asset is associated to
    pub asset_manager: Pubkey,

    /// Candy Guard address if any
    pub candy_guard: Option<Pubkey>,

    /// The mint address of this Asset
    pub mint: Pubkey,

    /// Total supply of asset
    pub supply: u64,

    /// Total items minted
    pub items_redeemed: u64,

    /// The uri of the metadata of the Asset
    pub uri: String,
}
impl Asset {
    pub const LEN: usize = 144 + 8;
}
