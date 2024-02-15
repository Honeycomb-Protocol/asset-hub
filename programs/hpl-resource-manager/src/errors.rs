use anchor_lang::prelude::*;

#[error_code]
pub enum ResourceErrorCode {
    #[msg("The resource is not initialized")]
    ResourceNotInitialized,

    #[msg("The resource provided is not found")]
    ResourceNotFound,

    #[msg("The amount provided is insufficient")]
    InsufficientAmount,
}
