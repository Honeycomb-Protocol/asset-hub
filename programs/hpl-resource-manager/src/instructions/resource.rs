use {
    crate::{
        utils::{create_metadata_for_mint, create_mint_with_extensions, ResourceMetadataArgs},
        Resource, ResourseKind,
    },
    anchor_lang::prelude::*,
    anchor_spl::{associated_token::AssociatedToken, token::Token},
    hpl_compression::{init_tree, CompressedDataEvent},
    hpl_hive_control::state::Project,
    hpl_utils::reallocate,
    spl_account_compression::{program::SplAccountCompression, Noop},
    spl_token_2022::ID as Token2022,
};

#[derive(Accounts)]
#[instruction(args: CreateResourceArgs)]
pub struct CreateResource<'info> {
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
pub struct CreateResourceArgs {
    pub kind: ResourseKind,
    pub metadata: ResourceMetadataArgs,
    pub decimals: u8,
}

pub fn create_resource(ctx: Context<CreateResource>, args: CreateResourceArgs) -> Result<()> {
    let resource = &mut ctx.accounts.resource;

    // create resource account
    resource.set_defaults();
    resource.bump = ctx.bumps["resource"];
    resource.project = ctx.accounts.project.key();
    resource.mint = ctx.accounts.mint.key();
    resource.kind = args.kind;

    // create the mint account with the extensions
    create_mint_with_extensions(
        &resource,
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.mint.to_account_info(),
        &ctx.accounts.rent_sysvar,
        &ctx.accounts.token22_program.to_account_info(),
        args.decimals,
        &args.metadata,
    )?;

    // create the metadata account for the mint
    create_metadata_for_mint(
        ctx.accounts.token22_program.to_account_info(),
        ctx.accounts.mint.to_account_info(),
        &resource,
        args.metadata,
    )?;

    Ok(())
}

#[derive(Accounts)]
pub struct InitilizeResourceTree<'info> {
    #[account()]
    pub project: Box<Account<'info, Project>>,

    #[account(mut, has_one = project)]
    pub resource: Box<Account<'info, Resource>>,

    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub merkle_tree: Signer<'info>,

    pub rent_sysvar: Sysvar<'info, Rent>,

    pub system_program: Program<'info, System>,

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
pub struct InitilizeResourceTreeArgs {
    pub max_depth: u32,
    pub max_buffer_size: u32,
}

pub fn initilize_resource_tree(
    ctx: Context<InitilizeResourceTree>,
    args: InitilizeResourceTreeArgs,
) -> Result<()> {
    let resource = &mut ctx.accounts.resource;

    msg!("Reallocating resource account to fit the merkle tree.");
    reallocate(
        32,
        resource.to_account_info(),
        ctx.accounts.payer.to_account_info(),
        &ctx.accounts.rent_sysvar,
        &ctx.accounts.system_program,
    )?;

    msg!("Initializing the resource tree.");
    // create the compressed token account using controlled merkle tree
    resource
        .merkle_trees
        .merkle_trees
        .push(ctx.accounts.merkle_tree.key());

    msg!("Creating the merkle tree event.");
    let event = CompressedDataEvent::tree(
        ctx.accounts.merkle_tree.key(),
        resource.merkle_trees.schema.clone(),
        crate::ID,
        String::from("Holding"),
    );
    event.wrap(&ctx.accounts.log_wrapper)?;

    msg!("Creating the merkle tree for the resource.");
    // create the merkle tree for the resource
    let bump_binding = [resource.bump];
    let signer_seeds = resource.seeds(&bump_binding);
    init_tree(
        args.max_depth,
        args.max_buffer_size,
        &resource.to_account_info(),
        &ctx.accounts.merkle_tree,
        &ctx.accounts.compression_program,
        &ctx.accounts.log_wrapper,
        Some(&[&signer_seeds[..]]),
    )?;

    Ok(())
}
