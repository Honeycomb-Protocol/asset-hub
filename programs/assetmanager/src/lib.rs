use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod structs;
pub mod utils;

use instructions::*;

declare_id!("7cJdKSjPtZqiGV4CFAGtbhhpf5CsYjbkbEkLKcXfHLYd");

#[program]
pub mod assetmanager {
    use super::*;

    pub fn create_asset(ctx: Context<CreateAsset>, args: CreateAssetArgs) -> Result<()> {
        instructions::create_asset(ctx, args)
    }

    pub fn mint_asset(ctx: Context<MintAsset>, amount: u64) -> Result<()> {
        instructions::mint_asset(ctx, amount)
    }
}
