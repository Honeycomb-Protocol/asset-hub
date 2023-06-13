use anchor_lang::prelude::error_code;

#[error_code]
pub enum ErrorCode {
    #[msg("Opertaion overflowed")]
    Overflow,

    #[msg("You are not authorized to perform this action")]
    Unauthorized,

    #[msg("Metadata is invalid for the nft")]
    InvalidMetadata,

    #[msg("The holder account is currrently Inactive")]
    InactiveHolder,
}
