use {
    anchor_lang::{prelude::*, solana_program::keccak},
    hpl_toolkit::{compression::*, schema::*, ToNode, ToSchema},
    std::collections::HashMap,
};

/// Resource holding state
#[compressed_account()]
pub enum Holding {
    Fungible {
        holder: Pubkey,
        balance: u64,
    },

    INF {
        holder: NonFungibleHolder,
        characteristics: HashMap<String, String>,
    },
}

impl Holding {
    pub fn get_balance(&self) -> u64 {
        match self {
            Holding::Fungible { balance, .. } => *balance,
            Holding::INF { holder, .. } => match holder {
                NonFungibleHolder::Eject { .. } => 0,
                NonFungibleHolder::Holder(_) => 1,
            },
        }
    }

    pub fn get_holder(&self) -> Pubkey {
        match self {
            Holding::Fungible { holder, .. } => *holder,
            Holding::INF { holder, .. } => match holder {
                NonFungibleHolder::Eject { holder, .. } => *holder,
                NonFungibleHolder::Holder(holder) => *holder,
            },
        }
    }

    pub fn get_characteristics(&self) -> Vec<(String, String)> {
        match self {
            Holding::Fungible { .. } => vec![],
            Holding::INF {
                characteristics, ..
            } => characteristics
                .iter()
                .map(|(k, v)| (k.clone(), v.clone()))
                .collect(),
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, ToSchema, ToNode)]
pub enum NonFungibleHolder {
    Holder(Pubkey),
    Eject { mint: Pubkey, holder: Pubkey },
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct HoldingAccountArgs {
    pub holding: Holding,
    pub root: [u8; 32],
    pub leaf_idx: u32,
}
