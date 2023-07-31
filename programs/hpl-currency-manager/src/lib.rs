use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;
pub mod utils;

declare_id!("CrNcYmnu2nvH5fp4pspk2rLQ9h6N3XrJvZMzEhnpbJux");

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
        // Perform platform gate to manage assets for the project
        hpl_hive_control::instructions::platform_gate_fn(
            hpl_hive_control::constants::ACTIONS.manage_assets,
            None,
            &ctx.accounts.project,
            ctx.accounts.authority.key(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
        )?;
        // Create the new currency using the provided arguments
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
        // Perform platform gate to manage assets for the project
        hpl_hive_control::instructions::platform_gate_fn(
            hpl_hive_control::constants::ACTIONS.manage_assets,
            None,
            &ctx.accounts.project,
            ctx.accounts.authority.key(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
        )?;
        // Update the existing currency using the provided arguments
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
        // Perform platform gate to manage assets for the project
        hpl_hive_control::instructions::platform_gate_fn(
            hpl_hive_control::constants::ACTIONS.manage_assets,
            None,
            &ctx.accounts.project,
            ctx.accounts.authority.key(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
        )?;
        // Wrap the currency
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
        // Perform platform gate to manage public low-level actions for the project
        hpl_hive_control::instructions::platform_gate_fn(
            hpl_hive_control::constants::ACTIONS.public_low,
            None,
            &ctx.accounts.project,
            ctx.accounts.payer.key(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &None,
            ctx.accounts.system_program.to_account_info(),
        )?;
        // Clone the currency reference for later usage
        let currency = &ctx.accounts.currency.clone();
        // Get references to the token program, token account, and mint
        let token_program = ctx.accounts.token_program.to_account_info();
        let token_account = ctx.accounts.token_account.to_account_info();
        let mint = ctx.accounts.mint.to_account_info();

        // Create the holder account
        instructions::create_holder_account(ctx)?;

        // Perform post-actions after creating the holder account
        post_actions(currency, token_program, token_account, mint)
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
        // Perform platform gate to manage assets for the project
        hpl_hive_control::instructions::platform_gate_fn(
            hpl_hive_control::constants::ACTIONS.manage_assets,
            None,
            &ctx.accounts.project,
            ctx.accounts.authority.key(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            &ctx.accounts.delegate_authority,
            ctx.accounts.system_program.to_account_info(),
        )?;

        // Check if the holder account status is active, if not, return an error
        if ctx.accounts.holder_account.status == HolderStatus::Inactive {
            return Err(ErrorCode::InactiveHolder.into());
        }

        // Perform pre-actions before minting the currency
        pre_actions(
            &ctx.accounts.currency,
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.token_account.to_account_info(),
            ctx.accounts.mint.to_account_info(),
        )?;

        // Clone the currency reference for later usage
        let currency = &ctx.accounts.currency.clone();

        // Get references to the token program, token account, and mint
        let token_program = ctx.accounts.token_program.to_account_info();
        let token_account = ctx.accounts.token_account.to_account_info();
        let mint = ctx.accounts.mint.to_account_info();

        // Mint the specified amount of currency
        instructions::mint_currency(ctx, amount)?;

        // Perform post-actions after minting the currency
        post_actions(currency, token_program, token_account, mint)
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
        let allowed_programs: Vec<Pubkey> = vec![
            ctx.accounts.project.allowed_programs.clone(),
            hpl_hive_control::constants::known_programs(),
        ]
        .concat();

        // if allowed_programs.len() > 0 {
        //     let ix_program_key =
        //         anchor_lang::solana_program::sysvar::instructions::get_instruction_relative(
        //             0,
        //             &ctx.accounts.instructions_sysvar,
        //         )
        //         .unwrap()
        //         .program_id;

        //     if ix_program_key.eq(&ID) {
        //         hpl_hive_control::instructions::platform_gate_fn(
        //             hpl_hive_control::constants::ACTIONS.driver_action,
        //             Some((0, Pubkey::default())),
        //             &ctx.accounts.project,
        //             ctx.accounts.authority.key(),
        //             ctx.accounts.wallet.to_account_info(),
        //             ctx.accounts.vault.to_account_info(),
        //             &None,
        //             ctx.accounts.system_program.to_account_info(),
        //         )?;
        //     } else {
        //         let found = allowed_programs.iter().find(|p| (*p).eq(&ix_program_key));
        //         if found.is_none() {
        //             return Err(errors::ErrorCode::Unauthorized.into());
        //         }
        //     }
        // } else {
        //     hpl_hive_control::instructions::platform_gate_fn(
        //         hpl_hive_control::constants::ACTIONS.public_high,
        //         None,
        //         &ctx.accounts.project,
        //         ctx.accounts.authority.key(),
        //         ctx.accounts.wallet.to_account_info(),
        //         ctx.accounts.vault.to_account_info(),
        //         &None,
        //         ctx.accounts.system_program.to_account_info(),
        //     )?;
        // }

        let ix_program_key =
            anchor_lang::solana_program::sysvar::instructions::get_instruction_relative(
                0,
                &ctx.accounts.instructions_sysvar,
            )
            .unwrap()
            .program_id;

        // Perform the platform gate based on the caller's program ID
        if ix_program_key.eq(&ID) {
            // If caller's program ID is the HPL Hive Control program ID, perform driver action platform gate
            hpl_hive_control::instructions::platform_gate_fn(
                hpl_hive_control::constants::ACTIONS.public_high,
                None,
                &ctx.accounts.project,
                ctx.accounts.authority.key(),
                ctx.accounts.wallet.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                &None,
                ctx.accounts.system_program.to_account_info(),
            )?;
        } else {
            // If caller's program ID is not the HPL Hive Control program ID, check if it's in the allowed programs list
            let found = allowed_programs.iter().find(|p| (*p).eq(&ix_program_key));
            if found.is_none() {
                return Err(errors::ErrorCode::Unauthorized.into());
            }
        }
        // Check if the holder account status is active, if not, return an error
        if ctx.accounts.holder_account.status == HolderStatus::Inactive {
            return Err(ErrorCode::InactiveHolder.into());
        }

        // Perform pre-actions before funding the account
        pre_actions(
            &ctx.accounts.currency,
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.token_account.to_account_info(),
            ctx.accounts.mint.to_account_info(),
        )?;

        // Clone the currency reference for later usage
        let currency = &ctx.accounts.currency.clone();

        // Get references to the token program, token account, and mint
        let token_program = ctx.accounts.token_program.to_account_info();
        let token_account = ctx.accounts.token_account.to_account_info();
        let mint = ctx.accounts.mint.to_account_info();

        // Fund the account with the specified amount
        instructions::fund_account(ctx, amount)?;

        // Perform post-actions after funding the account
        post_actions(currency, token_program, token_account, mint)
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
        let allowed_programs: Vec<Pubkey> = vec![
            ctx.accounts.project.allowed_programs.clone(),
            hpl_hive_control::constants::known_programs(),
        ]
        .concat();

        // if allowed_programs.len() > 0 {
        //     let ix_program_key =
        //         anchor_lang::solana_program::sysvar::instructions::get_instruction_relative(
        //             0,
        //             &ctx.accounts.instructions_sysvar,
        //         )
        //         .unwrap()
        //         .program_id;

        //     if ix_program_key.eq(&ID) {
        //         hpl_hive_control::instructions::platform_gate_fn(
        //             hpl_hive_control::constants::ACTIONS.driver_action,
        //             Some((0, Pubkey::default())),
        //             &ctx.accounts.project,
        //             ctx.accounts.authority.key(),
        //             ctx.accounts.owner.to_account_info(),
        //             ctx.accounts.vault.to_account_info(),
        //             &None,
        //             ctx.accounts.system_program.to_account_info(),
        //         )?;
        //     } else {
        //         let found = allowed_programs.iter().find(|p| (*p).eq(&ix_program_key));
        //         if found.is_none() {
        //             return Err(errors::ErrorCode::Unauthorized.into());
        //         }
        //     }
        // } else {
        //     hpl_hive_control::instructions::platform_gate_fn(
        //         hpl_hive_control::constants::ACTIONS.public_high,
        //         None,
        //         &ctx.accounts.project,
        //         ctx.accounts.authority.key(),
        //         ctx.accounts.owner.to_account_info(),
        //         ctx.accounts.vault.to_account_info(),
        //         &None,
        //         ctx.accounts.system_program.to_account_info(),
        //     )?;
        // }

        let ix_program_key =
            anchor_lang::solana_program::sysvar::instructions::get_instruction_relative(
                0,
                &ctx.accounts.instructions_sysvar,
            )
            .unwrap()
            .program_id;

        // Perform the platform gate based on the caller's program ID
        if ix_program_key.eq(&ID) {
            // If caller's program ID is the HPL Hive Control program ID, perform driver action platform gate
            hpl_hive_control::instructions::platform_gate_fn(
                hpl_hive_control::constants::ACTIONS.public_high,
                None,
                &ctx.accounts.project,
                ctx.accounts.authority.key(),
                ctx.accounts.owner.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                &None,
                ctx.accounts.system_program.to_account_info(),
            )?;
        } else {
            // If caller's program ID is not the HPL Hive Control program ID, check if it's in the allowed programs list
            let found = allowed_programs.iter().find(|p| (*p).eq(&ix_program_key));
            if found.is_none() {
                return Err(errors::ErrorCode::Unauthorized.into());
            }
        }
        // Check if the holder account status is active, if not, return an error
        if ctx.accounts.holder_account.status == HolderStatus::Inactive {
            return Err(ErrorCode::InactiveHolder.into());
        }

        // Perform pre-actions before burning the currency
        pre_actions(
            &ctx.accounts.currency,
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.token_account.to_account_info(),
            ctx.accounts.mint.to_account_info(),
        )?;

        // Clone the currency reference for later usage
        let currency = &ctx.accounts.currency.clone();

        // Get references to the token program, token account, and mint
        let token_program = ctx.accounts.token_program.to_account_info();
        let token_account = ctx.accounts.token_account.to_account_info();
        let mint = ctx.accounts.mint.to_account_info();

        // Burn the specified amount of currency
        instructions::burn_currency(ctx, amount)?;

        // Perform post-actions after burning the currency
        post_actions(currency, token_program, token_account, mint)
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
        let allowed_programs: Vec<Pubkey> = vec![
            ctx.accounts.project.allowed_programs.clone(),
            hpl_hive_control::constants::known_programs(),
        ]
        .concat();

        // if allowed_programs.len() > 0 {
        //     let ix_program_key =
        //         anchor_lang::solana_program::sysvar::instructions::get_instruction_relative(
        //             0,
        //             &ctx.accounts.instructions_sysvar,
        //         )
        //         .unwrap()
        //         .program_id;

        //     if ix_program_key.eq(&ID) {
        //         hpl_hive_control::instructions::platform_gate_fn(
        //             hpl_hive_control::constants::ACTIONS.driver_action,
        //             Some((0, Pubkey::default())),
        //             &ctx.accounts.project,
        //             ctx.accounts.authority.key(),
        //             ctx.accounts.owner.to_account_info(),
        //             ctx.accounts.vault.to_account_info(),
        //             &None,
        //             ctx.accounts.system_program.to_account_info(),
        //         )?;
        //     } else {
        //         let found = allowed_programs.iter().find(|p| (*p).eq(&ix_program_key));
        //         if found.is_none() {
        //             return Err(errors::ErrorCode::Unauthorized.into());
        //         }
        //     }
        // } else {
        //     hpl_hive_control::instructions::platform_gate_fn(
        //         hpl_hive_control::constants::ACTIONS.public_high,
        //         None,
        //         &ctx.accounts.project,
        //         ctx.accounts.authority.key(),
        //         ctx.accounts.owner.to_account_info(),
        //         ctx.accounts.vault.to_account_info(),
        //         &None,
        //         ctx.accounts.system_program.to_account_info(),
        //     )?;
        // }

        let ix_program_key =
            anchor_lang::solana_program::sysvar::instructions::get_instruction_relative(
                0,
                &ctx.accounts.instructions_sysvar,
            )
            .unwrap()
            .program_id;

        msg!("CPI? {:?}", ix_program_key);

        // Perform the platform gate based on the caller's program ID
        if ix_program_key.eq(&ID) {
            // If caller's program ID is the HPL Hive Control program ID, perform driver action platform gate
            hpl_hive_control::instructions::platform_gate_fn(
                hpl_hive_control::constants::ACTIONS.public_high,
                None,
                &ctx.accounts.project,
                ctx.accounts.authority.key(),
                ctx.accounts.owner.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                &None,
                ctx.accounts.system_program.to_account_info(),
            )?;
        } else {
            // If caller's program ID is not the HPL Hive Control program ID, check if it's in the allowed programs list
            let found = allowed_programs.iter().find(|p| (*p).eq(&ix_program_key));
            msg!("Allowed CPI {}", found.is_some());
            if found.is_none() {
                return Err(errors::ErrorCode::Unauthorized.into());
            }
        }

        // Check if the sender's holder account status is active, if not, return an error
        if ctx.accounts.sender_holder_account.status == HolderStatus::Inactive {
            return Err(ErrorCode::InactiveHolder.into());
        }

        // Check if the receiver's holder account status is active, if not, return an error
        if ctx.accounts.receiver_holder_account.status == HolderStatus::Inactive {
            return Err(ErrorCode::InactiveHolder.into());
        }

        // Perform pre-actions before transferring the currency for the sender's token account
        pre_actions(
            &ctx.accounts.currency,
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.sender_token_account.to_account_info(),
            ctx.accounts.mint.to_account_info(),
        )?;

        // Perform pre-actions before transferring the currency for the sender's token account
        pre_actions(
            &ctx.accounts.currency,
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.receiver_token_account.to_account_info(),
            ctx.accounts.mint.to_account_info(),
        )?;

        // Clone the currency reference for later usage
        let currency = &ctx.accounts.currency.clone();

        // Get references to the token program, sender's and receiver's token accounts, and mint
        let token_program = ctx.accounts.token_program.to_account_info();
        let sender_token_account = ctx.accounts.sender_token_account.to_account_info();
        let receiver_token_account = ctx.accounts.receiver_token_account.to_account_info();
        let mint = ctx.accounts.mint.to_account_info();

        // Transfer the specified amount of currency
        instructions::transfer_currency(ctx, amount)?;

        // Perform post-actions after transferring the currency for the sender's token account
        post_actions(
            currency,
            token_program.clone(),
            sender_token_account,
            mint.clone(),
        )?;

        // Perform post-actions after transferring the currency for the sender's token account
        post_actions(currency, token_program, receiver_token_account, mint)
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
        let allowed_programs: Vec<Pubkey> = vec![
            ctx.accounts.project.allowed_programs.clone(),
            hpl_hive_control::constants::known_programs(),
        ]
        .concat();

        // if allowed_programs.len() > 0 {
        //     let ix_program_key =
        //         anchor_lang::solana_program::sysvar::instructions::get_instruction_relative(
        //             0,
        //             &ctx.accounts.instructions_sysvar,
        //         )
        //         .unwrap()
        //         .program_id;

        //     if ix_program_key.eq(&ID) {
        //         hpl_hive_control::instructions::platform_gate_fn(
        //             hpl_hive_control::constants::ACTIONS.driver_action,
        //             Some((0, Pubkey::default())),
        //             &ctx.accounts.project,
        //             ctx.accounts.authority.key(),
        //             ctx.accounts.owner.to_account_info(),
        //             ctx.accounts.vault.to_account_info(),
        //             &None,
        //             ctx.accounts.system_program.to_account_info(),
        //         )?;
        //     } else {
        //         let found = allowed_programs.iter().find(|p| (*p).eq(&ix_program_key));
        //         if found.is_none() {
        //             return Err(errors::ErrorCode::Unauthorized.into());
        //         }
        //     }
        // } else {
        //     hpl_hive_control::instructions::platform_gate_fn(
        //         hpl_hive_control::constants::ACTIONS.public_high,
        //         None,
        //         &ctx.accounts.project,
        //         ctx.accounts.authority.key(),
        //         ctx.accounts.owner.to_account_info(),
        //         ctx.accounts.vault.to_account_info(),
        //         &None,
        //         ctx.accounts.system_program.to_account_info(),
        //     )?;
        // }

        let ix_program_key =
            anchor_lang::solana_program::sysvar::instructions::get_instruction_relative(
                0,
                &ctx.accounts.instructions_sysvar,
            )
            .unwrap()
            .program_id;

        // Perform the platform gate based on the caller's program ID
        if ix_program_key.eq(&ID) {
            // If caller's program ID is the HPL Hive Control program ID, perform driver action platform gate
            hpl_hive_control::instructions::platform_gate_fn(
                hpl_hive_control::constants::ACTIONS.public_high,
                None,
                &ctx.accounts.project,
                ctx.accounts.authority.key(),
                ctx.accounts.owner.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                &None,
                ctx.accounts.system_program.to_account_info(),
            )?;
        } else {
            // If caller's program ID is not the HPL Hive Control program ID, check if it's in the allowed programs list
            let found = allowed_programs.iter().find(|p| (*p).eq(&ix_program_key));
            if found.is_none() {
                return Err(errors::ErrorCode::Unauthorized.into());
            }
        }

        // Check if the holder account status is active, if not, return an error
        if ctx.accounts.holder_account.status == HolderStatus::Inactive {
            return Err(ErrorCode::InactiveHolder.into());
        }

        // Perform pre-actions before approving the delegate
        pre_actions(
            &ctx.accounts.currency,
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.token_account.to_account_info(),
            ctx.accounts.mint.to_account_info(),
        )?;

        // Clone the currency reference for later usage
        let currency = &ctx.accounts.currency.clone();

        // Get references to the token program, token account, and mint
        let token_program = ctx.accounts.token_program.to_account_info();
        let token_account = ctx.accounts.token_account.to_account_info();
        let mint = ctx.accounts.mint.to_account_info();

        // Approve the delegate to manage the specified amount of currency
        instructions::approve_delegate(ctx, amount)?;

        // Perform post-actions after approving the delegate
        post_actions(currency, token_program, token_account, mint)
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
        let allowed_programs: Vec<Pubkey> = vec![
            ctx.accounts.project.allowed_programs.clone(),
            hpl_hive_control::constants::known_programs(),
        ]
        .concat();

        // if allowed_programs.len() > 0 {
        //     let ix_program_key =
        //         anchor_lang::solana_program::sysvar::instructions::get_instruction_relative(
        //             0,
        //             &ctx.accounts.instructions_sysvar,
        //         )
        //         .unwrap()
        //         .program_id;

        //     if ix_program_key.eq(&ID) {
        //         hpl_hive_control::instructions::platform_gate_fn(
        //             hpl_hive_control::constants::ACTIONS.driver_action,
        //             Some((0, Pubkey::default())),
        //             &ctx.accounts.project,
        //             ctx.accounts.authority.key(),
        //             ctx.accounts.authority.to_account_info(),
        //             ctx.accounts.vault.to_account_info(),
        //             &None,
        //             ctx.accounts.system_program.to_account_info(),
        //         )?;
        //     } else {
        //         let found = allowed_programs.iter().find(|p| (*p).eq(&ix_program_key));
        //         if found.is_none() {
        //             return Err(errors::ErrorCode::Unauthorized.into());
        //         }
        //     }
        // } else {
        //     hpl_hive_control::instructions::platform_gate_fn(
        //         hpl_hive_control::constants::ACTIONS.public_high,
        //         None,
        //         &ctx.accounts.project,
        //         ctx.accounts.authority.key(),
        //         ctx.accounts.authority.to_account_info(),
        //         ctx.accounts.vault.to_account_info(),
        //         &None,
        //         ctx.accounts.system_program.to_account_info(),
        //     )?;
        // }

        // Perform the platform gate based on the caller's program ID
        let ix_program_key =
            anchor_lang::solana_program::sysvar::instructions::get_instruction_relative(
                0,
                &ctx.accounts.instructions_sysvar,
            )
            .unwrap()
            .program_id;

        // Perform the platform gate based on the caller's program ID
        if ix_program_key.eq(&ID) {
            // If caller's program ID is the HPL Hive Control program ID, perform driver action platform gate
            hpl_hive_control::instructions::platform_gate_fn(
                hpl_hive_control::constants::ACTIONS.public_high,
                None,
                &ctx.accounts.project,
                ctx.accounts.authority.key(),
                ctx.accounts.authority.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                &None,
                ctx.accounts.system_program.to_account_info(),
            )?;
        } else {
            // If caller's program ID is not the HPL Hive Control program ID, check if it's in the allowed programs list
            let found = allowed_programs.iter().find(|p| (*p).eq(&ix_program_key));
            if found.is_none() {
                return Err(errors::ErrorCode::Unauthorized.into());
            }
        }

        // Check if the holder account status is active, if not, return an error
        if ctx.accounts.holder_account.status == HolderStatus::Inactive {
            return Err(ErrorCode::InactiveHolder.into());
        }

        // Perform pre-actions before revoking the delegate
        pre_actions(
            &ctx.accounts.currency,
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.token_account.to_account_info(),
            ctx.accounts.mint.to_account_info(),
        )?;

        // Clone the currency reference for later usage
        let currency = &ctx.accounts.currency.clone();

        // Get references to the token program, token account, and mint
        let token_program = ctx.accounts.token_program.to_account_info();
        let token_account = ctx.accounts.token_account.to_account_info();
        let mint = ctx.accounts.mint.to_account_info();

        // Revoke the delegate's permission to manage currency
        instructions::revoke_delegate(ctx)?;

        // Perform post-actions after revoking the delegate
        post_actions(currency, token_program, token_account, mint)
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
        let allowed_programs: Vec<Pubkey> = vec![
            ctx.accounts.project.allowed_programs.clone(),
            hpl_hive_control::constants::known_programs(),
        ]
        .concat();

        // if allowed_programs.len() > 0 {
        //     let ix_program_key =
        //         anchor_lang::solana_program::sysvar::instructions::get_instruction_relative(
        //             0,
        //             &ctx.accounts.instructions_sysvar,
        //         )
        //         .unwrap()
        //         .program_id;

        //     if ix_program_key.eq(&ID) {
        //         hpl_hive_control::instructions::platform_gate_fn(
        //             hpl_hive_control::constants::ACTIONS.driver_action,
        //             Some((0, Pubkey::default())),
        //             &ctx.accounts.project,
        //             ctx.accounts.authority.key(),
        //             ctx.accounts.authority.to_account_info(),
        //             ctx.accounts.vault.to_account_info(),
        //             &None,
        //             ctx.accounts.system_program.to_account_info(),
        //         )?;
        //     } else {
        //         let found = allowed_programs.iter().find(|p| (*p).eq(&ix_program_key));
        //         if found.is_none() {
        //             return Err(errors::ErrorCode::Unauthorized.into());
        //         }
        //     }
        // } else {
        //     hpl_hive_control::instructions::platform_gate_fn(
        //         hpl_hive_control::constants::ACTIONS.public_high,
        //         None,
        //         &ctx.accounts.project,
        //         ctx.accounts.authority.key(),
        //         ctx.accounts.authority.to_account_info(),
        //         ctx.accounts.vault.to_account_info(),
        //         &None,
        //         ctx.accounts.system_program.to_account_info(),
        //     )?;
        // }

        let ix_program_key =
            anchor_lang::solana_program::sysvar::instructions::get_instruction_relative(
                0,
                &ctx.accounts.instructions_sysvar,
            )
            .unwrap()
            .program_id;

        // Perform the platform gate based on the caller's program ID
        if ix_program_key.eq(&ID) {
            // If caller's program ID is the HPL Hive Control program ID, perform driver action platform gate
            hpl_hive_control::instructions::platform_gate_fn(
                hpl_hive_control::constants::ACTIONS.public_high,
                None,
                &ctx.accounts.project,
                ctx.accounts.authority.key(),
                ctx.accounts.authority.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                &None,
                ctx.accounts.system_program.to_account_info(),
            )?;
        } else {
            // If caller's program ID is not the HPL Hive Control program ID, check if it's in the allowed programs list
            let found = allowed_programs.iter().find(|p| (*p).eq(&ix_program_key));
            if found.is_none() {
                return Err(errors::ErrorCode::Unauthorized.into());
            }
        }

        // Call the `set_holder_status` instruction to set the holder account's status
        instructions::set_holder_status(ctx, status)
    }
}
