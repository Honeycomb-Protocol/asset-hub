use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod structs;
pub mod utils;

use instructions::*;

declare_id!("AXX2agYcoDwGFsgEWvSitqfGH4ooKXUqK5P7Ch9raDJT");

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

    pub fn create_block_definition_enum(
        ctx: Context<CreateBlockDefinitionEnum>,
        args: CreateBlockDefinitionEnumArgs,
    ) -> Result<()> {
        instructions::create_block_definition_enum(ctx, args)
    }

    pub fn create_block_definition_boolean(
        ctx: Context<CreateBlockDefinitionBoolean>,
        args: CreateBlockDefinitionBooleanArgs,
    ) -> Result<()> {
        instructions::create_block_definition_boolean(ctx, args)
    }

    pub fn create_block_definition_number(
        ctx: Context<CreateBlockDefinitionNumber>,
        args: CreateBlockDefinitionNumberArgs,
    ) -> Result<()> {
        instructions::create_block_definition_number(ctx, args)
    }

    pub fn create_nft(ctx: Context<CreateNFT>, args: CreateNFTArgs) -> Result<()> {
        instructions::create_nft(ctx, args)
    }

    pub fn add_block(ctx: Context<AddBlock>) -> Result<()> {
        instructions::add_block(ctx)
    }

    pub fn mint_nft(ctx: Context<MintNFT>) -> Result<()> {
        instructions::mint_nft(ctx)
    }
}
