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

    /// The mint address of this Asset
    pub mint: Pubkey,

    /// The maximum supply of this Asset
    pub max_supply: u64,

    /// The current supply of this Asset
    pub supply: u64,

    /// The name of the Asset
    pub name: String,

    /// The symbol of the Asset
    pub symbol: String,

    /// The description of the Asset
    pub description: String,

    /// The uri of the metadata of the Asset
    pub uri: String,
}
impl Asset {
    pub const LEN: usize = 184;
}
