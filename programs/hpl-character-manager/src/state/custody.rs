use {super::CharacterSource, anchor_lang::prelude::*};

/// Game character (particulary NFT) PDA Account
/// PDA: ['character', mint]
/// Category: nft_state
#[account]
pub struct AssetCustody {
    pub bump: u8,

    /// Where this character came from
    pub wallet: Pubkey,

    pub character_model: Option<Pubkey>,
    pub source: Option<CharacterSource>,
}

impl AssetCustody {
    pub const LEN: usize = 8 + 134;

    pub fn set_defaults(&mut self) {
        self.bump = 0;
        self.wallet = Pubkey::default();
        self.character_model = None;
        self.source = None;
    }
}
