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
    holder: Pubkey,

    // the resource this holding is associated with
    balance: u64,
}
