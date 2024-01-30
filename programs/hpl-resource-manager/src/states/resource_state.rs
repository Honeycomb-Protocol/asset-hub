use {
    anchor_lang::prelude::*,
    hpl_compression::{CompressedSchema, ControlledMerkleTrees, Schema},
};

#[account]
pub struct Resource {
    /// Bump seed for the PDA
    pub bump: u8,

    /// The project this resouce is associated with
    pub project: Pubkey,

    /// The mint of this resource
    pub mint: Pubkey,

    /// token account trees
    pub merkle_trees: ControlledMerkleTrees,

    // the characterstics of this resource
    pub kind: ResourseKind,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum ResourseKind {
    Fungible,

    NonFungible { characterstics: Schema },
}

impl Resource {
    pub const LEN: usize = 8 + 1 + 32 + 32 + 1 + 4;

    pub fn get_size(kind: &ResourseKind) -> usize {
        let mut size = Self::LEN;
        size += kind.try_to_vec().unwrap().len();
        size += super::Holding::schema().size_for_borsh();
        size
    }

    pub fn set_defaults(&mut self) {
        self.bump = 0;
        self.project = Pubkey::default();
        self.mint = Pubkey::default();
        self.kind = ResourseKind::Fungible;
        self.merkle_trees = ControlledMerkleTrees {
            active: 0,
            merkle_trees: Vec::new(),
            schema: super::Holding::schema(),
        }
    }

    pub fn seeds<'a>(&'a self, bump: &'a [u8]) -> Vec<&'a [u8]> {
        let resource_signer_seeds: Vec<&'a [u8]> = vec![
            b"resource".as_ref(),
            self.project.as_ref(),
            self.mint.as_ref(),
            bump,
        ];

        resource_signer_seeds
    }
}
