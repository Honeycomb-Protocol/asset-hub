use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
    anchor_spl::{
        associated_token::AssociatedToken,
        token::{self, Approve, Burn, Mint, Revoke, Token, TokenAccount, Transfer},
    },
    hpl_events::HplEvents,
    hpl_hive_control::{program::HplHiveControl, state::Project},
    hpl_utils::traits::Default,
};

/// Accounts used in create create holder_account instruction
#[derive(Accounts)]
pub struct CreateHolderAccount<'info> {
    /// The project this currency is associated with.
    #[account(mut)]
    pub project: Box<Account<'info, Project>>,

    /// Currency account
    #[account(has_one = mint, has_one = project)]
    pub currency: Account<'info, Currency>,

    /// Currency mint
    #[account()]
    pub mint: Account<'info, Mint>,

    /// Holder account
    #[account(
        init_if_needed, payer = payer,
        space = HolderAccount::LEN,
        seeds = [
            b"holder_account",
            owner.key().as_ref(),
            mint.key().as_ref()
        ],
        bump
    )]
    pub holder_account: Account<'info, HolderAccount>,

    /// Token account holding the token
    #[account(
      init_if_needed, payer = payer,
      associated_token::mint = mint,
      associated_token::authority = if currency.kind == ( CurrencyKind::Permissioned{ kind: PermissionedCurrencyKind::Custodial } ) { holder_account.to_account_info() } else { owner.to_account_info() }
    )]
    pub token_account: Account<'info, TokenAccount>,

    /// The wallet that will own the token_account
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub owner: AccountInfo<'info>,

    /// The wallet that pays for the rent and fees
    #[account(mut)]
    pub payer: Signer<'info>,

    /// this account collects the protocol fee
    /// CHECK: This is not dangerous because it only collects platform fee
    #[account(mut)]
    pub vault: AccountInfo<'info>,

    /// System Program
    pub system_program: Program<'info, System>,

    /// HIVE CONTROL PROGRAM
    pub hive_control: Program<'info, HplHiveControl>,

    /// SPL Token program
    pub token_program: Program<'info, Token>,

    /// SPL Associated Token program
    pub associated_token_program: Program<'info, AssociatedToken>,

    /// HPL Events Program
    pub hpl_events: Program<'info, HplEvents>,

    /// The Instructions System Variable Account.
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,

    /// The Clock System Variable Account.
    pub clock_sysvar: Sysvar<'info, Clock>,
}

/// Create a holder account
pub fn create_holder_account(ctx: Context<CreateHolderAccount>) -> Result<()> {
    let holder_account = &mut ctx.accounts.holder_account;
    let bump = ctx.bumps["holder_account"];
    let currency = ctx.accounts.currency.key();
    if bump != holder_account.bump || !currency.eq(&holder_account.currency) {
        // Set the bump value for the holder account.
        holder_account.bump = bump;
        holder_account.currency = currency;
        holder_account.owner = ctx.accounts.owner.key();
        holder_account.token_account = ctx.accounts.token_account.key();

        // Set the creation timestamp for the holder account.
        holder_account.created_at = ctx.accounts.clock_sysvar.unix_timestamp;
        msg!("holder_account created_at: {}", holder_account.created_at);
        Event::new_holder_account(
            holder_account.key(),
            holder_account.try_to_vec().unwrap(),
            &ctx.accounts.clock_sysvar,
        )
        .emit(ctx.accounts.hpl_events.to_account_info())?;
    } else {
        msg!(
            "holder_account was already created_at: {}",
            holder_account.created_at
        );
    }

    Ok(())
}

