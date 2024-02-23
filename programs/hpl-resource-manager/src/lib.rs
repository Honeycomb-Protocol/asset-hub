mod errors;
mod instructions;
mod states;
mod utils;

use anchor_lang::prelude::*;
use instructions::*;
use states::*;

declare_id!("ATQfyuSouoFHW393YFYeojfBcsPD6KpM4cVCzSwkguT2");

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

    // pub fn wrap_resource<'info>(
    //     ctx: Context<'_, '_, '_, 'info, WrapResource<'info>>,
    //     args: WrapResourceArgs,
    // ) -> Result<()> {
    //     instructions::wrap_resource(ctx, args)
    // }

    pub fn unwrap_resource<'info>(
        ctx: Context<'_, '_, '_, 'info, UnWrapResource<'info>>,
        args: UnWrapResourceArgs,
    ) -> Result<()> {
        instructions::unwrap_resource(ctx, args)
    }

    pub fn craft_recipe<'info>(
        ctx: Context<'_, '_, '_, 'info, CraftRecipe<'info>>,
        args: Vec<CraftRecipieArg>,
    ) -> Result<()> {
        instructions::craft_recipe(ctx, args)
    }

    pub fn initilize_recipe(
        ctx: Context<InitilizeRecipe>,
        args: InitilizeRecipieArgs,
    ) -> Result<()> {
        instructions::initilize_recipe(ctx, args)
    }
}
