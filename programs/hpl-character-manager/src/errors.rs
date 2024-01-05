use anchor_lang::prelude::error_code;

#[error_code]
pub enum ErrorCode {
    #[msg("Metadata provided for mint is invalid")]
    InvalidMetadata,
    #[msg("Provided metadata didn't match any criteria config for the character model")]
    NoCriteriaMatched,
}
