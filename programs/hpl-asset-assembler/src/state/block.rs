use anchor_lang::prelude::*;

/// Block types
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq)]
pub enum BlockType {
    /// If the block has a string value
    Enum = 0,

    /// If the block has a boolean value
    Boolean = 1,

    /// If the block value is a random number
    Random = 2,

    /// [LATER] If the block value is a computed number
    Computed = 3,
}

/// Block account
#[account]
pub struct Block {
    pub bump: u8,

    /// The assembler this block is associated to
    pub assembler: Pubkey,

    /// The order of the block in layers
    pub block_order: u8,

    /// Is there a image for this block
    pub is_graphical: bool,

    /// The type of the block/trait_type
    pub block_type: BlockType,

    /// The name of the block
    pub block_name: String,

    /// The name of the block
    pub block_defination_counts: u16,
}
impl Block {
    pub const LEN: usize = 64 + 8 + (40 * 1); // base size + 8 align + string extra
}

/// Block Definition Account
#[account]
pub struct BlockDefinition {
    pub bump: u8,

    /// The block this definition is associated to
    pub block: Pubkey,

    /// The mint address of the block definition
    pub mint: Pubkey,

    /// The value of the block definition
    pub value: BlockDefinitionValue,

    pub defination_index: u16,
}
impl BlockDefinition {
    pub const LEN: usize = 128 + 8; // base size + 8 align
}

/// Block Definition Value
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum BlockDefinitionValue {
    Enum {
        is_collection: bool,
        value: String,
        image: Option<String>,
    },
    Boolean {
        value: bool,
    },
    Number {
        min: u64,
        max: u64,
    },
}
