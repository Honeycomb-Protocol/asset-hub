use {
    anchor_lang::{prelude::*, solana_program::keccak},
    hpl_compression::{
        compressed_account, CompressedData, CompressedDataChunk, CompressedSchema, Schema,
        SchemaValue, ToNode,
    },
    spl_account_compression::Node,
    std::collections::HashMap,
};

/// Game character (particulary NFT) PDA Account
#[compressed_account()]
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

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum CharacterSource {
    Wrapped {
        mint: Pubkey,
        criteria: NftWrapCriteria,
        is_compressed: bool,
    },
}

impl CompressedDataChunk for CharacterSource {
    const KEY: &'static str = "source";
}

impl CompressedSchema for CharacterSource {
    fn schema() -> Schema {
        let mut wrapped = HashMap::new();
        wrapped.insert(String::from("mint"), Pubkey::schema());
        wrapped.insert(String::from("criteria"), NftWrapCriteria::schema());
        wrapped.insert(String::from("is_compressed"), bool::schema());

        Schema::Enum(vec![(String::from("Wrapped"), Schema::Object(wrapped))])
    }
    fn schema_value(&self) -> SchemaValue {
        match self {
            Self::Wrapped {
                mint,
                criteria,
                is_compressed,
            } => {
                let mut wrapped = HashMap::new();
                wrapped.insert(String::from("mint"), mint.schema_value());
                wrapped.insert(String::from("criteria"), criteria.schema_value());
                wrapped.insert(String::from("is_compressed"), is_compressed.schema_value());

                SchemaValue::Enum(
                    String::from("Wrapped"),
                    Box::new(SchemaValue::Object(wrapped)),
                )
            }
        }
    }
}

impl ToNode for CharacterSource {
    fn to_node(&self) -> Node {
        match self {
            Self::Wrapped {
                mint,
                criteria,
                is_compressed,
            } => keccak::hashv(&[
                "Wrapped".as_bytes(),
                mint.to_node().as_ref(),
                criteria.to_node().as_ref(),
                is_compressed.to_node().as_ref(),
            ])
            .to_bytes(),
        }
    }
}

