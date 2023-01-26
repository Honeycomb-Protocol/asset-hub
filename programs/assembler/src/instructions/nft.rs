use crate::{
    errors::ErrorCode,
    structs::{
        Assembler, AssemblingAction, Block, BlockDefinition, BlockDefinitionValue, NFTAttribute,
        NFTAttributeValue, NFTMinted, NFT,
    },
    utils::EXTRA_SIZE,
};
use anchor_lang::{prelude::*, solana_program};
use anchor_spl::token::{
    self, Approve, Burn, CloseAccount, Mint, MintTo, Revoke, Token, TokenAccount, Transfer,
};
use mpl_token_metadata::{
    self,
    state::{Metadata, TokenMetadataAccount},
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
        space = EXTRA_SIZE + NFT::LEN,
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
    pub token_metadata_program: UncheckedAccount<'info>,

    /// SYSVAR RENT
    pub rent: Sysvar<'info, Rent>,
}

/// Create a new nft
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub struct CreateNFTArgs {
    pub name: String,
    pub symbol: String,
    pub description: String,
}
pub fn create_nft(ctx: Context<CreateNFT>, args: CreateNFTArgs) -> Result<()> {
    let assembler = &mut ctx.accounts.assembler;
    let assembler_key = assembler.key();
    assembler.nfts += 1;

    let nft = &mut ctx.accounts.nft;
    nft.bump = ctx.bumps["nft"];
    nft.assembler = assembler.key();
    nft.authority = ctx.accounts.authority.key();
    nft.collection_address = assembler.collection;
    nft.mint = ctx.accounts.nft_mint.key();
    nft.name = args.name;
    nft.symbol = args.symbol;
    nft.description = args.description;
    nft.minted = false;
    nft.id = assembler.nfts;
    nft.uri = format!("{}/{}.json", assembler.nft_base_uri, nft.mint.to_string());
    nft.is_generated = false;

    let assembler_seeds = &[
        b"assembler".as_ref(),
        assembler.collection.as_ref(),
        &[assembler.bump],
    ];
    let assembler_signer = &[&assembler_seeds[..]];

    let create_metadata = mpl_token_metadata::instruction::create_metadata_accounts_v3(
        ctx.accounts.token_metadata_program.key(),
        ctx.accounts.nft_metadata.key(),
        nft.mint,
        assembler_key,
        ctx.accounts.payer.key(),
        assembler_key,
        format!("{} #{}", assembler.collection_name, nft.id),
        assembler.collection_symbol.clone(),
        nft.uri.clone(),
        None,
        0,
        false,
        true,
        Some(mpl_token_metadata::state::Collection {
            key: assembler.collection,
            verified: false,
        }),
        None,
        None,
    );

    solana_program::program::invoke_signed(
        &create_metadata,
        &[
            ctx.accounts.nft_metadata.clone(),
            ctx.accounts.nft_mint.to_account_info(),
            assembler.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            assembler.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ],
        assembler_signer,
    )?;
    // @TODO: Add the nft to the collection code below is not working for some reason
    // mpl_token_metadata::instruction::verify_collection(
    //     ctx.accounts.token_metadata_program.key(),
    //     ctx.accounts.nft_metadata.key(),
    //     assembler_key,
    //     ctx.accounts.payer.key(),
    //     assembler_key,
    //     // ctx.accounts.collection_mint.key(),
    //     ctx.accounts.collection_metadata_account.key(),
    //     ctx.accounts.collection_master_edition.key(),
    //     None,
    // );

    // solana_program::program::invoke_signed(
    //     &create_metadata,
    //     &[
    //         ctx.accounts.nft_metadata.clone(),
    //         assembler.to_account_info(),
    //         ctx.accounts.payer.to_account_info(),
    //         assembler.to_account_info(),
    //         // ctx.accounts.collection_mint.to_account_info(),
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
    #[account(has_one = assembler, has_one = authority)]
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
            token_mint.key().as_ref()
        ],
        bump,
        token::mint = token_mint,
        token::authority = assembler,
    )]
    pub deposit_account: Option<Account<'info, TokenAccount>>,

    /// NFT Attribute
    #[account(
        init, payer = payer,
        space = EXTRA_SIZE + NFTAttribute::LEN,
        seeds = [
            b"nft_attribute".as_ref(),
            block.key().as_ref(),
            nft.mint.as_ref(),
        ],
        bump,
    )]
    pub nft_attribute: Box<Account<'info, NFTAttribute>>,

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
    pub token_metadata_program: UncheckedAccount<'info>,
}

