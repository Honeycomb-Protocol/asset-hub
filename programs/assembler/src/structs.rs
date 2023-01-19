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

    /// Action to take for the block SFT while assembling
    pub assembling_action: AssemblingAction,

    /// The number of NFTs created by this assembler
    pub nfts: u16,
}
impl Assembler {
    pub const LEN: usize = 144;
}

/// Assembling Action
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum AssemblingAction {
    /// burn the block SFT
    Burn = 0,

    /// Take custody of the block SFT
    TakeCustody = 1,
}
impl PartialEq for AssemblingAction {
    fn eq(&self, other: &Self) -> bool {
        match (self, other) {
            (AssemblingAction::Burn, AssemblingAction::Burn) => true,
            (AssemblingAction::TakeCustody, AssemblingAction::TakeCustody) => true,
            _ => false,
        }
    }
}

/// Block types
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
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

/// Block Definition Account
#[account]
pub struct BlockDefinitionEnum {
    pub bump: u8,

    /// The block this definition is associated to
    pub block: Pubkey,

    /// The mint address of this block definition
    pub mint: Pubkey,

    /// Flag if the given mint is of a collection
    pub is_collection: bool,

    /// The value of the block
    pub value: String,

    /// [optional] Image url of the block if it's graphic
    pub image: Option<String>,
}
impl BlockDefinitionEnum {
    pub const LEN: usize = 120;
}

/// Block Definition Account
#[account]
pub struct BlockDefinitionBoolean {
    pub bump: u8,

    /// The block this definition is associated to
    pub block: Pubkey,

    /// The value of the block defintion
    pub value: bool,
}
impl BlockDefinitionBoolean {
    pub const LEN: usize = 34;
}

/// Block Definition Account
#[account]
pub struct BlockDefinitionNumber {
    pub bump: u8,

    /// The block this definition is associated to
    pub block: Pubkey,

    /// The minimum number allowed as value
    pub min: u64,

    /// The maximum number allowed as value
    pub max: u64,
}
impl BlockDefinitionNumber {
    pub const LEN: usize = 52;
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

    /// The name of the NFT
    pub name: String,

    /// The symbol of the NFT
    pub symbol: String,

    /// The description of the NFT
    pub description: String,

    /// The image url of the NFT
    pub image: String,
}
impl NFT {
    pub const LEN: usize = 232;
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

    /// Attribute name
    pub attribute_name: String,

    /// Attribute value
    pub attribute_value: String,
}
impl NFTAttribute {
    pub const LEN: usize = 152;
}
