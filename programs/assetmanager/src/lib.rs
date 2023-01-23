use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod structs;
pub mod utils;

use instructions::*;

declare_id!("BNGKUeQQHw2MgZc9EqFsCWmnkLEKLCUfu5cw9YFWK3hF");

#[program]
pub mod assetmanager {
    use super::*;

    pub fn create_asset_manager(
        ctx: Context<CreateAssetManager>,
        args: CreateAssetManagerArgs,
    ) -> Result<()> {
        instructions::create_asset_manager(ctx, args)
    }

    pub fn create_asset(ctx: Context<CreateAsset>, args: CreateAssetArgs) -> Result<()> {
        instructions::create_asset(ctx, args)
    }

    pub fn mint_asset(ctx: Context<MintAsset>, amount: u64) -> Result<()> {
        instructions::mint_asset(ctx, amount)
    }
}
