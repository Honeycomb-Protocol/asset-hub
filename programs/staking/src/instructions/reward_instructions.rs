use {
    crate::state::*,
    anchor_lang::prelude::*,
    anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer},
};

/// Accounts used in fund rewards instruction
#[derive(Accounts)]
pub struct FundRewards<'info> {
    /// Project state account
    #[account()]
    pub project: Account<'info, Project>,

    /// Mint address of the reward token
    #[account(mut, constraint = reward_mint.key() == project.reward_mint)]
    pub reward_mint: Account<'info, Mint>,

    /// Vault
    #[account(mut, constraint = vault.key() == project.vault)]
    pub vault: Account<'info, TokenAccount>,

    /// Payee token account
    #[account(mut, constraint = token_account.mint == reward_mint.key() && token_account.owner == wallet.key())]
    pub token_account: Account<'info, TokenAccount>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub wallet: Signer<'info>,

    /// NATIVE TOKEN PROGRAM
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
}

/// Fund rewards
pub fn fund_rewards(ctx: Context<FundRewards>, amount: u64) -> Result<()> {
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.token_account.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
                authority: ctx.accounts.wallet.to_account_info(),
            },
        ),
        amount,
    )?;
    Ok(())
}

/// Accounts used in fund rewards instruction
#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    /// Project state account
    #[account()]
    pub project: Account<'info, Project>,

    /// NFT state account
    #[account(mut, has_one = project, constraint = nft.staker == wallet.key())]
    pub nft: Account<'info, NFT>,

    /// Mint address of the reward token
    #[account(mut, constraint = reward_mint.key() == project.reward_mint)]
    pub reward_mint: Account<'info, Mint>,

    /// Vault
    #[account(mut, constraint = vault.key() == project.vault)]
    pub vault: Account<'info, TokenAccount>,

    /// Payee token account
    #[account(mut, constraint = token_account.mint == reward_mint.key() && token_account.owner == wallet.key())]
    pub token_account: Account<'info, TokenAccount>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub wallet: Signer<'info>,

    /// NATIVE TOKEN PROGRAM
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,

    /// SYSVAR CLOCK
    pub clock: Sysvar<'info, Clock>,
}

/// Claim rewards
pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
    let project = &ctx.accounts.project;
    let nft = &mut ctx.accounts.nft;

    let project_seeds = &[
        b"project".as_ref(),
        ctx.accounts.project.key.as_ref(),
        &[ctx.accounts.project.bump],
    ];
    let project_signer = &[&project_seeds[..]];

    let seconds_elapsed = ctx.accounts.clock.unix_timestamp - nft.last_claim;
    let rewards_amount = ((project.rewards_per_second * 100000) * seconds_elapsed as u64) / 100000;

    nft.last_claim = ctx.accounts.clock.unix_timestamp;

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.token_account.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
                authority: ctx.accounts.wallet.to_account_info(),
            },
            project_signer,
        ),
        rewards_amount,
    )?;
    Ok(())
}
