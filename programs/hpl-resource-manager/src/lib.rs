mod errors;
mod instructions;
mod state;
mod utils;

use anchor_lang::prelude::*;
use instructions::*;
use state::*;

declare_id!("Assetw8uxLogzVXic5P8wGYpVdesS1oZHfSnBFHAu42s");

#[cfg(not(feature = "cpi"))]
use hpl_toolkit::schema::*;
#[cfg_attr(not(feature = "cpi"), account_schemas_ix_injector(Resource Recipe))]
#[program]
pub mod hpl_resource_manager {
    use super::*;

    pub fn create_resource(ctx: Context<CreateResource>, args: CreateResourceArgs) -> Result<()> {
        instructions::create_resource(ctx, args)
    }

    pub fn initialize_resource_tree(
        ctx: Context<InitializeResourceTree>,
        args: InitializeResourceTreeArgs,
    ) -> Result<()> {
        instructions::initialize_resource_tree(ctx, args)
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

    // pub fn unwrap_resource<'info>(
    //     ctx: Context<'_, '_, '_, 'info, UnWrapResource<'info>>,
    //     args: UnWrapResourceArgs,
    // ) -> Result<()> {
    //     instructions::unwrap_resource(ctx, args)
    // }

    pub fn initialize_recipe(
        ctx: Context<InitializeRecipe>,
        args: InitializeRecipeArgs,
    ) -> Result<()> {
        instructions::initialize_recipe(ctx, args)
    }

    pub fn craft_recipe_proof<'info>(
        ctx: Context<'_, '_, '_, 'info, CraftRecipeProof<'info>>,
        args: CraftResourceUser,
    ) -> Result<()> {
        instructions::craft_recipe_proof(ctx, args)
    }

    pub fn craft_recipe_burn<'info>(
        ctx: Context<'_, '_, '_, 'info, CraftRecipeBurn<'info>>,
        args: CraftRecipeBurnArgs,
    ) -> Result<()> {
        instructions::craft_recipe_burn(ctx, args)
    }

    pub fn craft_recipe_mint<'info>(
        ctx: Context<'_, '_, '_, 'info, CraftRecipeMint<'info>>,
        args: CraftRecipeMintArgs,
    ) -> Result<()> {
        instructions::craft_recipe_mint(ctx, args)
    }
}
