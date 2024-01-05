use anchor_lang::prelude::*;

mod bubblegum;

pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("7cJdKSjPtZqiGV4CFAGtbhhpf5CsYjbkbEkLKcXfHLYd");
hpl_macros::platform_gate!();

#[program]
pub mod hpl_character_manager {
    use super::*;

    pub fn new_character_model(
        ctx: Context<NewCharacterModel>,
        args: NewCharacterModelArgs,
    ) -> Result<()> {
        instructions::new_character_model(ctx, args)
    }
}
