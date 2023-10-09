use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;
pub mod utils;

declare_id!("CrncyaGmZfWvpxRcpHEkSrqeeyQsdn4MAedo9KuARAc4");
hpl_macros::platform_gate!();

use {
    errors::ErrorCode,
    instructions::*,
    state::HolderStatus,
    utils::{post_actions, pre_actions},
};

/// The entry point for the HPL currency manager program.
#[program]
pub mod hpl_currency_manager {
    use super::*;

    /// Create a new currency in the HPL Hive Control program.
    ///
    /// This function serves as a platform gate to manage assets for a project. It calls the
    /// `platform_gate_fn` from the `hpl_hive_control` instructions module to check permissions
    /// and then calls `create_currency` from the `hpl_hive_control::instructions` module to
    /// perform the actual currency creation.
    ///
    /// # Parameters
    ///
    /// - `ctx`: The program context with accounts and instructions provided by the runtime.
    /// - `args`: The arguments required to create a new currency.
    ///
    /// # Errors
    ///
    /// This function can return an error if the platform gate fails or if the currency creation
    /// encounters any issues.
    pub fn create_currency(ctx: Context<CreateCurrency>, args: CreateCurrencyArgs) -> Result<()> {
        platform_gate_cpi(
            hpl_hive_control::state::SerializableActions::ManageCurrencies,
            None,
            ctx.accounts.project.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.hive_control.to_account_info(),
            ctx.accounts.instructions_sysvar.to_account_info(),
        )?;

        instructions::create_currency(ctx, args)
    }

    /// Update an existing currency in the HPL Hive Control program.
    ///
    /// This function serves as a platform gate to manage assets for a project. It calls the
    /// `platform_gate_fn` from the `hpl_hive_control` instructions module to check permissions
    /// and then calls `update_currency` from the `hpl_hive_control::instructions` module to
    /// perform the actual currency update.
    ///
    /// # Parameters
    ///
    /// - `ctx`: The program context with accounts and instructions provided by the runtime.
    /// - `args`: The arguments required to update an existing currency.
    ///
    /// # Errors
    ///
    /// This function can return an error if the platform gate fails or if the currency update
    /// encounters any issues.
    pub fn update_currency(ctx: Context<UpdateCurrency>, args: UpdateCurrencyArgs) -> Result<()> {
        platform_gate_cpi(
            hpl_hive_control::state::SerializableActions::ManageCurrencies,
            None,
            ctx.accounts.project.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.hive_control.to_account_info(),
            ctx.accounts.instructions_sysvar.to_account_info(),
        )?;

        instructions::update_currency(ctx, args)
    }

    /// Wrap a currency in the HPL Hive Control program.
    ///
    /// This function serves as a platform gate to manage assets for a project. It checks
    /// permissions using the `platform_gate_fn` from the `hpl_hive_control` instructions
    /// module. If the platform gate is successful, it proceeds to wrap the currency.
    ///
    /// # Parameters
    ///
    /// - `ctx`: The program context containing accounts and instructions provided by the runtime.
    ///
    /// # Errors
    ///
    /// This function returns an error if the platform gate fails or if the currency wrapping
    /// encounters any issues.
    pub fn wrap_currency(ctx: Context<WrapCurrency>) -> Result<()> {
        platform_gate_cpi(
            hpl_hive_control::state::SerializableActions::ManageCurrencies,
            None,
            ctx.accounts.project.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.hive_control.to_account_info(),
            ctx.accounts.instructions_sysvar.to_account_info(),
        )?;

        instructions::wrap_currency(ctx)
    }

    /// Create a holder account in the HPL Hive Control program.
    ///
    /// This function serves as a platform gate to manage public low-level actions for a project.
    /// It checks permissions using the `platform_gate_fn` from the `hpl_hive_control` instructions
    /// module. If the platform gate is successful, it proceeds to create the holder account.
    ///
    /// # Parameters
    ///
    /// - `ctx`: The program context containing accounts and instructions provided by the runtime.
    ///
    /// # Errors
    ///
    /// This function returns an error if the platform gate fails or if any issues occur during the
    /// holder account creation process.
    pub fn create_holder_account(ctx: Context<CreateHolderAccount>) -> Result<()> {
        platform_gate_cpi(
            hpl_hive_control::state::SerializableActions::PublicLow,
            None,
            ctx.accounts.project.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &None,
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.hive_control.to_account_info(),
            ctx.accounts.instructions_sysvar.to_account_info(),
        )?;

        let currency = &ctx.accounts.currency.clone();
        let mint = &ctx.accounts.mint.clone();
        let token_account = &ctx.accounts.token_account.clone();
        let token_program = &ctx.accounts.token_program.clone();

        instructions::create_holder_account(ctx)?;

        post_actions(currency, mint, token_account, token_program)
    }

