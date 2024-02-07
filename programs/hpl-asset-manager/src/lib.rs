use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod states;

use instructions::*;

declare_id!("7cJdKSjPtZqiGV4CFAGtbhhpf5CsYjbkbEkLKcXfHLYd");
hpl_toolkit::platform_gate!();

#[program]
pub mod hpl_asset_manager {
    use super::*;

    pub fn create_asset_manager(ctx: Context<CreateAssetManager>) -> Result<()> {
        hpl_toolkit::add_service!(hpl_hive_control::state::Service::AssetManager {
            asset_manager_id: ctx.accounts.asset_manager.key(),
        });

        instructions::create_asset_manager(ctx)
    }

    pub fn create_asset(
        ctx: Context<CreateAsset>,
        args: CreateAssetArgs,
        proof_index: u8,
    ) -> Result<()> {
        platform_gate_cpi(
            hpl_hive_control::state::SerializableActions::ManageAssets,
            Some((proof_index, ctx.accounts.asset_manager.key())),
            ctx.accounts.project.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.hive_control.to_account_info(),
            ctx.accounts.instructions_sysvar.to_account_info(),
        )?;

        instructions::create_asset(ctx, args)
    }

    pub fn mint_asset(ctx: Context<MintAsset>, amount: u64) -> Result<()> {
        platform_gate_cpi(
            hpl_hive_control::state::SerializableActions::PublicHigh,
            None,
            ctx.accounts.project.to_account_info(),
            ctx.accounts.wallet.to_account_info(),
            ctx.accounts.wallet.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.hive_control.to_account_info(),
            ctx.accounts.instructions_sysvar.to_account_info(),
        )?;

        instructions::mint_asset(ctx, amount)
    }
}
