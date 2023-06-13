use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;
pub mod utils;

declare_id!("4mGbMdQY7YgVp9rEqZnbkRg5m1H5o3ixZnneGgcT3Pvf");

use {
    errors::ErrorCode,
    instructions::*,
    state::HolderStatus,
    utils::{post_actions, pre_actions},
};

#[program]
pub mod hpl_currency_manager {
    use super::*;

    pub fn create_currency(ctx: Context<CreateCurrency>, args: CreateCurrencyArgs) -> Result<()> {
        hpl_hive_control::instructions::platform_gate_fn(
            hpl_hive_control::constants::ACTIONS.manage_assets,
            None,
            &ctx.accounts.project,
            ctx.accounts.authority.key(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
        )?;
        instructions::create_currency(ctx, args)
    }

    pub fn update_currency(ctx: Context<UpdateCurrency>, args: UpdateCurrencyArgs) -> Result<()> {
        hpl_hive_control::instructions::platform_gate_fn(
            hpl_hive_control::constants::ACTIONS.manage_assets,
            None,
            &ctx.accounts.project,
            ctx.accounts.authority.key(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
        )?;
        instructions::update_currency(ctx, args)
    }

    pub fn wrap_currency(ctx: Context<WrapCurrency>) -> Result<()> {
        hpl_hive_control::instructions::platform_gate_fn(
            hpl_hive_control::constants::ACTIONS.manage_assets,
            None,
            &ctx.accounts.project,
            ctx.accounts.authority.key(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
        )?;
        instructions::wrap_currency(ctx)
    }

    pub fn create_holder_account(ctx: Context<CreateHolderAccount>) -> Result<()> {
        hpl_hive_control::instructions::platform_gate_fn(
            hpl_hive_control::constants::ACTIONS.public_low,
            None,
            &ctx.accounts.project,
            ctx.accounts.payer.key(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &None,
            ctx.accounts.system_program.to_account_info(),
        )?;

        let currency = &ctx.accounts.currency.clone();
        let token_program = ctx.accounts.token_program.to_account_info();
        let token_account = ctx.accounts.token_account.to_account_info();
        let mint = ctx.accounts.mint.to_account_info();

        instructions::create_holder_account(ctx)?;

        post_actions(currency, token_program, token_account, mint)
    }

    pub fn mint_currency(ctx: Context<MintCurrency>, amount: u64) -> Result<()> {
        hpl_hive_control::instructions::platform_gate_fn(
            hpl_hive_control::constants::ACTIONS.manage_assets,
            None,
            &ctx.accounts.project,
            ctx.accounts.authority.key(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
        )?;

        if ctx.accounts.holder_account.status == HolderStatus::Inactive {
            return Err(ErrorCode::InactiveHolder.into());
        }

        pre_actions(
            &ctx.accounts.currency,
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.token_account.to_account_info(),
            ctx.accounts.mint.to_account_info(),
        )?;

        let currency = &ctx.accounts.currency.clone();
        let token_program = ctx.accounts.token_program.to_account_info();
        let token_account = ctx.accounts.token_account.to_account_info();
        let mint = ctx.accounts.mint.to_account_info();

        instructions::mint_currency(ctx, amount)?;

        post_actions(currency, token_program, token_account, mint)
    }

    pub fn fund_account(ctx: Context<FundAccount>, amount: u64) -> Result<()> {
        if ctx.accounts.project.allowed_programs.len() > 0 {
            let ix_program_key =
                anchor_lang::solana_program::sysvar::instructions::get_instruction_relative(
                    0,
                    &ctx.accounts.instructions_sysvar,
                )
                .unwrap()
                .program_id;

            if ix_program_key.eq(&ID) {
                hpl_hive_control::instructions::platform_gate_fn(
                    hpl_hive_control::constants::ACTIONS.driver_action,
                    Some((0, Pubkey::default())),
                    &ctx.accounts.project,
                    ctx.accounts.authority.key(),
                    ctx.accounts.wallet.to_account_info(),
                    ctx.accounts.vault.to_account_info(),
                    &None,
                    ctx.accounts.system_program.to_account_info(),
                )?;
            } else {
                let found = ctx
                    .accounts
                    .project
                    .allowed_programs
                    .iter()
                    .find(|p| (*p).eq(&ix_program_key));
                if found.is_none() {
                    return Err(errors::ErrorCode::Unauthorized.into());
                }
            }
        } else {
            hpl_hive_control::instructions::platform_gate_fn(
                hpl_hive_control::constants::ACTIONS.public_low,
                None,
                &ctx.accounts.project,
                ctx.accounts.authority.key(),
                ctx.accounts.wallet.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                &None,
                ctx.accounts.system_program.to_account_info(),
            )?;
        }

        if ctx.accounts.holder_account.status == HolderStatus::Inactive {
            return Err(ErrorCode::InactiveHolder.into());
        }

        pre_actions(
            &ctx.accounts.currency,
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.token_account.to_account_info(),
            ctx.accounts.mint.to_account_info(),
        )?;

        let currency = &ctx.accounts.currency.clone();
        let token_program = ctx.accounts.token_program.to_account_info();
        let token_account = ctx.accounts.token_account.to_account_info();
        let mint = ctx.accounts.mint.to_account_info();

        instructions::fund_account(ctx, amount)?;

        post_actions(currency, token_program, token_account, mint)
    }

    pub fn burn_currency(ctx: Context<BurnCurrency>, amount: u64) -> Result<()> {
        if ctx.accounts.project.allowed_programs.len() > 0 {
            let ix_program_key =
                anchor_lang::solana_program::sysvar::instructions::get_instruction_relative(
                    0,
                    &ctx.accounts.instructions_sysvar,
                )
                .unwrap()
                .program_id;

            if ix_program_key.eq(&ID) {
                hpl_hive_control::instructions::platform_gate_fn(
                    hpl_hive_control::constants::ACTIONS.driver_action,
                    Some((0, Pubkey::default())),
                    &ctx.accounts.project,
                    ctx.accounts.authority.key(),
                    ctx.accounts.owner.to_account_info(),
                    ctx.accounts.vault.to_account_info(),
                    &None,
                    ctx.accounts.system_program.to_account_info(),
                )?;
            } else {
                let found = ctx
                    .accounts
                    .project
                    .allowed_programs
                    .iter()
                    .find(|p| (*p).eq(&ix_program_key));
                if found.is_none() {
                    return Err(errors::ErrorCode::Unauthorized.into());
                }
            }
        } else {
            hpl_hive_control::instructions::platform_gate_fn(
                hpl_hive_control::constants::ACTIONS.public_high,
                None,
                &ctx.accounts.project,
                ctx.accounts.authority.key(),
                ctx.accounts.owner.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                &None,
                ctx.accounts.system_program.to_account_info(),
            )?;
        }

        if ctx.accounts.holder_account.status == HolderStatus::Inactive {
            return Err(ErrorCode::InactiveHolder.into());
        }

        pre_actions(
            &ctx.accounts.currency,
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.token_account.to_account_info(),
            ctx.accounts.mint.to_account_info(),
        )?;

        let currency = &ctx.accounts.currency.clone();
        let token_program = ctx.accounts.token_program.to_account_info();
        let token_account = ctx.accounts.token_account.to_account_info();
        let mint = ctx.accounts.mint.to_account_info();

        instructions::burn_currency(ctx, amount)?;

        post_actions(currency, token_program, token_account, mint)
    }

    pub fn transfer_currency(ctx: Context<TransferCurrency>, amount: u64) -> Result<()> {
        if ctx.accounts.project.allowed_programs.len() > 0 {
            let ix_program_key =
                anchor_lang::solana_program::sysvar::instructions::get_instruction_relative(
                    0,
                    &ctx.accounts.instructions_sysvar,
                )
                .unwrap()
                .program_id;

            if ix_program_key.eq(&ID) {
                hpl_hive_control::instructions::platform_gate_fn(
                    hpl_hive_control::constants::ACTIONS.driver_action,
                    Some((0, Pubkey::default())),
                    &ctx.accounts.project,
                    ctx.accounts.authority.key(),
                    ctx.accounts.owner.to_account_info(),
                    ctx.accounts.vault.to_account_info(),
                    &None,
                    ctx.accounts.system_program.to_account_info(),
                )?;
            } else {
                let found = ctx
                    .accounts
                    .project
                    .allowed_programs
                    .iter()
                    .find(|p| (*p).eq(&ix_program_key));
                if found.is_none() {
                    return Err(errors::ErrorCode::Unauthorized.into());
                }
            }
        } else {
            hpl_hive_control::instructions::platform_gate_fn(
                hpl_hive_control::constants::ACTIONS.public_high,
                None,
                &ctx.accounts.project,
                ctx.accounts.authority.key(),
                ctx.accounts.owner.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                &None,
                ctx.accounts.system_program.to_account_info(),
            )?;
        }

        if ctx.accounts.sender_holder_account.status == HolderStatus::Inactive {
            return Err(ErrorCode::InactiveHolder.into());
        }

        if ctx.accounts.receiver_holder_account.status == HolderStatus::Inactive {
            return Err(ErrorCode::InactiveHolder.into());
        }

        pre_actions(
            &ctx.accounts.currency,
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.sender_token_account.to_account_info(),
            ctx.accounts.mint.to_account_info(),
        )?;

        pre_actions(
            &ctx.accounts.currency,
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.receiver_token_account.to_account_info(),
            ctx.accounts.mint.to_account_info(),
        )?;

        let currency = &ctx.accounts.currency.clone();
        let token_program = ctx.accounts.token_program.to_account_info();
        let sender_token_account = ctx.accounts.sender_token_account.to_account_info();
        let receiver_token_account = ctx.accounts.receiver_token_account.to_account_info();
        let mint = ctx.accounts.mint.to_account_info();

        instructions::transfer_currency(ctx, amount)?;

        post_actions(
            currency,
            token_program.clone(),
            sender_token_account,
            mint.clone(),
        )?;
        post_actions(currency, token_program, receiver_token_account, mint)
    }

    pub fn approve_delegate(ctx: Context<ApproveDelegate>, amount: u64) -> Result<()> {
        if ctx.accounts.project.allowed_programs.len() > 0 {
            let ix_program_key =
                anchor_lang::solana_program::sysvar::instructions::get_instruction_relative(
                    0,
                    &ctx.accounts.instructions_sysvar,
                )
                .unwrap()
                .program_id;

            if ix_program_key.eq(&ID) {
                hpl_hive_control::instructions::platform_gate_fn(
                    hpl_hive_control::constants::ACTIONS.driver_action,
                    Some((0, Pubkey::default())),
                    &ctx.accounts.project,
                    ctx.accounts.authority.key(),
                    ctx.accounts.owner.to_account_info(),
                    ctx.accounts.vault.to_account_info(),
                    &None,
                    ctx.accounts.system_program.to_account_info(),
                )?;
            } else {
                let found = ctx
                    .accounts
                    .project
                    .allowed_programs
                    .iter()
                    .find(|p| (*p).eq(&ix_program_key));
                if found.is_none() {
                    return Err(errors::ErrorCode::Unauthorized.into());
                }
            }
        } else {
            hpl_hive_control::instructions::platform_gate_fn(
                hpl_hive_control::constants::ACTIONS.public_high,
                None,
                &ctx.accounts.project,
                ctx.accounts.authority.key(),
                ctx.accounts.owner.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                &None,
                ctx.accounts.system_program.to_account_info(),
            )?;
        }

        if ctx.accounts.holder_account.status == HolderStatus::Inactive {
            return Err(ErrorCode::InactiveHolder.into());
        }

        pre_actions(
            &ctx.accounts.currency,
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.token_account.to_account_info(),
            ctx.accounts.mint.to_account_info(),
        )?;

        let currency = &ctx.accounts.currency.clone();
        let token_program = ctx.accounts.token_program.to_account_info();
        let token_account = ctx.accounts.token_account.to_account_info();
        let mint = ctx.accounts.mint.to_account_info();

        instructions::approve_delegate(ctx, amount)?;

        post_actions(currency, token_program, token_account, mint)
    }

    pub fn revoke_delegate(ctx: Context<RevokeDelegate>) -> Result<()> {
        if ctx.accounts.project.allowed_programs.len() > 0 {
            let ix_program_key =
                anchor_lang::solana_program::sysvar::instructions::get_instruction_relative(
                    0,
                    &ctx.accounts.instructions_sysvar,
                )
                .unwrap()
                .program_id;

            if ix_program_key.eq(&ID) {
                hpl_hive_control::instructions::platform_gate_fn(
                    hpl_hive_control::constants::ACTIONS.driver_action,
                    Some((0, Pubkey::default())),
                    &ctx.accounts.project,
                    ctx.accounts.authority.key(),
                    ctx.accounts.authority.to_account_info(),
                    ctx.accounts.vault.to_account_info(),
                    &None,
                    ctx.accounts.system_program.to_account_info(),
                )?;
            } else {
                let found = ctx
                    .accounts
                    .project
                    .allowed_programs
                    .iter()
                    .find(|p| (*p).eq(&ix_program_key));
                if found.is_none() {
                    return Err(errors::ErrorCode::Unauthorized.into());
                }
            }
        } else {
            hpl_hive_control::instructions::platform_gate_fn(
                hpl_hive_control::constants::ACTIONS.public_high,
                None,
                &ctx.accounts.project,
                ctx.accounts.authority.key(),
                ctx.accounts.authority.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                &None,
                ctx.accounts.system_program.to_account_info(),
            )?;
        }

        if ctx.accounts.holder_account.status == HolderStatus::Inactive {
            return Err(ErrorCode::InactiveHolder.into());
        }

        pre_actions(
            &ctx.accounts.currency,
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.token_account.to_account_info(),
            ctx.accounts.mint.to_account_info(),
        )?;

        let currency = &ctx.accounts.currency.clone();
        let token_program = ctx.accounts.token_program.to_account_info();
        let token_account = ctx.accounts.token_account.to_account_info();
        let mint = ctx.accounts.mint.to_account_info();

        instructions::revoke_delegate(ctx)?;

        post_actions(currency, token_program, token_account, mint)
    }

    pub fn set_holder_status(ctx: Context<SetHolderStatus>, status: HolderStatus) -> Result<()> {
        if ctx.accounts.project.allowed_programs.len() > 0 {
            let ix_program_key =
                anchor_lang::solana_program::sysvar::instructions::get_instruction_relative(
                    0,
                    &ctx.accounts.instructions_sysvar,
                )
                .unwrap()
                .program_id;

            if ix_program_key.eq(&ID) {
                hpl_hive_control::instructions::platform_gate_fn(
                    hpl_hive_control::constants::ACTIONS.driver_action,
                    Some((0, Pubkey::default())),
                    &ctx.accounts.project,
                    ctx.accounts.authority.key(),
                    ctx.accounts.authority.to_account_info(),
                    ctx.accounts.vault.to_account_info(),
                    &None,
                    ctx.accounts.system_program.to_account_info(),
                )?;
            } else {
                let found = ctx
                    .accounts
                    .project
                    .allowed_programs
                    .iter()
                    .find(|p| (*p).eq(&ix_program_key));
                if found.is_none() {
                    return Err(errors::ErrorCode::Unauthorized.into());
                }
            }
        } else {
            hpl_hive_control::instructions::platform_gate_fn(
                hpl_hive_control::constants::ACTIONS.public_high,
                None,
                &ctx.accounts.project,
                ctx.accounts.authority.key(),
                ctx.accounts.authority.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                &None,
                ctx.accounts.system_program.to_account_info(),
            )?;
        }

        instructions::set_holder_status(ctx, status)
    }
}
