use {
    crate::{Holding, MintResourceArgs, Resource},
    anchor_lang::prelude::*,
    hpl_compression::{CompressedData, CompressedDataEvent, ToNode},
    spl_account_compression::{program::SplAccountCompression, Noop},
};

pub fn use_mint_resource<'info>(
    resource: &mut Account<'info, Resource>,
    merkle_tree: &AccountInfo<'info>,
    owner: &AccountInfo<'info>,
    remaining_accounts: Vec<AccountInfo<'info>>,
    clock: &Sysvar<'info, Clock>,
    log_wrapper: &Program<'info, Noop>,
    compression_program: &Program<'info, SplAccountCompression>,
    args: MintResourceArgs,
) -> Result<()> {
    msg!("verifying leaf");

    let (leaf_idx, seq) = resource
        .merkle_trees
        .assert_append(merkle_tree.to_account_info())?;

    if let Some(holding_state) = args.holding_state {
        let bump_binding = [resource.bump];
        let signer_seeds = resource.seeds(&bump_binding);
        let new_holding_state = Holding {
            holder: holding_state.holding.holder,
            balance: holding_state.holding.balance + args.amount,
        };

        let event = CompressedDataEvent::Leaf {
            slot: clock.slot,
            tree_id: merkle_tree.key().to_bytes(),
            leaf_idx: holding_state.leaf_idx,
            seq,
            stream_type: new_holding_state.event_stream(),
        };
        event.wrap(&log_wrapper)?;

        // update the compressed token account using controlled merkle tree
        hpl_compression::replace_leaf(
            holding_state.root,
            holding_state.holding.to_compressed().to_node(),
            new_holding_state.to_compressed().to_node(),
            holding_state.leaf_idx,
            &resource.to_account_info(),
            &merkle_tree,
            &compression_program,
            &log_wrapper,
            remaining_accounts.to_owned(),
            Some(&[&signer_seeds[..]]),
        )?;
    } else {
        msg!("Minting without default holding state");
        let holding_account = Holding {
            holder: owner.key(),
            balance: args.amount,
        };

        msg!("Event Stream ");
        // event
        let event = CompressedDataEvent::Leaf {
            slot: clock.slot,
            tree_id: merkle_tree.key().to_bytes(),
            leaf_idx,
            seq,
            stream_type: holding_account.event_stream(),
        };
        event.wrap(&log_wrapper)?;

        msg!("Compressing the holding account");
        // create the compressed token account using controlled merkle tree
        let compressed_holding = holding_account.to_compressed();
        let bump_binding = [resource.bump];
        let signer_seeds = resource.seeds(&bump_binding);

        hpl_compression::append_leaf(
            compressed_holding.to_node(),
            &resource.to_account_info(),
            &merkle_tree,
            &compression_program,
            &log_wrapper,
            Some(&[&signer_seeds[..]]),
        )?;
    }

    msg!("Minted {:?} Resources", args.amount);

    Ok(())
}
