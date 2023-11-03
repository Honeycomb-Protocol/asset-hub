use {
    crate::{errors::ErrorCode, utils::Conditional},
    anchor_lang::prelude::*,
    hpl_utils::Default,
};

/// A Payment structure account defines a single or series of payments required to be made by a user.
/// PDA: ['payment_session', payment_structure, payer]
/// Category: payment_session_state
#[account]
pub struct PaymentSession {
    pub bump: u8,
    /// The payment structure.
    pub payment_structure: Pubkey,
    /// The payer of this payment structure.
    pub payer: Pubkey,
    /// Payments conditional status
    pub payments_status: Conditional<bool>,
}

/// Default implementation for `PaymentSession`.
impl Default for PaymentSession {
    /// The size of the serialized `PaymentSession` account.
    const LEN: usize = 8 + 104;

    /// Sets default values for `PaymentSession`.
    fn set_defaults(&mut self) {
        self.bump = 0;
    }
}

impl PaymentSession {
    pub fn get_initial_len(payment: &Conditional<bool>) -> usize {
        Self::LEN + payment.get_len()
    }

    pub fn eval_status(&self) -> Result<()> {
        self.payments_status.evaluate(&|&item| {
            if item {
                Ok(())
            } else {
                Err(ErrorCode::IncompletePayment.into())
            }
        })
    }

    pub fn is_completed(&self) -> bool {
        self.eval_status().is_ok()
    }
}
