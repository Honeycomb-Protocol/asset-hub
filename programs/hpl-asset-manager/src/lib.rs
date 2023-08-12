use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod states;

use instructions::*;

declare_id!("7cJdKSjPtZqiGV4CFAGtbhhpf5CsYjbkbEkLKcXfHLYd");

#[program]
pub mod hpl_asset_manager {
    use super::*;

    pub fn create_asset_manager(ctx: Context<CreateAssetManager>) -> Result<()> {
        hpl_hive_control::cpi::add_remove_service(
            CpiContext::new(
                ctx.accounts.hive_control.to_account_info(),
                hpl_hive_control::cpi::accounts::AddRemoveService {
                    project: ctx.accounts.project.to_account_info(),
                    delegate_authority: if let Some(delegate_authority) =
                        &ctx.accounts.delegate_authority
                    {
                        Some(delegate_authority.to_account_info())
                    } else {
                        Some(ctx.accounts.hive_control.to_account_info())
                    },
                    authority: ctx.accounts.authority.to_account_info(),
                    payer: ctx.accounts.payer.to_account_info(),
                    rent_sysvar: ctx.accounts.rent_sysvar.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    log_wrapper: ctx.accounts.log_wrapper.to_account_info(),
                    clock: ctx.accounts.clock_sysvar.to_account_info(),
                    vault: ctx.accounts.vault.to_account_info(),
                },
            ),
            hpl_hive_control::instructions::AddRemoveServiceArgs {
                service: hpl_hive_control::state::Service::AssetManager {
                    asset_manager_id: ctx.accounts.asset_manager.key(),
                },
                remove: Some(false),
            },
        )?;

        instructions::create_asset_manager(ctx)
    }

    pub fn create_asset(
        ctx: Context<CreateAsset>,
        args: CreateAssetArgs,
        proof_index: u8,
    ) -> Result<()> {
        hpl_hive_control::instructions::platform_gate_fn(
            hpl_hive_control::constants::ACTIONS.manage_assets,
            Some((proof_index, ctx.accounts.asset_manager.key())),
            &ctx.accounts.project,
            ctx.accounts.authority.key(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
        )?;

        instructions::create_asset(ctx, args)
    }

    pub fn mint_asset(ctx: Context<MintAsset>, amount: u64) -> Result<()> {
        hpl_hive_control::instructions::platform_gate_fn(
            hpl_hive_control::constants::ACTIONS.public_high,
            None,
            &ctx.accounts.project,
            ctx.accounts.wallet.key(),
            ctx.accounts.wallet.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
        )?;

        instructions::mint_asset(ctx, amount)
    }
}
