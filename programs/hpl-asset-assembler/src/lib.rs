use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;
use state::*;

declare_id!("Gq1333CkB2sGernk72TKfDVLnHj9LjmeijFujM2ULxJz");

#[program]
pub mod hpl_asset_assembler {
    use super::*;

    pub fn create_assembler(
        ctx: Context<CreateAssembler>,
        args: CreateAssemblerArgs,
    ) -> Result<()> {
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
                    rent_sysvar: ctx.accounts.rent.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    vault: ctx.accounts.vault.to_account_info(),
                },
            ),
            hpl_hive_control::instructions::AddRemoveServiceArgs {
                service: hpl_hive_control::state::Service::Assembler {
                    assembler_id: ctx.accounts.assembler.key(),
                },
                remove: Some(false),
            },
        )?;

        instructions::create_assembler(ctx, args)
    }

    pub fn update_assembler(
        ctx: Context<UpdateAssembler>,
        args: UpdateAssemblerArgs,
        proof_index: u8,
    ) -> Result<()> {
        hpl_hive_control::instructions::platform_gate_fn(
            hpl_hive_control::constants::ACTIONS.manage_assembler,
            Some((proof_index, ctx.accounts.assembler.key())),
            &ctx.accounts.project,
            ctx.accounts.authority.key(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
        )?;

        instructions::update_assembler(ctx, args)
    }

    pub fn create_block(
        ctx: Context<CreateBlock>,
        args: CreateBlockArgs,
        proof_index: u8,
    ) -> Result<()> {
        hpl_hive_control::instructions::platform_gate_fn(
            hpl_hive_control::constants::ACTIONS.manage_assembler,
            Some((proof_index, ctx.accounts.assembler.key())),
            &ctx.accounts.project,
            ctx.accounts.authority.key(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
        )?;

        instructions::create_block(ctx, args)
    }

    pub fn create_block_definition(
        ctx: Context<CreateBlockDefinition>,
        args: BlockDefinitionValue,
        proof_index: u8,
    ) -> Result<()> {
        hpl_hive_control::instructions::platform_gate_fn(
            hpl_hive_control::constants::ACTIONS.manage_assembler,
            Some((proof_index, ctx.accounts.assembler.key())),
            &ctx.accounts.project,
            ctx.accounts.authority.key(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
        )?;

        instructions::create_block_definition(ctx, args)
    }

    pub fn create_nft(ctx: Context<CreateNFT>) -> Result<()> {
        hpl_hive_control::instructions::platform_gate_fn(
            hpl_hive_control::constants::ACTIONS.public_low,
            None,
            &ctx.accounts.project,
            ctx.accounts.authority.key(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
        )?;

        instructions::create_nft(ctx)
    }

    pub fn add_block(ctx: Context<AddBlock>) -> Result<()> {
        hpl_hive_control::instructions::platform_gate_fn(
            hpl_hive_control::constants::ACTIONS.public_high,
            None,
            &ctx.accounts.project,
            ctx.accounts.authority.key(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
        )?;

        instructions::add_block(ctx)
    }

    pub fn mint_nft(ctx: Context<MintNFT>) -> Result<()> {
        hpl_hive_control::instructions::platform_gate_fn(
            hpl_hive_control::constants::ACTIONS.public_low,
            None,
            &ctx.accounts.project,
            ctx.accounts.authority.key(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
        )?;

        instructions::mint_nft(ctx)
    }

    pub fn burn_nft(ctx: Context<BurnNFT>) -> Result<()> {
        hpl_hive_control::instructions::platform_gate_fn(
            hpl_hive_control::constants::ACTIONS.public_low,
            None,
            &ctx.accounts.project,
            ctx.accounts.authority.key(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
        )?;

        instructions::burn_nft(ctx)
    }

    pub fn remove_block(ctx: Context<RemoveBlock>) -> Result<()> {
        hpl_hive_control::instructions::platform_gate_fn(
            hpl_hive_control::constants::ACTIONS.public_high,
            None,
            &ctx.accounts.project,
            ctx.accounts.authority.key(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
        )?;

        instructions::remove_block(ctx)
    }

    pub fn set_nft_generated(
        ctx: Context<SetNFTGenerated>,
        args: SetNFTGeneratedArgs,
        proof_index: u8,
    ) -> Result<()> {
        hpl_hive_control::instructions::platform_gate_fn(
            hpl_hive_control::constants::ACTIONS.manage_assembler,
            Some((proof_index, ctx.accounts.assembler.key())),
            &ctx.accounts.project,
            ctx.accounts.authority.key(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
        )?;

        instructions::set_nft_generated(ctx, args)
    }

    pub fn update_metadata(
        ctx: Context<UpdateMetadata>,
        args: UpdateMetadataArgs,
        proof_index: u8,
    ) -> Result<()> {
        hpl_hive_control::instructions::platform_gate_fn(
            hpl_hive_control::constants::ACTIONS.manage_assembler,
            Some((proof_index, ctx.accounts.assembler.key())),
            &ctx.accounts.project,
            ctx.accounts.authority.key(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
        )?;

        instructions::update_metadata(ctx, args)
    }
}
