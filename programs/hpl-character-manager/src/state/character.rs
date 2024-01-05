use {
    anchor_lang::{prelude::*, solana_program::keccak},
    hpl_compression::{
        compressed_account, CompressedData, CompressedDataChunk, CompressedSchema, Schema,
        SchemaValue, ToNode,
    },
    spl_account_compression::Node,
    std::collections::HashMap,
};

/// Game character (particulary NFT) PDA Account
#[compressed_account()]
pub struct CharacterSchema {
    /// The wallet that owns this character
    pub owner: Pubkey,

    /// Where this character came from
    #[chunk]
    pub source: CharacterSource,

    /// NFT being used by a HPL Service
    #[chunk]
    pub used_by: CharacterUsedBy,
}

impl CharacterSchema {
    pub fn is_used(&self) -> bool {
        match self.used_by {
            CharacterUsedBy::None => false,
            _ => true,
        }
    }
}

#[compressed_account(chunk = source)]
pub enum CharacterSource {
    Wrapped {
        mint: Pubkey,
        criteria: NftWrapCriteria,
        is_compressed: bool,
    },
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum NftWrapCriteria {
    Collection(Pubkey),
    Creator(Pubkey),
    MerkleTree(Pubkey),
}

impl CompressedSchema for NftWrapCriteria {
    fn schema() -> Schema {
        let mut schema = HashMap::new();
        schema.insert(String::from("Collection"), Option::<Pubkey>::schema());
        schema.insert(String::from("Creator"), Option::<Pubkey>::schema());
        schema.insert(String::from("MerkleTree"), Option::<Pubkey>::schema());
        Schema::Object(schema)
    }
    fn schema_value(&self) -> SchemaValue {
        let mut schema = HashMap::new();
        schema.insert(String::from("Collection"), None::<Pubkey>.schema_value());
        schema.insert(String::from("Creator"), None::<Pubkey>.schema_value());
        schema.insert(String::from("MerkleTree"), None::<Pubkey>.schema_value());
        match self {
            Self::Collection(pubkey) => {
                schema.insert(String::from("Collection"), pubkey.schema_value());
            }
            Self::Creator(pubkey) => {
                schema.insert(String::from("Creator"), pubkey.schema_value());
            }
            Self::MerkleTree(pubkey) => {
                schema.insert(String::from("MerkleTree"), pubkey.schema_value());
            }
        }
        SchemaValue::Object(schema)
    }
}

impl ToNode for NftWrapCriteria {
    fn to_node(&self) -> Node {
        match self {
            Self::Collection(address) => {
                keccak::hashv(&["Collection".as_bytes(), address.to_node().as_ref()]).to_bytes()
            }
            Self::Creator(address) => {
                keccak::hashv(&["Creator".as_bytes(), address.to_node().as_ref()]).to_bytes()
            }
            Self::MerkleTree(address) => {
                keccak::hashv(&["MerkleTree".as_bytes(), address.to_node().as_ref()]).to_bytes()
            }
        }
    }
}

#[compressed_account(chunk = used_by)]
pub enum CharacterUsedBy {
    None,
    Staking {
        pool: Pubkey,
        staker: Pubkey,
        staked_at: i64,
        claimed_at: i64,
    },
    Missions {
        participation: Pubkey,
    },
    Guild {
        id: Pubkey,
        role: GuildRole,
        order: u8,
    },
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum GuildRole {
    Chief,
    Member,
}

impl CompressedSchema for GuildRole {
    fn schema() -> Schema {
        let mut schema = HashMap::new();
        schema.insert(String::from("Chief"), Option::<bool>::schema());
        schema.insert(String::from("Member"), Option::<bool>::schema());
        Schema::Object(schema)
    }
    fn schema_value(&self) -> SchemaValue {
        let mut schema = HashMap::new();
        schema.insert(String::from("Chief"), None::<bool>.schema_value());
        schema.insert(String::from("Member"), None::<bool>.schema_value());
        match self {
            Self::Chief => {
                schema.insert(String::from("Collection"), true.schema_value());
            }
            Self::Member => {
                schema.insert(String::from("Creator"), true.schema_value());
            }
        }
        SchemaValue::Object(schema)
    }
}

impl ToNode for GuildRole {
    fn to_node(&self) -> Node {
        match self {
            Self::Chief => keccak::hashv(&["Chief".as_bytes()]).to_bytes(),
            Self::Member => keccak::hashv(&["Member".as_bytes()]).to_bytes(),
        }
    }
}
