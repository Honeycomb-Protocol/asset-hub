use mpl_token_metadata::state::Data;

use {
    crate::{
        errors::ErrorCode,
        state::{
            Assembler, AssemblingAction, Block, BlockDefinition, BlockDefinitionValue,
            NFTAttribute, NFTAttributeValue, NFTUniqueConstraint, NFT,
        },
    },
    anchor_lang::{prelude::*, solana_program},
    anchor_spl::{
        associated_token::AssociatedToken,
        token::{self, Burn, CloseAccount, Mint, Token, TokenAccount},
    },
    hpl_hive_control::state::{DelegateAuthority, Project},
    hpl_utils::{self, reallocate, BpfWriter},
    mpl_token_metadata::{
        self,
        instruction::{
            CollectionDetailsToggle, CollectionToggle, DelegateArgs, MintArgs, RevokeArgs,
            RuleSetToggle, UpdateArgs, UsesToggle,
        },
        state::{AssetData, Metadata, TokenMetadataAccount, TokenStandard},
    },
};

/// Accounts used in the create nft instruction
#[derive(Accounts)]
pub struct CreateNFT<'info> {
    /// Assembler state account
    #[account(mut, has_one = project)]
    pub assembler: Box<Account<'info, Assembler>>,

    /// The collection mint of the assembler
    #[account(mut, constraint = collection_mint.key() == assembler.collection)]
    pub collection_mint: Box<Account<'info, Mint>>,

    /// Metadata account of the collection
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub collection_metadata_account: AccountInfo<'info>,

    /// Master Edition account of the collection
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub collection_master_edition: AccountInfo<'info>,

    /// NFT mint account
    #[account(
      init,
      payer = payer,
      mint::decimals = 0,
      mint::authority = assembler,
      mint::freeze_authority = assembler,
    )]
    pub nft_mint: Account<'info, Mint>,

    /// Metadata account of the NFT
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub nft_metadata: AccountInfo<'info>,

    /// Master Edition account of the NFT
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub nft_master_edition: AccountInfo<'info>,

    /// NFT account
    #[account(
        init, payer = payer,
        space = NFT::LEN,
        seeds = [
            b"nft".as_ref(),
            nft_mint.key().as_ref(),
        ],
        bump,
    )]
    pub nft: Account<'info, NFT>,

    /// The wallet that holds the pre mint authority over this NFT
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub authority: AccountInfo<'info>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub payer: Signer<'info>,

    /// NATIVE SYSTEM PROGRAM
    pub system_program: Program<'info, System>,

    /// SPL TOKEN PROGRAM
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,

    /// METAPLEX TOKEN METADATA PROGRAM
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: AccountInfo<'info>,

    /// SYSVAR RENT
    pub rent: Sysvar<'info, Rent>,

    /// NATIVE Instructions SYSVAR
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,

    // HIVE CONTROL
    #[account()]
    pub project: Box<Account<'info, Project>>,
    #[account(has_one = authority)]
    pub delegate_authority: Option<Account<'info, DelegateAuthority>>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub vault: AccountInfo<'info>,
}

/// Create a new nft
pub fn create_nft(ctx: Context<CreateNFT>) -> Result<()> {
    let assembler = &mut ctx.accounts.assembler;
    assembler.nfts += 1;

    let nft = &mut ctx.accounts.nft;
    nft.bump = ctx.bumps["nft"];
    nft.assembler = assembler.key();
    nft.authority = ctx.accounts.authority.key();
    nft.collection_address = assembler.collection;
    nft.mint = ctx.accounts.nft_mint.key();
    nft.name = format!("{} #{}", assembler.collection_name, assembler.nfts);
    nft.symbol = assembler.collection_symbol.clone();
    nft.description = assembler.collection_description.clone();
    nft.minted = false;
    nft.id = assembler.nfts;
    nft.uri = assembler.nft_base_uri.clone();
    nft.is_generated = false;

    let assembler_seeds = &[
        b"assembler".as_ref(),
        assembler.collection.as_ref(),
        &[assembler.bump],
    ];
    let assembler_signer = &[&assembler_seeds[..]];

    hpl_utils::create_nft(
        AssetData {
            name: nft.name.clone(),
            symbol: nft.symbol.clone(),
            uri: nft.uri.clone(),
            seller_fee_basis_points: assembler.default_royalty,
            creators: Some(
                vec![
                    vec![mpl_token_metadata::state::Creator {
                        address: assembler.key(),
                        verified: true,
                        share: 0,
                    }],
                    assembler
                        .default_creators
                        .iter()
                        .map(|c| mpl_token_metadata::state::Creator {
                            address: c.address,
                            verified: false,
                            share: c.share,
                        })
                        .collect(),
                ]
                .concat(),
            ),
            primary_sale_happened: false,
            is_mutable: true,
            token_standard: match assembler.token_standard {
                crate::state::TokenStandard::NonFungible => TokenStandard::NonFungible,
                crate::state::TokenStandard::ProgrammableNonFungible => {
                    TokenStandard::ProgrammableNonFungible
                }
            },
            collection: None,
            uses: None,
            collection_details: None,
            rule_set: assembler.rule_set,
        },
        false,
        true,
        ctx.accounts.nft_metadata.to_account_info(),
        ctx.accounts.nft_master_edition.to_account_info(),
        ctx.accounts.nft_mint.to_account_info(),
        assembler.to_account_info(),
        ctx.accounts.payer.to_account_info(),
        assembler.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.instructions_sysvar.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        Some(assembler_signer),
    )?;

    // set_and_verify_collection(
    //     ctx.accounts.nft_metadata.clone(),
    //     ctx.accounts.collection_mint.to_account_info(),
    //     ctx.accounts.collection_metadata_account.clone(),
    //     ctx.accounts.collection_master_edition.clone(),
    //     assembler.to_account_info(),
    //     ctx.accounts.payer.to_account_info(),
    //     ctx.accounts.token_metadata_program.clone(),
    //     Some(assembler_signer),
    // )?;

    Ok(())
}

