use {
    crate::{
        utils::{use_burn_resource, use_mint_resource},
        HoldingAccountArgs, Resource,
    },
    anchor_lang::prelude::*,
    anchor_spl::token::Token,
    hpl_hive_control::state::Project,
    spl_account_compression::{program::SplAccountCompression, Noop},
    spl_token_2022::ID as Token2022,
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

    /// CHECK: this is not dangerous. we are not reading & writing from it
    #[account(address = Token2022)]
    pub token22_program: AccountInfo<'info>,

    /// SPL TOKEN PROGRAM
    pub token_program: Program<'info, Token>,

    /// SPL Compression program.
    pub compression_program: Program<'info, SplAccountCompression>,

    /// SPL Noop program.
    pub log_wrapper: Program<'info, Noop>,

    // SYSVAR CLOCK
    pub clock: Sysvar<'info, Clock>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct MintResourceArgs {
    pub holding_state: Option<HoldingAccountArgs>,
    pub amount: u64,
}

pub fn mint_resource<'info>(
    ctx: Context<'_, '_, '_, 'info, MintResource<'info>>,
    args: MintResourceArgs,
) -> Result<()> {
    let resource = &mut ctx.accounts.resource;

    use_mint_resource(
        resource,
        &ctx.accounts.merkle_tree,
        &ctx.accounts.owner,
        ctx.remaining_accounts.to_vec(),
        &ctx.accounts.clock.to_owned(),
        &ctx.accounts.log_wrapper.to_owned(),
        &ctx.accounts.compression_program.to_owned(),
        args,
    )?;

    msg!("Minting the token");
    // update compress supply in mint's metadata
    // update_compressed_supply(
    //     ctx.accounts.token22_program.to_account_info(),
    //     ctx.accounts.mint.to_account_info(),
    //     &resource,
    //     args.amount,
    // )?;

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

    /// CHECK: this is not dangerous. we are not reading & writing from it
    #[account(address = Token2022)]
    pub token22_program: AccountInfo<'info>,

    /// SPL TOKEN PROGRAM
    pub token_program: Program<'info, Token>,

    /// SPL Compression program.
    pub compression_program: Program<'info, SplAccountCompression>,

    /// SPL Noop program.
    pub log_wrapper: Program<'info, Noop>,

    // SYSVAR CLOCK
    pub clock: Sysvar<'info, Clock>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct BurnResourceArgs {
    pub holding_state: HoldingAccountArgs,
    pub amount: u64,
}

pub fn burn_resource<'info>(
    ctx: Context<'_, '_, '_, 'info, BurnResource<'info>>,
    args: BurnResourceArgs,
) -> Result<()> {
    let resource = &mut ctx.accounts.resource;

    use_burn_resource(
        resource,
        &ctx.accounts.merkle_tree,
        &ctx.remaining_accounts.to_vec(),
        &ctx.accounts.clock.to_owned(),
        &ctx.accounts.log_wrapper.to_owned(),
        &ctx.accounts.compression_program.to_owned(),
        &args.holding_state,
        args.amount,
    )?;

    msg!("Minting the token");
    // update compress supply in mint's metadata
    // update_compressed_supply(
    //     ctx.accounts.token22_program.to_account_info(),
    //     ctx.accounts.mint.to_account_info(),
    //     &resource,
    //     args.amount,
    // )?;

    Ok(())
}
