use {
    crate::{
        errors::ErrorCode,
        structs::{
            Assembler, AssemblingAction, Block, BlockDefinition, BlockDefinitionValue,
            NFTAttribute, NFTAttributeValue, NFTUniqueConstraint, NFT,
        },
        utils::{
            create_master_edition, create_metadata, set_and_verify_collection, update_metadata,
            BpfWriter,
        },
    },
    anchor_lang::{prelude::*, solana_program},
    anchor_spl::token::{
        self, Approve, Burn, CloseAccount, Mint, MintTo, Revoke, Token, TokenAccount, Transfer,
    },
    mpl_token_metadata::{
        self,
        state::{Metadata, TokenMetadataAccount},
    },
};

/// Accounts used in the create nft instruction
#[derive(Accounts)]
pub struct CreateNFT<'info> {
    /// Assembler state account
    #[account(mut)]
    pub assembler: Account<'info, Assembler>,

    /// The collection mint of the assembler
    #[account(mut, constraint = collection_mint.key() == assembler.collection)]
    pub collection_mint: Account<'info, Mint>,

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

    create_metadata(
        nft.name.clone(),
        nft.symbol.clone(),
        nft.uri.clone(),
        0,
        None,
        // Some(vec![mpl_token_metadata::state::Creator {
        //     address: assembler.authority,
        //     verified: true,
        //     share: 100,
        // }]),
        None,
        None,
        None,
        assembler.to_account_info(),
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.nft_mint.to_account_info(),
        ctx.accounts.nft_metadata.clone(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.token_metadata_program.to_account_info(),
        ctx.accounts.rent.to_account_info(),
        Some(assembler_signer),
    )?;

    set_and_verify_collection(
        ctx.accounts.nft_metadata.clone(),
        ctx.accounts.collection_mint.to_account_info(),
        ctx.accounts.collection_metadata_account.clone(),
        ctx.accounts.collection_master_edition.clone(),
        assembler.to_account_info(),
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.token_metadata_program.clone(),
        Some(assembler_signer),
    )?;

    // let create_metadata = mpl_token_metadata::instruction::create_metadata_accounts_v3(
    //     ctx.accounts.token_metadata_program.key(),
    //     ctx.accounts.nft_metadata.key(),
    //     nft.mint,
    //     assembler_key,
    //     ctx.accounts.payer.key(),
    //     assembler_key,
    //     nft.name.clone(),
    //     nft.symbol.clone(),
    //     nft.uri.clone(),
    //     None,
    //     0,
    //     false,
    //     true,
    //     None,
    //     // Some(mpl_token_metadata::state::Collection {
    //     //     key: assembler.collection,
    //     //     verified: false,
    //     // }),
    //     None,
    //     None,
    // );

    // solana_program::program::invoke_signed(
    //     &create_metadata,
    //     &[
    //         ctx.accounts.nft_metadata.clone(),
    //         ctx.accounts.nft_mint.to_account_info(),
    //         assembler.to_account_info(),
    //         ctx.accounts.payer.to_account_info(),
    //         assembler.to_account_info(),
    //         ctx.accounts.system_program.to_account_info(),
    //         ctx.accounts.rent.to_account_info(),
    //     ],
    //     assembler_signer,
    // )?;

    // let verify_collection = mpl_token_metadata::instruction::set_and_verify_collection(
    //     ctx.accounts.token_metadata_program.key(),
    //     ctx.accounts.nft_metadata.key(),
    //     assembler.key(),
    //     ctx.accounts.payer.key(),
    //     assembler.key(),
    //     ctx.accounts.collection_mint.key(),
    //     ctx.accounts.collection_metadata_account.key(),
    //     ctx.accounts.collection_master_edition.key(),
    //     None,
    // );

    // solana_program::program::invoke_signed(
    //     &verify_collection,
    //     &[
    //         ctx.accounts.nft_metadata.clone(),
    //         assembler.to_account_info(),
    //         ctx.accounts.payer.to_account_info(),
    //         ctx.accounts.collection_mint.to_account_info(),
    //         ctx.accounts.collection_metadata_account.clone(),
    //         ctx.accounts.collection_master_edition.clone(),
    //     ],
    //     assembler_signer,
    // )?;

    Ok(())
}