/// Accounts used in the add block instruction
#[derive(Accounts)]
pub struct AddBlock<'info> {
    /// Assembler state account
    #[account(has_one = project)]
    pub assembler: Box<Account<'info, Assembler>>,

    /// NFT account
    #[account(mut, has_one = assembler, has_one = authority)]
    pub nft: Box<Account<'info, NFT>>,

    /// Block account
    #[account(has_one = assembler)]
    pub block: Account<'info, Block>,

    /// Block definition account
    #[account(has_one = block)]
    pub block_definition: Box<Account<'info, BlockDefinition>>,

    /// Attribute token mint
    #[account(mut)]
    pub token_mint: Box<Account<'info, Mint>>,

    /// Attribute token account
    #[account(mut, constraint = token_account.owner == authority.key() && token_account.mint == token_mint.key())]
    pub token_account: Box<Account<'info, TokenAccount>>,

    /// Attribute token metadata
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub token_metadata: AccountInfo<'info>,

    /// Attribute token edition
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account()]
    pub token_edition: Option<AccountInfo<'info>>,

    /// Attribute token record
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub token_record: Option<AccountInfo<'info>>,

    /// The account that will hold the nft sent on expedition
    #[account(
        init,
        payer = payer,
        seeds = [
            b"deposit",
            token_mint.key().as_ref(),
            nft.mint.as_ref(),
        ],
        bump,
        token::mint = token_mint,
        token::authority = assembler,
    )]
    pub deposit_account: Option<Account<'info, TokenAccount>>,

    /// Deposit token_record
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub deposit_token_record: Option<AccountInfo<'info>>,

    /// The wallet that has pre mint authority over this NFT
    #[account(mut)]
    pub authority: Signer<'info>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub payer: Signer<'info>,

    /// NATIVE SYSTEM PROGRAM
    pub system_program: Program<'info, System>,

    /// SPL TOKEN PROGRAM
    pub token_program: Program<'info, Token>,

    /// ASSOCIATED TOKEN PROGRAM
    pub associated_token_program: Program<'info, AssociatedToken>,

    /// METAPLEX TOKEN METADATA PROGRAM
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: AccountInfo<'info>,

    /// NATIVE Instructions SYSVAR
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,

    /// SYSVAR RENT
    pub rent: Sysvar<'info, Rent>,

    // HIVE CONTROL
    #[account()]
    pub project: Box<Account<'info, Project>>,
    #[account(has_one = authority)]
    pub delegate_authority: Option<Account<'info, DelegateAuthority>>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub vault: AccountInfo<'info>,
}

