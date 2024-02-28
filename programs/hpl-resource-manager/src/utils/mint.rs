use {
    crate::{
        errors::ResourceErrorCode, Holding, HoldingAccountArgs, MintResourceArgs,
        NonFungibleHolder, Resource,
    },
    anchor_lang::prelude::*,
    hpl_toolkit::{
        compression::{CompressedData, CompressedDataEvent, ToNode},
        HashMap,
    },
    spl_account_compression::{program::SplAccountCompression, Noop},
};

pub fn use_mint_resource<'info>(
    resource: &mut Account<'info, Resource>,
    merkle_tree: &AccountInfo<'info>,
    owner: &AccountInfo<'info>,
    remaining_accounts: &[AccountInfo<'info>],
    clock: &Sysvar<'info, Clock>,
    log_wrapper: &Program<'info, Noop>,
    compression_program: &Program<'info, SplAccountCompression>,
    args: &MintResourceArgs,
) -> Result<()> {
    msg!("verifying leaf");

    match args {
        MintResourceArgs::Fungible {
            holding_state,
            amount,
        } => {
            mint_fungible_resource(
                resource,
                merkle_tree,
                owner,
                remaining_accounts,
                clock,
                log_wrapper,
                compression_program,
                holding_state.to_owned(),
                amount,
            )?;
            msg!("Minted {:?} Resources", amount);
        }

        MintResourceArgs::INF {
            holding_state: _,
            characteristics,
        } => {
            mint_non_fungible_resource(
                resource,
                merkle_tree,
                owner,
                clock,
                log_wrapper,
                compression_program,
                characteristics.to_owned(),
            )?;

            msg!("Minted Non Fungible Resource");
        }
    }

    Ok(())
}

pub fn mint_non_fungible_resource<'info>(
    resource: &mut Account<'info, Resource>,
    merkle_tree: &AccountInfo<'info>,
    owner: &AccountInfo<'info>,
    clock: &Sysvar<'info, Clock>,
    log_wrapper: &Program<'info, Noop>,
    compression_program: &Program<'info, SplAccountCompression>,
    characteristics: HashMap<String, String>,
) -> Result<()> {
    let (leaf_idx, seq) = resource
        .merkle_trees
        .assert_append(merkle_tree.to_account_info())?;

    msg!("Minting Non Fungible Resource");
    let holding_account = Holding::INF {
        holder: NonFungibleHolder::Holder(owner.key()),
        characteristics: characteristics.into_iter().collect(),
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

    hpl_toolkit::compression::append_leaf(
        compressed_holding.to_node(),
        &resource.to_account_info(),
        &merkle_tree,
        &compression_program,
        &log_wrapper,
        Some(&[&signer_seeds[..]]),
    )?;

    Ok(())
}

pub fn mint_fungible_resource<'info>(
    resource: &mut Account<'info, Resource>,
    merkle_tree: &AccountInfo<'info>,
    owner: &AccountInfo<'info>,
    remaining_accounts: &[AccountInfo<'info>],
    clock: &Sysvar<'info, Clock>,
    log_wrapper: &Program<'info, Noop>,
    compression_program: &Program<'info, SplAccountCompression>,
    holding_state: Option<HoldingAccountArgs>,
    amount: &u64,
) -> Result<()> {
    let (leaf_idx, seq) = resource
        .merkle_trees
        .assert_append(merkle_tree.to_account_info())?;

    if let Some(holding_state) = &holding_state {
        let bump_binding = [resource.bump];
        let signer_seeds = resource.seeds(&bump_binding);

        let new_holding_state;
        if let Holding::Fungible { holder, balance } = holding_state.holding {
            new_holding_state = Holding::Fungible {
                holder: holder,
                balance: balance + amount,
            };
        } else {
            return Err(ResourceErrorCode::InvalidHoldingState.into());
        }

        let event = CompressedDataEvent::Leaf {
            slot: clock.slot,
            tree_id: merkle_tree.key().to_bytes(),
            leaf_idx: holding_state.leaf_idx,
            seq,
            stream_type: new_holding_state.event_stream(),
        };
        event.wrap(&log_wrapper)?;

        // update the compressed token account using controlled merkle tree
        hpl_toolkit::compression::replace_leaf(
            holding_state.root,
            holding_state.holding.to_compressed().to_node(),
            new_holding_state.to_compressed().to_node(),
            holding_state.leaf_idx,
            &resource.to_account_info(),
            &merkle_tree,
            &compression_program,
            &log_wrapper,
            remaining_accounts.to_vec(),
            Some(&[&signer_seeds[..]]),
        )?;
    } else {
        msg!("Minting without the holding state");
        let holding_account = Holding::Fungible {
            holder: owner.key.to_owned(),
            balance: *amount,
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

        hpl_toolkit::compression::append_leaf(
            compressed_holding.to_node(),
            &resource.to_account_info(),
            &merkle_tree,
            &compression_program,
            &log_wrapper,
            Some(&[&signer_seeds[..]]),
        )?;
    };

    Ok(())
}
