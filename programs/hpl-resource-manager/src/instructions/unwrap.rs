use {
    crate::{errors::ResourceErrorCode, utils::mint_tokens, Holding, HoldingAccountArgs, Resource},
    anchor_lang::prelude::*,
    anchor_spl::{
        associated_token::AssociatedToken,
        token_interface::{Mint, Token2022, TokenAccount},
    },
    hpl_hive_control::state::Project,
    hpl_toolkit::compression::{verify_leaf, CompressedData, CompressedDataEvent, ToNode},
    spl_account_compression::{program::SplAccountCompression, Noop},
};

#[derive(Accounts)]
pub struct UnWrapResource<'info> {
    #[account()]
    pub project: Box<Account<'info, Project>>,

    #[account(has_one = project, has_one = mint)]
    pub resource: Box<Account<'info, Resource>>,

    #[account(mut, constraint = resource.mint == mint.key())]
    pub mint: Box<InterfaceAccount<'info, Mint>>,

    /// CHECK: this is not dangerous. we are not reading & writing from it
    #[account(mut)]
    pub merkle_tree: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = owner
    )]
    pub recipient_account: Box<InterfaceAccount<'info, TokenAccount>>,

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

    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UnWrapResourceArgs {
    pub holding_state: HoldingAccountArgs,
    pub amount: u64,
}

pub fn unwrap_resource<'info>(
    ctx: Context<'_, '_, '_, 'info, UnWrapResource<'info>>,
    args: UnWrapResourceArgs,
) -> Result<()> {
    let resource = &mut ctx.accounts.resource;

    // verify the holding account leaf
    msg!("verifying leaf");
    verify_leaf(
        args.holding_state.root,
        args.holding_state.holding.to_compressed().to_node(),
        args.holding_state.leaf_idx,
        &ctx.accounts.merkle_tree.to_account_info(),
        &ctx.accounts.compression_program,
        ctx.remaining_accounts.to_vec(),
    )?;

    msg!("burning resource condition");
    if args.amount > args.holding_state.holding.balance {
        return Err(ResourceErrorCode::InsufficientAmount.into());
    }

    msg!("burning resource");
    let (_leaf_idx, seq) = resource
        .merkle_trees
        .assert_append(ctx.accounts.merkle_tree.to_account_info())?;

    let new_holding_state = Holding {
        holder: args.holding_state.holding.holder,
        balance: args.holding_state.holding.balance - args.amount,
    };

    msg!("creating event");
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
    hpl_toolkit::compression::replace_leaf(
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

    msg!("minting tokens");
    // transfer the amount to the owner
    mint_tokens(
        &ctx.accounts.token_program,
        &ctx.accounts.mint.to_account_info(),
        &ctx.accounts.recipient_account.to_account_info(),
        &ctx.accounts.owner.to_account_info(),
        &resource,
        args.amount,
    )?;

    Ok(())
}
