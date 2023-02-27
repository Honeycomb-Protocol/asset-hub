use crate::{errors::ErrorCode, states::*};
use anchor_lang::{prelude::*, solana_program};
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};
use hpl_hive_control::{
    program::HplHiveControl,
    state::{DelegateAuthority, Project},
};
use hpl_utils::create;
use mpl_token_metadata::{instruction::CreateArgs, state::AssetData};

/// Accounts used in create asset manager
#[derive(Accounts)]
pub struct CreateAssetManager<'info> {
    #[account(
        init, payer = payer,
        space = AssetManager::LEN,
        seeds = [
          b"asset_manager".as_ref(),
          project.key().as_ref(),
          &[project.services.len() as u8],
        ],
        bump,
      )]
    pub asset_manager: Account<'info, AssetManager>,

    /// The wallet that holds the authority over the assembler
    pub authority: Signer<'info>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub payer: Signer<'info>,

    /// HIVE CONTROL
    #[account(mut)]
    pub project: Box<Account<'info, Project>>,

    #[account(has_one = authority)]
    pub delegate_authority: Option<Account<'info, DelegateAuthority>>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub vault: AccountInfo<'info>,

    /// SYSTEM PROGRAM
    pub system_program: Program<'info, System>,

    /// RENT SYSVAR
    pub rent_sysvar: Sysvar<'info, Rent>,

    /// HIVE CONTROL PROGRAM
    pub hive_control: Program<'info, HplHiveControl>,
}
pub fn create_asset_manager(ctx: Context<CreateAssetManager>) -> Result<()> {
    let asset_manager = &mut ctx.accounts.asset_manager;
    asset_manager.bump = ctx.bumps["asset_manager"];
    asset_manager.project = ctx.accounts.project.key();
    Ok(())
}

/// Accounts used in the create asset instruction
#[derive(Accounts)]
pub struct CreateAsset<'info> {
    #[account(has_one = project)]
    pub asset_manager: Box<Account<'info, AssetManager>>,

    /// Mint of the asset
    #[account(
      init,
      payer = payer,
      mint::decimals = 0,
      mint::authority = asset,
      mint::freeze_authority = asset,
    )]
    pub mint: Box<Account<'info, Mint>>,

    /// Metadata account of the asset
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub metadata: AccountInfo<'info>,

    /// Master Edition account of the asset
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub edition: AccountInfo<'info>,

    #[account(
      init, payer = payer,
      space = Asset::LEN,
      seeds = [
        b"asset".as_ref(),
        mint.key().as_ref(),
      ],
      bump,
    )]
    pub asset: Box<Account<'info, Asset>>,

    /// The wallet that holds the authority over the assembler
    pub authority: Signer<'info>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub payer: Signer<'info>,

    /// The system program.
    pub system_program: Program<'info, System>,

    /// SPL TOKEN PROGRAM
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,

    /// METAPLEX TOKEN METADATA PROGRAM
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: UncheckedAccount<'info>,

    /// SYSVAR RENT
    pub rent_sysvar: Sysvar<'info, Rent>,

    /// NATIVE Instructions SYSVAR
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = solana_program::sysvar::instructions::ID)]
    pub sysvar_instructions: AccountInfo<'info>,

    // HIVE CONTROL
    #[account()]
    pub project: Box<Account<'info, Project>>,
    #[account(has_one = authority)]
    pub delegate_authority: Option<Account<'info, DelegateAuthority>>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub vault: AccountInfo<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub struct CreateAssetArgs {
    pub candy_guard: Option<Pubkey>,
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub supply: u64,
}

/// Create an asset manager
pub fn create_asset(ctx: Context<CreateAsset>, args: CreateAssetArgs) -> Result<()> {
    let asset = &mut ctx.accounts.asset;
    asset.bump = ctx.bumps["asset"];
    asset.asset_manager = ctx.accounts.asset_manager.key();
    asset.candy_guard = args.candy_guard;
    asset.mint = ctx.accounts.mint.key();
    asset.supply = args.supply;
    asset.items_redeemed = 0;
    asset.uri = args.uri;

    let asset_seeds = &[b"asset".as_ref(), asset.mint.as_ref(), &[asset.bump]];
    let asset_signer = &[&asset_seeds[..]];

    create(
        CreateArgs::V1 {
            asset_data: AssetData {
                name: args.name.clone(),
                symbol: args.symbol.clone(),
                uri: asset.uri.clone(),
                seller_fee_basis_points: 0,
                creators: Some(
                    [vec![mpl_token_metadata::state::Creator {
                        address: asset.key(),
                        verified: true,
                        share: 100,
                    }]]
                    .concat(),
                ),
                primary_sale_happened: false,
                is_mutable: true,
                token_standard: mpl_token_metadata::state::TokenStandard::FungibleAsset,
                collection: None,
                uses: None,
                collection_details: None,
                rule_set: None,
            },
            decimals: Some(0),
            print_supply: Some(mpl_token_metadata::state::PrintSupply::Limited(args.supply)),
        },
        false,
        true,
        ctx.accounts.metadata.to_account_info(),
        ctx.accounts.edition.to_account_info(),
        ctx.accounts.mint.to_account_info(),
        asset.to_account_info(),
        ctx.accounts.payer.to_account_info(),
        asset.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.sysvar_instructions.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        Some(asset_signer),
    )?;

    Ok(())
}

/// Accounts used in the mint asset instruction
#[derive(Accounts)]
pub struct MintAsset<'info> {
    #[account(has_one = project)]
    pub asset_manager: Box<Account<'info, AssetManager>>,

    /// The asset state account.
    #[account(has_one = mint, has_one = asset_manager)]
    pub asset: Account<'info, Asset>,

    /// Mint of the asset
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    /// The token account of user wallet.
    #[account(mut, has_one = mint, constraint = token_account.owner == wallet.key())]
    pub token_account: Account<'info, TokenAccount>,

    /// Candy guard address of the asset
    #[account()]
    pub candy_guard: Option<AccountInfo<'info>>,

    /// The wallet holds the complete authority over the asset manager.
    #[account(mut)]
    pub wallet: Signer<'info>,

    /// The system program.
    pub system_program: Program<'info, System>,

    /// SPL TOKEN PROGRAM
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,

    // HIVE CONTROL
    #[account()]
    pub project: Box<Account<'info, Project>>,
    #[account(constraint = delegate_authority.authority == wallet.key())]
    pub delegate_authority: Option<Account<'info, DelegateAuthority>>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub vault: AccountInfo<'info>,
}

/// Mint an asset
pub fn mint_asset(ctx: Context<MintAsset>, amount: u64) -> Result<()> {
    let asset = &mut ctx.accounts.asset;

    if let Some(candy_guard) = &ctx.accounts.candy_guard {
        if !candy_guard.is_signer || candy_guard.key() != asset.candy_guard.unwrap() {
            return Err(ErrorCode::UnauthorizedMint.into());
        }
    } else if ctx.accounts.wallet.key() != ctx.accounts.project.authority {
        return Err(ErrorCode::UnauthorizedMint.into());
    }

    let asset_seeds = &[b"asset".as_ref(), asset.mint.as_ref(), &[asset.bump]];
    let asset_signer = &[&asset_seeds[..]];

    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: asset.to_account_info(),
            },
            asset_signer,
        ),
        amount,
    )?;

    Ok(())
}
