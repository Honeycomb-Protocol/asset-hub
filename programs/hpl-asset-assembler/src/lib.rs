use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;
use state::*;

hpl_macros::platform_gate!();

declare_id!("Gq1333CkB2sGernk72TKfDVLnHj9LjmeijFujM2ULxJz");

#[program]
pub mod hpl_asset_assembler {
    use super::*;

    pub fn create_assembler(
        ctx: Context<CreateAssembler>,
        args: CreateAssemblerArgs,
    ) -> Result<()> {
        hpl_macros::add_service!(hpl_hive_control::state::Service::Assembler {
            assembler_id: ctx.accounts.assembler.key(),
        });
        instructions::create_assembler(ctx, args)
    }

    pub fn update_assembler(
        ctx: Context<UpdateAssembler>,
        args: UpdateAssemblerArgs,
        proof_index: u8,
    ) -> Result<()> {
        platform_gate_cpi(
            hpl_hive_control::state::SerializableActions::ManageAssembler,
            Some((proof_index, ctx.accounts.assembler.key())),
            ctx.accounts.project.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.hive_control.to_account_info(),
            ctx.accounts.instructions_sysvar.to_account_info(),
        )?;
        instructions::update_assembler(ctx, args)
    }

    pub fn create_block(
        ctx: Context<CreateBlock>,
        args: CreateBlockArgs,
        proof_index: u8,
    ) -> Result<()> {
        platform_gate_cpi(
            hpl_hive_control::state::SerializableActions::ManageAssembler,
            Some((proof_index, ctx.accounts.assembler.key())),
            ctx.accounts.project.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.hive_control.to_account_info(),
            ctx.accounts.instructions_sysvar.to_account_info(),
        )?;

        instructions::create_block(ctx, args)
    }

    pub fn create_block_definition(
        ctx: Context<CreateBlockDefinition>,
        args: BlockDefinitionValue,
        proof_index: u8,
    ) -> Result<()> {
        platform_gate_cpi(
            hpl_hive_control::state::SerializableActions::ManageAssembler,
            Some((proof_index, ctx.accounts.assembler.key())),
            ctx.accounts.project.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.hive_control.to_account_info(),
            ctx.accounts.instructions_sysvar.to_account_info(),
        )?;
        instructions::create_block_definition(ctx, args)
    }

    pub fn create_nft(ctx: Context<CreateNFT>) -> Result<()> {
        platform_gate_cpi(
            hpl_hive_control::state::SerializableActions::PublicLow,
            None,
            ctx.accounts.project.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.hive_control.to_account_info(),
            ctx.accounts.instructions_sysvar.to_account_info(),
        )?;

        instructions::create_nft(ctx)
    }

    pub fn add_block(ctx: Context<AddBlock>) -> Result<()> {
        platform_gate_cpi(
            hpl_hive_control::state::SerializableActions::FeeExempt,
            None,
            ctx.accounts.project.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.hive_control.to_account_info(),
            ctx.accounts.instructions_sysvar.to_account_info(),
        )?;

        instructions::add_block(ctx)
    }

    pub fn mint_nft(ctx: Context<MintNFT>) -> Result<()> {
        platform_gate_cpi(
            hpl_hive_control::state::SerializableActions::PublicHigh,
            None,
            ctx.accounts.project.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.hive_control.to_account_info(),
            ctx.accounts.instructions_sysvar.to_account_info(),
        )?;

        instructions::mint_nft(ctx)
    }

    pub fn burn_nft(ctx: Context<BurnNFT>) -> Result<()> {
        platform_gate_cpi(
            hpl_hive_control::state::SerializableActions::PublicLow,
            None,
            ctx.accounts.project.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.hive_control.to_account_info(),
            ctx.accounts.instructions_sysvar.to_account_info(),
        )?;

        instructions::burn_nft(ctx)
    }

    pub fn remove_block(ctx: Context<RemoveBlock>) -> Result<()> {
        platform_gate_cpi(
            hpl_hive_control::state::SerializableActions::PublicLow,
            None,
            ctx.accounts.project.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.hive_control.to_account_info(),
            ctx.accounts.instructions_sysvar.to_account_info(),
        )?;

        instructions::remove_block(ctx)
    }

    pub fn set_nft_generated(
        ctx: Context<SetNFTGenerated>,
        args: SetNFTGeneratedArgs,
        proof_index: u8,
    ) -> Result<()> {
        platform_gate_cpi(
            hpl_hive_control::state::SerializableActions::PublicLow,
            Some((proof_index, ctx.accounts.assembler.key())),
            ctx.accounts.project.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.hive_control.to_account_info(),
            ctx.accounts.instructions_sysvar.to_account_info(),
        )?;

        instructions::set_nft_generated(ctx, args)
    }

    pub fn update_metadata(
        ctx: Context<UpdateMetadata>,
        args: UpdateMetadataArgs,
        proof_index: u8,
    ) -> Result<()> {
        platform_gate_cpi(
            hpl_hive_control::state::SerializableActions::PublicLow,
            Some((proof_index, ctx.accounts.assembler.key())),
            ctx.accounts.project.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.hive_control.to_account_info(),
            ctx.accounts.instructions_sysvar.to_account_info(),
        )?;

        instructions::update_metadata(ctx, args)
    }
}
