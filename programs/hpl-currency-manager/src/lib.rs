use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

declare_id!("3F6KxyjUzun3zc9fpNSSz1S54AvFfPJbo1eLAx9Bxsz7");

use {instructions::*, state::HolderStatus};

#[program]
pub mod hpl_currency_manager {
    use super::*;

    pub fn create_currency(ctx: Context<CreateCurrency>, args: CreateCurrencyArgs) -> Result<()> {
        instructions::create_currency(ctx, args)
    }

    pub fn create_holder_account(ctx: Context<CreateHolderAccount>) -> Result<()> {
        instructions::create_holder_account(ctx)
    }

    pub fn mint_currency(ctx: Context<MintCurrency>, amount: u64) -> Result<()> {
        instructions::mint_currency(ctx, amount)
    }

    pub fn burn_currency(ctx: Context<BurnCurrency>, amount: u64) -> Result<()> {
        instructions::burn_currency(ctx, amount)
    }

    pub fn transfer_currency(ctx: Context<TransferCurrency>, amount: u64) -> Result<()> {
        instructions::transfer_currency(ctx, amount)
    }

    pub fn approve_delegate(ctx: Context<ApproveDelegate>) -> Result<()> {
        instructions::approve_delegate(ctx)
    }

    pub fn revoke_delegate(ctx: Context<RevokeDelegate>) -> Result<()> {
        instructions::revoke_delegate(ctx)
    }

    pub fn set_holder_status(ctx: Context<SetHolderStatus>, status: HolderStatus) -> Result<()> {
        instructions::set_holder_status(ctx, status)
    }
}
