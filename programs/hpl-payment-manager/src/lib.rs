use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;
pub mod utils;

use instructions::*;

declare_id!("Pay9ZxrVRXjt9Da8qpwqq4yBRvvrfx3STWnKK4FstPr");

#[program]
pub mod hpl_payment_manager {
    use super::*;

    pub fn create_payment_structure(
        ctx: Context<CreatePaymentStructure>,
        args: CreatePaymentStructureArgs,
    ) -> Result<()> {
        instructions::create_payment_structure(ctx, args)
    }

    pub fn delete_payment_structure(ctx: Context<DeletePaymentStructure>) -> Result<()> {
        instructions::delete_payment_structure(ctx)
    }

    pub fn start_payment_session(ctx: Context<StartPaymentSession>) -> Result<()> {
        instructions::start_payment_session(ctx)
    }

    pub fn make_hpl_currency_payment(
        ctx: Context<MakeHplCurrencyPayment>,
        args: MakePaymentArgs,
    ) -> Result<()> {
        instructions::make_hpl_currency_payment(ctx, args)
    }

    pub fn make_nft_payment(ctx: Context<MakeNftPayment>, args: MakePaymentArgs) -> Result<()> {
        instructions::make_nft_payment(ctx, args)
    }

    pub fn make_cnft_payment<'info>(
        ctx: Context<'_, '_, '_, 'info, MakeCNftPayment<'info>>,
        args: MakeCnftPaymentArgs,
    ) -> Result<()> {
        instructions::make_cnft_payment(ctx, args)
    }

    pub fn close_payment_session(ctx: Context<ClosePaymentSession>) -> Result<()> {
        instructions::close_payment_session(ctx)
    }
}
