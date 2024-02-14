use {
    anchor_lang::{prelude::*, solana_program::keccak},
    hpl_compression::{
        compressed_account, CompressedData, CompressedSchema, Schema, SchemaValue, ToNode,
    },
    spl_account_compression::Node,
    std::collections::HashMap,
};

/// Resource holding state
#[compressed_account()]
pub struct Holding {
    // the holder of this holding
    pub holder: Pubkey,

    // the resource this holding is associated with
    pub balance: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct HoldingAccountArgs {
    pub holding: Holding,
    pub root: [u8; 32],
    pub leaf_idx: u32,
    pub source_hash: [u8; 32],
}