/// Create a new nft
pub fn add_block(ctx: Context<AddBlock>) -> Result<()> {
    let assembler = &ctx.accounts.assembler;
    let block = &ctx.accounts.block;
    let block_definition = &ctx.accounts.block_definition;
    let token_mint = &ctx.accounts.token_mint;
    let nft = &mut ctx.accounts.nft;

    if nft.minted {
        return Err(ErrorCode::NFTAlreadyMinted.into());
    }

    let index = nft
        .attributes
        .iter()
        .position(|r| r.order == block.block_order);
    if let Some(_) = index {
        return Err(ErrorCode::BlockExistsForNFT.into());
    }

    let attribute_value: NFTAttributeValue;
    match &block_definition.value {
        BlockDefinitionValue::Enum {
            is_collection,
            value,
            image: _image,
        } => {
            if *is_collection {
                let metadata_account_info = &ctx.accounts.token_metadata;
                if metadata_account_info.data_is_empty() {
                    return Err(ErrorCode::InvalidMetadata.into());
                }

                let metadata: Metadata = Metadata::from_account_info(metadata_account_info)?;
                if metadata.mint != token_mint.key() {
                    return Err(ErrorCode::InvalidMetadata.into());
                }

                if let Some(collection) = metadata.collection {
                    if !collection.verified && collection.key != block_definition.mint {
                        return Err(ErrorCode::InvalidTokenForBlockDefinition.into());
                    }
                } else {
                    return Err(ErrorCode::InvalidMetadata.into());
                }
            } else {
                if block_definition.mint != token_mint.key() {
                    return Err(ErrorCode::InvalidTokenForBlockDefinition.into());
                }
            }

            attribute_value = NFTAttributeValue::String {
                value: value.clone(),
            };
        }
        BlockDefinitionValue::Number { min, max } => {
            if block_definition.mint != token_mint.key() {
                return Err(ErrorCode::InvalidTokenForBlockDefinition.into());
            }

            let value = (min + max) / 2;
            attribute_value = NFTAttributeValue::Number { value };
        }
        BlockDefinitionValue::Boolean { value } => {
            if block_definition.mint != token_mint.key() {
                return Err(ErrorCode::InvalidTokenForBlockDefinition.into());
            }

            attribute_value = NFTAttributeValue::Boolean {
                value: value.clone(),
            };
        }
    }

    match assembler.assembling_action {
        AssemblingAction::Burn => {
            token::burn(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    token::Burn {
                        mint: token_mint.to_account_info(),
                        from: ctx.accounts.token_account.to_account_info(),
                        authority: ctx.accounts.authority.to_account_info(),
                    },
                ),
                1 * 10u64.pow(token_mint.decimals.into()),
            )?;
        }
        AssemblingAction::Freeze => {
            let assembler_seeds = &[
                b"assembler".as_ref(),
                assembler.collection.as_ref(),
                &[assembler.bump],
            ];
            let assembler_signer = &[&assembler_seeds[..]];

            hpl_utils::delegate(
                DelegateArgs::StakingV1 {
                    amount: 1 * 10u64.pow(token_mint.decimals.into()),
                    authorization_data: None,
                },
                None,
                assembler.to_account_info(),
                ctx.accounts.token_metadata.to_account_info(),
                ctx.accounts.token_edition.clone(),
                ctx.accounts.token_record.clone(),
                ctx.accounts.token_mint.to_account_info(),
                ctx.accounts.token_account.to_account_info(),
                ctx.accounts.authority.to_account_info(),
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.instructions_sysvar.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
                None,
                None,
                None,
            )?;

            hpl_utils::lock(
                assembler.to_account_info(),
                ctx.accounts.token_mint.to_account_info(),
                ctx.accounts.token_account.to_account_info(),
                Some(ctx.accounts.authority.to_account_info()),
                ctx.accounts.token_metadata.to_account_info(),
                ctx.accounts.token_edition.clone(),
                ctx.accounts.token_record.clone(),
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.instructions_sysvar.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
                None,
                None,
                Some(assembler_signer),
            )?;
        }
        AssemblingAction::TakeCustody => {
            if let Some(deposit_account) = &ctx.accounts.deposit_account {
                hpl_utils::transfer(
                    1 * 10u64.pow(token_mint.decimals.into()),
                    ctx.accounts.token_account.to_account_info(),
                    ctx.accounts.authority.to_account_info(),
                    deposit_account.to_account_info(),
                    assembler.to_account_info(),
                    ctx.accounts.token_mint.to_account_info(),
                    ctx.accounts.token_metadata.to_account_info(),
                    ctx.accounts.token_edition.clone(),
                    ctx.accounts.token_record.clone(),
                    ctx.accounts.deposit_token_record.clone(),
                    ctx.accounts.authority.to_account_info(),
                    ctx.accounts.payer.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                    ctx.accounts.token_program.to_account_info(),
                    ctx.accounts.associated_token_program.to_account_info(),
                    ctx.accounts.instructions_sysvar.to_account_info(),
                    None,
                    None,
                    None,
                )?;
            } else {
                return Err(ErrorCode::DepositAccountNotProvided.into());
            }
        }
    }

    let nft_attribute = NFTAttribute {
        mint: token_mint.key(),
        order: block.block_order,
        attribute_name: block.block_name.clone(),
        block_definition_index: block_definition.defination_index,
        attribute_value,
    };

    reallocate(
        isize::try_from(NFTAttribute::LEN).unwrap(),
        nft.to_account_info(),
        ctx.accounts.payer.to_account_info(),
        &ctx.accounts.rent,
        &ctx.accounts.system_program,
    )?;

    nft.attributes.push(nft_attribute);

    Ok(())
}

