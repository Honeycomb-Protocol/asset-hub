use anchor_lang::prelude::*;

/// Assembler state account
#[account]
pub struct Assembler {
    pub bump: u8,

    /// The wallet that has authority to modify the assembler
    pub authority: Pubkey,

    /// The collection address of the assembler generated NFTs
    pub collection: Pubkey,

    /// The collection name to be associated with each nft
    pub collection_name: String,

    /// The collection symbol to be associated with each nft
    pub collection_symbol: String,

    /// The collection description to be associated with each nft
    pub collection_description: String,

    /// The base uri of each nft metadata
    pub nft_base_uri: String,

    /// Action to take for the block SFT while assembling
    pub assembling_action: AssemblingAction,

    /// The number of NFTs created by this assembler
    pub nfts: u16,
}
impl Assembler {
    pub const LEN: usize = 144;
}

/// Assembling Action
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub enum AssemblingAction {
    /// burn the block token
    Burn,

    /// Freeze the block token
    Freeze,

    /// Take custody of the block token
    TakeCustody,
}
impl PartialEq for AssemblingAction {
    fn eq(&self, other: &Self) -> bool {
        match (self, other) {
            (AssemblingAction::Burn, AssemblingAction::Burn) => true,
            (AssemblingAction::Freeze, AssemblingAction::Freeze) => true,
            (AssemblingAction::TakeCustody, AssemblingAction::TakeCustody) => true,
            _ => false,
        }
    }
}

/// Block types
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
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
impl PartialEq for BlockType {
    fn eq(&self, other: &Self) -> bool {
        match (self, other) {
            (BlockType::Enum, BlockType::Enum) => true,
            (BlockType::Boolean, BlockType::Boolean) => true,
            (BlockType::Random, BlockType::Random) => true,
            (BlockType::Computed, BlockType::Computed) => true,
            _ => false,
        }
    }
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
}
impl Block {
    pub const LEN: usize = 64;
}

/// Block Definition Value
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
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
impl PartialEq for BlockDefinitionValue {
    fn eq(&self, other: &Self) -> bool {
        match (self, other) {
            (
                BlockDefinitionValue::Enum {
                    is_collection: is_collection1,
                    value: value1,
                    image: image1,
                },
                BlockDefinitionValue::Enum {
                    is_collection: is_collection2,
                    value: value2,
                    image: image2,
                },
            ) => is_collection1 == is_collection2 && value1 == value2 && image1 == image2,
            (
                BlockDefinitionValue::Boolean { value: value1 },
                BlockDefinitionValue::Boolean { value: value2 },
            ) => value1 == value2,
            (
                BlockDefinitionValue::Number {
                    min: min1,
                    max: max1,
                },
                BlockDefinitionValue::Number {
                    min: min2,
                    max: max2,
                },
            ) => min1 == min2 && max1 == max2,
            _ => false,
        }
    }
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
}
impl BlockDefinition {
    pub const LEN: usize = 128;
}

/// NFT state account
#[account]
pub struct NFT {
    pub bump: u8,

    /// The assembler this NFT is associated to
    pub assembler: Pubkey,

    /// The wallet that has pre mint authority over this NFT
    pub authority: Pubkey,

    /// The collection address of this NFT
    pub collection_address: Pubkey,

    /// The mint address of this NFT
    pub mint: Pubkey,

    /// Flag if this NFT is minted
    pub minted: bool,

    /// The id of the NFT
    pub id: u16,

    /// The uri of the NFT
    pub uri: String,
}
impl NFT {
    pub const LEN: usize = 160;
}

/// NFT Attribute Value
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum NFTAttributeValue {
    /// If the attribute has a string value
    String { value: String },

    /// If the attribute has a boolean value
    Boolean { value: bool },

    /// If the attribute value is a number
    Number { value: u64 },
}

/// NFT Attribute
#[account]
pub struct NFTAttribute {
    pub bump: u8,

    /// The NFT this attribute is associated to
    pub nft: Pubkey,

    /// The block account
    pub block: Pubkey,

    /// The block definition
    pub block_definition: Pubkey,

    /// The token mint associated with this attribute
    pub mint: Pubkey,

    /// Attribute name
    pub attribute_name: String,

    /// Attribute value
    pub attribute_value: NFTAttributeValue,
}
impl NFTAttribute {
    pub const LEN: usize = 192;
}
