use anchor_lang::prelude::error_code;

#[error_code]
pub enum ErrorCode {
    #[msg("Opertaion overflowed")]
    Overflow,

    #[msg("Invalid metadata")]
    InvalidMetadata,

    #[msg("Invalid NFT")]
    InvalidNFT,
}
