use {
    crate::{errors::ResourceErrorCode, BurnResourceArgs, Holding, HoldingAccountArgs, Resource},
    anchor_lang::prelude::*,
    hpl_toolkit::{
        compression::{CompressedDataEvent, ToNode},
        CompressedData,
    },
    spl_account_compression::{program::SplAccountCompression, Noop},
};

pub fn use_burn_resource<'info>(
    resource: &mut Account<'info, Resource>,
    merkle_tree: &AccountInfo<'info>,
    remaining_accounts: &[AccountInfo<'info>],
    clock: &Sysvar<'info, Clock>,
    log_wrapper: &Program<'info, Noop>,
    compression_program: &Program<'info, SplAccountCompression>,
    args: &BurnResourceArgs,
) -> Result<()> {
    match args {
        BurnResourceArgs::Fungible {
            holding_state,
            amount,
        } => {
            burn_fungible_token(
                resource,
                merkle_tree,
                remaining_accounts,
                clock,
                log_wrapper,
                compression_program,
                holding_state,
                amount,
            )?;
        }

        BurnResourceArgs::INF { holding_state } => {
            burn_non_fungible_token(
                resource,
                merkle_tree,
                remaining_accounts,
                clock,
                log_wrapper,
                compression_program,
                holding_state,
            )?;
        }
    };

    Ok(())
}

pub fn burn_fungible_token<'info>(
    resource: &mut Account<'info, Resource>,
    merkle_tree: &AccountInfo<'info>,
    remaining_accounts: &[AccountInfo<'info>],
    clock: &Sysvar<'info, Clock>,
    log_wrapper: &Program<'info, Noop>,
    compression_program: &Program<'info, SplAccountCompression>,
    holding_state: &HoldingAccountArgs,
    amount: &u64,
) -> Result<()> {
    let (_leaf_idx, seq) = resource
        .merkle_trees
        .assert_append(merkle_tree.to_owned())?;

    if let Holding::Fungible { holder, balance } = holding_state.holding {
        if *amount > balance {
            msg!("InsufficientAmount {:?} {:?}", amount, balance);
            return Err(ResourceErrorCode::InsufficientAmount.into());
        }

        let new_holding_state = Holding::Fungible {
            holder: holder,
            balance: balance - amount,
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
        if balance - amount > 0 {
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
    } else {
        return Err(ResourceErrorCode::InvalidHoldingState.into());
    }

    Ok(())
}

pub fn burn_non_fungible_token<'info>(
    resource: &mut Account<'info, Resource>,
    merkle_tree: &AccountInfo<'info>,
    remaining_accounts: &[AccountInfo<'info>],
    clock: &Sysvar<'info, Clock>,
    log_wrapper: &Program<'info, Noop>,
    compression_program: &Program<'info, SplAccountCompression>,
    holding_state: &HoldingAccountArgs,
) -> Result<()> {
    let (_leaf_idx, seq) = resource
        .merkle_trees
        .assert_append(merkle_tree.to_owned())?;

    if let Holding::INF {
        holder: _,
        characteristics: _,
    } = holding_state.holding
    {
        let event = CompressedDataEvent::Leaf {
            slot: clock.slot,
            tree_id: merkle_tree.key().to_bytes(),
            leaf_idx: holding_state.leaf_idx,
            seq: seq,
            stream_type: holding_state.holding.event_stream(),
        };
        event.wrap(&log_wrapper)?;

        let bump_binding = [resource.bump];
        let signer_seeds = resource.seeds(&bump_binding);

        // update the compressed token account using controlled merkle tree
        hpl_toolkit::compression::replace_leaf(
            holding_state.root,
            holding_state.holding.to_compressed().to_node(),
            [0; 32],
            holding_state.leaf_idx,
            &resource.to_account_info(),
            &merkle_tree,
            &compression_program,
            &log_wrapper,
            remaining_accounts.to_vec(),
            Some(&[&signer_seeds[..]]),
        )?;
    } else {
        return Err(ResourceErrorCode::InvalidHoldingState.into());
    }

    Ok(())
}
