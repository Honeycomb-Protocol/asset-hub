use anchor_lang::prelude::*;

mod bubblegum;

pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("ChRCtrG7X5kb9YncA4wuyD68DXXL8Szt3zBCCGiioBTg");
hpl_macros::platform_gate!();

#[program]
pub mod hpl_character_manager {
    use super::*;

    pub fn new_character_model(
        ctx: Context<NewCharacterModel>,
        args: NewCharacterModelArgs,
    ) -> Result<()> {
        instructions::new_character_model(ctx, args)
    }

    pub fn create_new_characters_tree(
        ctx: Context<CreateNewCharactersTree>,
        args: CreateNewCharactersTreeArgs,
    ) -> Result<()> {
        instructions::create_new_characters_tree(ctx, args)
    }

    pub fn deposit_nft(ctx: Context<DepositNft>) -> Result<()> {
        instructions::deposit_nft(ctx)
    }

    pub fn withdraw_nft(ctx: Context<WithdrawNft>) -> Result<()> {
        instructions::withdraw_nft(ctx)
    }

    pub fn deposit_cnft<'info>(
        ctx: Context<'_, '_, '_, 'info, DepositCnft<'info>>,
        args: DepositCnftArgs,
    ) -> Result<()> {
        instructions::deposit_cnft(ctx, args)
    }

    pub fn withdraw_cnft<'info>(
        ctx: Context<'_, '_, '_, 'info, WithdrawCnft<'info>>,
        args: WithdrawCnftArgs,
    ) -> Result<()> {
        instructions::withdraw_cnft(ctx, args)
    }

    pub fn wrap_character(ctx: Context<WrapCharacter>) -> Result<()> {
        instructions::wrap_character(ctx)
    }

    pub fn unwrap_character<'info>(
        ctx: Context<'_, '_, '_, 'info, UnwrapCharacter<'info>>,
        args: UnwrapCharacterArgs,
    ) -> Result<()> {
        instructions::unwrap_character(ctx, args)
    }

    pub fn use_character<'info>(
        ctx: Context<'_, '_, '_, 'info, UseCharacter<'info>>,
        args: UseCharacterArgs,
    ) -> Result<()> {
        instructions::use_character(ctx, args)
    }

    pub fn verify_character<'info>(
        ctx: Context<'_, '_, '_, 'info, VerifyCharacter<'info>>,
        args: VerifyCharacterArgs,
    ) -> Result<()> {
        instructions::verify_character(ctx, args)
    }
}
