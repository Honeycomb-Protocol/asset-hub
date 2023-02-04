pub mod errors;
pub mod instructions;
pub mod state;
pub mod traits;

use {anchor_lang::prelude::*, instructions::*};

declare_id!("8pyniLLXEHVUJKX2h5E9DrvwTsRmSR64ucUYBg8jQgPP");

#[program]
pub mod staking {
    use super::*;

    pub fn create_project(ctx: Context<CreateProject>, args: CreateProjectArgs) -> Result<()> {
        instructions::create_project(ctx, args)
    }

    pub fn update_poject(ctx: Context<UpdateProject>, args: UpdateProjectArgs) -> Result<()> {
        instructions::update_project(ctx, args)
    }

    pub fn stake(ctx: Context<Stake>) -> Result<()> {
        instructions::stake(ctx)
    }

    pub fn unstake(ctx: Context<Unstake>) -> Result<()> {
        instructions::unstake(ctx)
    }

    pub fn fund_rewards(ctx: Context<FundRewards>, amount: u64) -> Result<()> {
        instructions::fund_rewards(ctx, amount)
    }

    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        instructions::claim_rewards(ctx)
    }
}
