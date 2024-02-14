use {
    crate::{errors::ResourceErrorCode, BurnResourceArgs, Holding, Resource},
    anchor_lang::prelude::*,
    hpl_compression::{verify_leaf, CompressedData, CompressedDataEvent, ToNode},
    spl_account_compression::{program::SplAccountCompression, Noop},
};

pub fn burn_resource<'info>(
    mut resource: Account<'info, Resource>,
    merkle_tree: AccountInfo<'info>,
    remaining_accounts: Vec<AccountInfo<'info>>,
    clock: Sysvar<'info, Clock>,
    log_wrapper: Program<'info, Noop>,
    compression_program: Program<'info, SplAccountCompression>,
    args: BurnResourceArgs,
) -> Result<()> {
    msg!("verifying leaf");
    // verify the holding account leaf
    verify_leaf(
        args.holding_state.root,
        args.holding_state.holding.to_compressed().to_node(),
        args.holding_state.leaf_idx,
        &merkle_tree,
        &compression_program,
        remaining_accounts.to_owned(),
    )?;

    msg!("checking for InsufficientAmount");
    if args.amount > args.holding_state.holding.balance {
        return Err(ResourceErrorCode::InsufficientAmount.into());
    }

    let (_leaf_idx, seq) = resource
        .merkle_trees
        .assert_append(merkle_tree.to_owned())?;

    let new_holding_state = Holding {
        holder: args.holding_state.holding.holder,
        balance: args.holding_state.holding.balance - args.amount,
    };

    let event = CompressedDataEvent::Leaf {
        slot: clock.slot,
        tree_id: merkle_tree.key().to_bytes(),
        leaf_idx: args.holding_state.leaf_idx,
        seq: seq,
        stream_type: new_holding_state.event_stream(),
    };
    event.wrap(&log_wrapper)?;

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
        &merkle_tree,
        &compression_program,
        &log_wrapper,
        remaining_accounts,
        Some(&[&signer_seeds[..]]),
    )?;

    Ok(())
}