/// Accounts used in the add block instruction
#[derive(Accounts)]
pub struct AddBlock<'info> {
    /// Assembler state account
    #[account()]
    pub assembler: Account<'info, Assembler>,

    /// NFT account
    #[account(mut, has_one = assembler, has_one = authority)]
    pub nft: Account<'info, NFT>,

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
    #[account()]
    pub token_metadata: AccountInfo<'info>,

    /// Attribute token edition
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account()]
    pub token_edition: AccountInfo<'info>,

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

    /// METAPLEX TOKEN METADATA PROGRAM
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: AccountInfo<'info>,

    /// SYSVAR RENT
    pub rent: Sysvar<'info, Rent>,
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

    let index = nft.attributes.iter().position(|r| r.block == block.key());
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
            token::approve(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Approve {
                        to: ctx.accounts.token_account.to_account_info(),
                        delegate: assembler.to_account_info(),
                        authority: ctx.accounts.authority.to_account_info(),
                    },
                ),
                1 * 10u64.pow(token_mint.decimals.into()),
            )?;

            let assembler_seeds = &[
                b"assembler".as_ref(),
                assembler.collection.as_ref(),
                &[assembler.bump],
            ];
            let assembler_signer = &[&assembler_seeds[..]];

            solana_program::program::invoke_signed(
                &mpl_token_metadata::instruction::freeze_delegated_account(
                    ctx.accounts.token_metadata_program.key(),
                    assembler.key(),
                    ctx.accounts.token_account.key(),
                    ctx.accounts.token_edition.key(),
                    token_mint.key(),
                ),
                &[
                    assembler.to_account_info(),
                    ctx.accounts.token_account.to_account_info(),
                    ctx.accounts.token_edition.to_account_info(),
                    ctx.accounts.token_mint.to_account_info(),
                    ctx.accounts.token_program.to_account_info(),
                ],
                assembler_signer,
            )?;
        }
        AssemblingAction::TakeCustody => {
            if let Some(deposit_account) = &ctx.accounts.deposit_account {
                token::transfer(
                    CpiContext::new(
                        ctx.accounts.token_program.to_account_info(),
                        Transfer {
                            from: ctx.accounts.token_account.to_account_info(),
                            to: deposit_account.to_account_info(),
                            authority: ctx.accounts.authority.to_account_info(),
                        },
                    ),
                    1 * 10u64.pow(token_mint.decimals.into()),
                )?;
            } else {
                return Err(ErrorCode::DepositAccountNotProvided.into());
            }
        }
    }

    let nft_attribute = NFTAttribute {
        block: block.key(),
        mint: token_mint.key(),
        order: block.block_order,
        attribute_name: block.block_name.clone(),
        block_definition: block_definition.key(),
        attribute_value,
    };

    NFT::reallocate(
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
    #[account()]
    pub assembler: Account<'info, Assembler>,

    /// NFT account
    #[account( mut, has_one = authority, has_one = assembler )]
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

    /// NFT token account
    #[account(mut, constraint = token_account.mint == nft_mint.key() && token_account.owner == authority.key())]
    pub token_account: Box<Account<'info, TokenAccount>>,

    /// NFT unique constraint
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub unique_constraint: Option<AccountInfo<'info>>,
    // #[account(
    //     init, payer = payer,
    //     space = NFTUniqueConstraint::LEN,
    //     seeds = nft.attributes.iter().map(|x| x.mint.as_ref()).collect::<Vec<_>>()[..],
    //     bump,
    // )]
    // pub unique_constraint: Option<Account<'info, NFTUniqueConstraint>>,
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

    /// METAPLEX TOKEN METADATA PROGRAM
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: AccountInfo<'info>,

    /// SYSVAR RENT
    pub rent: Sysvar<'info, Rent>,
}

