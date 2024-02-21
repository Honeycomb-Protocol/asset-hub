use anchor_lang::prelude::*;

#[account]
pub struct Recipe {
    pub bump: u8,

    pub project: Pubkey,

    pub key: Pubkey,

    pub xp: XpPair,

    pub output: ResourceAmountPair,

    pub inputs: Vec<ResourceAmountPair>,

    pub output_characterstics: Vec<(String, String)>,
}
impl Recipe {
    pub const LEN: usize = 8 + 1 + 32 + 32 + 32 + 40;

    pub fn get_len(input_len: usize, cac_len: Vec<(String, String)>) -> usize {
        // adding the space for the bump, project, key, xp, output
        let mut space = Self::LEN + input_len * 40;

        // adding the space for the characterstics
        for (label, value) in cac_len {
            space += label.len() + value.len();
        }

        space
    }

    pub fn set_defaults(&mut self) {
        self.bump = 0;
        self.project = Pubkey::default();
        self.key = Pubkey::default();
        self.inputs = Vec::new();
        self.xp = XpPair {
            label: "".to_string(),
            increament: 0,
        };
        self.output = ResourceAmountPair {
            resource: Pubkey::default(),
            amount: 0,
        };
    }
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone, Copy)]
pub struct ResourceAmountPair {
    pub resource: Pubkey,

    pub amount: u64,
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone)]
pub struct XpPair {
    pub label: String,

    pub increament: u64,
}
