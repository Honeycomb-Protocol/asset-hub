use anchor_lang::prelude::*;

#[error_code]
pub enum ResourceErrorCode {
    #[msg("The resource is not initialized")]
    ResourceNotInitialized,

    #[msg("The amount provided is greater than the amount that is held in the account")]
    InsufficientAmount,
}
