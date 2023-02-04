use {
    crate::{state::*, traits::Default},
    anchor_lang::prelude::*,
    anchor_spl::token::{self, Mint, Token, TokenAccount},
};

/// Accounts used in create project instruction
#[derive(Accounts)]
pub struct CreateProject<'info> {
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub key: AccountInfo<'info>,

    /// Project state account
    #[account(
      init, payer = payer,
      space = Project::LEN,
      seeds = [
        b"project".as_ref(),
        key.key().as_ref()
      ],
      bump
    )]
    pub project: Account<'info, Project>,

    /// The wallet that holds the authority over the assembler
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub authority: AccountInfo<'info>,

    /// Reward mint address to be used for the project
    pub reward_mint: Account<'info, Mint>,

    /// Reward token account used as vault
    #[account(
      init, payer = payer,
      seeds = [
        b"vault",
        project.key().as_ref(),
        reward_mint.key().as_ref()
      ],
      bump,
      token::mint = reward_mint,
      token::authority = project
    )]
    pub vault: Account<'info, TokenAccount>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub payer: Signer<'info>,

    /// NATIVE SYSTEM PROGRAM
    pub system_program: Program<'info, System>,

    /// SPL TOKEN PROGRAM
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreateProjectArgs {
    pub name: String,
    pub rewards_per_second: u64,
    pub start_time: i64,
}

/// Create a new project
pub fn create_project(ctx: Context<CreateProject>, args: CreateProjectArgs) -> Result<()> {
    let project = &mut ctx.accounts.project;
    project.set_defaults();

    project.bump = ctx.bumps["project"];
    project.vault_bump = ctx.bumps["vault"];
    project.key = ctx.accounts.key.key();
    project.authority = ctx.accounts.authority.key();
    project.reward_mint = ctx.accounts.reward_mint.key();
    project.vault = ctx.accounts.vault.key();
    project.name = args.name;
    project.rewards_per_second = args.rewards_per_second;
    project.start_time = args.start_time;

    Ok(())
}

/// Accounts used in update project instruction
#[derive(Accounts)]
pub struct UpdateProject<'info> {
    /// Project state account
    #[account(mut, has_one = authority)]
    pub project: Account<'info, Project>,

    /// The wallet that holds the authority over the assembler
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub new_authority: Option<AccountInfo<'info>>,

    /// Collection mint address to be used for the project
    pub collection: Option<Account<'info, Mint>>,

    /// Creator address to be used for the project
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub creator: Option<AccountInfo<'info>>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub authority: Signer<'info>,

    /// NATIVE SYSTEM PROGRAM
    pub system_program: Program<'info, System>,

    /// SYSVAR RENT
    pub rent: Sysvar<'info, Rent>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct UpdateProjectArgs {
    pub name: Option<String>,
    pub rewards_per_second: Option<u64>,
    pub start_time: Option<i64>,
}

/// Update a project
pub fn update_project(ctx: Context<UpdateProject>, args: UpdateProjectArgs) -> Result<()> {
    let project = &mut ctx.accounts.project;

    project.name = args.name.unwrap_or(project.name.clone());
    project.rewards_per_second = args
        .rewards_per_second
        .unwrap_or(project.rewards_per_second);
    project.start_time = args.start_time.unwrap_or(project.start_time);

    if let Some(new_authority) = &ctx.accounts.new_authority {
        project.authority = new_authority.key();
    }

    if let Some(collection) = &ctx.accounts.collection {
        Project::reallocate(
            32,
            project.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            &ctx.accounts.rent,
            &ctx.accounts.system_program,
        )?;
        project.collections.push(collection.key());
    }

    if let Some(creator) = &ctx.accounts.creator {
        Project::reallocate(
            32,
            project.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            &ctx.accounts.rent,
            &ctx.accounts.system_program,
        )?;
        project.creators.push(creator.key());
    }

    Ok(())
}