/// Accounts used in the mint nft instruction
#[derive(Accounts)]
pub struct MintNFT<'info> {
    /// Assembler state account
    #[account(has_one = project)]
    pub assembler: Box<Account<'info, Assembler>>,

    /// NFT account
    #[account( mut, has_one = authority, has_one = assembler )]
    pub nft: Box<Account<'info, NFT>>,

    /// NFT mint account
    #[account(mut, constraint = nft_mint.key() == nft.mint)]
    pub nft_mint: Account<'info, Mint>,

    /// Metadata account of the NFT
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub nft_metadata: AccountInfo<'info>,

    /// Master Edition account of the NFT
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub nft_master_edition: AccountInfo<'info>,

    /// NFT token record
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub nft_token_record: Option<AccountInfo<'info>>,

    /// NFT token account
    #[account(mut, constraint = token_account.mint == nft_mint.key() && token_account.owner == authority.key())]
    pub token_account: Box<Account<'info, TokenAccount>>,

    /// NFT unique constraint
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub unique_constraint: Option<AccountInfo<'info>>,

    /// The wallet that has pre mint authority over this NFT
    #[account(mut)]
    pub authority: Signer<'info>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub payer: Signer<'info>,

    /// NATIVE SYSTEM PROGRAM
    pub system_program: Program<'info, System>,

    /// SPL TOKEN PROGRAM
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,

    /// ASSOCIATED TOKEN PROGRAM
    pub associated_token_program: Program<'info, AssociatedToken>,

    /// NATIVE Instructions SYSVAR
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,

    /// METAPLEX TOKEN METADATA PROGRAM
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: AccountInfo<'info>,

    /// SYSVAR RENT
    pub rent: Sysvar<'info, Rent>,

    // HIVE CONTROL
    #[account()]
    pub project: Box<Account<'info, Project>>,
    #[account(has_one = authority)]
    pub delegate_authority: Option<Account<'info, DelegateAuthority>>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub vault: AccountInfo<'info>,
}

/// Create a new nft
pub fn mint_nft(ctx: Context<MintNFT>) -> Result<()> {
    let assembler = &ctx.accounts.assembler;
    let assembler_key = assembler.key();
    let nft = &mut ctx.accounts.nft;

    if nft.minted {
        return Err(ErrorCode::NFTAlreadyMinted.into());
    }

    if !assembler.allow_duplicates {
        if let Some(unique_constraint_info) = &mut ctx.accounts.unique_constraint {
            if unique_constraint_info.data_len() > 0 {
                msg!("Unique constraint account is not empty");
                return Err(ErrorCode::InvalidUniqueConstraint.into());
            }

            let mut seeds = Vec::new();
            let mut attributes = nft.attributes.clone();
            attributes.sort_by_key(|a| a.order);

            let attribute_seed = attributes
                .iter()
                .map(|x| {
                    [
                        x.block_definition_index.to_be_bytes(),
                        u16::from(x.order).to_be_bytes(),
                    ]
                    .concat()
                })
                .flatten()
                .collect::<Vec<_>>();

            seeds.push(&attribute_seed[..]);
            seeds.push(assembler_key.as_ref());
            let (gen_unique_constraint_key, bump) =
                Pubkey::find_program_address(&seeds[..], ctx.program_id);

            if gen_unique_constraint_key != unique_constraint_info.key() {
                msg!("Different unique constraint key generated");
                msg!("Expected: {}", gen_unique_constraint_key);
                msg!("Found: {}", unique_constraint_info.key());
                return Err(ErrorCode::InvalidUniqueConstraint.into());
            }

            let seed_bump = &[bump];
            seeds.push(seed_bump);
            let pda_signer = &seeds[..];
            let signers = &[pda_signer];

            anchor_lang::system_program::create_account(
                anchor_lang::context::CpiContext::new_with_signer(
                    ctx.accounts.system_program.to_account_info(),
                    anchor_lang::system_program::CreateAccount {
                        from: ctx.accounts.payer.to_account_info(),
                        to: unique_constraint_info.to_account_info(),
                    },
                    signers,
                ),
                ctx.accounts.rent.minimum_balance(NFTUniqueConstraint::LEN),
                NFTUniqueConstraint::LEN as u64,
                ctx.program_id,
            )?;

            let unique_constraint = NFTUniqueConstraint {
                bump,
                nft: nft.key(),
            };

            let mut dst_ref = unique_constraint_info.try_borrow_mut_data()?;
            let dst = dst_ref.as_mut();
            let mut writer = BpfWriter::new(dst);

            unique_constraint.try_serialize(&mut writer)?;
        } else {
            return Err(ErrorCode::UniqueConstraintNotProvided.into());
        }
    }

    let assembler_seeds = &[
        b"assembler".as_ref(),
        assembler.collection.as_ref(),
        &[assembler.bump],
    ];
    let assembler_signer = &[&assembler_seeds[..]];

    hpl_utils::mint(
        MintArgs::V1 {
            amount: 1,
            authorization_data: None,
        },
        ctx.accounts.token_account.to_account_info(),
        Some(ctx.accounts.authority.to_account_info()),
        ctx.accounts.nft_metadata.to_account_info(),
        Some(ctx.accounts.nft_master_edition.to_account_info()),
        ctx.accounts.nft_token_record.clone(),
        ctx.accounts.nft_mint.to_account_info(),
        assembler.to_account_info(),
        None, // delegate_record,
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.instructions_sysvar.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        ctx.accounts.rent.to_account_info(),
        None,
        None,
        Some(assembler_signer),
    )?;

    nft.minted = true;

    Ok(())
}

