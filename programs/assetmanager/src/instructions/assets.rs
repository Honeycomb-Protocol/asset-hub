use crate::{errors::ErrorCode, structs::*, utils::*};
use anchor_lang::{prelude::*, solana_program};
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};

/// Accounts used in the create assembler instruction
#[derive(Accounts)]
pub struct CreateAsset<'info> {
    /// Mint of the asset
    #[account(
      init,
      payer = owner,
      mint::decimals = 0,
      mint::authority = asset,
      mint::freeze_authority = asset,
    )]
    pub mint: Account<'info, Mint>,

    /// Metadata account of the asset
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub metadata: AccountInfo<'info>,

    #[account(
      init, payer = owner,
      space = DESCRIMINATOR_SIZE + Asset::LEN + EXTRA_SIZE,
      seeds = [
        b"asset".as_ref(),
        mint.key().as_ref(),
      ],
      bump,
    )]
    pub asset: Account<'info, Asset>,

    /// The wallet that pays for everything.
    #[account(mut)]
    pub owner: Signer<'info>,

    /// The system program.
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

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub struct CreateAssetArgs {
    pub candy_guard: Option<Pubkey>,
    pub name: String,
    pub symbol: String,
    pub uri: String,
}

/// Create an asset manager
pub fn create_asset(ctx: Context<CreateAsset>, args: CreateAssetArgs) -> Result<()> {
    let asset = &mut ctx.accounts.asset;
    asset.bump = ctx.bumps["asset"];
    asset.owner = ctx.accounts.owner.key();
    asset.candy_guard = args.candy_guard;
    asset.mint = ctx.accounts.mint.key();
    asset.items_redeemed = 0;
    asset.uri = args.uri;

    let asset_seeds = &[b"asset".as_ref(), asset.mint.as_ref(), &[asset.bump]];
    let asset_signer = &[&asset_seeds[..]];

    let create_metadata = mpl_token_metadata::instruction::create_metadata_accounts_v3(
        ctx.accounts.token_metadata_program.key(),
        ctx.accounts.metadata.key(),
        asset.mint,
        asset.key(),
        ctx.accounts.owner.key(),
        asset.key(),
        args.name.clone(),
        args.symbol.clone(),
        asset.uri.clone(),
        None,
        // Some(vec![mpl_token_metadata::state::Creator {
        //     address: asset_manager.authority,
        //     verified: true,
        //     share: 100,
        // }]),
        0,
        false,
        true,
        None,
        None,
        None,
    );

    solana_program::program::invoke_signed(
        &create_metadata,
        &[
            ctx.accounts.metadata.clone(),
            ctx.accounts.mint.to_account_info(),
            asset.to_account_info(),
            ctx.accounts.owner.to_account_info(),
            asset.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ],
        asset_signer,
    )?;

    Ok(())
}

/// Accounts used in the create mint asset instruction
#[derive(Accounts)]
pub struct MintAsset<'info> {
    /// The asset state account.
    #[account(has_one = mint)]
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

    /// SPL TOKEN PROGRAM
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
}

/// Mint an asset
pub fn mint_asset(ctx: Context<MintAsset>, amount: u64) -> Result<()> {
    let asset = &mut ctx.accounts.asset;

    let candy_guard = &ctx.accounts.candy_guard;
    if let Some(candy_guard) = candy_guard {
        if !candy_guard.is_signer || candy_guard.key() != asset.candy_guard.unwrap() {
            return Err(ErrorCode::UnauthorizedMint.into());
        }
    } else if ctx.accounts.wallet.key() != asset.owner {
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