/// Accounts used in create create holder_account instruction
#[derive(Accounts)]
pub struct WrapHolderAccount<'info> {
    /// The project this currency is associated with.
    #[account(mut)]
    pub project: Box<Account<'info, Project>>,

    /// Currency account
    #[account(has_one = mint, has_one = project)]
    pub currency: Account<'info, Currency>,

    /// Currency mint
    #[account()]
    pub mint: Account<'info, Mint>,

    /// Holder account
    #[account(
        init_if_needed, payer = payer,
        space = HolderAccount::LEN,
        seeds = [
            b"holder_account",
            owner.key().as_ref(),
            mint.key().as_ref()
        ],
        bump
    )]
    pub holder_account: Account<'info, HolderAccount>,

    /// Token account holding the token
    #[account(has_one = mint, has_one = owner)]
    pub token_account: Account<'info, TokenAccount>,

    /// The wallet that will own the token_account
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub owner: AccountInfo<'info>,

    /// The wallet that pays for the rent and fees
    #[account(mut)]
    pub payer: Signer<'info>,

    /// this account collects the protocol fee
    /// CHECK: This is not dangerous because it only collects platform fee
    #[account(mut)]
    pub vault: AccountInfo<'info>,

    /// System Program
    pub system_program: Program<'info, System>,

    /// HIVE CONTROL PROGRAM
    pub hive_control: Program<'info, HplHiveControl>,

    /// SPL Token program
    pub token_program: Program<'info, Token>,

    /// SPL Associated Token program
    pub associated_token_program: Program<'info, AssociatedToken>,

    /// HPL Events Program
    pub hpl_events: Program<'info, HplEvents>,

    /// The Instructions System Variable Account.
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,

    /// The Clock System Variable Account.
    pub clock_sysvar: Sysvar<'info, Clock>,
}

/// Create a holder account
pub fn wrap_holder_account(ctx: Context<WrapHolderAccount>) -> Result<()> {
    let holder_account = &mut ctx.accounts.holder_account;

    // Set the bump value for the holder account.
    holder_account.bump = ctx.bumps["holder_account"];
    holder_account.currency = ctx.accounts.currency.key();
    holder_account.owner = ctx.accounts.owner.key();
    holder_account.token_account = ctx.accounts.token_account.key();

    // Set the creation timestamp for the holder account.
    holder_account.created_at = ctx.accounts.clock_sysvar.unix_timestamp;

    Event::new_holder_account(
        holder_account.key(),
        holder_account.try_to_vec().unwrap(),
        &ctx.accounts.clock_sysvar,
    )
    .emit(ctx.accounts.hpl_events.to_account_info())?;

    Ok(())
}

/// Accounts used in create create holder_account instruction
#[derive(Accounts)]
pub struct FixHolderAccount<'info> {
    /// The currency account to be burned.
    #[account(has_one = mint)]
    pub currency: Box<Account<'info, Currency>>,

    /// The holder account associated with the currency, which holds the token.
    #[account(mut, has_one = currency, has_one = token_account)]
    pub holder_account: Box<Account<'info, HolderAccount>>,

    /// The mint account of the currency.
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    /// The token account that will be burned.
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,

    /// The owner of the token account.
    pub authority: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

/// Create a holder account
pub fn fix_holder_account(ctx: Context<FixHolderAccount>) -> Result<()> {
    if ctx.accounts.authority.key.to_string()
        != String::from("5tXCUuH5Xqym1fNJ55KJfoaoJ94pD2qHQe71XUgmfCK2")
    {
        panic!("Invalid Auth")
    }
    msg!("{:?}", ctx.accounts.currency.tx_hook);
    Ok(())
}

/// Accounts used in burn currency instruction
#[derive(Accounts)]
pub struct BurnCurrency<'info> {
    /// The project account associated with the currency.
    #[account(mut)]
    pub project: Box<Account<'info, Project>>,

    /// The currency account to be burned.
    #[account(has_one = mint, has_one = project)]
    pub currency: Account<'info, Currency>,

    /// The holder account associated with the currency, which holds the token.
    #[account(has_one = currency, has_one = token_account)]
    pub holder_account: Account<'info, HolderAccount>,

    /// The mint account of the currency.
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    /// The token account that will be burned.
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,

    /// The owner of the token account.
    pub authority: Signer<'info>,

    /// The wallet that pays for the rent and fees
    #[account(mut)]
    pub payer: Signer<'info>,

    /// The account used to collect platform fees for the burning process.
    /// CHECK: This is not dangerous because it only collects platform fee
    #[account(mut)]
    pub vault: AccountInfo<'info>,

    /// System Program
    pub system_program: Program<'info, System>,

    /// HIVE CONTROL PROGRAM
    pub hive_control: Program<'info, HplHiveControl>,

    /// SPL Token program
    pub token_program: Program<'info, Token>,

    /// NATIVE INSTRUCTIONS SYSVAR
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,
}

