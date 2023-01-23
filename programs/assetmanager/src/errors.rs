use anchor_lang::prelude::error_code;

#[error_code]
pub enum ErrorCode {
    #[msg("Max supply limit exceeded")]
    MaxSupplyExceeded,
}
