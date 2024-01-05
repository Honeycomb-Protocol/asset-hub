use {
    super::{CharacterSchema, NftWrapCriteria},
    anchor_lang::prelude::*,
    hpl_compression::{CompressedSchema, ControlledMerkleTrees, Schema},
    hpl_utils::traits::*,
};

/// Game character (particulary NFT) PDA Account
/// PDA: ['character', mint]
/// Category: nft_state
#[account]
pub struct CharacterModel {
    pub bump: u8,

    /// The project this character is associated with
    pub project: Pubkey,

    /// Where this character came from
    pub config: CharacterConfig,

    /// Character specific attributes
    pub attributes: Schema,

    /// Character merkle trees
    pub merkle_trees: ControlledMerkleTrees,
}

impl Default for CharacterModel {
    const LEN: usize = 8 + 200;

    fn set_defaults(&mut self) {
        self.bump = 0;
        self.project = Pubkey::default();
        self.config = CharacterConfig::Wrapped(Vec::new());
        self.attributes = Schema::Null;
        self.merkle_trees = ControlledMerkleTrees {
            active: 0,
            merkle_trees: Vec::new(),
            schema: CharacterSchema::schema(),
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum CharacterConfig {
    Wrapped(Vec<NftWrapCriteria>),
    // ... rest
}