    /// Wrap a holder account in the HPL Hive Control program.
    ///
    /// This function serves as a platform gate to manage public low-level actions for a project.
    /// It checks permissions using the `platform_gate_fn` from the `hpl_hive_control` instructions
    /// module. If the platform gate is successful, it proceeds to wrap the holder account.
    ///
    /// # Parameters
    ///
    /// - `ctx`: The program context containing accounts and instructions provided by the runtime.
    ///
    /// # Errors
    ///
    /// This function returns an error if the platform gate fails or if any issues occur during the
    /// holder account creation process.
    pub fn wrap_holder_account(ctx: Context<WrapHolderAccount>) -> Result<()> {
        platform_gate_cpi(
            hpl_hive_control::state::SerializableActions::PublicLow,
            None,
            ctx.accounts.project.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &None,
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.hive_control.to_account_info(),
            ctx.accounts.instructions_sysvar.to_account_info(),
        )?;

        let currency = &ctx.accounts.currency.clone();
        let token_program = &ctx.accounts.token_program.clone();
        let token_account = &ctx.accounts.token_account.clone();
        let mint = &ctx.accounts.mint.clone();

        // Create the holder account
        instructions::wrap_holder_account(ctx)?;

        post_actions(currency, mint, token_account, token_program)
    }

    /// Fix a holder account in the HPL Hive Control program.
    ///
    /// This function serves as a platform gate to manage public low-level actions for a project.
    /// It checks permissions using the `platform_gate_fn` from the `hpl_hive_control` instructions
    /// module. If the platform gate is successful, it proceeds to fix the holder account.
    ///
    /// # Parameters
    ///
    /// - `ctx`: The program context containing accounts and instructions provided by the runtime.
    ///
    /// # Errors
    ///
    /// This function returns an error if the platform gate fails or if any issues occur during the
    /// holder account creation process.
    pub fn fix_holder_account(ctx: Context<FixHolderAccount>) -> Result<()> {
        platform_gate_cpi(
            hpl_hive_control::state::SerializableActions::PublicLow,
            None,
            ctx.accounts.project.to_account_info(),
            ctx.accounts.owner.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &None,
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.hive_control.to_account_info(),
            ctx.accounts.instructions_sysvar.to_account_info(),
        )?;

        // Perform pre-actions before instructionn
        pre_actions(
            &ctx.accounts.currency,
            &ctx.accounts.mint,
            &ctx.accounts.token_account,
            &ctx.accounts.token_program,
        )?;

        let currency = &ctx.accounts.currency.clone();
        let token_program = &ctx.accounts.token_program.clone();
        let token_account = &ctx.accounts.new_token_account.clone();
        let mint = &ctx.accounts.mint.clone();

        // Create the holder account
        instructions::fix_holder_account(ctx)?;

        post_actions(currency, mint, token_account, token_program)
    }

    /// Mint new currency in the HPL Hive Control program.
    ///
    /// This function serves as a platform gate to manage assets for a project. It checks
    /// permissions using the `platform_gate_fn` from the `hpl_hive_control` instructions
    /// module. If the platform gate is successful and the holder account status is active,
    /// it proceeds to mint the new currency. Otherwise, it returns an error.
    ///
    /// # Parameters
    ///
    /// - `ctx`: The program context containing accounts and instructions provided by the runtime.
    /// - `amount`: The amount of currency to be minted.
    ///
    /// # Errors
    ///
    /// This function returns an error if the platform gate fails, the holder account is inactive,
    /// or if any issues occur during the currency minting process.
    pub fn mint_currency(ctx: Context<MintCurrency>, amount: u64) -> Result<()> {
        platform_gate_cpi(
            hpl_hive_control::state::SerializableActions::PublicLow,
            None,
            ctx.accounts.project.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &None,
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.hive_control.to_account_info(),
            ctx.accounts.instructions_sysvar.to_account_info(),
        )?;

        // Check if the holder account status is active, if not, return an error
        if ctx.accounts.holder_account.status == HolderStatus::Inactive {
            return Err(ErrorCode::InactiveHolder.into());
        }

        // Perform pre-actions before instructionn
        pre_actions(
            &ctx.accounts.currency,
            &ctx.accounts.mint,
            &ctx.accounts.token_account,
            &ctx.accounts.token_program,
        )?;

        let currency = &ctx.accounts.currency.clone();
        let token_program = &ctx.accounts.token_program.clone();
        let token_account = &ctx.accounts.token_account.clone();
        let mint = &ctx.accounts.mint.clone();

        // Mint the specified amount of currency
        instructions::mint_currency(ctx, amount)?;

        post_actions(currency, mint, token_account, token_program)
    }

