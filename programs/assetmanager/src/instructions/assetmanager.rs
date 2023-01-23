use crate::{structs::*, utils::*};
use anchor_lang::prelude::*;

/// Accounts used in the create assembler instruction
#[derive(Accounts)]
pub struct CreateAssetManager<'info> {
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub key: AccountInfo<'info>,

    /// The asset manager state account.
    #[account(
        init, payer = payer,
        space = DESCRIMINATOR_SIZE + AssetManager::LEN + EXTRA_SIZE,
        seeds = [
          b"asset_manager".as_ref(),
          key.key().as_ref(),
        ],
        bump,
    )]
    pub asset_manager: Account<'info, AssetManager>,

    /// The wallet holds the complete authority over the asset manager.
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub treasury: AccountInfo<'info>,

    /// The wallet holds the complete authority over the asset manager.
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub authority: AccountInfo<'info>,

    /// The wallet that pays for everything.
    #[account(mut)]
    pub payer: Signer<'info>,

    /// The system program.
    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub struct CreateAssetManagerArgs {
    pub name: String,
}

/// Create an asset manager
pub fn create_asset_manager(
    ctx: Context<CreateAssetManager>,
    args: CreateAssetManagerArgs,
) -> Result<()> {
    let asset_manager = &mut ctx.accounts.asset_manager;
    asset_manager.bump = ctx.bumps["asset_manager"];
    asset_manager.key = ctx.accounts.key.key();
    asset_manager.authority = ctx.accounts.authority.key();
    asset_manager.treasury = ctx.accounts.treasury.key();
    asset_manager.name = args.name;
    Ok(())
}
