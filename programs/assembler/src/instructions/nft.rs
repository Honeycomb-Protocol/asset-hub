use crate::{
    errors::ErrorCode,
    structs::{
        Assembler, AssemblingAction, Block, BlockDefinitionBoolean, BlockDefinitionEnum,
        BlockDefinitionNumber, BlockType, NFTAttribute, NFT,
    },
    utils::EXTRA_SIZE,
};
use anchor_lang::{prelude::*, solana_program};
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};
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

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreateNFTArgs {
    pub image: String,
    pub uri: String,
}

/// Create a new nft
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
    nft.id = assembler.nfts;
    nft.name = format!("{} #{}", assembler.collection_name, nft.id);
    nft.symbol = assembler.collection_symbol.clone();
    nft.description = assembler.collection_description.clone();
    nft.image = args.image;

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
        nft.name.clone(),
        nft.symbol.clone(),
        args.uri,
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
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account()]
    pub block_definition: AccountInfo<'info>,
    // /// Block definition account
    // #[account(has_one = block)]
    // pub block_definition_enum: Option<Account<'info, BlockDefinitionEnum>>,

    // /// Block definition account
    // #[account(has_one = block)]
    // pub block_definition_number: Option<Account<'info, BlockDefinitionNumber>>,

    // /// Block definition account
    // #[account(has_one = block)]
    // pub block_definition_boolean: Option<Account<'info, BlockDefinitionBoolean>>,
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
}

/// Create a new nft
pub fn add_block(ctx: Context<AddBlock>) -> Result<()> {
    let assembler = &ctx.accounts.assembler;
    let block = &ctx.accounts.block;

    let block_defintion_info = &ctx.accounts.block_definition;
    let block_defintion_buf_ref = block_defintion_info.try_borrow_data()?;
    let block_defintion_buf = &mut block_defintion_buf_ref.as_ref();

    let attribute_value: String;

    if block.block_type == BlockType::Enum {
        if let Ok(block_defintion) = BlockDefinitionEnum::try_deserialize(block_defintion_buf) {
            if block_defintion.block != block.key() {
                return Err(ErrorCode::InvalidBlockDefinition.into());
            }

            let token_mint = &ctx.accounts.token_mint;
            if block_defintion.is_collection {
                let metadata_account_info = &ctx.accounts.token_metadata;
                if metadata_account_info.data_is_empty() {
                    return Err(ErrorCode::InvalidMetadata.into());
                }

                let metadata: Metadata = Metadata::from_account_info(metadata_account_info)?;
                if metadata.mint != token_mint.key() {
                    return Err(ErrorCode::InvalidMetadata.into());
                }

                if let Some(collection) = metadata.collection {
                    if !collection.verified && collection.key != block_defintion.mint {
                        return Err(ErrorCode::InvalidTokenForBlockDefinition.into());
                    }
                } else {
                    return Err(ErrorCode::InvalidMetadata.into());
                }
            } else {
                if block_defintion.mint != token_mint.key() {
                    return Err(ErrorCode::InvalidTokenForBlockDefinition.into());
                }
            }

            if assembler.assembling_action == AssemblingAction::Burn {
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

            attribute_value = block_defintion.value;
        } else {
            return Err(ErrorCode::InvalidBlockDefinition.into());
        }
    } else if block.block_type == BlockType::Random || block.block_type == BlockType::Computed {
        if let Ok(block_defintion) = BlockDefinitionNumber::try_deserialize(block_defintion_buf) {
            if block_defintion.block != block.key() {
                return Err(ErrorCode::InvalidBlockDefinition.into());
            }

            attribute_value = "number".to_string();
        } else {
            return Err(ErrorCode::InvalidBlockDefinition.into());
        }
    } else if block.block_type == BlockType::Boolean {
        if let Ok(block_defintion) = BlockDefinitionBoolean::try_deserialize(block_defintion_buf) {
            if block_defintion.block != block.key() {
                return Err(ErrorCode::InvalidBlockDefinition.into());
            }

            attribute_value = "boolean".to_string();
        } else {
            return Err(ErrorCode::InvalidBlockDefinition.into());
        }
    } else {
        return Err(ErrorCode::InvalidBlockType.into());
    }

    let nft_attribute = &mut ctx.accounts.nft_attribute;
    nft_attribute.bump = ctx.bumps["nft_attribute"];
    nft_attribute.nft = ctx.accounts.nft.key();
    nft_attribute.block = block.key();
    nft_attribute.attribute_name = block.block_name.clone();
    nft_attribute.block_definition = block_defintion_info.key();
    nft_attribute.attribute_value = attribute_value;

    // if let Some(block_definition) = &ctx.accounts.block_definition_enum {
    //     nft_attribute.block_definition = block_definition.key();
    //     nft_attribute.attribute_value = block_definition.value.clone();

    //     if block_definition.is_collection {
    //         let metadata_account_info = &ctx.accounts.token_metadata;
    //         if metadata_account_info.data_is_empty() {
    //             return Err(ErrorCode::InvalidMetadata.into());
    //         }

    //         let metadata: Metadata = Metadata::from_account_info(metadata_account_info)?;
    //         if metadata.mint != ctx.accounts.token_mint.key() {
    //             return Err(ErrorCode::InvalidMetadata.into());
    //         }

    //         if let Some(collection) = metadata.collection {
    //             if !collection.verified && collection.key != block_definition.mint {
    //                 return Err(ErrorCode::InvalidTokenForBlockDefinition.into());
    //             }
    //         } else {
    //             return Err(ErrorCode::InvalidMetadata.into());
    //         }
    //     } else {
    //         if block_definition.mint != ctx.accounts.token_mint.key() {
    //             return Err(ErrorCode::InvalidTokenForBlockDefinition.into());
    //         }
    //     }

    //     if assembler.assembling_action == AssemblingAction::Burn {
    //         token::burn(
    //             CpiContext::new(
    //                 ctx.accounts.token_program.to_account_info(),
    //                 token::Burn {
    //                     mint: ctx.accounts.token_mint.to_account_info(),
    //                     from: ctx.accounts.token_account.to_account_info(),
    //                     authority: ctx.accounts.wallet.to_account_info(),
    //                 },
    //             ),
    //             1,
    //         )?;
    //     }
    // } else if let Some(block_definition) = &ctx.accounts.block_definition_number {
    //     nft_attribute.block_definition = block_definition.key();
    //     nft_attribute.attribute_value = "number".to_string();
    // } else if let Some(block_definition) = &ctx.accounts.block_definition_boolean {
    //     nft_attribute.block_definition = block_definition.key();
    //     nft_attribute.attribute_value = "boolean".to_string();
    // } else {
    //     return Err(ErrorCode::InvalidBlockDefinition.into());
    // }

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

    Ok(())
}