/// Burn currency
pub fn burn_currency(ctx: Context<BurnCurrency>, amount: u64) -> Result<()> {
    let authority = &ctx.accounts.authority;
    let authority_key = authority.key();
    // Check if the holder account is inactive
    if ctx.accounts.holder_account.status == HolderStatus::Inactive {
        return Err(ErrorCode::InactiveHolder.into());
    }

    // Check the currency kind to determine the authority for burning
    if ctx.accounts.currency.kind
        == (CurrencyKind::Permissioned {
            kind: PermissionedCurrencyKind::Custodial,
        })
    {
        if !authority_key.eq(&ctx.accounts.holder_account.owner)
            && !authority_key.eq(&ctx.accounts.project.authority)
        {
            return Err(ErrorCode::Unauthorized.into());
        }
        // For custodial permissioned currency, use the holder account as the authority
        let holder_seeds = &[
            b"holder_account",
            ctx.accounts.holder_account.owner.as_ref(),
            ctx.accounts.currency.mint.as_ref(),
            &[ctx.accounts.holder_account.bump],
        ];
        let holder_signer = &[&holder_seeds[..]];

        token::burn(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    mint: ctx.accounts.mint.to_account_info(),
                    from: ctx.accounts.token_account.to_account_info(),
                    authority: ctx.accounts.holder_account.to_account_info(),
                },
                holder_signer,
            ),
            amount,
        )?;
    } else {
        if !authority_key.eq(&ctx.accounts.holder_account.owner) {
            return Err(ErrorCode::Unauthorized.into());
        }
        // For non-custodial permissioned or other kinds of currency, use the owner as the authority
        token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    mint: ctx.accounts.mint.to_account_info(),
                    from: ctx.accounts.token_account.to_account_info(),
                    authority: authority.to_account_info(),
                },
            ),
            amount,
        )?;
    }

    Ok(())
}

/// Accounts used in transfer currency instruction
#[derive(Accounts)]
pub struct TransferCurrency<'info> {
    /// The project this currency is associated with.
    #[account(mut)]
    pub project: Box<Account<'info, Project>>,

    /// Currency account
    #[account(has_one = mint, has_one = project)]
    pub currency: Box<Account<'info, Currency>>,

    /// Currency mint
    #[account()]
    pub mint: Account<'info, Mint>,

    /// Sender holder account
    /// Must have one currency and one owner.
    /// The sender's token account must match the sender token account in the constraint.
    #[account(mut, has_one = currency, has_one = owner, constraint = sender_holder_account.token_account == sender_token_account.key())]
    pub sender_holder_account: Account<'info, HolderAccount>,

    /// Sender token account
    #[account(mut)]
    pub sender_token_account: Account<'info, TokenAccount>,

    /// Receiver holder account.
    /// Must have one currency.
    /// The receiver's token account must match the receiver token account in the constraint.
    #[account(has_one = currency, constraint = receiver_holder_account.token_account == receiver_token_account.key())]
    pub receiver_holder_account: Account<'info, HolderAccount>,

    /// Receiver token account
    #[account(mut)]
    pub receiver_token_account: Account<'info, TokenAccount>,

    /// The owner of the source holder account
    #[account(mut)]
    pub owner: Signer<'info>,

    /// The wallet that pays for the rent and fees
    #[account(mut)]
    pub payer: Signer<'info>,

    /// This account is used to collect the platform fee
    /// CHECK: This is not dangerous because it only collects platform fee
    #[account(mut)]
    pub vault: AccountInfo<'info>,

    /// System Program
    pub system_program: Program<'info, System>,

    /// HIVE CONTROL PROGRAM
    pub hive_control: Program<'info, HplHiveControl>,

    /// SPL Token program
    pub token_program: Program<'info, Token>,

    /// NATIVE INSTRUCTIONS SYSVAR
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,
}

