use anchor_lang::prelude::error_code;

#[error_code]
pub enum HplCharacterManagerError {
    #[msg("Metadata provided for mint is invalid")]
    InvalidMetadata,
    #[msg("Provided metadata didn't match any criteria config for the character model")]
    NoCriteriaMatched,
    #[msg("Asset ID provided in context does not match the generated one")]
    AssetIDMismatch,
    #[msg("Source not found for the provided asset custody")]
    CustodialAssetSourceNotFound,
    #[msg("Character is currently being used by another service")]
    CharacterInUse,
    #[msg("Cannot change used_by type")]
    UsedByMismatch,
    #[msg("Merkle tree provided does not belong to this model")]
    MerkleTreeInvalid,
}
