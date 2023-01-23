use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod structs;
pub mod utils;

use instructions::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod assetmanager {
    use super::*;

    pub fn create_asset_manager(
        ctx: Context<CreateAssetManager>,
        args: CreateAssetManagerArgs,
    ) -> Result<()> {
        instructions::create_asset_manager(ctx, args)
    }
}
