use {
    crate::{errors::ErrorCode, state::*, traits::Default},
    anchor_lang::{prelude::*, solana_program},
    anchor_spl::token::{self, Approve, Mint, Revoke, Token, TokenAccount},
    mpl_token_metadata::{
        instruction::InstructionBuilder,
        state::{Metadata, TokenMetadataAccount},
    },
};

/// Accounts used in stake instruction
#[derive(Accounts)]
pub struct Stake<'info> {
    /// Project state account
    #[account()]
    pub project: Account<'info, Project>,

    /// Reward token account used as vault
    #[account(
      init, payer = wallet,
      space = NFT::LEN,
      seeds = [
        b"nft",
        nft_mint.key().as_ref(),
      ],
      bump,
    )]
    pub nft: Account<'info, NFT>,

    /// Mint address of the NFT
    #[account(mut)]
    pub nft_mint: Account<'info, Mint>,

    /// Token account of the NFT
    #[account(mut, constraint = nft_account.mint == nft_mint.key() && nft_account.owner == wallet.key())]
    pub nft_account: Account<'info, TokenAccount>,

    /// NFT token metadata
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub nft_metadata: AccountInfo<'info>,

    /// NFT edition
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account()]
    pub nft_edition: AccountInfo<'info>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub wallet: Signer<'info>,

    /// NATIVE SYSTEM PROGRAM
    pub system_program: Program<'info, System>,

    /// NATIVE TOKEN PROGRAM
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,

    /// METAPLEX TOKEN METADATA PROGRAM
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = mpl_token_metadata::ID)]
    pub token_metadata_program: AccountInfo<'info>,

    /// NATIVE CLOCK SYSVAR
    pub clock: Sysvar<'info, Clock>,

    /// NATIVE Instructions SYSVAR
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = solana_program::sysvar::instructions::ID)]
    pub sysvar_instructions: AccountInfo<'info>,
}

/// Stake NFT
pub fn stake(ctx: Context<Stake>) -> Result<()> {
    let metadata_account_info = &ctx.accounts.nft_metadata;
    if metadata_account_info.data_is_empty() {
        msg!("Metadata account is empty");
        return Err(ErrorCode::InvalidMetadata.into());
    }

    let metadata: Metadata = Metadata::from_account_info(metadata_account_info)?;
    if metadata.mint != ctx.accounts.nft_mint.key() {
        msg!("Metadata mint does not match NFT mint");
        return Err(ErrorCode::InvalidMetadata.into());
    }

    if let Some(collection) = metadata.collection {
        if !collection.verified && ctx.accounts.project.collections.contains(&collection.key) {
            if let Some(creators) = metadata.data.creators {
                let found = creators
                    .iter()
                    .position(|x| x.verified && ctx.accounts.project.creators.contains(&x.address));
                if found.is_none() {
                    return Err(ErrorCode::InvalidNFT.into());
                }
            } else {
                msg!("Metadata creators not found");
                return Err(ErrorCode::InvalidMetadata.into());
            }
        }
    } else {
        msg!("Metadata collection not found");
        return Err(ErrorCode::InvalidMetadata.into());
    }

    token::approve(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Approve {
                to: ctx.accounts.nft_account.to_account_info(),
                delegate: ctx.accounts.nft.to_account_info(),
                authority: ctx.accounts.wallet.to_account_info(),
            },
        ),
        1,
    )?;

    let mint_key = ctx.accounts.nft_mint.key();
    let nft_seeds = &[b"nft".as_ref(), mint_key.as_ref(), &[ctx.bumps["nft"]]];
    let nft_signer = &[&nft_seeds[..]];

    let lock_ix = mpl_token_metadata::instruction::builders::LockBuilder::new()
        .authority(ctx.accounts.nft.key())
        .token_owner(ctx.accounts.wallet.key())
        .token(ctx.accounts.nft_account.key())
        .mint(ctx.accounts.nft_mint.key())
        .metadata(ctx.accounts.nft_metadata.key())
        .edition(ctx.accounts.nft_edition.key())
        .payer(ctx.accounts.wallet.key())
        .system_program(ctx.accounts.system_program.key())
        .sysvar_instructions(ctx.accounts.sysvar_instructions.key())
        .spl_token_program(ctx.accounts.token_program.key())
        .build(mpl_token_metadata::instruction::LockArgs::V1 {
            authorization_data: None,
        })
        .unwrap()
        .instruction();

    solana_program::program::invoke_signed(
        &lock_ix,
        &[
            ctx.accounts.nft.to_account_info(),
            ctx.accounts.wallet.to_account_info(),
            ctx.accounts.nft_account.to_account_info(),
            ctx.accounts.nft_mint.to_account_info(),
            ctx.accounts.nft_metadata.to_account_info(),
            ctx.accounts.nft_edition.to_account_info(),
            ctx.accounts.wallet.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.sysvar_instructions.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
        ],
        nft_signer,
    )?;

    let nft = &mut ctx.accounts.nft;
    nft.set_defaults();

    nft.bump = ctx.bumps["nft"];
    nft.project = ctx.accounts.project.key();
    nft.staker = ctx.accounts.wallet.key();
    nft.mint = ctx.accounts.nft_mint.key();
    nft.last_claim = ctx.accounts.clock.unix_timestamp;

    Ok(())
}

