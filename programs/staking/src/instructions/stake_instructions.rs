use {
    crate::{errors::ErrorCode, state::*, traits::Default, utils},
    anchor_lang::{prelude::*, solana_program},
    anchor_spl::token::{self, Approve, Mint, Token, TokenAccount},
    mpl_token_metadata::{
        instruction::{DelegateArgs, RevokeArgs},
        state::{Metadata, TokenMetadataAccount},
    },
};

/// Accounts used in init NFT instruction
#[derive(Accounts)]
pub struct InitNFT<'info> {
    /// Project state account
    #[account()]
    pub project: Account<'info, Project>,

    /// NFT state account
    #[account(
        init, payer = wallet,
        space = NFT::LEN,
        seeds = [
          b"nft",
          nft_mint.key().as_ref(),
          project.key().as_ref(),
        ],
        bump,
      )]
    pub nft: Account<'info, NFT>,

    /// Mint address of the NFT
    #[account(mut)]
    pub nft_mint: Account<'info, Mint>,

    /// NFT token metadata
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub nft_metadata: AccountInfo<'info>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub wallet: Signer<'info>,

    /// NATIVE SYSTEM PROGRAM
    pub system_program: Program<'info, System>,
}

/// Init NFT
pub fn init_nft(ctx: Context<InitNFT>) -> Result<()> {
    let project = &ctx.accounts.project;
    if project.allowed_mints && project.authority != ctx.accounts.wallet.key() {
        return Err(ErrorCode::OnlyOwner.into());
    }

    let nft = &mut ctx.accounts.nft;
    nft.set_defaults();
    nft.bump = ctx.bumps["nft"];
    nft.project = ctx.accounts.project.key();
    nft.mint = ctx.accounts.nft_mint.key();

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

    let validation_out = utils::validate_collection_creator(metadata, project)?;

    match validation_out {
        utils::ValidateCollectionCreatorOutput::Collection { address } => {
            nft.collection = address;
        }
        utils::ValidateCollectionCreatorOutput::Creator { address } => {
            nft.creator = address;
        }
    }

    Ok(())
}

/// Accounts used in stake instruction
#[derive(Accounts)]
pub struct Stake<'info> {
    /// Project state account
    #[account()]
    pub project: Box<Account<'info, Project>>,

    /// NFT state account
    #[account(mut, has_one = project)]
    pub nft: Box<Account<'info, NFT>>,

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

    /// NFT token record
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub nft_token_record: Option<AccountInfo<'info>>,

    /// Staker state account
    #[account(mut, has_one = project, has_one = wallet)]
    pub staker: Account<'info, Staker>,

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
    let project = &ctx.accounts.project;
    let nft = &mut ctx.accounts.nft;
    let staker = &mut ctx.accounts.staker;

    if let Some(cooldown_duration) = project.cooldown_duration {
        let duration = nft.last_unstaked_at + i64::try_from(cooldown_duration).unwrap();
        if ctx.accounts.clock.unix_timestamp < duration {
            msg!(
                "Cooldown period not expired, remaining: {}",
                duration - ctx.accounts.clock.unix_timestamp
            );
            return Err(ErrorCode::CantStakeYet.into());
        }
    }

    token::approve(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Approve {
                to: ctx.accounts.nft_account.to_account_info(),
                delegate: nft.to_account_info(),
                authority: ctx.accounts.wallet.to_account_info(),
            },
        ),
        1,
    )?;

    let mint_key = ctx.accounts.nft_mint.key();
    let project_key = project.key();
    let nft_seeds = &[
        b"nft".as_ref(),
        mint_key.as_ref(),
        project_key.as_ref(),
        &[nft.bump],
    ];
    let nft_signer = &[&nft_seeds[..]];

    utils::delegate(
        DelegateArgs::StakingV1 {
            amount: 1,
            authorization_data: None,
        },
        None,
        nft.to_account_info(),
        ctx.accounts.nft_metadata.to_account_info(),
        ctx.accounts.nft_edition.to_account_info(),
        ctx.accounts.nft_token_record.clone(),
        ctx.accounts.nft_mint.to_account_info(),
        ctx.accounts.nft_account.to_account_info(),
        ctx.accounts.wallet.to_account_info(),
        ctx.accounts.wallet.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.sysvar_instructions.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        None,
    )?;

    utils::lock(
        nft.to_account_info(),
        ctx.accounts.nft_mint.to_account_info(),
        ctx.accounts.nft_account.to_account_info(),
        ctx.accounts.wallet.to_account_info(),
        ctx.accounts.nft_metadata.to_account_info(),
        ctx.accounts.nft_edition.to_account_info(),
        ctx.accounts.nft_token_record.clone(),
        ctx.accounts.wallet.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.sysvar_instructions.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        Some(nft_signer),
    )?;

    nft.last_staked_at = ctx.accounts.clock.unix_timestamp;
    nft.staker = staker.key();
    if project.reset_stake_duration {
        nft.staked_at = ctx.accounts.clock.unix_timestamp;
    }
    staker.total_staked += 1;

    Ok(())
}