impl CharacterSource {
    pub fn id(&self) -> Pubkey {
        match self {
            Self::Wrapped { mint, .. } => *mint,
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum NftWrapCriteria {
    Collection(Pubkey),
    Creator(Pubkey),
    MerkleTree(Pubkey),
}

impl CompressedSchema for NftWrapCriteria {
    fn schema() -> Schema {
        Schema::Enum(vec![
            (String::from("Collection"), Pubkey::schema()),
            (String::from("Creator"), Pubkey::schema()),
            (String::from("MerkleTree"), Pubkey::schema()),
        ])
    }
    fn schema_value(&self) -> SchemaValue {
        match self {
            Self::Collection(pubkey) => {
                SchemaValue::Enum(String::from("Collection"), Box::new(pubkey.schema_value()))
            }
            Self::Creator(pubkey) => {
                SchemaValue::Enum(String::from("Creator"), Box::new(pubkey.schema_value()))
            }
            Self::MerkleTree(pubkey) => {
                SchemaValue::Enum(String::from("MerkleTree"), Box::new(pubkey.schema_value()))
            }
        }
    }
}

impl ToNode for NftWrapCriteria {
    fn to_node(&self) -> Node {
        match self {
            Self::Collection(address) => {
                keccak::hashv(&["Collection".as_bytes(), address.to_node().as_ref()]).to_bytes()
            }
            Self::Creator(address) => {
                keccak::hashv(&["Creator".as_bytes(), address.to_node().as_ref()]).to_bytes()
            }
            Self::MerkleTree(address) => {
                keccak::hashv(&["MerkleTree".as_bytes(), address.to_node().as_ref()]).to_bytes()
            }
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
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
    },
    Guild {
        id: Pubkey,
        role: GuildRole,
        order: u8,
    },
}

impl CompressedDataChunk for CharacterUsedBy {
    const KEY: &'static str = "used_by";
}

impl CompressedSchema for CharacterUsedBy {
    fn schema() -> Schema {
        let mut schema = Vec::<(String, Schema)>::new();

        schema.push((String::from("None"), Schema::Null));

        let mut staking = HashMap::new();
        staking.insert(String::from("pool"), Pubkey::schema());
        staking.insert(String::from("staker"), Pubkey::schema());
        staking.insert(String::from("staked_at"), i64::schema());
        staking.insert(String::from("claimed_at"), i64::schema());
        schema.push((String::from("Staking"), Schema::Object(staking)));

        let mut missions = HashMap::new();
        missions.insert(String::from("participation"), Pubkey::schema());
        schema.push((String::from("Missions"), Schema::Object(missions)));

        let mut guild = HashMap::new();
        guild.insert(String::from("id"), Pubkey::schema());
        guild.insert(String::from("role"), GuildRole::schema());
        guild.insert(String::from("order"), u8::schema());
        schema.push((String::from("Guild"), Schema::Object(guild)));

        Schema::Enum(schema)
    }

    fn schema_value(&self) -> SchemaValue {
        match self {
            Self::None => SchemaValue::Enum(String::from("None"), Box::new(SchemaValue::Null)),
            Self::Staking {
                pool,
                staker,
                staked_at,
                claimed_at,
            } => {
                let mut staking = HashMap::new();
                staking.insert(String::from("pool"), pool.schema_value());
                staking.insert(String::from("staker"), staker.schema_value());
                staking.insert(String::from("staked_at"), staked_at.schema_value());
                staking.insert(String::from("claimed_at"), claimed_at.schema_value());

                SchemaValue::Enum(
                    String::from("Staking"),
                    Box::new(SchemaValue::Object(staking)),
                )
            }
            Self::Mission { id } => {
                let mut missions = HashMap::new();
                missions.insert(String::from("id"), id.schema_value());

                SchemaValue::Enum(
                    String::from("Missions"),
                    Box::new(SchemaValue::Object(missions)),
                )
            }
            Self::Guild { id, role, order } => {
                let mut guild = HashMap::new();
                guild.insert(String::from("id"), id.schema_value());
                guild.insert(String::from("role"), role.schema_value());
                guild.insert(String::from("order"), order.schema_value());

                SchemaValue::Enum(String::from("Guild"), Box::new(SchemaValue::Object(guild)))
            }
        }
    }
}

impl ToNode for CharacterUsedBy {
    fn to_node(&self) -> Node {
        match self {
            Self::None {} => keccak::hashv(&["None".as_bytes()]).to_bytes(),
            Self::Staking {
                pool,
                staker,
                staked_at,
                claimed_at,
            } => keccak::hashv(&[
                "Staking".as_bytes(),
                pool.to_node().as_ref(),
                staker.to_node().as_ref(),
                staked_at.to_node().as_ref(),
                claimed_at.to_node().as_ref(),
            ])
            .to_bytes(),
            Self::Mission { id } => {
                keccak::hashv(&[
                    "Missions".as_bytes(),
                    id.to_node().as_ref(),
                ])
                .to_bytes()
            }
            Self::Guild { id, role, order } => keccak::hashv(&[
                "Guild".as_bytes(),
                id.to_node().as_ref(),
                role.to_node().as_ref(),
                order.to_node().as_ref(),
            ])
            .to_bytes(),
        }
    }
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

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum MissionRequirement {
    Time {
        /// The end time of the mission in unix timestamp
        /// Calculated by start_time + mission.duration
        end_time: u64,
    },
    // Add task requirement later down the line
}

impl CompressedSchema for MissionRequirement {
    fn schema() -> Schema {
        let mut schema = Vec::<(String, Schema)>::new();

        let mut time = HashMap::new();
        time.insert(String::from("end_time"), i64::schema());
        schema.push((String::from("Time"), Schema::Object(time)));

        Schema::Enum(schema)
    }

    fn schema_value(&self) -> SchemaValue {
        match self {
            Self::Time { end_time } => {
                let mut time = HashMap::new();
                time.insert(String::from("end_time"), end_time.schema_value());

                SchemaValue::Enum(String::from("Time"), Box::new(SchemaValue::Object(time)))
            }
        }
    }
}

impl ToNode for MissionRequirement {
    fn to_node(&self) -> Node {
        match self {
            Self::Time { end_time } => {
                keccak::hashv(&["Time".as_bytes(), end_time.to_node().as_ref()]).to_bytes()
            }
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct EarnedReward {
    pub delta: u8,
    pub reward_idx: u8,
}

impl CompressedSchema for EarnedReward {
    fn schema() -> Schema {
        let mut schema = HashMap::new();

        schema.insert(String::from("delta"), u8::schema());
        schema.insert(String::from("reward_idx"), u8::schema());

        Schema::Object(schema)
    }

    fn schema_value(&self) -> SchemaValue {
        let mut val = HashMap::new();

        val.insert(String::from("delta"), self.delta.schema_value());
        val.insert(String::from("reward_idx"), self.reward_idx.schema_value());

        SchemaValue::Object(val)
    }
}

impl ToNode for EarnedReward {
    fn to_node(&self) -> Node {
        keccak::hashv(&[
            self.delta.to_node().as_ref(),
            self.reward_idx.to_node().as_ref(),
        ])
        .to_bytes()
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum GuildRole {
    Chief,
    Member,
}

impl CompressedSchema for GuildRole {
    fn schema() -> Schema {
        Schema::Enum(vec![
            (String::from("Chief"), Schema::Null),
            (String::from("Member"), Schema::Null),
        ])
    }
    fn schema_value(&self) -> SchemaValue {
        match self {
            Self::Chief => SchemaValue::Enum(String::from("Chief"), Box::new(SchemaValue::Null)),
            Self::Member => SchemaValue::Enum(String::from("Member"), Box::new(SchemaValue::Null)),
        }
    }
}

impl ToNode for GuildRole {
    fn to_node(&self) -> Node {
        match self {
            Self::Chief => keccak::hashv(&["Chief".as_bytes()]).to_bytes(),
            Self::Member => keccak::hashv(&["Member".as_bytes()]).to_bytes(),
        }
    }
}