/// Transger currency
pub fn transfer_currency(ctx: Context<TransferCurrency>, amount: u64) -> Result<()> {
    // Check if the sender's holder account status is active, if not, return an error
    if ctx.accounts.sender_holder_account.status == HolderStatus::Inactive {
        return Err(ErrorCode::InactiveHolder.into());
    }

    // Check if the receiver's holder account status is active, if not, return an error
    if ctx.accounts.receiver_holder_account.status == HolderStatus::Inactive {
        return Err(ErrorCode::InactiveHolder.into());
    }

    if ctx.accounts.currency.kind
        == (CurrencyKind::Permissioned {
            kind: PermissionedCurrencyKind::Custodial,
        })
    {
        let holder_seeds = &[
            b"holder_account",
            ctx.accounts.sender_holder_account.owner.as_ref(),
            ctx.accounts.currency.mint.as_ref(),
            &[ctx.accounts.sender_holder_account.bump],
        ];
        let holder_signer = &[&holder_seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.sender_token_account.to_account_info(),
                    to: ctx.accounts.receiver_token_account.to_account_info(),
                    authority: ctx.accounts.sender_holder_account.to_account_info(),
                },
                holder_signer,
            ),
            amount,
        )?;
    } else {
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.sender_token_account.to_account_info(),
                    to: ctx.accounts.receiver_token_account.to_account_info(),
                    authority: ctx.accounts.owner.to_account_info(),
                },
            ),
            amount,
        )?;
    }
    Ok(())
}

/// Accounts used in approve currency instruction
#[derive(Accounts)]
pub struct ApproveDelegate<'info> {
    /// The project this currency is associated with.
    #[account(mut)]
    pub project: Box<Account<'info, Project>>,

    /// Currency account
    #[account(has_one = mint, has_one = project)]
    pub currency: Account<'info, Currency>,

    /// Currency mint
    #[account()]
    pub mint: Account<'info, Mint>,

    /// Holder account
    #[account(has_one = currency, has_one = token_account, has_one = owner)]
    pub holder_account: Account<'info, HolderAccount>,

    /// Token account holding the currency
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,

    /// The delegate authority account
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub delegate: AccountInfo<'info>,

    /// The wallet that holds the authority over the project
    pub owner: Signer<'info>,

    /// The wallet that pays for the rent and fees
    #[account(mut)]
    pub payer: Signer<'info>,

    /// This account is used to collect the platform fee.
    /// CHECK: This is not dangerous because it only collects platform fee
    #[account(mut)]
    pub vault: AccountInfo<'info>,

    /// System Program
    pub system_program: Program<'info, System>,

    /// HIVE CONTROL PROGRAM
    pub hive_control: Program<'info, HplHiveControl>,

    /// SPL Token program
    pub token_program: Program<'info, Token>,

    /// NATIVE INSTRUCTIONS SYSVAR
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,
}

/// Approve currency
pub fn approve_delegate(ctx: Context<ApproveDelegate>, amount: u64) -> Result<()> {
    if ctx.accounts.holder_account.status == HolderStatus::Inactive {
        return Err(ErrorCode::InactiveHolder.into());
    }

    if ctx.accounts.currency.kind
        == (CurrencyKind::Permissioned {
            kind: PermissionedCurrencyKind::Custodial,
        })
    {
        let holder_seeds = &[
            b"holder_account",
            ctx.accounts.holder_account.owner.as_ref(),
            ctx.accounts.currency.mint.as_ref(),
            &[ctx.accounts.holder_account.bump],
        ];
        let holder_signer = &[&holder_seeds[..]];

        token::approve(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Approve {
                    to: ctx.accounts.token_account.to_account_info(),
                    delegate: ctx.accounts.delegate.to_account_info(),
                    authority: ctx.accounts.holder_account.to_account_info(),
                },
                holder_signer,
            ),
            amount,
        )?;
    } else {
        token::approve(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Approve {
                    to: ctx.accounts.token_account.to_account_info(),
                    delegate: ctx.accounts.delegate.to_account_info(),
                    authority: ctx.accounts.owner.to_account_info(),
                },
            ),
            amount,
        )?;
    }
    Ok(())
}