    /// Fund an account in the HPL Hive Control program.
    ///
    /// This function performs a platform gate to determine the action based on the caller's
    /// program ID. If the caller's program ID matches the HPL Hive Control program ID, it
    /// checks permissions using the `platform_gate_fn` for driver actions. Otherwise, it
    /// checks if the caller's program ID is allowed based on the list of allowed programs.
    /// If the caller's program ID is neither the HPL Hive Control program ID nor in the list
    /// of allowed programs, it returns an unauthorized error.
    ///
    /// If the holder account status is inactive, it returns an error. Otherwise, it performs
    /// pre-actions before funding the account, calls the `fund_account` instruction to perform
    /// the funding, and then performs post-actions.
    ///
    /// # Parameters
    ///
    /// - `ctx`: The program context containing accounts and instructions provided by the runtime.
    /// - `amount`: The amount to fund the account with.
    ///
    /// # Errors
    ///
    /// This function returns an error if the platform gate fails, the holder account is inactive,
    /// the caller's program ID is not authorized, or if any issues occur during the funding process.
    pub fn fund_account(ctx: Context<FundAccount>, amount: u64) -> Result<()> {
        platform_gate_cpi(
            hpl_hive_control::state::SerializableActions::FeeExempt,
            None,
            ctx.accounts.project.to_account_info(),
            ctx.accounts.owner.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &None,
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.hive_control.to_account_info(),
            ctx.accounts.instructions_sysvar.to_account_info(),
        )?;

        // Perform pre-actions before instructionn
        pre_actions(
            &ctx.accounts.currency,
            &ctx.accounts.mint,
            &ctx.accounts.token_account,
            &ctx.accounts.token_program,
        )?;

        let currency = &ctx.accounts.currency.clone();
        let token_program = &ctx.accounts.token_program.clone();
        let token_account = &ctx.accounts.token_account.clone();
        let mint = &ctx.accounts.mint.clone();

        // Fund the account with the specified amount
        instructions::fund_account(ctx, amount)?;

        post_actions(currency, mint, token_account, token_program)
    }

    /// Burn currency in the HPL Hive Control program.
    ///
    /// This function performs a platform gate to determine the action based on the caller's
    /// program ID. If the caller's program ID matches the HPL Hive Control program ID, it
    /// checks permissions using the `platform_gate_fn` for driver actions. Otherwise, it
    /// checks if the caller's program ID is allowed based on the list of allowed programs.
    /// If the caller's program ID is neither the HPL Hive Control program ID nor in the list
    /// of allowed programs, it returns an unauthorized error.
    ///
    /// If the holder account status is inactive, it returns an error. Otherwise, it performs
    /// pre-actions before burning the currency, calls the `burn_currency` instruction to perform
    /// the burning, and then performs post-actions.
    ///
    /// # Parameters
    ///
    /// - `ctx`: The program context containing accounts and instructions provided by the runtime.
    /// - `amount`: The amount of currency to be burned.
    ///
    /// # Errors
    ///
    /// This function returns an error if the platform gate fails, the holder account is inactive,
    /// the caller's program ID is not authorized, or if any issues occur during the burning process.
    pub fn burn_currency(ctx: Context<BurnCurrency>, amount: u64) -> Result<()> {
        platform_gate_cpi(
            hpl_hive_control::state::SerializableActions::FeeExempt,
            None,
            ctx.accounts.project.to_account_info(),
            ctx.accounts.owner.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &None,
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.hive_control.to_account_info(),
            ctx.accounts.instructions_sysvar.to_account_info(),
        )?;

        // Perform pre-actions before instructionn
        pre_actions(
            &ctx.accounts.currency,
            &ctx.accounts.mint,
            &ctx.accounts.token_account,
            &ctx.accounts.token_program,
        )?;

        let currency = &ctx.accounts.currency.clone();
        let token_program = &ctx.accounts.token_program.clone();
        let token_account = &ctx.accounts.token_account.clone();
        let mint = &ctx.accounts.mint.clone();

        // Burn the specified amount of currency
        instructions::burn_currency(ctx, amount)?;

        post_actions(currency, mint, token_account, token_program)
    }

