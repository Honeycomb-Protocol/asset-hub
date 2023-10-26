use {
    crate::{
        errors::ErrorCode,
        state::*,
        utils::{Conditional, Event},
    },
    anchor_lang::prelude::*,
    hpl_events::HplEvents,
    hpl_utils::traits::Default,
};

/// Accounts used in create payment structure instruction
#[derive(Accounts)]
#[instruction(args: CreatePaymentStructureArgs)]
pub struct CreatePaymentStructure<'info> {
    /// CHECK: just used for unique id
    pub unique: AccountInfo<'info>,

    /// The payment structure account
    #[account(
      init, payer = payer,
      space = PaymentStructure::get_initial_len(&args.payments),
      seeds = [b"payment_structure", unique.key().as_ref()],
      bump
    )]
    pub payment_structure: Account<'info, PaymentStructure>,

    /// The wallet that has authority over this action
    pub authority: Signer<'info>,

    /// The payer wallet
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Solana System Program
    pub system_program: Program<'info, System>,

    /// HPL Events Program
    pub hpl_events: Program<'info, HplEvents>,

    /// Solana Clock Sysvar
    pub clock_sysvar: Sysvar<'info, Clock>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub struct CreatePaymentStructureArgs {
    pub payments: Conditional<Payment>,
}

/// Create a payment structure.
///
/// This function is used to create a new payment structure.
///
/// # Parameters
///
/// - `ctx`: The program context that contains the accounts involved in the transaction.
/// - `args`: The arguments required to create the new payment structure. It includes the payment conditions and items
///
/// # Errors
///
/// This function can return errors if:
/// - There is an issue setting the default values for the payment structure account.
/// - The provided payment structure arguements are not valid.
///
/// # Example
///
/// ```no_run
/// # use my_program::*;
/// # fn main() -> ProgramResult {
/// # let ctx: Context<CreatePaymentStructure> = unimplemented!();
/// # let args: CreatePaymentStructureArgs = unimplemented!();
/// create_payment_structure(ctx, args)?;
/// # Ok(())
/// # }
/// ```
pub fn create_payment_structure(
    ctx: Context<CreatePaymentStructure>,
    args: CreatePaymentStructureArgs,
) -> Result<()> {
    let payment_structure = &mut ctx.accounts.payment_structure;
    payment_structure.set_defaults();

    payment_structure.bump = ctx.bumps["payment_structure"];
    payment_structure.unique_key = ctx.accounts.unique.key();
    payment_structure.payments = args.payments;

    Event::new_payment_structure(
        payment_structure.key(),
        payment_structure.try_to_vec().unwrap(),
        &ctx.accounts.clock_sysvar,
    )
    .emit(ctx.accounts.hpl_events.to_account_info())?;

    Ok(())
}

/// Accounts used in delete payment structure instruction
#[derive(Accounts)]
pub struct DeletePaymentStructure<'info> {
    /// The payment structure account
    #[account(mut, has_one = authority, close = benificiary)]
    pub payment_structure: Account<'info, PaymentStructure>,

    /// The wallet that receives SOL after account is closed
    /// CHECK: This just receives SOL
    #[account(mut)]
    pub benificiary: AccountInfo<'info>,

    /// The wallet that has authority over this action
    pub authority: Signer<'info>,

    /// Solana System Program
    pub system_program: Program<'info, System>,

    /// HPL Events Program
    pub hpl_events: Program<'info, HplEvents>,

    /// Solana Clock Sysvar
    pub clock_sysvar: Sysvar<'info, Clock>,
}

/// Delete a payment structure.
///
/// This function is used to delete a payment structure.
///
/// # Parameters
///
/// - `ctx`: The program context that contains the accounts involved in the transaction.
///
/// # Example
///
/// ```no_run
/// # use my_program::*;
/// # fn main() -> ProgramResult {
/// # let ctx: Context<DeletePaymentStructure> = unimplemented!();
/// delete_payment_structure(ctx)?;
/// # Ok(())
/// # }
/// ```
pub fn delete_payment_structure(ctx: Context<DeletePaymentStructure>) -> Result<()> {
    if ctx.accounts.payment_structure.active_sessions > 0 {
        return Err(ErrorCode::HasActivePaymentSessions.into());
    }
    Event::delete_payment_structure(
        ctx.accounts.payment_structure.key(),
        ctx.accounts.payment_structure.try_to_vec().unwrap(),
        &ctx.accounts.clock_sysvar,
    )
    .emit(ctx.accounts.hpl_events.to_account_info())?;

    Ok(())
}
