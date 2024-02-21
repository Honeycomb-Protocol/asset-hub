use {
    crate::{errors::ResourceErrorCode, Holding, HoldingAccountArgs, Resource},
    anchor_lang::prelude::*,
    hpl_toolkit::compression::{CompressedData, CompressedDataEvent, ToNode},
    spl_account_compression::{program::SplAccountCompression, Noop},
};

pub fn use_burn_resource<'info>(
    resource: &mut Account<'info, Resource>,
    merkle_tree: &AccountInfo<'info>,
    remaining_accounts: &[AccountInfo<'info>],
    clock: &Sysvar<'info, Clock>,
    log_wrapper: &Program<'info, Noop>,
    compression_program: &Program<'info, SplAccountCompression>,
    holding_state: HoldingAccountArgs,
    amount: &u64,
) -> Result<()> {
    msg!("checking for InsufficientAmount");
    if *amount > holding_state.holding.balance {
        msg!(
            "InsufficientAmount {:?} {:?}",
            amount,
            holding_state.holding.balance
        );
        return Err(ResourceErrorCode::InsufficientAmount.into());
    }

    let (_leaf_idx, seq) = resource
        .merkle_trees
        .assert_append(merkle_tree.to_owned())?;

    let new_holding_state = Holding {
        holder: holding_state.holding.holder,
        balance: holding_state.holding.balance - amount,
    };

    let event = CompressedDataEvent::Leaf {
        slot: clock.slot,
        tree_id: merkle_tree.key().to_bytes(),
        leaf_idx: holding_state.leaf_idx,
        seq: seq,
        stream_type: new_holding_state.event_stream(),
    };
    event.wrap(&log_wrapper)?;

    let new_leaf;
    if holding_state.holding.balance - amount > 0 {
        new_leaf = new_holding_state.to_compressed().to_node();
    } else {
        new_leaf = [0; 32];
    }

    let bump_binding = [resource.bump];
    let signer_seeds = resource.seeds(&bump_binding);

    // update the compressed token account using controlled merkle tree
    hpl_toolkit::compression::replace_leaf(
        holding_state.root,
        holding_state.holding.to_compressed().to_node(),
        new_leaf,
        holding_state.leaf_idx,
        &resource.to_account_info(),
        &merkle_tree,
        &compression_program,
        &log_wrapper,
        remaining_accounts.to_vec(),
        Some(&[&signer_seeds[..]]),
    )?;

    Ok(())
}