    /// Transfer currency in the HPL Hive Control program from one holder account to another.
    ///
    /// This function performs a platform gate to determine the action based on the caller's
    /// program ID. If the caller's program ID matches the HPL Hive Control program ID, it
    /// checks permissions using the `platform_gate_fn` for driver actions. Otherwise, it
    /// checks if the caller's program ID is allowed based on the list of allowed programs.
    /// If the caller's program ID is neither the HPL Hive Control program ID nor in the list
    /// of allowed programs, it returns an unauthorized error.
    ///
    /// If either the sender's or receiver's holder account status is inactive, it returns an error.
    /// Otherwise, it performs pre-actions before transferring the currency, calls the `transfer_currency`
    /// instruction to perform the transfer, and then performs post-actions for both the sender's and
    /// receiver's token accounts.
    ///
    /// # Parameters
    ///
    /// - `ctx`: The program context containing accounts and instructions provided by the runtime.
    /// - `amount`: The amount of currency to be transferred.
    ///
    /// # Errors
    ///
    /// This function returns an error if the platform gate fails, either the sender's or receiver's
    /// holder account is inactive, the caller's program ID is not authorized, or if any issues occur
    /// during the transfer process.
    pub fn transfer_currency(ctx: Context<TransferCurrency>, amount: u64) -> Result<()> {
        platform_gate_cpi(
            hpl_hive_control::state::SerializableActions::FeeExempt,
            None,
            ctx.accounts.project.to_account_info(),
            ctx.accounts.owner.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &None,
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.hive_control.to_account_info(),
            ctx.accounts.instructions_sysvar.to_account_info(),
        )?;

        // Perform pre-actions before instructionn
        pre_actions(
            &ctx.accounts.currency,
            &ctx.accounts.mint,
            &ctx.accounts.sender_token_account,
            &ctx.accounts.token_program,
        )?;

        pre_actions(
            &ctx.accounts.currency,
            &ctx.accounts.mint,
            &ctx.accounts.receiver_token_account,
            &ctx.accounts.token_program,
        )?;

        let currency = &ctx.accounts.currency.clone();
        let token_program = &ctx.accounts.token_program.clone();
        let sender_token_account = &ctx.accounts.sender_token_account.clone();
        let receiver_token_account = &ctx.accounts.receiver_token_account.clone();
        let mint = &ctx.accounts.mint.clone();

        // Transfer the specified amount of currency
        instructions::transfer_currency(ctx, amount)?;

        post_actions(currency, mint, sender_token_account, token_program)?;

        post_actions(currency, mint, receiver_token_account, token_program)
    }

    ///
    /// This function performs a platform gate to determine the action based on the caller's
    /// program ID. If the caller's program ID matches the HPL Hive Control program ID, it
    /// checks permissions using the `platform_gate_fn` for driver actions. Otherwise, it
    /// checks if the caller's program ID is allowed based on the list of allowed programs.
    /// If the caller's program ID is neither the HPL Hive Control program ID nor in the list
    /// of allowed programs, it returns an unauthorized error.
    ///
    /// If the holder account status is inactive, it returns an error. Otherwise, it performs
    /// pre-actions before approving the delegate, calls the `approve_delegate` instruction to
    /// approve the delegate, and then performs post-actions.
    ///
    /// # Parameters
    ///
    /// - `ctx`: The program context containing accounts and instructions provided by the runtime.
    /// - `amount`: The amount of currency to be approved for delegation.
    ///
    /// # Errors
    ///
    /// This function returns an error if the platform gate fails, the holder account is inactive,
    /// the caller's program ID is not authorized, or if any issues occur during the approval process.
    pub fn approve_delegate(ctx: Context<ApproveDelegate>, amount: u64) -> Result<()> {
        platform_gate_cpi(
            hpl_hive_control::state::SerializableActions::FeeExempt,
            None,
            ctx.accounts.project.to_account_info(),
            ctx.accounts.owner.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &None,
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.hive_control.to_account_info(),
            ctx.accounts.instructions_sysvar.to_account_info(),
        )?;

        // Perform pre-actions before instructionn
        pre_actions(
            &ctx.accounts.currency,
            &ctx.accounts.mint,
            &ctx.accounts.token_account,
            &ctx.accounts.token_program,
        )?;

        let currency = &ctx.accounts.currency.clone();
        let token_program = &ctx.accounts.token_program.clone();
        let token_account = &ctx.accounts.token_account.clone();
        let mint = &ctx.accounts.mint.clone();

        // Approve the delegate to manage the specified amount of currency
        instructions::approve_delegate(ctx, amount)?;

        post_actions(currency, mint, token_account, token_program)
    }

