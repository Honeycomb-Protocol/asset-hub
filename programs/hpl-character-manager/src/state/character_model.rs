use {
    super::{CharacterSchema, NftWrapCriteria},
    crate::errors::HplCharacterManagerError,
    anchor_lang::prelude::*,
    hpl_compression::{CompressedSchema, ControlledMerkleTrees, Schema},
    hpl_utils::traits::*,
};

/// Game character (particulary NFT) PDA Account
///
/// PDA: `'character', project, key`
///
/// Category: nft_state
#[account]
pub struct CharacterModel {
    pub bump: u8,

    /// The project this character is associated with
    pub key: Pubkey,

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

impl CharacterModel {
    pub fn get_size(attributes: &Schema) -> usize {
        8 + 89
            + attributes.size_for_borsh()
            + ControlledMerkleTrees::get_size_for_borsh(&CharacterSchema::schema(), 0)
    }

    pub fn assert_merkle_tree(&self, merkle_tree: Pubkey) -> Result<()> {
        if !self.merkle_trees.merkle_trees.contains(&merkle_tree) {
            return Err(HplCharacterManagerError::MerkleTreeInvalid.into());
        }
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum CharacterConfig {
    Wrapped(Vec<NftWrapCriteria>),
    // ... rest
}
