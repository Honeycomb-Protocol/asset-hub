use {crate::traits::*, anchor_lang::prelude::*};

/// The staking account linked to the NFT
#[account]
pub struct NFT {
    pub bump: u8,

    /// The project this NFT is staked in
    pub project: Pubkey,

    /// wallet of the staker
    pub staker: Pubkey,

    /// The mint of the NFT
    pub mint: Pubkey,

    /// Last time the owner claimed rewards
    pub last_claim: i64,
}

impl Default for NFT {
    const LEN: usize = 8 + 112;

    fn set_defaults(&mut self) {
        self.bump = 0;
        self.project = Pubkey::default();
        self.staker = Pubkey::default();
        self.mint = Pubkey::default();
        self.last_claim = 0;
    }
}
