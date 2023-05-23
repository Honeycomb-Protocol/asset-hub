use {anchor_lang::prelude::*, hpl_utils::Default};

/// A currency is a project associated spl token.
/// It is used as in-game utility currency.
#[account]
pub struct Currency {
    pub bump: u8,

    /// The project this currency is associated with.
    pub project: Pubkey,

    /// The spl mint of the currency.
    pub mint: Pubkey,

    /// The type of currency.
    pub kind: CurrencyKind,
}
impl Default for Currency {
    const LEN: usize = 8 + 70;

    fn set_defaults(&mut self) {
        self.bump = 0;
        self.project = Pubkey::default();
        self.mint = Pubkey::default();
        self.kind = CurrencyKind::Permissioned {
            kind: PermissionedCurrencyKind::NonCustodial,
        };
    }
}

/// The type of currency.
/// Custodial currencies are held by the program for the user.
/// NonCustodial currencies are transfered to holders wallet.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum CurrencyKind {
    Permissioned { kind: PermissionedCurrencyKind },
    Wrapped,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum PermissionedCurrencyKind {
    NonCustodial,
    Custodial,
}