/// Create a new nft
pub fn add_block(ctx: Context<AddBlock>) -> Result<()> {
    if ctx.accounts.nft.minted {
        return Err(ErrorCode::NFTAlreadyMinted.into());
    }

    let assembler = &ctx.accounts.assembler;
    let block = &ctx.accounts.block;
    let block_definition = &ctx.accounts.block_definition;
    let token_mint = &ctx.accounts.token_mint;

    let nft_attribute = &mut ctx.accounts.nft_attribute;
    nft_attribute.bump = ctx.bumps["nft_attribute"];
    nft_attribute.nft = ctx.accounts.nft.key();
    nft_attribute.block = block.key();
    nft_attribute.mint = token_mint.key();
    nft_attribute.order = block.block_order;
    nft_attribute.attribute_name = block.block_name.clone();
    nft_attribute.block_definition = block_definition.key();

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

            nft_attribute.attribute_value = NFTAttributeValue::String {
                value: value.clone(),
            };
        }
        BlockDefinitionValue::Number { min, max } => {
            if block_definition.mint != token_mint.key() {
                return Err(ErrorCode::InvalidTokenForBlockDefinition.into());
            }

            let value = (min + max) / 2;
            nft_attribute.attribute_value = NFTAttributeValue::Number { value };
        }
        BlockDefinitionValue::Boolean { value } => {
            if block_definition.mint != token_mint.key() {
                return Err(ErrorCode::InvalidTokenForBlockDefinition.into());
            }

            nft_attribute.attribute_value = NFTAttributeValue::Boolean {
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
                    1,
                )?;
            } else {
                return Err(ErrorCode::DepositAccountNotProvided.into());
            }
        }
    }

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

    /// NFT token account
    #[account(mut, constraint = token_account.mint == nft_mint.key() && token_account.owner == authority.key())]
    pub token_account: Account<'info, TokenAccount>,

    /// The wallet that has pre mint authority over this NFT
    #[account(mut)]
    pub authority: Signer<'info>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub payer: Signer<'info>,

    /// SPL TOKEN PROGRAM
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
}

/// Create a new nft
pub fn mint_nft(ctx: Context<MintNFT>) -> Result<()> {
    let nft = &mut ctx.accounts.nft;

    if nft.minted {
        return Err(ErrorCode::NFTAlreadyMinted.into());
    }

    let assembler = &ctx.accounts.assembler;
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

    emit!(NFTMinted { nft: nft.key() });

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

    /// NFT token account
    #[account(mut, constraint = token_account.mint == nft_mint.key() && token_account.owner == authority.key())]
    pub token_account: Account<'info, TokenAccount>,

    /// The wallet that holds the pre mint authority over this NFT
    pub authority: Signer<'info>,

    /// SPL TOKEN PROGRAM
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
}

/// Burn a nft
pub fn burn_nft(ctx: Context<BurnNFT>) -> Result<()> {
    let nft = &mut ctx.accounts.nft;

    if !nft.minted {
        return Err(ErrorCode::NFTNotMinted.into());
    }

    if ctx.accounts.assembler.assembling_action == AssemblingAction::Burn {
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
    #[account(has_one = assembler, has_one = authority)]
    pub nft: Account<'info, NFT>,

    /// Block account
    #[account(has_one = assembler)]
    pub block: Account<'info, Block>,

    /// Block definition account
    #[account(has_one = block)]
    pub block_definition: Account<'info, BlockDefinition>,

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
            token_mint.key().as_ref()
        ],
        bump,
        token::mint = token_mint,
        token::authority = assembler,
    )]
    pub deposit_account: Option<Account<'info, TokenAccount>>,

    /// NFT Attribute
    #[account(mut, has_one = nft)]
    pub nft_attribute: Box<Account<'info, NFTAttribute>>,

    /// The wallet that has pre mint authority over this NFT
    #[account(mut)]
    pub authority: Signer<'info>,

    /// SPL TOKEN PROGRAM
    pub token_program: Program<'info, Token>,

    /// METAPLEX TOKEN METADATA PROGRAM
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: UncheckedAccount<'info>,
}

/// Create a new nft
pub fn remove_block(ctx: Context<RemoveBlock>) -> Result<()> {
    let assembler = &ctx.accounts.assembler;
    let block_definition = &ctx.accounts.block_definition;
    let token_mint = &ctx.accounts.token_mint;

    if ctx.accounts.nft.minted {
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
                    1,
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

    // Close nft attribute
    let source = ctx.accounts.nft_attribute.to_account_info();
    let destination = ctx.accounts.authority.to_account_info();

    **destination.lamports.borrow_mut() = destination
        .lamports()
        .checked_add(source.lamports())
        .ok_or(ErrorCode::Overflow)?;

    let mut source_account_data = source.data.borrow_mut();
    **source.lamports.borrow_mut() = 0;
    let data_len = source_account_data.len();
    solana_program::program_memory::sol_memset(*source_account_data, 0, data_len);

    Ok(())
}

/// Accounts used in set nft generated instruction
#[derive(Accounts)]
pub struct SetNFTGenerated<'info> {
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
}

/// Set NFT is generated
pub fn set_nft_generated(ctx: Context<SetNFTGenerated>) -> Result<()> {
    let nft = &mut ctx.accounts.nft;
    nft.is_generated = true;
    Ok(())
}
