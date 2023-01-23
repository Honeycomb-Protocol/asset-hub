use anchor_lang::prelude::*;

/// The Asset Manager state account.
#[account]
pub struct AssetManager {
    pub bump: u8,

    /// The unique identifier of the asset manager.
    pub key: Pubkey,

    /// The wallet holds the complete authority over the asset manager.
    pub authority: Pubkey,

    /// The treasury wallet of the asset manager.
    pub treasury: Pubkey,

    /// Asset manager project name
    pub name: String,
}
impl AssetManager {
    pub const LEN: usize = 128;
}

/// The Asset.
#[account]
pub struct Asset {
    pub bump: u8,

    /// The asset manager this asset is associated to
    pub manager: Pubkey,

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
