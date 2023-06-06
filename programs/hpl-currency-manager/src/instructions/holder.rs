use {
    crate::{errors::ErrorCode, id, state::*},
    anchor_lang::prelude::*,
    anchor_spl::token::{self, Approve, Burn, Mint, Revoke, Token, TokenAccount, Transfer},
    hpl_hive_control::state::Project,
    hpl_utils::traits::Default,
};

/// Accounts used in create create holder_account instruction
#[derive(Accounts)]
pub struct CreateHolderAccount<'info> {
    /// The project this currency is associated with.
    #[account(mut)]
    pub project: Account<'info, Project>,

    /// Currency account
    #[account(has_one = mint, has_one = project)]
    pub currency: Account<'info, Currency>,

    /// Holder account
    #[account(
        init, payer = payer,
        space = HolderAccount::LEN,
        seeds = [
            b"holder_account",
            owner.key().as_ref(),
            mint.key().as_ref()
        ],
        bump
    )]
    pub holder_account: Account<'info, HolderAccount>,

    /// Currency mint
    #[account()]
    pub mint: Account<'info, Mint>,

    /// Currency metadata
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub metadata: AccountInfo<'info>,

    /// token account holding the token
    #[account(
      init, payer = payer,
      seeds = [
        if currency.kind == ( CurrencyKind::Permissioned{ kind: PermissionedCurrencyKind::Custodial } )  { holder_account.to_account_info() } else { owner.to_account_info() }.key().as_ref(),
        mint.key().as_ref(),
        id().as_ref(),
        token_program.key().as_ref(),
      ],
      bump,
      token::mint = mint,
      token::authority = if currency.kind == ( CurrencyKind::Permissioned{ kind: PermissionedCurrencyKind::Custodial } ) { holder_account.to_account_info() } else { owner.to_account_info() }
    )]
    pub token_account: Account<'info, TokenAccount>,

    /// The wallet that will own the token_account
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub owner: AccountInfo<'info>,
    /// The wallet that pays for the rent
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: This is not dangerous because it only collects platform fee
    #[account(mut)]
    pub vault: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,
}

/// Create a holder account
pub fn create_holder_account(ctx: Context<CreateHolderAccount>) -> Result<()> {
    let holder_account = &mut ctx.accounts.holder_account;

    holder_account.bump = ctx.bumps["holder_account"];
    holder_account.currency = ctx.accounts.currency.key();
    holder_account.owner = ctx.accounts.owner.key();
    holder_account.token_account = ctx.accounts.token_account.key();

    Ok(())
}

/// Accounts used in burn currency instruction
#[derive(Accounts)]
pub struct BurnCurrency<'info> {
    /// The project this currency is associated with.
    #[account(mut)]
    pub project: Account<'info, Project>,

    /// Currency account
    #[account(has_one = mint, has_one = project)]
    pub currency: Account<'info, Currency>,

    /// Holder account
    #[account(has_one = currency, has_one = token_account, has_one = owner)]
    pub holder_account: Account<'info, HolderAccount>,

    /// Currency mint
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    /// Token account holding the currency
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,

    /// The wallet that holds the authority over the project
    pub authority: Signer<'info>,
    /// The wallet that holds the authority over the project
    pub owner: Signer<'info>,
    /// CHECK: This is not dangerous because it only collects platform fee
    #[account(mut)]
    pub vault: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,
}

/// Burn currency
pub fn burn_currency(ctx: Context<BurnCurrency>, amount: u64) -> Result<()> {
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
        token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    mint: ctx.accounts.mint.to_account_info(),
                    from: ctx.accounts.token_account.to_account_info(),
                    authority: ctx.accounts.owner.to_account_info(),
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

    /// Sender Holder account
    #[account(has_one = currency, has_one = owner, constraint = sender_holder_account.token_account == sender_token_account.key())]
    pub sender_holder_account: Account<'info, HolderAccount>,

    /// Sender Token account holding the currency
    #[account(mut)]
    pub sender_token_account: Account<'info, TokenAccount>,

    /// Reciever Holder account
    #[account(has_one = currency, constraint = receiver_holder_account.token_account == receiver_token_account.key())]
    pub receiver_holder_account: Account<'info, HolderAccount>,

    /// Receiver Token account holding the currency
    #[account(mut)]
    pub receiver_token_account: Account<'info, TokenAccount>,

    /// The wallet that holds the authority over the project
    pub authority: Signer<'info>,
    /// The wallet that holds the authority over the project
    pub owner: Signer<'info>,
    /// CHECK: This is not dangerous because it only collects platform fee
    #[account(mut)]
    pub vault: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,
}

/// Transger currency
pub fn transfer_currency(ctx: Context<TransferCurrency>, amount: u64) -> Result<()> {
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
    pub project: Account<'info, Project>,

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
    pub authority: Signer<'info>,
    /// The wallet that holds the authority over the project
    pub owner: Signer<'info>,
    /// CHECK: This is not dangerous because it only collects platform fee
    #[account(mut)]
    pub vault: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
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
    pub project: Account<'info, Project>,

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
    /// CHECK: This is not dangerous because it only collects platform fee
    #[account(mut)]
    pub vault: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,
}

/// Approve currency
pub fn revoke_delegate(ctx: Context<RevokeDelegate>) -> Result<()> {
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
    pub project: Account<'info, Project>,

    /// Currency account
    #[account(has_one = project)]
    pub currency: Account<'info, Currency>,

    /// Holder account
    #[account(mut, has_one = token_account, has_one = currency)]
    pub holder_account: Account<'info, HolderAccount>,

    /// Holder account
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,

    /// The wallet that will own the token_account
    pub authority: Signer<'info>,
    /// CHECK: This is not dangerous because it only collects platform fee
    #[account(mut)]
    pub vault: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,
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
    Ok(())
}