/// Accounts used in the burn nft instruction
#[derive(Accounts)]
pub struct BurnNFT<'info> {
    /// Assembler state account
    #[account(has_one = project)]
    pub assembler: Box<Account<'info, Assembler>>,

    /// NFT account
    #[account(mut, has_one = assembler)]
    pub nft: Box<Account<'info, NFT>>,

    /// NFT mint account
    #[account(mut, constraint = nft_mint.key() == nft.mint)]
    pub nft_mint: Account<'info, Mint>,

    /// Metadata account of the NFT
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub nft_metadata: AccountInfo<'info>,

    /// Master Edition account of the NFT
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub nft_master_edition: AccountInfo<'info>,

    /// NFT token account
    #[account(mut, constraint = token_account.mint == nft_mint.key() && token_account.owner == authority.key())]
    pub token_account: Account<'info, TokenAccount>,

    /// NFT unique constraint
    #[account(mut, has_one = nft, close = authority)]
    pub unique_constraint: Option<Account<'info, NFTUniqueConstraint>>,

    /// The wallet that holds the pre mint authority over this NFT
    pub authority: Signer<'info>,

    /// Payer account
    pub payer: Signer<'info>,

    /// NATIVE SYSTEM PROGRAM
    pub system_program: Program<'info, System>,

    /// SPL TOKEN PROGRAM
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,

    /// METAPLEX TOKEN METADATA PROGRAM
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: AccountInfo<'info>,

    /// NATIVE Instructions SYSVAR
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,

    // HIVE CONTROL
    #[account()]
    pub project: Box<Account<'info, Project>>,
    #[account(has_one = authority)]
    pub delegate_authority: Option<Account<'info, DelegateAuthority>>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub vault: AccountInfo<'info>,
}

/// Burn a nft
pub fn burn_nft(ctx: Context<BurnNFT>) -> Result<()> {
    let assembler = &ctx.accounts.assembler;
    let nft = &mut ctx.accounts.nft;

    if !nft.minted {
        return Err(ErrorCode::NFTNotMinted.into());
    }

    if assembler.assembling_action == AssemblingAction::Burn {
        return Err(ErrorCode::NFTNotBurnable.into());
    }

    token::burn(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.nft_mint.to_account_info(),
                from: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        ),
        1,
    )?;

    let metadata_account_info = &ctx.accounts.nft_metadata;
    let mut metadata: Metadata = Metadata::from_account_info(metadata_account_info)?;
    metadata.data.uri = assembler.nft_base_uri.clone();

    let assembler_seeds = &[
        b"assembler".as_ref(),
        assembler.collection.as_ref(),
        &[assembler.bump],
    ];
    let assembler_signer = &[&assembler_seeds[..]];

    hpl_utils::update(
        UpdateArgs::V1 {
            new_update_authority: None,
            data: Some(metadata.data),
            primary_sale_happened: None,
            is_mutable: None,
            collection: CollectionToggle::None,
            collection_details: CollectionDetailsToggle::None,
            uses: UsesToggle::None,
            rule_set: RuleSetToggle::None,
            authorization_data: None,
        },
        None,
        None,
        ctx.accounts.nft_mint.to_account_info(),
        ctx.accounts.nft_metadata.to_account_info(),
        ctx.accounts.nft_master_edition.to_account_info(),
        assembler.to_account_info(),
        ctx.accounts.authority.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.instructions_sysvar.to_account_info(),
        Some(assembler_signer),
    )?;

    nft.minted = false;

    Ok(())
}

