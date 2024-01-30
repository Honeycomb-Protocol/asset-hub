use {
    crate::{
        utils::{create_metadata_for_mint, create_mint_with_extensions, ResourceMetadataArgs},
        Resource, ResourseKind,
    },
    anchor_lang::prelude::*,
    anchor_spl::{associated_token::AssociatedToken, token::Token},
    hpl_hive_control::state::Project,
    spl_token_2022::ID as Token2022,
};

#[derive(Accounts)]
#[instruction(args: CreateNewResourceArgs)]
pub struct CreateNewResource<'info> {
    #[account()]
    pub project: Box<Account<'info, Project>>,

    #[account(
        init,
        payer = payer,
        seeds = [b"resource".as_ref(), project.key().as_ref(), mint.key().as_ref()],
        space = Resource::get_size(&args.kind),
        bump,
    )]
    pub resource: Box<Account<'info, Resource>>,

    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub mint: Signer<'info>,

    pub system_program: Program<'info, System>,

    pub rent_sysvar: Sysvar<'info, Rent>,

    /// CHECK: this is not dangerous. we are not reading & writing from it
    #[account(address = Token2022)]
    pub token22_program: AccountInfo<'info>,

    /// SPL TOKEN PROGRAM
    pub token_program: Program<'info, Token>,

    /// ASSOCIATED TOKEN PROGRAM
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateNewResourceArgs {
    pub kind: ResourseKind,
    pub metadata: ResourceMetadataArgs,
    pub decimals: u8,
}

pub fn create_new_resource(
    ctx: Context<CreateNewResource>,
    args: CreateNewResourceArgs,
) -> Result<()> {
    let resource = &mut ctx.accounts.resource;

    // create resource account
    resource.set_defaults();
    resource.bump = ctx.bumps["resource"];
    resource.project = ctx.accounts.project.key();
    resource.mint = ctx.accounts.mint.key();
    resource.kind = args.kind;

    // create the mint account with the extensions
    let mint = create_mint_with_extensions(
        &resource,
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.mint.to_account_info(),
        &ctx.accounts.rent_sysvar,
        &ctx.accounts.token22_program.to_account_info(),
        args.decimals,
        &args.metadata,
    )?;

    msg!("Mint account created with decimals: {}", mint.decimals);
    msg!(
        "Mint account created with decimals: {}",
        mint.freeze_authority.unwrap_or(Pubkey::default())
    );
    msg!(
        "Mint account created with decimals: {}",
        mint.mint_authority.unwrap_or(Pubkey::default())
    );
    msg!("Mint account created with decimals: {}", mint.supply);
    msg!(
        "Mint account created with decimals: {}",
        mint.is_initialized
    );

    // create the metadata account for the mint
    create_metadata_for_mint(
        ctx.accounts.token22_program.to_account_info(),
        ctx.accounts.mint.to_account_info(),
        &resource,
        args.metadata,
    )?;

    Ok(())
}
