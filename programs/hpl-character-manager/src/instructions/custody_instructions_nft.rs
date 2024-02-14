use {
    crate::{errors::HplCharacterManagerError, state::*},
    anchor_lang::prelude::*,
    anchor_spl::{
        associated_token::AssociatedToken,
        token::{self, Mint, Token, TokenAccount},
    },
    hpl_hive_control::{program::HplHiveControl, state::Project},
    mpl_token_metadata::{
        instruction::{DelegateArgs, RevokeArgs},
        state::{Metadata, TokenMetadataAccount},
    },
};

/// Accounts used in init NFT instruction
#[derive(Accounts)]
pub struct DepositNft<'info> {
    // HIVE CONTROL
    #[account()]
    pub project: Box<Account<'info, Project>>,

    #[account()]
    pub character_model: Box<Account<'info, CharacterModel>>,

    #[account(
      init, payer = wallet,
      space = AssetCustody::LEN,
      seeds = [
        b"asset_custody",
        nft_mint.key().as_ref()
      ],
      bump
    )]
    pub asset_custody: Box<Account<'info, AssetCustody>>,

    /// Mint address of the NFT
    #[account(mut)]
    pub nft_mint: Box<Account<'info, Mint>>,

    /// Token account of the NFT
    #[account(mut, constraint = nft_account.mint == nft_mint.key() && nft_account.owner == wallet.key())]
    pub nft_account: Box<Account<'info, TokenAccount>>,

    /// NFT token metadata
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub nft_metadata: AccountInfo<'info>,

    /// NFT edition
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub nft_edition: AccountInfo<'info>,

    /// NFT token record
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub nft_token_record: Option<AccountInfo<'info>>,

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

    /// NATIVE TOKEN PROGRAM
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,

    /// ASSOCIATED TOKEN PROGRAM
    pub associated_token_program: Program<'info, AssociatedToken>,

    /// METAPLEX TOKEN METADATA PROGRAM
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = mpl_token_metadata::ID)]
    pub token_metadata_program: AccountInfo<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub authorization_rules_program: Option<AccountInfo<'info>>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub authorization_rules: Option<AccountInfo<'info>>,

    /// NATIVE CLOCK SYSVAR
    pub clock: Sysvar<'info, Clock>,

    /// NATIVE INSTRUCTIONS SYSVAR
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,
}

/// Init NFT
pub fn deposit_nft(ctx: Context<DepositNft>) -> Result<()> {
    let metadata_account_info = &ctx.accounts.nft_metadata;

    if metadata_account_info.data_is_empty() {
        msg!("Metadata account is empty");
        return Err(HplCharacterManagerError::InvalidMetadata.into());
    }

    let metadata: Metadata = Metadata::from_account_info(metadata_account_info)?;
    if metadata.mint != ctx.accounts.nft_mint.key() {
        msg!("Metadata mint does not match NFT mint");
        return Err(HplCharacterManagerError::InvalidMetadata.into());
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
        return Err(HplCharacterManagerError::NoCriteriaMatched.into());
    }

    let args: Result<DelegateArgs> = match metadata.token_standard {
        Some(token_standard) => match token_standard {
            mpl_token_metadata::state::TokenStandard::ProgrammableNonFungible => {
                Ok(DelegateArgs::StakingV1 {
                    amount: 1,
                    authorization_data: None,
                })
            }
            _ => Ok(DelegateArgs::StandardV1 { amount: 1 }),
        },
        None => Err(HplCharacterManagerError::InvalidMetadata.into()),
    };

    let character_model_seeds = &[
        b"character_model",
        ctx.accounts.character_model.project.as_ref(),
        ctx.accounts.character_model.key.as_ref(),
        &[ctx.accounts.character_model.bump],
    ];
    let character_model_signer = &[&character_model_seeds[..]];

    crate::metadata::delegate(
        args.unwrap(),
        None,
        ctx.accounts.character_model.to_account_info(),
        ctx.accounts.nft_metadata.to_account_info(),
        Some(ctx.accounts.nft_edition.to_account_info()),
        ctx.accounts.nft_token_record.clone(),
        ctx.accounts.nft_mint.to_account_info(),
        ctx.accounts.nft_account.to_account_info(),
        ctx.accounts.wallet.to_account_info(),
        ctx.accounts.wallet.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.instructions_sysvar.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        ctx.accounts.authorization_rules_program.clone(),
        ctx.accounts.authorization_rules.clone(),
        None,
    )?;

    crate::metadata::lock(
        ctx.accounts.character_model.to_account_info(),
        ctx.accounts.nft_mint.to_account_info(),
        ctx.accounts.nft_account.to_account_info(),
        Some(ctx.accounts.wallet.to_account_info()),
        ctx.accounts.nft_metadata.to_account_info(),
        Some(ctx.accounts.nft_edition.to_account_info()),
        ctx.accounts.nft_token_record.clone(),
        ctx.accounts.wallet.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.instructions_sysvar.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        ctx.accounts.authorization_rules_program.clone(),
        ctx.accounts.authorization_rules.clone(),
        Some(character_model_signer),
    )?;

    let asset_custody = &mut ctx.accounts.asset_custody;
    asset_custody.bump = ctx.bumps.asset_custody;
    asset_custody.wallet = ctx.accounts.wallet.key();
    asset_custody.character_model = Some(ctx.accounts.character_model.key());
    asset_custody.source = Some(CharacterSource::Wrapped {
        mint: ctx.accounts.nft_mint.key(),
        criteria: source_criteria.unwrap(),
        is_compressed: false,
    });

    Ok(())
}

