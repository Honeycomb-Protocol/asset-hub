use {
    crate::{
        errors::ResourceErrorCode, utils::burn_tokens, Holding, HoldingAccountArgs, Resource,
    },
    anchor_lang::prelude::*,
    anchor_spl::{
        associated_token::AssociatedToken,
        token::{Token, TokenAccount, close_account, CloseAccount},
    },
    hpl_compression::{verify_leaf, CompressedData, CompressedDataEvent, ToNode},
    hpl_hive_control::state::Project,
    spl_account_compression::{program::SplAccountCompression, Noop},
    spl_token_2022::ID as Token2022,
};

#[derive(Accounts)]
pub struct WrapResource<'info> {
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

    #[account(
        mut, 
        constraint = token_account.owner == owner.key(),
        constraint = token_account.mint == mint.key()
    )]
    pub token_account: Box<Account<'info, TokenAccount>>,

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

    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct WrapResourceArgs {
    pub holding_state: HoldingAccountArgs,
    pub amount: u64,
}

pub fn wrap_resource<'info>(
    ctx: Context<'_, '_, '_, 'info, WrapResource<'info>>,
    args: WrapResourceArgs,
) -> Result<()> {
    let resource = &mut ctx.accounts.resource;


    if args.amount > ctx.accounts.token_account.amount     {
        return Err(ResourceErrorCode::InsufficientAmount.into());
    }

     // transfer the amount to the owner
     burn_tokens(
        &ctx.accounts.token_program,
        &ctx.accounts.mint,
        &ctx.accounts.token_account.to_account_info(),
        &ctx.accounts.owner.to_account_info(),
        &resource,
        args.amount,
    )?;


    // close the account if the amount is zero after the burning the desired amount
    if args.amount == ctx.accounts.token_account.amount {
        close_account(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                CloseAccount {
                    account: ctx.accounts.token_account.to_account_info(),
                    destination: ctx.accounts.owner.to_account_info(),
                    authority: ctx.accounts.owner.to_account_info(),
                }
            ),
        )?;
    }
    
    // verify the holding account leaf
    verify_leaf(
        args.holding_state.root,
        args.holding_state.holding.to_compressed().to_node(),
        args.holding_state.leaf_idx,
        &ctx.accounts.merkle_tree.to_account_info(),
        &ctx.accounts.compression_program,
        ctx.remaining_accounts.to_vec(),
    )?;


    let (_leaf_idx, seq) = resource
        .merkle_trees
        .assert_append(ctx.accounts.merkle_tree.to_account_info())?;

    let new_holding_state = Holding {
        holder: args.holding_state.holding.holder,
        balance: args.holding_state.holding.balance + args.amount,
    };

    let event = CompressedDataEvent::Leaf {
        slot: ctx.accounts.clock.slot,
        tree_id: ctx.accounts.merkle_tree.key().to_bytes(),
        leaf_idx: args.holding_state.leaf_idx,
        seq: seq,
        stream_type: new_holding_state.event_stream(),
    };
    event.wrap(&ctx.accounts.log_wrapper)?;

    let bump_binding = [resource.bump];
    let signer_seeds = resource.seeds(&bump_binding);

    // update the compressed token account using controlled merkle tree
    hpl_compression::replace_leaf(
        args.holding_state.root,
        args.holding_state.holding.to_compressed().to_node(),
        new_holding_state.to_compressed().to_node(),
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
