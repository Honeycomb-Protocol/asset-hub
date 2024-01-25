mod errors;
mod instructions;
mod states;

use anchor_lang::prelude::*;
use instructions::*;
use states::*;

declare_id!("L9A9ZxrVRXjt9Da8qpwqq4yBRvvrfx3STWnKK4FstPr");

#[program]
pub mod hpl_resource_manager {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
        ctx.accounts.new_account.data = data;
        msg!("Changed data to: {}!", data); // Message will show up in the tx logs
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = signer, space = 8 + 8)]
    pub new_account: Account<'info, NewAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct NewAccount {
    data: u64,
}
