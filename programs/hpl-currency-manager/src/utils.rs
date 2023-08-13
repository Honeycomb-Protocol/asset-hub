pub use {
    crate::state::{Currency, CurrencyKind, PermissionedCurrencyKind},
    anchor_lang::prelude::*,
    anchor_spl::token::{Mint, Token, TokenAccount},
};

pub fn pre_actions<'info>(
    currency: &Account<'info, Currency>,
    mint: &Account<'info, Mint>,
    token_account: &Account<'info, TokenAccount>,
    token_program: &Program<'info, Token>,
) -> Result<()> {
    if token_account.is_frozen()
        && mint.freeze_authority.is_some()
        && mint.freeze_authority.unwrap().eq(&currency.key())
        && currency.kind
            != (CurrencyKind::Permissioned {
                kind: PermissionedCurrencyKind::Custodial,
            })
    {
        let currency_seeds = &[
            b"currency".as_ref(),
            currency.mint.as_ref(),
            &[currency.bump],
        ];
        let currency_signer = &[&currency_seeds[..]];

        anchor_spl::token::thaw_account(CpiContext::new_with_signer(
            token_program.to_account_info(),
            anchor_spl::token::ThawAccount {
                account: token_account.to_account_info(),
                mint: mint.to_account_info(),
                authority: currency.to_account_info(),
            },
            currency_signer,
        ))?;
    }
    return Ok(());
}

pub fn post_actions<'info>(
    currency: &Account<'info, Currency>,
    mint: &Account<'info, Mint>,
    token_account: &Account<'info, TokenAccount>,
    token_program: &Program<'info, Token>,
) -> Result<()> {
    if !token_account.is_frozen()
        && mint.freeze_authority.is_some()
        && mint.freeze_authority.unwrap().eq(&currency.key())
        && currency.kind
            != (CurrencyKind::Permissioned {
                kind: PermissionedCurrencyKind::Custodial,
            })
    {
        let currency_seeds = &[
            b"currency".as_ref(),
            currency.mint.as_ref(),
            &[currency.bump],
        ];
        let currency_signer = &[&currency_seeds[..]];

        anchor_spl::token::freeze_account(CpiContext::new_with_signer(
            token_program.to_account_info(),
            anchor_spl::token::FreezeAccount {
                account: token_account.to_account_info(),
                mint: mint.to_account_info(),
                authority: currency.to_account_info(),
            },
            currency_signer,
        ))?;
    }
    return Ok(());
}
