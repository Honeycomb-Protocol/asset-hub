use anchor_lang::prelude::*;
use hpl_utils::Default;

/// A holder is a middle man account between wallet and currency.
/// It contains detail about the token account that holds the currency
#[account]
pub struct HolderAccount {
    pub bump: u8,
    /// The currency associated with this account
    pub currency: Pubkey,
    /// The owner of this account.
    pub owner: Pubkey,
    /// The token account that holds the currency.
    pub token_account: Pubkey,
}
impl Default for HolderAccount {
    const LEN: usize = 8 + 96;

    fn set_defaults(&mut self) {
        self.bump = 0;
        self.currency = Pubkey::default();
        self.owner = Pubkey::default();
        self.token_account = Pubkey::default();
    }
}
