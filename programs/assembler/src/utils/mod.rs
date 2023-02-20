use {
    crate::{
        errors::ErrorCode,
        state::{Assembler, DelegateAuthority, DelegateAuthorityPermission},
    },
    anchor_lang::prelude::*,
};

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
