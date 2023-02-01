use mpl_token_metadata::state::Data;

use {
    anchor_lang::{prelude::*, solana_program},
    mpl_token_metadata::{
        instruction::{
            create_master_edition_v3, create_metadata_accounts_v3, update_metadata_accounts,
        },
        state::{Collection, CollectionDetails, Creator, Uses},
    },
};

pub fn create_metadata<'info>(
    name: String,
    symbol: String,
    collection_uri: String,
    seller_fee_basis_points: u16,
    creators: Option<Vec<Creator>>,
    collection: Option<Collection>,
    uses: Option<Uses>,
    collection_details: Option<CollectionDetails>,
    authority: AccountInfo<'info>,
    payer: AccountInfo<'info>,
    mint: AccountInfo<'info>,
    metadata_account: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    token_metadata_program: AccountInfo<'info>,
    rent: AccountInfo<'info>,
    signer_seeds: Option<&[&[&[u8]]; 1]>,
) -> Result<()> {
    let create_metadata = create_metadata_accounts_v3(
        token_metadata_program.key(),
        metadata_account.key(),
        mint.key(),
        authority.key(),
        payer.key(),
        authority.key(),
        name,
        symbol,
        collection_uri,
        creators,
        seller_fee_basis_points,
        false,
        true,
        collection,
        uses,
        collection_details,
    );

    if let Some(signer_seeds) = signer_seeds {
        return solana_program::program::invoke_signed(
            &create_metadata,
            &[
                metadata_account,
                mint,
                authority.clone(),
                payer,
                authority.clone(),
                system_program,
                rent,
            ],
            signer_seeds,
        )
        .map_err(Into::into);
    } else {
        return solana_program::program::invoke(
            &create_metadata,
            &[
                metadata_account,
                mint,
                authority.clone(),
                payer,
                authority.clone(),
                system_program,
                rent,
            ],
        )
        .map_err(Into::into);
    }
}

pub fn update_metadata<'info>(
    data: Option<Data>,
    metadata: AccountInfo<'info>,
    authority: AccountInfo<'info>,
    primary_sale_happened: Option<bool>,
    token_metadata_program: AccountInfo<'info>,
    signer_seeds: Option<&[&[&[u8]]; 1]>,
) -> Result<()> {
    let update_metadata = update_metadata_accounts(
        token_metadata_program.key(),
        metadata.key(),
        authority.key(),
        None,
        data,
        primary_sale_happened,
    );

    if let Some(signer_seed) = signer_seeds {
        return solana_program::program::invoke_signed(
            &update_metadata,
            &[metadata, authority],
            signer_seed,
        )
        .map_err(Into::into);
    } else {
        return solana_program::program::invoke(&update_metadata, &[metadata, authority])
            .map_err(Into::into);
    }
}

pub fn create_master_edition<'info>(
    mint: AccountInfo<'info>,
    metadata_account: AccountInfo<'info>,
    master_edition: AccountInfo<'info>,
    authority: AccountInfo<'info>,
    payer: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    token_program: AccountInfo<'info>,
    token_metadata_program: AccountInfo<'info>,
    rent: AccountInfo<'info>,
    signer_seeds: Option<&[&[&[u8]]; 1]>,
) -> Result<()> {
    let create_master_edition = create_master_edition_v3(
        token_metadata_program.key(),
        master_edition.key(),
        mint.key(),
        authority.key(),
        authority.key(),
        metadata_account.key(),
        payer.key(),
        Some(0),
    );

    if let Some(signer_seeds) = signer_seeds {
        return solana_program::program::invoke_signed(
            &create_master_edition,
            &[
                master_edition.clone(),
                mint,
                authority.clone(),
                authority.clone(),
                payer,
                metadata_account,
                token_program,
                system_program,
                rent,
            ],
            signer_seeds,
        )
        .map_err(Into::into);
    } else {
        return solana_program::program::invoke(
            &create_master_edition,
            &[
                master_edition,
                mint,
                authority.clone(),
                authority.clone(),
                metadata_account,
                payer,
                system_program,
                token_program,
                rent,
            ],
        )
        .map_err(Into::into);
    }
}

