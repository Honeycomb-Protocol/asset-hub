use anchor_lang::prelude::*;

#[error_code]
pub enum ResourceErrorCode {
    #[msg("The resource is not initialized")]
    ResourceNotInitialized,

    #[msg("The amount provided for burning is greater than the amount of the held in the account")]
    InsufficientAmount,
}