/// Accounts used in the remove block instruction
#[derive(Accounts)]
pub struct RemoveBlock<'info> {
    /// Assembler state account
    #[account(has_one = project)]
    pub assembler: Box<Account<'info, Assembler>>,

    /// NFT account
    #[account(mut, has_one = assembler, has_one = authority)]
    pub nft: Box<Account<'info, NFT>>,

    /// Block account
    #[account(has_one = assembler)]
    pub block: Box<Account<'info, Block>>,

    /// Block definition account
    #[account(has_one = block)]
    pub block_definition: Box<Account<'info, BlockDefinition>>,

    /// Burning token mint
    #[account(mut)]
    pub token_mint: Box<Account<'info, Mint>>,

    /// Burning token account
    #[account(mut, constraint = token_account.owner == authority.key() && token_account.mint == token_mint.key())]
    pub token_account: Box<Account<'info, TokenAccount>>,

    /// Burning token metadata
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub token_metadata: AccountInfo<'info>,

    /// Burning token edition
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account()]
    pub token_edition: Option<AccountInfo<'info>>,

    /// Attribute token record
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub token_record: Option<AccountInfo<'info>>,

    /// The account that will hold the nft sent on expedition
    #[account(
        mut,
        token::mint = token_mint,
        token::authority = assembler,
    )]
    pub deposit_account: Option<Account<'info, TokenAccount>>,

    /// Deposit token_record
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub deposit_token_record: Option<AccountInfo<'info>>,

    /// The wallet that has pre mint authority over this NFT
    #[account(mut)]
    pub authority: Signer<'info>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub payer: Signer<'info>,

    /// SYSTEM PROGRAM
    pub system_program: Program<'info, System>,

    /// SPL TOKEN PROGRAM
    pub token_program: Program<'info, Token>,

    /// ASSOCIATED TOKEN PROGRAM
    pub associated_token_program: Program<'info, AssociatedToken>,

    /// METAPLEX TOKEN METADATA PROGRAM
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: AccountInfo<'info>,

    /// NATIVE Instructions SYSVAR
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,

    /// RENT PROGRAM
    pub rent: Sysvar<'info, Rent>,

    // HIVE CONTROL
    #[account()]
    pub project: Box<Account<'info, Project>>,
    #[account(has_one = authority)]
    pub delegate_authority: Option<Account<'info, DelegateAuthority>>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub vault: AccountInfo<'info>,
}