/// Create a new nft
pub fn mint_nft(ctx: Context<MintNFT>) -> Result<()> {
    let assembler = &ctx.accounts.assembler;
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

            let mut seeds = nft
                .attributes
                .iter()
                .map(|x| [x.block_definition.as_ref(), x.mint.as_ref()])
                .flatten()
                .collect::<Vec<_>>();

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

            let mut dst_ref = unique_constraint_info.try_borrow_mut_data()?;
            let dst = dst_ref.as_mut();
            let mut writer = BpfWriter::new(dst);

            let unique_constraint = NFTUniqueConstraint {
                bump,
                nft: nft.key(),
            };

            unique_constraint.try_serialize(&mut writer)?;

            // let new_data = &unique_constraint.try_to_vec()?[..];
            // let mut dst_ref = unique_constraint_info.try_borrow_mut_data()?;
            // let dst = dst_ref.as_mut();
            // solana_program::program_memory::sol_memcpy(dst, new_data, NFTUniqueConstraint::LEN)
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

    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.nft_mint.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: assembler.to_account_info(),
            },
            assembler_signer,
        ),
        1,
    )?;

    nft.minted = true;

    if ctx.accounts.nft_master_edition.data_is_empty() {
        create_master_edition(
            ctx.accounts.nft_mint.to_account_info(),
            ctx.accounts.nft_metadata.to_account_info(),
            ctx.accounts.nft_master_edition.clone(),
            assembler.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.token_metadata_program.clone(),
            ctx.accounts.rent.to_account_info(),
            Some(assembler_signer),
        )?;
    }

    // let create_master_edition = mpl_token_metadata::instruction::create_master_edition_v3(
    //     ctx.accounts.token_metadata_program.key(),
    //     ctx.accounts.nft_master_edition.key(),
    //     ctx.accounts.nft_mint.key(),
    //     assembler.key(),
    //     assembler.key(),
    //     ctx.accounts.nft_metadata.key(),
    //     ctx.accounts.payer.key(),
    //     Some(0),
    // );

    // solana_program::program::invoke_signed(
    //     &create_master_edition,
    //     &[
    //         ctx.accounts.nft_master_edition.clone(),
    //         ctx.accounts.nft_mint.to_account_info(),
    //         assembler.to_account_info(),
    //         assembler.to_account_info(),
    //         ctx.accounts.payer.to_account_info(),
    //         ctx.accounts.nft_metadata.to_account_info(),
    //         ctx.accounts.token_program.to_account_info(),
    //         ctx.accounts.system_program.to_account_info(),
    //         ctx.accounts.rent.to_account_info(),
    //     ],
    //     assembler_signer,
    // )?;

    Ok(())
}

/// Accounts used in the burn nft instruction
#[derive(Accounts)]
pub struct BurnNFT<'info> {
    /// Assembler state account
    #[account()]
    pub assembler: Account<'info, Assembler>,

    /// NFT account
    #[account(mut, has_one = authority, has_one = assembler)]
    pub nft: Account<'info, NFT>,

    /// NFT mint account
    #[account(mut, constraint = nft_mint.key() == nft.mint)]
    pub nft_mint: Account<'info, Mint>,

    /// Metadata account of the NFT
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub nft_metadata: AccountInfo<'info>,

    /// NFT token account
    #[account(mut, constraint = token_account.mint == nft_mint.key() && token_account.owner == authority.key())]
    pub token_account: Account<'info, TokenAccount>,

    /// NFT unique constraint
    #[account(mut, has_one = nft, close = authority)]
    pub unique_constraint: Option<Account<'info, NFTUniqueConstraint>>,

    /// The wallet that holds the pre mint authority over this NFT
    pub authority: Signer<'info>,

    /// SPL TOKEN PROGRAM
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,

    /// METAPLEX TOKEN METADATA PROGRAM
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: AccountInfo<'info>,
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

    update_metadata(
        Some(metadata.data),
        metadata_account_info.clone(),
        assembler.to_account_info(),
        Some(true),
        ctx.accounts.token_metadata_program.clone(),
        Some(assembler_signer),
    )?;

    nft.minted = false;

    Ok(())
}

