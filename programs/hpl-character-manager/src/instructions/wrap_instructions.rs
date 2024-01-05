use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
    anchor_spl::token::{Mint, TokenAccount},
    hpl_compression::{CompressedData, CompressedDataEvent, ToNode},
    hpl_hive_control::{program::HplHiveControl, state::Project},
    hpl_utils::mpl_token_metadata::state::{Metadata, TokenMetadataAccount},
    mpl_bubblegum::utils::get_asset_id,
    spl_account_compression::{program::SplAccountCompression, Noop},
};

/// Accounts used in init NFT instruction
#[derive(Accounts)]
pub struct WrapNftCharacter<'info> {
    // HIVE CONTROL
    #[account()]
    pub project: Box<Account<'info, Project>>,

    #[account()]
    pub character_model: Box<Account<'info, CharacterModel>>,

    /// CHECK: unsafe
    #[account(mut)]
    pub merkle_tree: AccountInfo<'info>,

    /// Mint address of the NFT
    #[account()]
    pub mint: Account<'info, Mint>,

    /// Mint address of the NFT
    #[account(
        constraint = token_account.mint == mint.key(),
        constraint = token_account.owner == wallet.key()
    )]
    pub token_account: Account<'info, TokenAccount>,

    /// NFT token metadata
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub metadata: AccountInfo<'info>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub wallet: Signer<'info>,

    /// HPL Fee collection vault
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub vault: AccountInfo<'info>,

    /// NATIVE SYSTEM PROGRAM
    pub system_program: Program<'info, System>,

    /// HPL Hive Control Program
    pub hive_control: Program<'info, HplHiveControl>,

    /// SPL account compression program.
    pub compression_program: Program<'info, SplAccountCompression>,

    /// SPL Noop program.
    pub log_wrapper: Program<'info, Noop>,

    /// NATIVE CLOCK SYSVAR
    pub clock: Sysvar<'info, Clock>,

    /// NATIVE INSTRUCTIONS SYSVAR
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,
}

/// Init NFT
pub fn wrap_nft_character(ctx: Context<WrapNftCharacter>) -> Result<()> {
    let metadata_account_info = &ctx.accounts.metadata;

    if metadata_account_info.data_is_empty() {
        msg!("Metadata account is empty");
        return Err(ErrorCode::InvalidMetadata.into());
    }

    let metadata: Metadata = Metadata::from_account_info(metadata_account_info)?;
    if metadata.mint != ctx.accounts.mint.key() {
        msg!("Metadata mint does not match NFT mint");
        return Err(ErrorCode::InvalidMetadata.into());
    }

    let mut source_criteria = None::<NftWrapCriteria>;
    match &ctx.accounts.character_model.config {
        CharacterConfig::Wrapped(criterias) => {
            for criteria in criterias {
                match criteria {
                    NftWrapCriteria::Collection(address) => {
                        if let Some(collection) = &metadata.collection {
                            if collection.verified
                                && collection.key.to_string() == address.to_string()
                            {
                                source_criteria = Some(NftWrapCriteria::Collection(*address));
                                break;
                            }
                        }
                    }
                    NftWrapCriteria::Creator(address) => {
                        if let Some(creators) = &metadata.data.creators {
                            let mut found = false;
                            for creator in creators {
                                if creator.verified
                                    && creator.address.to_string() == address.to_string()
                                {
                                    source_criteria = Some(NftWrapCriteria::Creator(*address));
                                    found = true;
                                    break;
                                }
                            }
                            if found {
                                break;
                            }
                        }
                    }
                    NftWrapCriteria::MerkleTree(_) => {}
                }
            }
        }
    }

    if source_criteria.is_none() {
        return Err(ErrorCode::NoCriteriaMatched.into());
    }

    let (leaf_idx, seq) = ctx
        .accounts
        .character_model
        .merkle_trees
        .assert_append(ctx.accounts.merkle_tree.to_account_info())?;

    let character = CharacterSchema {
        owner: ctx.accounts.wallet.key(),
        source: CharacterSource::Wrapped {
            mint: ctx.accounts.mint.key(),
            criteria: source_criteria.unwrap(),
            is_compressed: false,
        },
        used_by: CharacterUsedBy::None,
    };

    let event = CompressedDataEvent::Leaf {
        slot: ctx.accounts.clock.slot,
        tree_id: ctx.accounts.merkle_tree.key().to_bytes(),
        leaf_idx,
        seq,
        stream_type: character.event_stream(),
    };
    event.wrap(&ctx.accounts.log_wrapper)?;

    hpl_compression::append_leaf(
        character.to_compressed().to_node(),
        &ctx.accounts.vault,
        &ctx.accounts.merkle_tree,
        &ctx.accounts.compression_program,
        &ctx.accounts.log_wrapper,
        Some(&[&[
            b"vault".as_ref(),
            crate::id().as_ref(),
            &[ctx.bumps["vault"]],
        ][..]]),
    )?;

    Ok(())
}

