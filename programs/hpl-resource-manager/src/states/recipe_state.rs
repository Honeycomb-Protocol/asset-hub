use anchor_lang::prelude::*;

#[account]
pub struct Recipe {
    pub bump: u8,

    pub key: Pubkey,

    pub xp: XpPair,

    pub output: ResourceAmountPair,

    pub inputs: Vec<ResourceAmountPair>,
}
impl Recipe {
    pub const LEN: usize = 8 + 1 + 32 + 32 + 40;

    pub fn get_len(len: usize) -> usize {
        Self::LEN + len * 40
    }

    pub fn set_defaults(&mut self) {
        self.bump = 0;
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
