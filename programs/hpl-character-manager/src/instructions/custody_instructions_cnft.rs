use {
    crate::{errors::HplCharacterManagerError, state::*},
    anchor_lang::prelude::*,
    hpl_hive_control::{program::HplHiveControl, state::Project},
    mpl_bubblegum::{programs::MPL_BUBBLEGUM_ID, utils::get_asset_id},
    spl_account_compression::{program::SplAccountCompression, Noop},
};

/// Accounts used in init NFT instruction
#[derive(Accounts)]
pub struct DepositCnft<'info> {
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
        asset_id.key().as_ref()
      ],
      bump
    )]
    pub asset_custody: Box<Account<'info, AssetCustody>>,

    /// CHECK: This is not dangerous
    pub asset_id: UncheckedAccount<'info>,

    /// CHECK: This is not dangerous
    pub tree_authority: UncheckedAccount<'info>,

    /// CHECK: This is not dangerous
    #[account(mut)]
    pub merkle_tree: UncheckedAccount<'info>,

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

    /// MPL Bubblegum program
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = MPL_BUBBLEGUM_ID)]
    pub bubblegum: AccountInfo<'info>,

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
pub struct DepositCnftArgs {
    pub root: [u8; 32],
    pub data_hash: [u8; 32],
    pub creator_hash: [u8; 32],
    pub nonce: u64,
    pub index: u32,
}

/// Init NFT
pub fn deposit_cnft<'info>(
    ctx: Context<'_, '_, '_, 'info, DepositCnft<'info>>,
    args: DepositCnftArgs,
) -> Result<()> {
    let mut source_criteria = None::<NftWrapCriteria>;
    match &ctx.accounts.character_model.config {
        CharacterConfig::Wrapped(criterias) => {
            for criteria in criterias {
                match criteria {
                    NftWrapCriteria::Collection(_) => {}
                    NftWrapCriteria::Creator(_) => {}
                    NftWrapCriteria::MerkleTree(address) => {
                        if *address == ctx.accounts.merkle_tree.key() {
                            source_criteria = Some(NftWrapCriteria::MerkleTree(*address));
                            break;
                        }
                    }
                }
            }
        }
    }

    if source_criteria.is_none() {
        return Err(HplCharacterManagerError::NoCriteriaMatched.into());
    }

    if get_asset_id(&ctx.accounts.merkle_tree.key(), args.nonce) != ctx.accounts.asset_id.key() {
        return Err(HplCharacterManagerError::AssetIDMismatch.into());
    }

    crate::bubblegum::transfer_cnft_cpi(
        ctx.accounts.tree_authority.to_account_info(),
        ctx.accounts.wallet.to_account_info(),
        ctx.accounts.wallet.to_account_info(),
        ctx.accounts.character_model.to_account_info(),
        ctx.accounts.merkle_tree.to_account_info(),
        ctx.accounts.log_wrapper.to_account_info(),
        ctx.accounts.compression_program.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.remaining_accounts.to_vec(),
        args.root,
        args.data_hash,
        args.creator_hash,
        args.nonce,
        args.index,
        None,
    )?;

    let asset_custody = &mut ctx.accounts.asset_custody;
    asset_custody.bump = ctx.bumps.asset_custody;
    asset_custody.wallet = ctx.accounts.wallet.key();
    asset_custody.character_model = Some(ctx.accounts.character_model.key());
    asset_custody.source = Some(CharacterSource::Wrapped {
        mint: ctx.accounts.asset_id.key(),
        criteria: source_criteria.unwrap(),
        is_compressed: true,
    });

    Ok(())
}

/// Accounts used in init NFT instruction
#[derive(Accounts)]
pub struct WithdrawCnft<'info> {
    // HIVE CONTROL
    #[account()]
    pub project: Box<Account<'info, Project>>,

    #[account()]
    pub character_model: Box<Account<'info, CharacterModel>>,

    #[account(mut, has_one = wallet, close = wallet)]
    pub asset_custody: Box<Account<'info, AssetCustody>>,

    /// CHECK: This is not dangerous
    pub tree_authority: UncheckedAccount<'info>,

    /// CHECK: This is not dangerous
    #[account(mut)]
    pub merkle_tree: UncheckedAccount<'info>,

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

    /// MPL Bubblegum program
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = MPL_BUBBLEGUM_ID)]
    pub bubblegum: AccountInfo<'info>,

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
pub struct WithdrawCnftArgs {
    pub root: [u8; 32],
    pub data_hash: [u8; 32],
    pub creator_hash: [u8; 32],
    pub nonce: u64,
    pub index: u32,
}

/// Init NFT
pub fn withdraw_cnft<'info>(
    ctx: Context<'_, '_, '_, 'info, WithdrawCnft<'info>>,
    args: WithdrawCnftArgs,
) -> Result<()> {
    let mut source_criteria = None::<NftWrapCriteria>;
    match &ctx.accounts.character_model.config {
        CharacterConfig::Wrapped(criterias) => {
            for criteria in criterias {
                match criteria {
                    NftWrapCriteria::Collection(_) => {}
                    NftWrapCriteria::Creator(_) => {}
                    NftWrapCriteria::MerkleTree(address) => {
                        if *address == ctx.accounts.merkle_tree.key() {
                            source_criteria = Some(NftWrapCriteria::MerkleTree(*address));
                            break;
                        }
                    }
                }
            }
        }
    }

    if source_criteria.is_none() {
        return Err(HplCharacterManagerError::NoCriteriaMatched.into());
    }

    let character_model_seeds = &[
        b"character_model",
        ctx.accounts.character_model.project.as_ref(),
        ctx.accounts.character_model.key.as_ref(),
        &[ctx.accounts.character_model.bump],
    ];
    let character_model_signer = &[&character_model_seeds[..]];

    crate::bubblegum::transfer_cnft_cpi(
        ctx.accounts.tree_authority.to_account_info(),
        ctx.accounts.character_model.to_account_info(),
        ctx.accounts.character_model.to_account_info(),
        ctx.accounts.wallet.to_account_info(),
        ctx.accounts.merkle_tree.to_account_info(),
        ctx.accounts.log_wrapper.to_account_info(),
        ctx.accounts.compression_program.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.remaining_accounts.to_vec(),
        args.root,
        args.data_hash,
        args.creator_hash,
        args.nonce,
        args.index,
        Some(character_model_signer),
    )?;

    Ok(())
}
