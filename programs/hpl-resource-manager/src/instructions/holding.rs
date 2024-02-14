use {
    crate::{errors::ResourceErrorCode, Holding, HoldingAccountArgs, Resource},
    anchor_lang::prelude::*,
    anchor_spl::token::Token,
    hpl_compression::{verify_leaf, CompressedData, CompressedDataEvent, ToNode},
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

    let (leaf_idx, seq) = resource
        .merkle_trees
        .assert_append(ctx.accounts.merkle_tree.to_account_info())?;

    if let Some(holding_state) = args.holding_state {
        verify_leaf(
            holding_state.root,
            holding_state.holding.to_compressed().to_node(),
            holding_state.leaf_idx,
            &ctx.accounts.merkle_tree.to_account_info(),
            &ctx.accounts.compression_program,
            ctx.remaining_accounts.to_vec(),
        )?;

        let bump_binding = [resource.bump];
        let signer_seeds = resource.seeds(&bump_binding);
        let new_holding_state = Holding {
            holder: holding_state.holding.holder,
            balance: holding_state.holding.balance + args.amount,
        };

        let event = CompressedDataEvent::Leaf {
            slot: ctx.accounts.clock.slot,
            tree_id: ctx.accounts.merkle_tree.key().to_bytes(),
            leaf_idx: holding_state.leaf_idx,
            seq,
            stream_type: new_holding_state.event_stream(),
        };
        event.wrap(&ctx.accounts.log_wrapper)?;

        // update the compressed token account using controlled merkle tree
        hpl_compression::replace_leaf(
            holding_state.root,
            holding_state.holding.to_compressed().to_node(),
            new_holding_state.to_compressed().to_node(),
            holding_state.leaf_idx,
            &resource.to_account_info(),
            &ctx.accounts.merkle_tree,
            &ctx.accounts.compression_program,
            &ctx.accounts.log_wrapper,
            ctx.remaining_accounts.to_vec(),
            Some(&[&signer_seeds[..]]),
        )?;
    } else {
        msg!("Minting without default holding state");
        let holding_account = Holding {
            holder: ctx.accounts.owner.key(),
            balance: args.amount,
        };

        msg!("Event Stream ");
        // event
        let event = CompressedDataEvent::Leaf {
            slot: ctx.accounts.clock.slot,
            tree_id: ctx.accounts.merkle_tree.key().to_bytes(),
            leaf_idx,
            seq,
            stream_type: holding_account.event_stream(),
        };
        event.wrap(&ctx.accounts.log_wrapper)?;

        msg!("Compressing the holding account");
        // create the compressed token account using controlled merkle tree
        let compressed_holding = holding_account.to_compressed();
        let bump_binding = [resource.bump];
        let signer_seeds = resource.seeds(&bump_binding);

        hpl_compression::append_leaf(
            compressed_holding.to_node(),
            &resource.to_account_info(),
            &ctx.accounts.merkle_tree,
            &ctx.accounts.compression_program,
            &ctx.accounts.log_wrapper,
            Some(&[&signer_seeds[..]]),
        )?;
    }

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

    msg!("verifying leaf");
    // verify the holding account leaf
    verify_leaf(
        args.holding_state.root,
        args.holding_state.holding.to_compressed().to_node(),
        args.holding_state.leaf_idx,
        &ctx.accounts.merkle_tree.to_account_info(),
        &ctx.accounts.compression_program,
        ctx.remaining_accounts.to_vec(),
    )?;

    msg!("checking for InsufficientAmount");
    if args.amount > args.holding_state.holding.balance {
        return Err(ResourceErrorCode::InsufficientAmount.into());
    }

    let (_leaf_idx, seq) = resource
        .merkle_trees
        .assert_append(ctx.accounts.merkle_tree.to_account_info())?;

    let new_holding_state = Holding {
        holder: args.holding_state.holding.holder,
        balance: args.holding_state.holding.balance - args.amount,
    };

    let event = CompressedDataEvent::Leaf {
        slot: ctx.accounts.clock.slot,
        tree_id: ctx.accounts.merkle_tree.key().to_bytes(),
        leaf_idx: args.holding_state.leaf_idx,
        seq: seq,
        stream_type: new_holding_state.event_stream(),
    };
    event.wrap(&ctx.accounts.log_wrapper)?;

    let new_leaf;
    if args.holding_state.holding.balance - args.amount > 0 {
        new_leaf = new_holding_state.to_compressed().to_node();
    } else {
        new_leaf = [0; 32];
    }

    let bump_binding = [resource.bump];
    let signer_seeds = resource.seeds(&bump_binding);

    // update the compressed token account using controlled merkle tree
    hpl_compression::replace_leaf(
        args.holding_state.root,
        args.holding_state.holding.to_compressed().to_node(),
        new_leaf,
        args.holding_state.leaf_idx,
        &resource.to_account_info(),
        &ctx.accounts.merkle_tree,
        &ctx.accounts.compression_program,
        &ctx.accounts.log_wrapper,
        ctx.remaining_accounts.to_vec(),
        Some(&[&signer_seeds[..]]),
    )?;

    Ok(())
}
