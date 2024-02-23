use {
    crate::{
        utils::{use_burn_resource, use_mint_resource},
        HoldingAccountArgs, Resource,
    },
    anchor_lang::prelude::*,
    anchor_spl::token_2022::Token2022,
    hpl_hive_control::state::Project,
    hpl_toolkit::HashMap,
    spl_account_compression::{program::SplAccountCompression, Noop},
};

#[derive(Accounts)]
pub struct MintResource<'info> {
    #[account()]
    pub project: Box<Account<'info, Project>>,

    #[account(has_one = project, has_one = mint)]
    pub resource: Box<Account<'info, Resource>>,

    /// CHECK: this is not dangerous. we are not reading & writing from it
    #[account(mut, constraint = resource.mint == mint.key())]
    pub mint: AccountInfo<'info>,

    /// CHECK: this is not dangerous. we are not reading & writing from it
    #[account(mut)]
    pub merkle_tree: AccountInfo<'info>,

    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token2022>,

    pub compression_program: Program<'info, SplAccountCompression>,

    pub log_wrapper: Program<'info, Noop>,

    pub clock: Sysvar<'info, Clock>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub enum MintResourceArgs {
    Fungible {
        holding_state: Option<HoldingAccountArgs>,
        amount: u64,
    },

    INF {
        holding_state: Option<HoldingAccountArgs>,
        characteristics: HashMap<String, String>,
    },
}

pub fn mint_resource<'info>(
    ctx: Context<'_, '_, '_, 'info, MintResource<'info>>,
    args: MintResourceArgs,
) -> Result<()> {
    let resource = &mut ctx.accounts.resource;

    // mint the resource for fungible tokens
    use_mint_resource(
        resource,
        &ctx.accounts.merkle_tree,
        &ctx.accounts.owner,
        ctx.remaining_accounts,
        &ctx.accounts.clock.to_owned(),
        &ctx.accounts.log_wrapper.to_owned(),
        &ctx.accounts.compression_program.to_owned(),
        &args,
    )?;

    msg!("Minting the token");

    Ok(())
}

#[derive(Accounts)]
pub struct BurnResource<'info> {
    #[account()]
    pub project: Box<Account<'info, Project>>,

    #[account(has_one = project, has_one = mint)]
    pub resource: Box<Account<'info, Resource>>,

    /// CHECK: this is not dangerous. we are not reading & writing from it
    #[account(mut)]
    pub mint: AccountInfo<'info>,

    /// CHECK: this is not dangerous. we are not reading & writing from it
    #[account(mut)]
    pub merkle_tree: AccountInfo<'info>,

    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub rent_sysvar: Sysvar<'info, Rent>,

    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token2022>,

    pub compression_program: Program<'info, SplAccountCompression>,

    pub log_wrapper: Program<'info, Noop>,

    pub clock: Sysvar<'info, Clock>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub enum BurnResourceArgs {
    Fungible {
        holding_state: HoldingAccountArgs,
        amount: u64,
    },

    INF {
        holding_state: HoldingAccountArgs,
    },
}

pub fn burn_resource<'info>(
    ctx: Context<'_, '_, '_, 'info, BurnResource<'info>>,
    args: BurnResourceArgs,
) -> Result<()> {
    let resource = &mut ctx.accounts.resource;

    use_burn_resource(
        resource,
        &ctx.accounts.merkle_tree,
        ctx.remaining_accounts,
        &ctx.accounts.clock.to_owned(),
        &ctx.accounts.log_wrapper.to_owned(),
        &ctx.accounts.compression_program.to_owned(),
        &args,
    )?;

    msg!("Token Burned");

    Ok(())
}
