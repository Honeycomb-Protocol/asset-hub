use {anchor_lang::prelude::*, hpl_toolkit::schema::*};

/// A currency is a project associated spl token.
/// It is used as in-game utility currency.
/// PDA: ['currency', mint]
/// Category: currency_state
#[account]
#[derive(ToSchema)]
pub struct Currency {
    pub bump: u8,

    /// The project this currency is associated with.
    pub project: Pubkey,

    /// The spl mint of the currency.
    pub mint: Pubkey,

    /// The type of currency.
    pub kind: CurrencyKind,

    /// Transaction Hook
    pub tx_hook: TxHook,
}

/// Default implementation for `Currency`.
impl Currency {
    /// The size of the serialized `Currency` account.
    pub const LEN: usize = 8 + 80;

    /// Sets default values for `Currency`.
    pub fn set_defaults(&mut self) {
        self.bump = 0;
        self.project = Pubkey::default();
        self.mint = Pubkey::default();
        self.kind = CurrencyKind::Permissioned {
            kind: PermissionedCurrencyKind::NonCustodial,
        };
        self.tx_hook = TxHook::User;
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, ToSchema)]
pub enum TxHook {
    /// No hook
    User,
    /// Hook to a program
    Authority,
    /// Hook to a program
    CPIProgram {
        /// The program id
        program_id: Pubkey,
        /// The data to be passed to the program
        data: Vec<u8>,
    },
}

/// The type of currency.
/// Custodial currencies are held by the program for the user.
/// NonCustodial currencies are transfered to holders wallet.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, ToSchema)]
pub enum CurrencyKind {
    /// Represents a permissioned currency, further specified by `PermissionedCurrencyKind`.
    Permissioned { kind: PermissionedCurrencyKind },
    /// Represents a wrapped currency.
    Wrapped,
}

/// The sub-type of permissioned currency.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, ToSchema)]
pub enum PermissionedCurrencyKind {
    /// Represents a non-custodial permissioned currency.
    NonCustodial,
    /// Represents a custodial permissioned currency.
    Custodial,
}