/// Create a new nft
pub fn remove_block(ctx: Context<RemoveBlock>) -> Result<()> {
    let assembler = &ctx.accounts.assembler;
    let nft = &mut ctx.accounts.nft;
    let block = &ctx.accounts.block;
    let block_definition = &ctx.accounts.block_definition;
    let token_mint = &ctx.accounts.token_mint;

    if nft.minted {
        return Err(ErrorCode::NFTAlreadyMinted.into());
    }

    match &block_definition.value {
        BlockDefinitionValue::Enum {
            is_collection,
            value: _value,
            image: _image,
        } => {
            if *is_collection {
                let metadata_account_info = &ctx.accounts.token_metadata;
                if metadata_account_info.data_is_empty() {
                    return Err(ErrorCode::InvalidMetadata.into());
                }

                let metadata: Metadata = Metadata::from_account_info(metadata_account_info)?;
                if metadata.mint != token_mint.key() {
                    return Err(ErrorCode::InvalidMetadata.into());
                }

                if let Some(collection) = metadata.collection {
                    if !collection.verified && collection.key != block_definition.mint {
                        return Err(ErrorCode::InvalidTokenForBlockDefinition.into());
                    }
                } else {
                    return Err(ErrorCode::InvalidMetadata.into());
                }
            } else {
                if block_definition.mint != token_mint.key() {
                    return Err(ErrorCode::InvalidTokenForBlockDefinition.into());
                }
            }
        }
        _ => {
            if block_definition.mint != token_mint.key() {
                return Err(ErrorCode::InvalidTokenForBlockDefinition.into());
            }
        }
    }

    let assembler_seeds = &[
        b"assembler".as_ref(),
        assembler.collection.as_ref(),
        &[assembler.bump],
    ];
    let assembler_signer = &[&assembler_seeds[..]];

    // Reverse assembling action
    match assembler.assembling_action {
        AssemblingAction::Burn => {
            return Err(ErrorCode::NFTNotBurnable.into());
        }
        AssemblingAction::Freeze => {
            hpl_utils::unlock(
                assembler.to_account_info(),
                token_mint.to_account_info(),
                ctx.accounts.token_account.to_account_info(),
                Some(ctx.accounts.authority.to_account_info()),
                ctx.accounts.token_metadata.to_account_info(),
                ctx.accounts.token_edition.clone(),
                ctx.accounts.token_record.clone(),
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.instructions_sysvar.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
                None,
                None,
                Some(assembler_signer),
            )?;

            hpl_utils::revoke(
                RevokeArgs::StakingV1,
                None,
                assembler.to_account_info(),
                ctx.accounts.token_metadata.to_account_info(),
                ctx.accounts.token_edition.clone(),
                ctx.accounts.token_record.clone(),
                ctx.accounts.token_mint.to_account_info(),
                ctx.accounts.token_account.to_account_info(),
                ctx.accounts.authority.to_account_info(),
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.instructions_sysvar.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
                None,
                None,
                Some(assembler_signer),
            )?;
        }
        AssemblingAction::TakeCustody => {
            if ctx.accounts.deposit_account.is_none() {
                return Err(ErrorCode::DepositAccountNotProvided.into());
            }
            let deposit_account = &ctx.accounts.deposit_account.clone().unwrap();
            hpl_utils::transfer(
                1 * 10u64.pow(token_mint.decimals.into()),
                deposit_account.to_account_info(),
                assembler.to_account_info(),
                ctx.accounts.token_account.to_account_info(),
                ctx.accounts.authority.to_account_info(),
                ctx.accounts.token_mint.to_account_info(),
                ctx.accounts.token_metadata.to_account_info(),
                ctx.accounts.token_edition.clone(),
                ctx.accounts.deposit_token_record.clone(),
                ctx.accounts.token_record.clone(),
                assembler.to_account_info(),
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
                ctx.accounts.associated_token_program.to_account_info(),
                ctx.accounts.instructions_sysvar.to_account_info(),
                None,
                None,
                Some(assembler_signer),
            )?;

            token::close_account(CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                CloseAccount {
                    account: deposit_account.to_account_info(),
                    destination: ctx.accounts.authority.to_account_info(),
                    authority: assembler.to_account_info(),
                },
                assembler_signer,
            ))?;
        }
    }

    let index = nft
        .attributes
        .iter()
        .position(|r| r.order == block.block_order);

    if let Some(index) = index {
        reallocate(
            isize::try_from(NFTAttribute::LEN).unwrap() * -1,
            nft.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            &ctx.accounts.rent,
            &ctx.accounts.system_program,
        )?;

        nft.attributes.remove(index);
    } else {
        return Err(ErrorCode::BlockDoesNotExistsForNFT.into());
    }

    Ok(())
}

/// Accounts used in set nft generated instruction
#[derive(Accounts)]
pub struct SetNFTGenerated<'info> {
    /// Assembler state account
    #[account(has_one = project)]
    pub assembler: Account<'info, Assembler>,

    /// The nft account
    #[account(
        mut,
        seeds = [
            b"nft".as_ref(),
            nft.mint.as_ref(),
        ],
        bump,
    )]
    pub nft: Account<'info, NFT>,

    /// NFT mint account
    #[account(mut, constraint = nft_mint.key() == nft.mint)]
    pub nft_mint: Account<'info, Mint>,

    /// Metadata account of the NFT
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub nft_metadata: AccountInfo<'info>,

    /// Master Edition account of the NFT
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub nft_master_edition: AccountInfo<'info>,

    /// The wallet that holds the authority to execute this instruction
    pub authority: Signer<'info>,

    /// The payer account
    pub payer: Signer<'info>,

    /// NATIVE SYSTEM PROGRAM
    pub system_program: Program<'info, System>,

    /// SPL TOKEN PROGRAM
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,

    /// NATIVE Instructions SYSVAR
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,

    // HIVE CONTROL
    #[account()]
    pub project: Box<Account<'info, Project>>,
    #[account(has_one = authority)]
    pub delegate_authority: Option<Account<'info, DelegateAuthority>>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub vault: AccountInfo<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct SetNFTGeneratedArgs {
    pub new_uri: Option<String>,
}