/// Accounts used in init NFT instruction
#[derive(Accounts)]
pub struct WithdrawNft<'info> {
    // HIVE CONTROL
    #[account()]
    pub project: Box<Account<'info, Project>>,

    #[account()]
    pub character_model: Box<Account<'info, CharacterModel>>,

    #[account(mut, has_one = wallet, close = wallet)]
    pub asset_custody: Box<Account<'info, AssetCustody>>,

    /// Mint address of the NFT
    #[account(mut)]
    pub nft_mint: Box<Account<'info, Mint>>,

    /// Token account of the NFT
    #[account(mut, constraint = nft_account.mint == nft_mint.key() && nft_account.owner == wallet.key())]
    pub nft_account: Box<Account<'info, TokenAccount>>,

    /// NFT token metadata
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub nft_metadata: AccountInfo<'info>,

    /// NFT edition
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub nft_edition: AccountInfo<'info>,

    /// NFT token record
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub nft_token_record: Option<AccountInfo<'info>>,

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

    /// NATIVE TOKEN PROGRAM
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,

    /// ASSOCIATED TOKEN PROGRAM
    pub associated_token_program: Program<'info, AssociatedToken>,

    /// METAPLEX TOKEN METADATA PROGRAM
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = mpl_token_metadata::ID)]
    pub token_metadata_program: AccountInfo<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub authorization_rules_program: Option<AccountInfo<'info>>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub authorization_rules: Option<AccountInfo<'info>>,

    /// NATIVE CLOCK SYSVAR
    pub clock: Sysvar<'info, Clock>,

    /// NATIVE INSTRUCTIONS SYSVAR
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,
}

/// Init NFT
pub fn withdraw_nft(ctx: Context<WithdrawNft>) -> Result<()> {
    let metadata_account_info = &ctx.accounts.nft_metadata;

    if metadata_account_info.data_is_empty() {
        msg!("Metadata account is empty");
        return Err(HplCharacterManagerError::InvalidMetadata.into());
    }

    let metadata: Metadata = Metadata::from_account_info(metadata_account_info)?;
    if metadata.mint != ctx.accounts.nft_mint.key() {
        msg!("Metadata mint does not match NFT mint");
        return Err(HplCharacterManagerError::InvalidMetadata.into());
    }

    let args: Result<RevokeArgs> = match metadata.token_standard {
        Some(token_standard) => match token_standard {
            mpl_token_metadata::state::TokenStandard::ProgrammableNonFungible => {
                Ok(RevokeArgs::StakingV1)
            }
            _ => Ok(RevokeArgs::StandardV1),
        },
        None => Err(HplCharacterManagerError::InvalidMetadata.into()),
    };

    let character_model_seeds = &[
        b"character_model",
        ctx.accounts.character_model.project.as_ref(),
        ctx.accounts.character_model.key.as_ref(),
        &[ctx.accounts.character_model.bump],
    ];
    let character_model_signer = &[&character_model_seeds[..]];

    crate::metadata::unlock(
        ctx.accounts.character_model.to_account_info(),
        ctx.accounts.nft_mint.to_account_info(),
        ctx.accounts.nft_account.to_account_info(),
        Some(ctx.accounts.wallet.to_account_info()),
        ctx.accounts.nft_metadata.to_account_info(),
        Some(ctx.accounts.nft_edition.to_account_info()),
        ctx.accounts.nft_token_record.clone(),
        ctx.accounts.wallet.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.instructions_sysvar.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        ctx.accounts.authorization_rules_program.clone(),
        ctx.accounts.authorization_rules.clone(),
        Some(character_model_signer),
    )?;

    crate::metadata::revoke(
        args.unwrap(),
        None,
        ctx.accounts.character_model.to_account_info(),
        ctx.accounts.nft_metadata.to_account_info(),
        Some(ctx.accounts.nft_edition.to_account_info()),
        ctx.accounts.nft_token_record.clone(),
        ctx.accounts.nft_mint.to_account_info(),
        ctx.accounts.nft_account.to_account_info(),
        ctx.accounts.wallet.to_account_info(),
        ctx.accounts.wallet.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.instructions_sysvar.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        ctx.accounts.authorization_rules_program.clone(),
        ctx.accounts.authorization_rules.clone(),
        Some(character_model_signer),
    )?;

    Ok(())
}