/// Accounts used in the remove block instruction
#[derive(Accounts)]
pub struct RemoveBlock<'info> {
    /// Assembler state account
    #[account(mut)]
    pub assembler: Account<'info, Assembler>,

    /// NFT account
    #[account(mut, has_one = assembler, has_one = authority)]
    pub nft: Account<'info, NFT>,

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
    #[account()]
    pub token_metadata: AccountInfo<'info>,

    /// Burning token edition
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account()]
    pub token_edition: AccountInfo<'info>,

    /// The account that will hold the nft sent on expedition
    #[account(
        mut,
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

    // /// NFT Attribute
    // #[account(mut, has_one = nft)]
    // pub nft_attribute: Box<Account<'info, NFTAttribute>>,
    /// The wallet that has pre mint authority over this NFT
    #[account(mut)]
    pub authority: Signer<'info>,

    /// SPL TOKEN PROGRAM
    pub token_program: Program<'info, Token>,

    /// METAPLEX TOKEN METADATA PROGRAM
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: AccountInfo<'info>,

    /// SYSTEM PROGRAM
    pub system_program: Program<'info, System>,

    /// RENT PROGRAM
    pub rent: Sysvar<'info, Rent>,
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
            solana_program::program::invoke_signed(
                &mpl_token_metadata::instruction::thaw_delegated_account(
                    ctx.accounts.token_metadata_program.key(),
                    assembler.key(),
                    ctx.accounts.token_account.key(),
                    ctx.accounts.token_edition.key(),
                    token_mint.key(),
                ),
                &[
                    assembler.to_account_info(),
                    ctx.accounts.token_account.to_account_info(),
                    ctx.accounts.token_edition.to_account_info(),
                    ctx.accounts.token_mint.to_account_info(),
                    ctx.accounts.token_program.to_account_info(),
                ],
                assembler_signer,
            )?;

            token::revoke(CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Revoke {
                    source: ctx.accounts.token_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ))?;
        }
        AssemblingAction::TakeCustody => {
            if let Some(deposit_account) = &ctx.accounts.deposit_account {
                token::transfer(
                    CpiContext::new_with_signer(
                        ctx.accounts.token_program.to_account_info(),
                        Transfer {
                            from: deposit_account.to_account_info(),
                            to: ctx.accounts.token_account.to_account_info(),
                            authority: assembler.to_account_info(),
                        },
                        assembler_signer,
                    ),
                    1 * 10u64.pow(token_mint.decimals.into()),
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
            } else {
                return Err(ErrorCode::DepositAccountNotProvided.into());
            }
        }
    }

    let index = nft.attributes.iter().position(|r| r.block == block.key());
    if let Some(index) = index {
        NFT::reallocate(
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

    // // Close nft attribute
    // let source = ctx.accounts.nft_attribute.to_account_info();
    // let destination = ctx.accounts.authority.to_account_info();

    // **destination.lamports.borrow_mut() = destination
    //     .lamports()
    //     .checked_add(source.lamports())
    //     .ok_or(ErrorCode::Overflow)?;

    // let mut source_account_data = source.data.borrow_mut();
    // **source.lamports.borrow_mut() = 0;
    // let data_len = source_account_data.len();
    // solana_program::program_memory::sol_memset(*source_account_data, 0, data_len);

    Ok(())
}

/// Accounts used in set nft generated instruction
#[derive(Accounts)]
pub struct SetNFTGenerated<'info> {
    /// Assembler state account
    #[account(mut)]
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

    /// Metadata account of the NFT
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub nft_metadata: AccountInfo<'info>,

    /// METAPLEX TOKEN METADATA PROGRAM
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: AccountInfo<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct SetNFTGeneratedArgs {
    pub new_uri: Option<String>,
}

/// Set NFT is generated
pub fn set_nft_generated(ctx: Context<SetNFTGenerated>, args: SetNFTGeneratedArgs) -> Result<()> {
    let assembler = &mut ctx.accounts.assembler;
    let nft = &mut ctx.accounts.nft;
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

        update_metadata(
            Some(metadata.data),
            metadata_account_info.clone(),
            assembler.to_account_info(),
            Some(true),
            ctx.accounts.token_metadata_program.clone(),
            Some(assembler_signer),
        )?;

        // let update_metadata = mpl_token_metadata::instruction::update_metadata_accounts(
        //     ctx.accounts.token_metadata_program.key(),
        //     ctx.accounts.nft_metadata.key(),
        //     assembler.key(),
        //     None,
        //     Some(metadata.data),
        //     Some(true),
        // );

        // solana_program::program::invoke_signed(
        //     &update_metadata,
        //     &[
        //         ctx.accounts.nft_metadata.clone(),
        //         assembler.to_account_info(),
        //     ],
        //     assembler_signer,
        // )?;
    }
    Ok(())
}
