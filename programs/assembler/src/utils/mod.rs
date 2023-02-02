pub mod bpf_writer;
pub mod metadata;

use anchor_lang::prelude::*;
pub use bpf_writer::BpfWriter;
pub use metadata::*;

use crate::{
    errors::ErrorCode,
    state::{Assembler, DelegateAuthority, DelegateAuthorityPermission},
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