/// Accounts used in unstake instruction
#[derive(Accounts)]
pub struct Unstake<'info> {
    /// Reward token account used as vault
    #[account(mut, constraint = nft.staker == wallet.key(), close = wallet)]
    pub nft: Account<'info, NFT>,

    /// Mint address of the NFT
    #[account(mut, constraint = nft_mint.key() == nft.mint)]
    pub nft_mint: Account<'info, Mint>,

    /// Token account of the NFT
    #[account(mut, constraint = nft_account.mint == nft_mint.key() && nft_account.owner == wallet.key())]
    pub nft_account: Account<'info, TokenAccount>,

    /// NFT token metadata
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub nft_metadata: AccountInfo<'info>,

    /// NFT edition
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account()]
    pub nft_edition: AccountInfo<'info>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub wallet: Signer<'info>,

    /// NATIVE SYSTEM PROGRAM
    pub system_program: Program<'info, System>,

    /// NATIVE TOKEN PROGRAM
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,

    /// METAPLEX TOKEN METADATA PROGRAM
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = mpl_token_metadata::ID)]
    pub token_metadata_program: AccountInfo<'info>,

    /// NATIVE CLOCK SYSVAR
    pub clock: Sysvar<'info, Clock>,

    /// NATIVE Instructions SYSVAR
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = solana_program::sysvar::instructions::ID)]
    pub sysvar_instructions: AccountInfo<'info>,
}

/// Unstake NFT
pub fn unstake(ctx: Context<Unstake>) -> Result<()> {
    let mint_key = ctx.accounts.nft_mint.key();
    let nft_seeds = &[b"nft".as_ref(), mint_key.as_ref(), &[ctx.accounts.nft.bump]];
    let nft_signer = &[&nft_seeds[..]];

    let unlock_ix = mpl_token_metadata::instruction::builders::UnlockBuilder::new()
        .authority(ctx.accounts.nft.key())
        .token_owner(ctx.accounts.wallet.key())
        .token(ctx.accounts.nft_account.key())
        .mint(ctx.accounts.nft_mint.key())
        .metadata(ctx.accounts.nft_metadata.key())
        .edition(ctx.accounts.nft_edition.key())
        .payer(ctx.accounts.wallet.key())
        .system_program(ctx.accounts.system_program.key())
        .sysvar_instructions(ctx.accounts.sysvar_instructions.key())
        .spl_token_program(ctx.accounts.token_program.key())
        .build(mpl_token_metadata::instruction::UnlockArgs::V1 {
            authorization_data: None,
        })
        .unwrap()
        .instruction();

    solana_program::program::invoke_signed(
        &unlock_ix,
        &[
            ctx.accounts.nft.to_account_info(),
            ctx.accounts.wallet.to_account_info(),
            ctx.accounts.nft_account.to_account_info(),
            ctx.accounts.nft_mint.to_account_info(),
            ctx.accounts.nft_metadata.to_account_info(),
            ctx.accounts.nft_edition.to_account_info(),
            ctx.accounts.wallet.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.sysvar_instructions.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
        ],
        nft_signer,
    )?;

    token::revoke(CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Revoke {
            source: ctx.accounts.nft_account.to_account_info(),
            authority: ctx.accounts.wallet.to_account_info(),
        },
    ))?;

    Ok(())
}
