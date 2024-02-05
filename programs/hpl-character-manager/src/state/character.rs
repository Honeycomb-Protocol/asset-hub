use {
    anchor_lang::{prelude::*, solana_program::keccak},
    hpl_toolkit::{compression::*, schema::*},
    spl_account_compression::Node,
    std::collections::HashMap,
};
/// Game character (particulary NFT) PDA Account
#[compressed_account]
pub struct CharacterSchema {
    /// The wallet that owns this character
    pub owner: Pubkey,

    /// Where this character came from
    #[chunk]
    pub source: CharacterSource,

    /// NFT being used by a HPL Service
    #[chunk]
    pub used_by: CharacterUsedBy,
}

#[compressed_account(chunk = source)]
pub enum CharacterSource {
    Wrapped {
        mint: Pubkey,
        criteria: NftWrapCriteria,
        is_compressed: bool,
    },
}

impl CharacterSource {
    pub fn id(&self) -> Pubkey {
        match self {
            Self::Wrapped { mint, .. } => *mint,
        }
    }
}

#[derive(ToSchema, AnchorSerialize, AnchorDeserialize, Clone, ToNode)]
pub enum NftWrapCriteria {
    Collection(Pubkey),
    Creator(Pubkey),
    MerkleTree(Pubkey),
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub enum DataOrHash<Data> {
    Data(Data),
    Hash([u8; 32]),
}

#[compressed_account(chunk = used_by)]
pub enum CharacterUsedBy {
    None,
    Staking {
        pool: Pubkey,
        staker: Pubkey,
        staked_at: i64,
        claimed_at: i64,
    },
    Mission {
        id: Pubkey,
        rewards: Vec<EarnedReward>,
        end_time: u64,
        rewards_collected: bool,
    },
    Guild {
        id: Pubkey,
        role: GuildRole,
        order: u8,
    },
}

impl CharacterUsedBy {
    pub fn is_used(&self) -> bool {
        match self {
            CharacterUsedBy::None => false,
            _ => true,
        }
    }

    pub fn user(&self) -> Pubkey {
        match self {
            CharacterUsedBy::None => panic!("Character is not used by anything"),
            CharacterUsedBy::Staking { pool, .. } => *pool,
            CharacterUsedBy::Mission { id, .. } => *id,
            CharacterUsedBy::Guild { id, .. } => *id,
        }
    }

    pub fn match_user(&self, user: &Pubkey) -> bool {
        &self.user() == user
    }

    pub fn match_used_by(&self, used_by: &Self) -> bool {
        match (self, used_by) {
            (Self::None, Self::None) => true,
            (Self::Staking { .. }, Self::Staking { .. }) => true,
            (Self::Mission { .. }, Self::Mission { .. }) => true,
            (Self::Guild { .. }, Self::Guild { .. }) => true,
            _ => false,
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, ToSchema, ToNode)]
pub struct EarnedReward {
    pub delta: u8,
    pub reward_idx: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, ToSchema, ToNode)]
pub enum GuildRole {
    Chief,
    Member,
}