/// Accounts used in init NFT instruction
#[derive(Accounts)]
pub struct WrapCnftCharacter<'info> {
    // HIVE CONTROL
    #[account()]
    pub project: Box<Account<'info, Project>>,

    #[account()]
    pub character_model: Box<Account<'info, CharacterModel>>,

    /// CHECK: unsafe
    #[account(mut)]
    pub character_merkle_tree: AccountInfo<'info>,

    /// CHECK: unsafe
    pub cnft_tree_authority: UncheckedAccount<'info>,

    /// CHECK: unsafe
    pub cnft_merkle_tree: UncheckedAccount<'info>,

    /// CHECK: unsafe
    pub data_hash: UncheckedAccount<'info>,

    /// CHECK: unsafe
    pub root: UncheckedAccount<'info>,

    /// CHECK: unsafe
    pub creator_hash: UncheckedAccount<'info>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub wallet: Signer<'info>,

    /// HPL Fee collection vault
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub vault: AccountInfo<'info>,

    /// NATIVE SYSTEM PROGRAM
    pub system_program: Program<'info, System>,

    /// HPL Hive Control Program
    pub hive_control: Program<'info, HplHiveControl>,

    /// SPL account compression program.
    pub compression_program: Program<'info, SplAccountCompression>,

    /// SPL Noop program.
    pub log_wrapper: Program<'info, Noop>,

    /// NATIVE CLOCK SYSVAR
    pub clock: Sysvar<'info, Clock>,

    /// NATIVE INSTRUCTIONS SYSVAR
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct WrapCnftCharacterArgs {
    pub nonce: u64,
    pub index: u32,
}

/// Init NFT
pub fn wrap_cnft_character<'info>(
    ctx: Context<'_, '_, '_, 'info, WrapCnftCharacter<'info>>,
    args: WrapCnftCharacterArgs,
) -> Result<()> {
    crate::bubblegum::transfer_cnft_cpi(
        ctx.accounts.cnft_tree_authority.to_account_info(),
        ctx.accounts.character_model.to_account_info(),
        ctx.accounts.character_model.to_account_info(),
        ctx.accounts.wallet.to_account_info(),
        ctx.accounts.cnft_merkle_tree.to_account_info(),
        ctx.accounts.log_wrapper.to_account_info(),
        ctx.accounts.compression_program.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.remaining_accounts.to_vec(),
        args.index,
        None,
    )?;

    let mut source_criteria = None::<NftWrapCriteria>;
    match &ctx.accounts.character_model.config {
        CharacterConfig::Wrapped(criterias) => {
            for criteria in criterias {
                match criteria {
                    NftWrapCriteria::Collection(_) => {}
                    NftWrapCriteria::Creator(_) => {}
                    NftWrapCriteria::MerkleTree(address) => {
                        if *address == ctx.accounts.cnft_merkle_tree.key() {
                            source_criteria = Some(NftWrapCriteria::MerkleTree(*address));
                            break;
                        }
                    }
                }
            }
        }
    }

    if source_criteria.is_none() {
        return Err(ErrorCode::NoCriteriaMatched.into());
    }

    let (leaf_idx, seq) = ctx
        .accounts
        .character_model
        .merkle_trees
        .assert_append(ctx.accounts.character_merkle_tree.to_account_info())?;

    let character = CharacterSchema {
        owner: ctx.accounts.wallet.key(),
        source: CharacterSource::Wrapped {
            mint: get_asset_id(&ctx.accounts.cnft_merkle_tree.key(), args.nonce),
            criteria: source_criteria.unwrap(),
            is_compressed: true,
        },
        used_by: CharacterUsedBy::None,
    };

    let event = CompressedDataEvent::Leaf {
        slot: ctx.accounts.clock.slot,
        tree_id: ctx.accounts.character_merkle_tree.key().to_bytes(),
        leaf_idx,
        seq,
        stream_type: character.event_stream(),
    };
    event.wrap(&ctx.accounts.log_wrapper)?;

    hpl_compression::append_leaf(
        character.to_compressed().to_node(),
        &ctx.accounts.vault,
        &ctx.accounts.character_merkle_tree,
        &ctx.accounts.compression_program,
        &ctx.accounts.log_wrapper,
        Some(&[&[
            b"vault".as_ref(),
            crate::id().as_ref(),
            &[ctx.bumps["vault"]],
        ][..]]),
    )?;

    Ok(())
}

// /// Accounts used in use NFT instruction
// #[derive(Accounts)]
// pub struct UnwrapNftCharacter<'info> {
//     // HIVE CONTROL
//     #[account()]
//     pub project: Box<Account<'info, Project>>,

//     /// NFT state account
//     #[account(
//         mut,
//         has_one = project,
//         constraint = !character.is_used(),
//         constraint = character.owner == wallet.key(),
//         close = wallet
//     )]
//     pub character: Account<'info, Character>,

//     /// The wallet ownning the cNFT
//     #[account(mut)]
//     pub wallet: Signer<'info>,

//     /// NATIVE SYSTEM PROGRAM
//     pub system_program: Program<'info, System>,

//     /// HPL Hive Control Program
//     pub hive_control: Program<'info, HplHiveControl>,

//     /// NATIVE INSTRUCTIONS SYSVAR
//     /// CHECK: This is not dangerous because we don't read or write from this account
//     #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
//     pub instructions_sysvar: AccountInfo<'info>,

//     /// CHECK: This is not dangerous because we don't read or write from this account
//     #[account(mut)]
//     pub vault: AccountInfo<'info>,
// }

// /// Close NFT
// pub fn unwrap_nft_character<'info>(_ctx: Context<UnwrapNftCharacter>) -> Result<()> {
//     Ok(())
// }
