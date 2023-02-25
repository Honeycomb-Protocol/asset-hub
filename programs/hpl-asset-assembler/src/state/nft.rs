use anchor_lang::{prelude::*};

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

    /// The name of the NFT
    pub name: String,

    /// The symbol of the NFT
    pub symbol: String,

    /// The description of the NFT
    pub description: String,

    /// Flag if this NFT is minted
    pub minted: bool,

    /// The id of the NFT
    pub id: u16,

    /// The uri of the NFT
    pub uri: String,

    /// Flag if the image for this nft is already generated
    pub is_generated: bool,

    /// NFT Attributes
    pub attributes: Vec<NFTAttribute>,
}
impl NFT {
    pub const LEN: usize = 256 + 8 + (40 * 4); // base size + 8 align + exta for strings
}

/// NFT Attribute
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct NFTAttribute {
    /// The block definition
    pub block_definition_index: u16,

    /// The token mint associated with this attribute
    pub mint: Pubkey,

    /// The order this attribute is to be place on
    pub order: u8,

    /// Attribute name
    pub attribute_name: String,

    /// Attribute value
    pub attribute_value: NFTAttributeValue,
}
impl NFTAttribute {
    pub const LEN: usize = 96 + (40 * 1);
}

/// NFT Attribute Value
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum NFTAttributeValue {
    /// If the attribute has a string value
    String { value: String },

    /// If the attribute has a boolean value
    Boolean { value: bool },

    /// If the attribute value is a number
    Number { value: u64 },
}

/// NFT Unique Constraint account
#[account]
pub struct NFTUniqueConstraint {
    pub bump: u8,

    /// The NFT this constraint is associated to
    pub nft: Pubkey,
}
impl NFTUniqueConstraint {
    pub const LEN: usize = 33 + 8; // base size + 8 align
}