/// Accounts used in unstake instruction
#[derive(Accounts)]
pub struct Unstake<'info> {
    /// Project state account
    #[account()]
    pub project: Box<Account<'info, Project>>,

    /// NFT state account
    #[account(mut, has_one = project, has_one = staker)]
    pub nft: Box<Account<'info, NFT>>,

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

    /// NFT token record
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub nft_token_record: Option<AccountInfo<'info>>,

    /// Staker state account
    #[account(mut, has_one = project, has_one = wallet)]
    pub staker: Account<'info, Staker>,

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
    let project = &ctx.accounts.project;
    let staker = &mut ctx.accounts.staker;
    let nft = &mut ctx.accounts.nft;

    if let Some(min_stake_duration) = project.min_stake_duration {
        let duration = nft.last_staked_at + i64::try_from(min_stake_duration).unwrap();
        if ctx.accounts.clock.unix_timestamp < duration {
            msg!(
                "Min stake duration not reached, remaining {} seconds",
                duration - ctx.accounts.clock.unix_timestamp
            );
            return Err(ErrorCode::CantUnstakeYet.into());
        }
    }

    nft.last_unstaked_at = ctx.accounts.clock.unix_timestamp;
    nft.staker = Pubkey::default();
    nft.collection = Pubkey::default();
    nft.creator = Pubkey::default();
    staker.total_staked -= 1;

    let mint_key = ctx.accounts.nft_mint.key();
    let project_key = project.key();
    let nft_seeds = &[
        b"nft".as_ref(),
        mint_key.as_ref(),
        project_key.as_ref(),
        &[nft.bump],
    ];
    let nft_signer = &[&nft_seeds[..]];

    utils::unlock(
        nft.to_account_info(),
        ctx.accounts.nft_mint.to_account_info(),
        ctx.accounts.nft_account.to_account_info(),
        ctx.accounts.wallet.to_account_info(),
        ctx.accounts.nft_metadata.to_account_info(),
        ctx.accounts.nft_edition.to_account_info(),
        ctx.accounts.nft_token_record.clone(),
        ctx.accounts.wallet.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.sysvar_instructions.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        Some(nft_signer),
    )?;

    utils::revoke(
        RevokeArgs::StakingV1,
        None,
        nft.to_account_info(),
        ctx.accounts.nft_metadata.to_account_info(),
        ctx.accounts.nft_edition.to_account_info(),
        ctx.accounts.nft_token_record.clone(),
        ctx.accounts.nft_mint.to_account_info(),
        ctx.accounts.nft_account.to_account_info(),
        ctx.accounts.wallet.to_account_info(),
        ctx.accounts.wallet.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.sysvar_instructions.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        Some(nft_signer),
    )?;

    Ok(())
}