    /// Revoke a delegate's permission to manage currency in the HPL Hive Control program.
    ///
    /// This function performs a platform gate to determine the action based on the caller's
    /// program ID. If the caller's program ID matches the HPL Hive Control program ID, it
    /// checks permissions using the `platform_gate_fn` for driver actions. Otherwise, it
    /// checks if the caller's program ID is allowed based on the list of allowed programs.
    /// If the caller's program ID is neither the HPL Hive Control program ID nor in the list
    /// of allowed programs, it returns an unauthorized error.
    ///
    /// If the holder account status is inactive, it returns an error. Otherwise, it performs
    /// pre-actions before revoking the delegate, calls the `revoke_delegate` instruction to
    /// revoke the delegate, and then performs post-actions.
    ///
    /// # Parameters
    ///
    /// - `ctx`: The program context containing accounts and instructions provided by the runtime.
    ///
    /// # Errors
    ///
    /// This function returns an error if the platform gate fails, the holder account is inactive,
    /// the caller's program ID is not authorized, or if any issues occur during the revoking process.
    pub fn revoke_delegate(ctx: Context<RevokeDelegate>) -> Result<()> {
        platform_gate_cpi(
            hpl_hive_control::state::SerializableActions::PublicHigh,
            None,
            ctx.accounts.project.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &None,
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.hive_control.to_account_info(),
            ctx.accounts.instructions_sysvar.to_account_info(),
        )?;

        // Perform pre-actions before instructionn
        pre_actions(
            &ctx.accounts.currency,
            &ctx.accounts.mint,
            &ctx.accounts.token_account,
            &ctx.accounts.token_program,
        )?;

        let currency = &ctx.accounts.currency.clone();
        let token_program = &ctx.accounts.token_program.clone();
        let token_account = &ctx.accounts.token_account.clone();
        let mint = &ctx.accounts.mint.clone();

        // Revoke the delegate's permission to manage currency
        instructions::revoke_delegate(ctx)?;

        post_actions(currency, mint, token_account, token_program)
    }

    /// Set the status of a holder account in the HPL Hive Control program.
    ///
    /// This function performs a platform gate to determine the action based on the caller's
    /// program ID. If the caller's program ID matches the HPL Hive Control program ID, it
    /// checks permissions using the `platform_gate_fn` for driver actions. Otherwise, it
    /// checks if the caller's program ID is allowed based on the list of allowed programs.
    /// If the caller's program ID is neither the HPL Hive Control program ID nor in the list
    /// of allowed programs, it returns an unauthorized error.
    ///
    /// The function then calls the `set_holder_status` instruction to set the holder account's status.
    ///
    /// # Parameters
    ///
    /// - `ctx`: The program context containing accounts and instructions provided by the runtime.
    /// - `status`: The status to be set for the holder account.
    ///
    /// # Errors
    ///
    /// This function returns an error if the platform gate fails, the caller's program ID is not authorized,
    /// or if any issues occur during the process of setting the holder account's status.
    pub fn set_holder_status(ctx: Context<SetHolderStatus>, status: HolderStatus) -> Result<()> {
        platform_gate_cpi(
            hpl_hive_control::state::SerializableActions::ManageCurrencyStatus,
            None,
            ctx.accounts.project.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &None,
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.hive_control.to_account_info(),
            ctx.accounts.instructions_sysvar.to_account_info(),
        )?;

        // Call the `set_holder_status` instruction to set the holder account's status
        instructions::set_holder_status(ctx, status)
    }
}
