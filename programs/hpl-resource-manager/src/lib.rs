mod errors;
mod instructions;
mod states;
mod utils;

use anchor_lang::prelude::*;
use instructions::*;
use states::*;

declare_id!("L9A9ZxrVRXjt9Da8qpwqq4yBRvvrfx3STWnKK4FstPr");

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