/// Set NFT is generated
pub fn set_nft_generated(ctx: Context<SetNFTGenerated>, args: SetNFTGeneratedArgs) -> Result<()> {
    let assembler = &ctx.accounts.assembler;
    let nft = &mut ctx.accounts.nft;

    if nft.is_generated {
        return Err(ErrorCode::InitialArtGenerated.into());
    }

    nft.is_generated = true;

    if let Some(new_uri) = args.new_uri {
        nft.uri = new_uri;

        let metadata_account_info = &ctx.accounts.nft_metadata;
        let mut metadata: Metadata = Metadata::from_account_info(metadata_account_info)?;
        metadata.data.uri = nft.uri.clone();

        let assembler_seeds = &[
            b"assembler".as_ref(),
            assembler.collection.as_ref(),
            &[assembler.bump],
        ];
        let assembler_signer = &[&assembler_seeds[..]];

        hpl_utils::update(
            UpdateArgs::V1 {
                new_update_authority: None,
                data: Some(metadata.data),
                primary_sale_happened: None,
                is_mutable: None,
                collection: CollectionToggle::None,
                collection_details: CollectionDetailsToggle::None,
                uses: UsesToggle::None,
                rule_set: RuleSetToggle::None,
                authorization_data: None,
            },
            None,
            None,
            ctx.accounts.nft_mint.to_account_info(),
            ctx.accounts.nft_metadata.to_account_info(),
            ctx.accounts.nft_master_edition.to_account_info(),
            assembler.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.instructions_sysvar.to_account_info(),
            Some(assembler_signer),
        )?;
    }
    Ok(())
}

/// Accounts used in update metadata
#[derive(Accounts)]
pub struct UpdateMetadata<'info> {
    /// Assembler state account
    #[account(has_one = project)]
    pub assembler: Box<Account<'info, Assembler>>,

    /// The nft account
    #[account( has_one = assembler )]
    pub nft: Account<'info, NFT>,

    /// NFT mint account
    #[account(mut, constraint = nft_mint.key() == nft.mint)]
    pub nft_mint: Account<'info, Mint>,

    /// Metadata account of the NFT
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub nft_metadata: AccountInfo<'info>,

    /// Master Edition account of the NFT
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub nft_master_edition: AccountInfo<'info>,

    /// The wallet that holds the authority to execute this instruction
    pub authority: Signer<'info>,

    /// The payer account
    pub payer: Signer<'info>,

    /// NATIVE SYSTEM PROGRAM
    pub system_program: Program<'info, System>,

    /// SPL TOKEN PROGRAM
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,

    /// NATIVE Instructions SYSVAR
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,

    // HIVE CONTROL
    #[account()]
    pub project: Box<Account<'info, Project>>,
    #[account(has_one = authority)]
    pub delegate_authority: Option<Account<'info, DelegateAuthority>>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub vault: AccountInfo<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct UpdateMetadataArgs {
    /// The name of the asset
    pub name: String,
    /// The symbol for the asset
    pub symbol: String,
    /// URI pointing to JSON representing the asset
    pub uri: String,
    /// Royalty basis points that goes to creators in secondary sales (0-10000)
    pub seller_fee_basis_points: u16,
    // Array of creators, optional
    // pub creators: Option<Vec<Creator>>,
}

/// Update metadata
pub fn update_metadata(ctx: Context<UpdateMetadata>, args: UpdateMetadataArgs) -> Result<()> {
    let assembler_seeds = &[
        b"assembler".as_ref(),
        ctx.accounts.assembler.collection.as_ref(),
        &[ctx.accounts.assembler.bump],
    ];
    let assembler_signer = &[&assembler_seeds[..]];

    hpl_utils::update(
        UpdateArgs::V1 {
            new_update_authority: None,
            data: Some(Data {
                name: args.name,
                symbol: args.symbol,
                uri: args.uri,
                seller_fee_basis_points: args.seller_fee_basis_points,
                creators: None,
            }),
            primary_sale_happened: None,
            is_mutable: None,
            collection: CollectionToggle::None,
            collection_details: CollectionDetailsToggle::None,
            uses: UsesToggle::None,
            rule_set: RuleSetToggle::None,
            authorization_data: None,
        },
        None,
        None,
        ctx.accounts.nft_mint.to_account_info(),
        ctx.accounts.nft_metadata.to_account_info(),
        ctx.accounts.nft_master_edition.to_account_info(),
        ctx.accounts.assembler.to_account_info(),
        ctx.accounts.authority.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.instructions_sysvar.to_account_info(),
        Some(assembler_signer),
    )?;

    Ok(())
}
