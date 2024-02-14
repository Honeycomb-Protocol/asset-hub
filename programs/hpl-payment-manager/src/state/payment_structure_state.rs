use {crate::utils::Conditional, anchor_lang::prelude::*};

/// A Payment structure account defines a single or series of payments required to be made by a user.
/// PDA: ['payment_structure', unique_key]
/// Category: payment_structure_state
#[account]
pub struct PaymentStructure {
    pub bump: u8,
    /// The unique identifier for this payment structure.
    pub unique_key: Pubkey,
    /// The authority over this payment structure
    pub authority: Pubkey,
    /// Requirements
    pub payments: Conditional<Payment>,
    /// Currently active payment sessions
    pub active_sessions: u64,
}

/// Default implementation for `PaymentStructure`.
impl PaymentStructure {
    /// The size of the serialized `PaymentStructure` account.
    pub const LEN: usize = 8 + 168;

    /// Sets default values for `PaymentStructure`.
    pub fn set_defaults(&mut self) {
        self.bump = 0;
        self.unique_key = Pubkey::default();
        self.authority = Pubkey::default();
        self.payments = Conditional::None;
        self.active_sessions = 0;
    }
}

impl PaymentStructure {
    pub fn get_initial_len(payments: &Conditional<Payment>) -> usize {
        Self::LEN + payments.get_len()
    }
}

/// The payment required to be accepted from user.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub struct Payment {
    /// Indicates whether this payment should be bbur.
    pub payment_method: PaymentMethod,

    /// The kind of payment method.
    pub kind: PaymentKind,
}

/// The payment method to be used for a specific payment.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum PaymentMethod {
    /// Burn the payment asset
    Burn,

    /// Transfer the payment asset to a particular wallet or a PDA
    Transfer(Pubkey),
}

/// Represents the asset to be accepted as payment.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum PaymentKind {
    /// Payment method for NFTs with associated criteria.
    Nft(NftPayment),

    /// Payment method using a hypothetical currency with an address.
    HplCurrency { address: Pubkey, amount: u64 },
}

/// Represents criteria for NFT payments.
#[derive(AnchorSerialize, AnchorDeserialize, Copy, Clone, PartialEq)]
pub enum NftPayment {
    /// The particular NFT mint to be accepted as payment
    Mint(Pubkey),
    /// All NFTs having the specified creator.
    Creator(Pubkey),
    /// All NFTs having the specified collection.
    ///
    /// NOTE: Not supported for cNFTs.
    Collection(Pubkey),
    /// All NFTs having the specified tree.
    ///
    /// NOTE: Not supported for NFTs.
    Tree(Pubkey),
}