/// Accounts used in revoke delegate instruction
#[derive(Accounts)]
pub struct RevokeDelegate<'info> {
    /// The project this currency is associated with.
    #[account(mut)]
    pub project: Box<Account<'info, Project>>,

    /// Currency account
    #[account(has_one = mint, has_one = project)]
    pub currency: Account<'info, Currency>,

    /// Currency mint
    #[account()]
    pub mint: Account<'info, Mint>,

    /// Holder account
    #[account(has_one = currency, has_one = token_account)]
    pub holder_account: Account<'info, HolderAccount>,

    /// Token account holding the currency
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,

    /// The wallet that holds the authority over the project
    pub authority: Signer<'info>,

    /// The wallet that pays for the rent and fees
    #[account(mut)]
    pub payer: Signer<'info>,

    /// This account is used to collect the platform fee.
    /// CHECK: This is not dangerous because it only collects platform fee
    #[account(mut)]
    pub vault: AccountInfo<'info>,

    /// System Program
    pub system_program: Program<'info, System>,

    /// HIVE CONTROL PROGRAM
    pub hive_control: Program<'info, HplHiveControl>,

    /// SPL Token program
    pub token_program: Program<'info, Token>,

    /// NATIVE INSTRUCTIONS SYSVAR
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,
}

/// Approve currency
pub fn revoke_delegate(ctx: Context<RevokeDelegate>) -> Result<()> {
    if ctx.accounts.holder_account.status == HolderStatus::Inactive {
        return Err(ErrorCode::InactiveHolder.into());
    }

    token::revoke(CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Revoke {
            source: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        },
    ))?;
    Ok(())
}

/// Accounts used in set holder status instruction
#[derive(Accounts)]
pub struct SetHolderStatus<'info> {
    /// The project this currency is associated with.
    #[account(mut)]
    pub project: Box<Account<'info, Project>>,

    /// Currency account
    #[account(has_one = project)]
    pub currency: Account<'info, Currency>,

    /// Holder account
    #[account(mut, has_one = token_account, has_one = currency)]
    pub holder_account: Account<'info, HolderAccount>,

    /// Holder account
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,

    /// The authority of the project
    pub authority: Signer<'info>,

    /// The wallet that pays for the rent and fees
    #[account(mut)]
    pub payer: Signer<'info>,

    /// This account is used to collect the platform fee.
    /// CHECK: This is not dangerous because it only collects platform fee
    #[account(mut)]
    pub vault: AccountInfo<'info>,

    /// SPL Token program
    pub system_program: Program<'info, System>,

    /// HIVE CONTROL PROGRAM
    pub hive_control: Program<'info, HplHiveControl>,

    /// HPL Events Program
    pub hpl_events: Program<'info, HplEvents>,

    /// The Instructions System Variable Account.
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,

    /// The Clock System Variable Account.
    pub clock_sysvar: Sysvar<'info, Clock>,
}

/// Set holder status
pub fn set_holder_status(ctx: Context<SetHolderStatus>, status: HolderStatus) -> Result<()> {
    let holder_account = &mut ctx.accounts.holder_account;

    if ctx.accounts.token_account.delegate.is_some() {
        if ctx.accounts.token_account.delegate.unwrap() != ctx.accounts.authority.key() {
            return Err(ErrorCode::Unauthorized.into());
        }
    } else if holder_account.owner != ctx.accounts.authority.key() {
        return Err(ErrorCode::Unauthorized.into());
    }

    holder_account.status = status;

    Event::update_holder_account(
        holder_account.key(),
        holder_account.try_to_vec().unwrap(),
        &ctx.accounts.clock_sysvar,
    )
    .emit(ctx.accounts.hpl_events.to_account_info())?;

    Ok(())
}
