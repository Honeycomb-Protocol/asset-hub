use {anchor_lang::prelude::*, hpl_utils::Default};

/// A currency is a project associated spl token.
/// It is used as in-game utility currency.
/// PDA: ['currency', mint]
/// Category: currency_state
#[account]
#[derive(Debug)]
pub struct Currency {
    pub bump: u8,

    /// The project this currency is associated with.
    pub project: Pubkey,

    /// The spl mint of the currency.
    pub mint: Pubkey,

    /// The type of currency.
    pub kind: CurrencyKind,
}

/// Default implementation for `Currency`.
impl Default for Currency {
    /// The size of the serialized `Currency` account.
    const LEN: usize = 8 + 80;

    /// Sets default values for `Currency`.
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
    /// Represents a permissioned currency, further specified by `PermissionedCurrencyKind`.
    Permissioned { kind: PermissionedCurrencyKind },
    /// Represents a wrapped currency.
    Wrapped,
}

/// The sub-type of permissioned currency.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum PermissionedCurrencyKind {
    /// Represents a non-custodial permissioned currency.
    NonCustodial,
    /// Represents a custodial permissioned currency.
    Custodial,
}
