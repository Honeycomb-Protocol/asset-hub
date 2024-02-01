mod errors;
mod instructions;
mod states;
mod utils;

use anchor_lang::prelude::*;
use instructions::*;
use states::*;

declare_id!("6ARwjKsMY2P3eLEWhdoU5czNezw3Qg6jEfbmLTVQqrPQ");

#[program]
pub mod hpl_resource_manager {
    use super::*;

    pub fn create_resource(ctx: Context<CreateResource>, args: CreateResourceArgs) -> Result<()> {
        instructions::create_resource(ctx, args)
    }

    pub fn initilize_resource_tree(
        ctx: Context<InitilizeResourceTree>,
        args: InitilizeResourceTreeArgs,
    ) -> Result<()> {
        instructions::initilize_resource_tree(ctx, args)
    }

    pub fn mint_resource<'info>(
        ctx: Context<'_, '_, '_, 'info, MintResource<'info>>,
        args: MintResourceArgs,
    ) -> Result<()> {
        instructions::mint_resource(ctx, args)
    }

    pub fn burn_resource<'info>(
        ctx: Context<'_, '_, '_, 'info, BurnResource<'info>>,
        args: BurnResourceArgs,
    ) -> Result<()> {
        instructions::burn_resource(ctx, args)
    }
}
