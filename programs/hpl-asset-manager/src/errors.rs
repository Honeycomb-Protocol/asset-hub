use anchor_lang::prelude::error_code;

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized to mints")]
    UnauthorizedMint,
}
