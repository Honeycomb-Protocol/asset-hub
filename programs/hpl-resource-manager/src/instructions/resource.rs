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
pub struct CreateNewResource<'info> {
    #[account()]
    pub project: Box<Account<'info, Project>>,

    #[account(
        init,
        payer = owner,
        seeds = [b"resource".as_ref(), project.key().as_ref(), mint.key().as_ref()],
        space = Resource::LEN,
        bump,
    )]
    pub resource: Box<Account<'info, Resource>>,

    /// CHECK: this is not dangerous. we are not reading & writing from it
    #[account(mut)]
    pub mint: AccountInfo<'info>,

    /// CHECK: this is not dangerous. we are not reading & writing from it
    #[account(mut)]
    pub metadata_account: AccountInfo<'info>,

    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,

    pub rent_sysvar: Sysvar<'info, Rent>,

    /// CHECK: this is not dangerous. we are not reading & writing from it
    #[account(address = Token2022)]
    pub token22_program: AccountInfo<'info>,
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

    // create the mint account with the extensions
    create_mint_with_extensions(
        &ctx.accounts.project.to_account_info(),
        &resource.to_account_info(),
        Some(&resource.to_account_info()),
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.mint.to_account_info(),
        &ctx.accounts.rent_sysvar,
        &ctx.accounts.token22_program.to_account_info(),
        args.decimals,
    )?;

    // create the metadata account for the mint
    create_metadata_for_mint(
        ctx.accounts.token22_program.to_account_info(),
        ctx.accounts.project.to_account_info(),
        ctx.accounts.mint.to_account_info(),
        resource.to_account_info(),
        args.metadata,
    )?;

    // create resource account
    resource.set_defaults();
    resource.bump = ctx.bumps["resource"];
    resource.project = ctx.accounts.project.key();
    resource.mint = ctx.accounts.mint.key();
    resource.kind = args.kind;

    Ok(())
}
