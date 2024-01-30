mod errors;
mod instructions;
mod states;
mod utils;

use anchor_lang::prelude::*;
use instructions::*;
use states::*;

declare_id!("6ARwjKsMY2P3eLEWhdoU5czNezw3Qg6jEfbmLTVQqrPQ");

#[program]
pub mod hpl_resource_manager {
    use super::*;

    pub fn create_new_resource(
        ctx: Context<CreateNewResource>,
        args: CreateNewResourceArgs,
    ) -> Result<()> {
        instructions::create_new_resource(ctx, args)
    }
}
