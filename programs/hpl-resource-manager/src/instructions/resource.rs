use {
    crate::{
        utils::{
            create_metadata_for_mint, create_mint_with_extensions, init_collection,
            ResourceMetadataArgs,
        },
        Resource, ResourseKind,
    },
    anchor_lang::prelude::*,
    anchor_spl::token_interface::Token2022,
    hpl_hive_control::state::Project,
    hpl_toolkit::{compression::init_tree, reallocate},
    spl_account_compression::{program::SplAccountCompression, Noop},
};

#[derive(Accounts)]
#[instruction(args: CreateResourceArgs)]
pub struct CreateResource<'info> {
    pub project: Box<Account<'info, Project>>,

    #[account(
        init,
        payer = payer,
        seeds = [b"resource".as_ref(), project.key().as_ref(), mint.key().as_ref()],
        space = Resource::get_size(&args.kind),
        bump,
    )]
    pub resource: Box<Account<'info, Resource>>,

    pub authority: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub mint: Signer<'info>,

    pub system_program: Program<'info, System>,

    pub rent_sysvar: Sysvar<'info, Rent>,

    pub token_program: Program<'info, Token2022>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateResourceArgs {
    pub kind: ResourseKind,
    pub metadata: ResourceMetadataArgs,
}

pub fn create_resource(ctx: Context<CreateResource>, args: CreateResourceArgs) -> Result<()> {
    let resource = &mut ctx.accounts.resource;
    let token_program = &ctx.accounts.token_program.to_account_info();

    let decimals = match &args.kind {
        ResourseKind::Fungible { decimals } => *decimals,
        _ => 0,
    };

    // create resource account
    resource.set_defaults();
    resource.bump = ctx.bumps.resource;
    resource.project = ctx.accounts.project.key();
    resource.mint = ctx.accounts.mint.key();
    resource.kind = args.kind.to_owned();

    // create the mint account with the extensions
    create_mint_with_extensions(
        &resource,
        &ctx.accounts.payer.to_account_info(),
        &ctx.accounts.mint.to_account_info(),
        &ctx.accounts.rent_sysvar,
        &token_program,
        decimals,
        &args.metadata,
        &args.kind,
    )?;

    // create the metadata account for the mint
    create_metadata_for_mint(
        token_program,
        ctx.accounts.mint.to_account_info(),
        &resource,
        args.metadata,
    )?;

    if let ResourseKind::INF { supply, .. } = &args.kind {
        msg!("Creating the group account for the mint.");
        // create the metadata account for the mint
        init_collection(
            &token_program,
            ctx.accounts.mint.to_account_info(),
            &resource,
            *supply,
        )?;
    }

    Ok(())
}

#[derive(Accounts)]
pub struct InitilizeResourceTree<'info> {
    pub project: Box<Account<'info, Project>>,

    #[account(mut, has_one = project)]
    pub resource: Box<Account<'info, Resource>>,

    pub authority: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub merkle_tree: Signer<'info>,

    pub rent_sysvar: Sysvar<'info, Rent>,

    pub system_program: Program<'info, System>,

    /// SPL TOKEN PROGRAM
    pub token_program: Program<'info, Token2022>,

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
