use anchor_lang::prelude::*;

pub mod bpf_writer;
pub mod errors;
pub mod instructions;
pub mod structs;
pub mod utils;

use instructions::*;
use structs::*;

declare_id!("Gq1333CkB2sGernk72TKfDVLnHj9LjmeijFujM2ULxJz");

#[program]
pub mod assembler {
    use super::*;

    pub fn create_assembler(
        ctx: Context<CreateAssembler>,
        args: CreateAssemblerArgs,
    ) -> Result<()> {
        instructions::create_assembler(ctx, args)
    }

    pub fn create_assembler_collection_master_edition(
        ctx: Context<CreateAssemblerCollectionMasterEdition>,
    ) -> Result<()> {
        instructions::create_assembler_collection_master_edition(ctx)
    }

    pub fn create_block(ctx: Context<CreateBlock>, args: CreateBlockArgs) -> Result<()> {
        instructions::create_block(ctx, args)
    }

    pub fn create_block_definition(
        ctx: Context<CreateBlockDefinition>,
        args: BlockDefinitionValue,
    ) -> Result<()> {
        instructions::create_block_definition(ctx, args)
    }

    pub fn create_nft(ctx: Context<CreateNFT>) -> Result<()> {
        instructions::create_nft(ctx)
    }

    pub fn add_block(ctx: Context<AddBlock>) -> Result<()> {
        instructions::add_block(ctx)
    }

    pub fn mint_nft(ctx: Context<MintNFT>) -> Result<()> {
        instructions::mint_nft(ctx)
    }

    pub fn burn_nft(ctx: Context<BurnNFT>) -> Result<()> {
        instructions::burn_nft(ctx)
    }

    pub fn remove_block(ctx: Context<RemoveBlock>) -> Result<()> {
        instructions::remove_block(ctx)
    }

    pub fn set_nft_generated(ctx: Context<SetNFTGenerated>, new_uri: String) -> Result<()> {
        instructions::set_nft_generated(ctx, new_uri)
    }

    pub fn update_assembler(
        ctx: Context<UpdateAssembler>,
        args: UpdateAssemblerArgs,
    ) -> Result<()> {
        instructions::update_assembler(ctx, args)
    }
}
