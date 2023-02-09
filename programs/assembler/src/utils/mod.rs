pub mod bpf_writer;
pub mod metadata;

pub use bpf_writer::BpfWriter;
pub use metadata::*;

use {
    crate::{
        errors::ErrorCode,
        state::{Assembler, DelegateAuthority, DelegateAuthorityPermission},
    },
    anchor_lang::{prelude::*, solana_program},
};

pub const DESCRIMINATOR_SIZE: usize = 8;
pub const EXTRA_SIZE: usize = DESCRIMINATOR_SIZE + 200;

pub fn assert_authority<'info>(
    signer: Pubkey,
    assembler: &Account<'info, Assembler>,
    delegate: &Option<Account<'info, DelegateAuthority>>,
    permissions: &[DelegateAuthorityPermission],
) -> Result<DelegateAuthorityPermission> {
    if assembler.authority == signer {
        return Ok(DelegateAuthorityPermission::Master);
    }

    if let Some(delegate) = delegate {
        if delegate.authority == signer && permissions.contains(&delegate.permission) {
            return Ok(delegate.permission);
        }
    }

    Err(ErrorCode::Unauthorized.into())
}

pub fn reallocate<'info>(
    len: isize,
    account_info: AccountInfo<'info>,
    payer_info: AccountInfo<'info>,
    rent_sysvar: &Sysvar<'info, Rent>,
    system_program: &Program<'info, System>,
) -> Result<()> {
    let curr_len = isize::try_from(account_info.data_len()).unwrap();
    let new_len = curr_len + len;
    let curr_rent = rent_sysvar.minimum_balance(usize::try_from(curr_len).unwrap());
    let new_rent = rent_sysvar.minimum_balance(usize::try_from(new_len).unwrap());
    let rent_diff: isize = isize::try_from(new_rent).unwrap() - isize::try_from(curr_rent).unwrap();

    let account_info_borrow = account_info.clone();
    if rent_diff > 0 {
        solana_program::program::invoke(
            &solana_program::system_instruction::transfer(
                payer_info.key,
                account_info_borrow.key,
                u64::try_from(rent_diff).unwrap(),
            ),
            &[
                payer_info,
                account_info_borrow,
                system_program.to_account_info(),
            ],
        )?;
    } else if rent_diff < 0 {
        let parsed_rent_diff = u64::try_from(rent_diff * -1).unwrap();

        **payer_info.lamports.borrow_mut() = payer_info
            .lamports()
            .checked_add(parsed_rent_diff)
            .ok_or(ErrorCode::Overflow)?;

        **account_info.lamports.borrow_mut() = account_info
            .lamports()
            .checked_sub(parsed_rent_diff)
            .ok_or(ErrorCode::Overflow)?;
    } else {
        return Ok(());
    }

    account_info
        .realloc(usize::try_from(new_len).unwrap(), false)
        .map_err(Into::into)
}
