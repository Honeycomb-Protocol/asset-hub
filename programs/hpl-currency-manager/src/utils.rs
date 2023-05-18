pub use {
    crate::state::{Currency, CurrencyType},
    anchor_lang::prelude::*,
};

pub fn pre_actions<'info>(
    currency: &Account<'info, Currency>,
    token_program: AccountInfo<'info>,
    token_account: AccountInfo<'info>,
    mint: AccountInfo<'info>,
) -> Result<()> {
    if currency.currency_type == CurrencyType::NonCustodial {
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
    token_program: AccountInfo<'info>,
    token_account: AccountInfo<'info>,
    mint: AccountInfo<'info>,
) -> Result<()> {
    if currency.currency_type == CurrencyType::NonCustodial {
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
