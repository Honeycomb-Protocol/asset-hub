use crate::{
    errors::ErrorCode,
    structs::{
        Assembler, Block, BlockDefinitionBoolean, BlockDefinitionEnum, BlockDefinitionNumber,
        BlockType,
    },
    utils::EXTRA_SIZE,
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
      space = EXTRA_SIZE + Block::LEN,
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

/// Accounts used in the create block definition enum instruction
#[derive(Accounts)]
#[instruction(args: CreateBlockDefinitionEnumArgs)]
pub struct CreateBlockDefinitionEnum<'info> {
    /// Assembler state account
    #[account( has_one = authority )]
    pub assembler: Account<'info, Assembler>,

    /// Block account
    #[account( has_one = assembler )]
    pub block: Account<'info, Block>,

    /// Block Definition account
    #[account(
      init, payer = payer,
      space = EXTRA_SIZE + BlockDefinitionEnum::LEN,
      seeds = [
        b"block_definition".as_ref(),
        args.value.as_bytes(),
        block.key().as_ref(),
      ],
      bump,
    )]
    pub block_definition: Account<'info, BlockDefinitionEnum>,

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

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreateBlockDefinitionEnumArgs {
    pub is_collection: bool,
    pub value: String,
    pub image: Option<String>,
}

/// Create a new block definition
pub fn create_block_definition_enum(
    ctx: Context<CreateBlockDefinitionEnum>,
    args: CreateBlockDefinitionEnumArgs,
) -> Result<()> {
    let block = &ctx.accounts.block;

    if block.block_type != BlockType::Enum {
        return Err(ErrorCode::BlockNotEnum.into());
    }

    if args.image.is_none() && block.is_graphical {
        return Err(ErrorCode::RequiredBlockImage.into());
    }

    let block_definition = &mut ctx.accounts.block_definition;
    block_definition.bump = ctx.bumps["block_definition"];
    block_definition.block = ctx.accounts.block.key();
    block_definition.mint = ctx.accounts.block_definition_mint.key();
    block_definition.value = args.value;
    block_definition.image = args.image;
    Ok(())
}

/// Accounts used in the create block definition number instruction
#[derive(Accounts)]
#[instruction(args: CreateBlockDefinitionNumberArgs)]
pub struct CreateBlockDefinitionNumber<'info> {
    /// Assembler state account
    #[account( has_one = authority )]
    pub assembler: Account<'info, Assembler>,

    /// Block account
    #[account( has_one = assembler )]
    pub block: Account<'info, Block>,

    /// Block Definition account
    #[account(
      init, payer = payer,
      space = EXTRA_SIZE + BlockDefinitionNumber::LEN,
      seeds = [
        b"block_definition".as_ref(),
        b"number".as_ref(),
        block.key().as_ref(),
      ],
      bump,
    )]
    pub block_definition: Account<'info, BlockDefinitionNumber>,

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
pub struct CreateBlockDefinitionNumberArgs {
    min: u64,
    max: u64,
}

/// Create a new block definition
pub fn create_block_definition_number(
    ctx: Context<CreateBlockDefinitionNumber>,
    args: CreateBlockDefinitionNumberArgs,
) -> Result<()> {
    let block = &ctx.accounts.block;

    if block.block_type != BlockType::Random || block.block_type != BlockType::Computed {
        return Err(ErrorCode::BlockNotNumber.into());
    }

    let block_definition = &mut ctx.accounts.block_definition;
    block_definition.bump = ctx.bumps["block_definition"];
    block_definition.block = ctx.accounts.block.key();
    block_definition.min = args.min;
    block_definition.max = args.max;
    Ok(())
}

/// Accounts used in the create block definition number instruction
#[derive(Accounts)]
#[instruction(args: CreateBlockDefinitionBooleanArgs)]
pub struct CreateBlockDefinitionBoolean<'info> {
    /// Assembler state account
    #[account( has_one = authority )]
    pub assembler: Account<'info, Assembler>,

    /// Block account
    #[account( has_one = assembler )]
    pub block: Account<'info, Block>,

    /// Block Definition account
    #[account(
      init, payer = payer,
      space = EXTRA_SIZE + BlockDefinitionBoolean::LEN,
      seeds = [
        b"block_definition".as_ref(),
        b"boolean".as_ref(),
        block.key().as_ref(),
      ],
      bump,
    )]
    pub block_definition: Account<'info, BlockDefinitionBoolean>,

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
pub struct CreateBlockDefinitionBooleanArgs {
    value: bool,
}

/// Create a new block definition
pub fn create_block_definition_boolean(
    ctx: Context<CreateBlockDefinitionBoolean>,
    args: CreateBlockDefinitionBooleanArgs,
) -> Result<()> {
    let block = &ctx.accounts.block;

    if block.block_type != BlockType::Boolean {
        return Err(ErrorCode::BlockNotBoolean.into());
    }

    let block_definition = &mut ctx.accounts.block_definition;
    block_definition.bump = ctx.bumps["block_definition"];
    block_definition.block = ctx.accounts.block.key();
    block_definition.value = args.value;
    Ok(())
}
