use {crate::traits::*, anchor_lang::prelude::*};

/// The NFT collection project state account
#[account]
pub struct Project {
    pub bump: u8,
    pub vault_bump: u8,
    pub key: Pubkey,

    /// The wallet that has authority to modify the assembler
    pub authority: Pubkey,

    /// The mint of the token distributed to stakers
    pub reward_mint: Pubkey,

    /// The account owning tokens distributed to stakers
    pub vault: Pubkey,

    /// Lock type { Freeze, Custody }
    pub lock_type: LockType,

    /// name of the project
    pub name: String,

    /// The rewards per selected duration
    pub rewards_per_duration: u64,

    /// The duration of the rewards in seconds
    pub rewards_duration: u64,

    /// The maximum duration of the rewards in seconds
    pub max_rewards_duration: Option<u64>,

    /// The minimum stake duration in seconds
    pub min_stake_duration: Option<u64>,

    /// Cooldown duration in seconds
    pub cooldown_duration: Option<u64>,

    /// Flag to reset stake duration on restaking
    pub reset_stake_duration: bool,

    /// Allowed mints only
    pub allowed_mints: bool,

    /// Total staked nfts
    pub total_staked: u64,

    /// The unix_timestamp when the statking starts
    pub start_time: Option<i64>,

    /// The unix_timestamp when the statking ends
    pub end_time: Option<i64>,

    /// The collection mint addresses to be used for the project
    pub collections: Vec<Pubkey>,

    /// The creator addresses to be used for the project
    pub creators: Vec<Pubkey>,
}
impl Default for Project {
    const LEN: usize = 8 + 266;

    fn set_defaults(&mut self) {
        self.bump = 0;
        self.vault_bump = 0;
        self.key = Pubkey::default();
        self.authority = Pubkey::default();
        self.reward_mint = Pubkey::default();
        self.vault = Pubkey::default();
        self.lock_type = LockType::Freeze;
        self.name = "".to_string();
        self.rewards_per_duration = 0;
        self.rewards_duration = 1;
        self.max_rewards_duration = None;
        self.min_stake_duration = None;
        self.cooldown_duration = None;
        self.reset_stake_duration = true;
        self.allowed_mints = false;
        self.total_staked = 0;
        self.start_time = None;
        self.end_time = None;
        self.collections = vec![];
        self.creators = vec![];
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum LockType {
    Freeze,
    Custoday,
}
