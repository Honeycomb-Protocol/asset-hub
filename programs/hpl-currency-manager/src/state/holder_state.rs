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
    /// Holder status
    pub status: HolderStatus,
    /// When this holder account was created
    pub created_at: i64,
}
impl Default for HolderAccount {
    const LEN: usize = 8 + 131;

    fn set_defaults(&mut self) {
        self.bump = 0;
        self.currency = Pubkey::default();
        self.owner = Pubkey::default();
        self.token_account = Pubkey::default();
        self.status = HolderStatus::Active;
        self.created_at = 0;
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum HolderStatus {
    /// The holder is active and can be used to send and receive currency.
    Active,
    /// The holder is inactive and cannot be used to send or receive currency.
    Inactive,
}
