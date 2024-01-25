use anchor_lang::prelude::*;

#[error_code]
pub enum ResourceErrorCode {
    #[msg("The resource is not initialized")]
    ResourceNotInitialized,
}
