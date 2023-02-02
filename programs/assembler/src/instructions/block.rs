use crate::{
    errors::ErrorCode,
    state::{Assembler, Block, BlockDefinition, BlockDefinitionValue, BlockType},
};
use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

/// Accounts used in the create block instruction
#[derive(Accounts)]
#[instruction(args: CreateBlockArgs)]
pub struct CreateBlock<'info> {
    /// Assembler state account
    #[account( has_one = authority )]
    pub assembler: Account<'info, Assembler>,

    /// Block account
    #[account(
      init, payer = payer,
      space = Block::LEN,
      seeds = [
        b"block".as_ref(),
        args.block_name.as_bytes(),
        &[args.block_order],
        assembler.key().as_ref(),
      ],
      bump,
    )]
    pub block: Account<'info, Block>,

    /// The wallet that holds the authority over the assembler
    #[account()]
    pub authority: Signer<'info>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub payer: Signer<'info>,

    /// NATIVE SYSTEM PROGRAM
    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreateBlockArgs {
    pub block_order: u8,
    pub is_graphical: bool,
    pub block_type: BlockType,
    pub block_name: String,
}

/// Create a new block
pub fn create_block(ctx: Context<CreateBlock>, args: CreateBlockArgs) -> Result<()> {
    let block = &mut ctx.accounts.block;
    block.bump = ctx.bumps["block"];
    block.assembler = ctx.accounts.assembler.key();
    block.is_graphical = args.is_graphical;
    block.block_order = args.block_order;
    block.block_type = args.block_type;
    block.block_name = args.block_name;
    Ok(())
}

/// Accounts used in the create block definition instruction
#[derive(Accounts)]
pub struct CreateBlockDefinition<'info> {
    /// Assembler state account
    #[account( has_one = authority )]
    pub assembler: Account<'info, Assembler>,

    /// Block account
    #[account( has_one = assembler )]
    pub block: Account<'info, Block>,

    /// Block Definition account
    #[account(
      init, payer = payer,
      space = BlockDefinition::LEN,
      seeds = [
        b"block_definition".as_ref(),
        block.key().as_ref(),
        block_definition_mint.key().as_ref(),
      ],
      bump,
    )]
    pub block_definition: Account<'info, BlockDefinition>,

    /// Mint of the SFT/Collection
    #[account(mut)]
    pub block_definition_mint: Account<'info, Mint>,

    /// The wallet that holds the authority over the assembler
    #[account()]
    pub authority: Signer<'info>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub payer: Signer<'info>,

    /// NATIVE SYSTEM PROGRAM
    pub system_program: Program<'info, System>,
}

/// Create a new block definition
pub fn create_block_definition(
    ctx: Context<CreateBlockDefinition>,
    args: BlockDefinitionValue,
) -> Result<()> {
    let block_definition = &mut ctx.accounts.block_definition;
    block_definition.bump = ctx.bumps["block_definition"];
    block_definition.block = ctx.accounts.block.key();
    block_definition.mint = ctx.accounts.block_definition_mint.key();
    block_definition.value = args;

    match &block_definition.value {
        BlockDefinitionValue::Enum {
            is_collection: _is_collection,
            value: _value,
            image: _image,
        } => {
            if ctx.accounts.block.block_type != BlockType::Enum {
                return Err(ErrorCode::BlockTypeMismatch.into());
            }
            // if ctx.accounts.block.is_graphical && image.is_none() {
            //     return Err(ErrorCode::RequiredBlockImage.into());
            // }
            return Ok(());
        }
        BlockDefinitionValue::Boolean { value: _value1 } => {
            if ctx.accounts.block.block_type != BlockType::Boolean {
                return Err(ErrorCode::BlockTypeMismatch.into());
            }
            return Ok(());
        }
        BlockDefinitionValue::Number {
            min: _min1,
            max: _max1,
        } => {
            if ctx.accounts.block.block_type != BlockType::Random
                && ctx.accounts.block.block_type != BlockType::Computed
            {
                return Err(ErrorCode::BlockTypeMismatch.into());
            }
            return Ok(());
        }
    };
}
