use anchor_lang::prelude::error_code;

#[error_code]
pub enum ErrorCode {
    #[msg("Opertaion overflowed")]
    Overflow,

    #[msg("This payment structure has active payment sessions")]
    HasActivePaymentSessions,

    #[msg("Condition validation failed")]
    ConditionValidationFailed,

    #[msg("Invalid Conditional path")]
    InvalidConditionalPath,

    #[msg("Incomplete Payment")]
    IncompletePayment,

    #[msg("Invalid payment kind")]
    InvalidPayment,

    #[msg("Invalid nft passed as payment")]
    InvalidNftPayment,

    #[msg("The metadata provided for nft is not valid")]
    InvalidMetadata,

    #[msg("Invalid hpl currency passes as payment")]
    InvalidHplCurrencyPayment,

    #[msg("Invalid instruction for cnft")]
    InvalidInstructionForCnft,

    #[msg("Invalid beneficiary")]
    InvalidBeneficiary,

    #[msg("Payment already made")]
    PaymentAlreadyMade,
}