pub fn set_and_verify_collection<'info>(
    metadata: AccountInfo<'info>,
    collection_mint: AccountInfo<'info>,
    collection_metadata_account: AccountInfo<'info>,
    collection_master_edition: AccountInfo<'info>,
    authority: AccountInfo<'info>,
    payer: AccountInfo<'info>,
    token_metadata_program: AccountInfo<'info>,
    signer_seeds: Option<&[&[&[u8]]; 1]>,
) -> Result<()> {
    let verify_collection = mpl_token_metadata::instruction::set_and_verify_collection(
        token_metadata_program.key(),
        metadata.key(),
        authority.key(),
        payer.key(),
        authority.key(),
        collection_mint.key(),
        collection_metadata_account.key(),
        collection_master_edition.key(),
        None,
    );

    if let Some(signer_seeds) = signer_seeds {
        return solana_program::program::invoke_signed(
            &verify_collection,
            &[
                metadata,
                authority,
                payer,
                collection_mint,
                collection_metadata_account,
                collection_master_edition,
            ],
            signer_seeds,
        )
        .map_err(Into::into);
    } else {
        return solana_program::program::invoke(
            &verify_collection,
            &[
                metadata,
                authority,
                payer,
                collection_mint,
                collection_metadata_account,
                collection_master_edition,
            ],
        )
        .map_err(Into::into);
    }
}

pub fn set_and_verify_sized_collection<'info>(
    metadata: AccountInfo<'info>,
    collection_mint: AccountInfo<'info>,
    collection_metadata_account: AccountInfo<'info>,
    collection_master_edition: AccountInfo<'info>,
    authority: AccountInfo<'info>,
    payer: AccountInfo<'info>,
    token_metadata_program: AccountInfo<'info>,
    signer_seeds: Option<&[&[&[u8]]; 1]>,
) -> Result<()> {
    let verify_collection = mpl_token_metadata::instruction::set_and_verify_sized_collection_item(
        token_metadata_program.key(),
        metadata.key(),
        authority.key(),
        payer.key(),
        authority.key(),
        collection_mint.key(),
        collection_metadata_account.key(),
        collection_master_edition.key(),
        None,
    );

    if let Some(signer_seeds) = signer_seeds {
        return solana_program::program::invoke_signed(
            &verify_collection,
            &[
                metadata,
                authority,
                payer,
                collection_mint,
                collection_metadata_account,
                collection_master_edition,
            ],
            signer_seeds,
        )
        .map_err(Into::into);
    } else {
        return solana_program::program::invoke(
            &verify_collection,
            &[
                metadata,
                authority,
                payer,
                collection_mint,
                collection_metadata_account,
                collection_master_edition,
            ],
        )
        .map_err(Into::into);
    }
}

pub fn set_collection_size<'info>(
    size: u64,
    collection_mint: AccountInfo<'info>,
    collection_metadata_account: AccountInfo<'info>,
    authority: AccountInfo<'info>,
    token_metadata_program: AccountInfo<'info>,
    signer_seeds: Option<&[&[&[u8]]; 1]>,
) -> Result<()> {
    let set_collection_size_ix = mpl_token_metadata::instruction::set_collection_size(
        token_metadata_program.key(),
        collection_metadata_account.key(),
        authority.key(),
        collection_mint.key(),
        None,
        size,
    );

    if let Some(signer_seeds) = signer_seeds {
        return solana_program::program::invoke_signed(
            &set_collection_size_ix,
            &[collection_metadata_account, authority, collection_mint],
            signer_seeds,
        )
        .map_err(Into::into);
    } else {
        return solana_program::program::invoke(
            &set_collection_size_ix,
            &[collection_metadata_account, authority, collection_mint],
        )
        .map_err(Into::into);
    }
}
