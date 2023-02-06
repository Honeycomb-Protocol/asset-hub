use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::{prelude::*, solana_program},
    mpl_token_metadata::{
        self,
        instruction::{
            builders::{
                DelegateBuilder, LockBuilder, RevokeBuilder, TransferBuilder, UnlockBuilder,
            },
            DelegateArgs, InstructionBuilder, LockArgs, RevokeArgs, TransferArgs, UnlockArgs,
        },
        state::Metadata,
    },
};

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

pub enum ValidateCollectionCreatorOutput {
    Collection { address: Pubkey },
    Creator { address: Pubkey },
}
pub fn validate_collection_creator<'info>(
    metadata: Metadata,
    project: &Account<'info, Project>,
) -> Result<ValidateCollectionCreatorOutput> {
    if project.collections.len() > 0 {
        if let Some(collection) = metadata.collection {
            if collection.verified && project.collections.contains(&collection.key) {
                return Ok(ValidateCollectionCreatorOutput::Collection {
                    address: collection.key,
                });
            }
        }
    }

    if project.creators.len() > 0 {
        if let Some(creators) = metadata.data.creators {
            let found = creators
                .iter()
                .position(|x| x.verified && project.creators.contains(&x.address));
            if let Some(index) = found {
                return Ok(ValidateCollectionCreatorOutput::Creator {
                    address: creators[index].address,
                });
            }
        }
    }

    Err(ErrorCode::InvalidNFT.into())
}

pub fn transfer<'info>(
    amount: u64,
    source_token_account: AccountInfo<'info>,
    source_token_account_owner: AccountInfo<'info>,
    destination_token_account: AccountInfo<'info>,
    destination_token_account_owner: AccountInfo<'info>,
    token_mint: AccountInfo<'info>,
    token_metadata: AccountInfo<'info>,
    token_edition: AccountInfo<'info>,
    source_token_account_record: Option<AccountInfo<'info>>,
    destination_token_account_record: Option<AccountInfo<'info>>,
    authority: AccountInfo<'info>,
    payer: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    token_program: AccountInfo<'info>,
    associated_token_program: AccountInfo<'info>,
    sysvar_instructions: AccountInfo<'info>,
    signer_seeds: Option<&[&[&[u8]]; 1]>,
) -> Result<()> {
    let mut binding = TransferBuilder::new();
    let transfer_builder = binding
        .token(source_token_account.key())
        .token_owner(source_token_account_owner.key())
        .destination(destination_token_account.key())
        .destination_owner(destination_token_account_owner.key())
        .mint(token_mint.key())
        .metadata(token_metadata.key())
        .edition(token_edition.key())
        .authority(authority.key())
        .payer(payer.key())
        .system_program(system_program.key())
        .sysvar_instructions(sysvar_instructions.key())
        .spl_token_program(token_program.key())
        .spl_ata_program(associated_token_program.key());

    let mut account_infos = vec![
        source_token_account,
        source_token_account_owner,
        destination_token_account,
        destination_token_account_owner,
        token_mint,
        token_metadata,
        token_edition,
    ];

    if let Some(source_token_account_record) = source_token_account_record {
        transfer_builder.owner_token_record(source_token_account_record.key());
        account_infos.push(source_token_account_record);
    }

    if let Some(destination_token_account_record) = destination_token_account_record {
        transfer_builder.destination_token_record(destination_token_account_record.key());
        account_infos.push(destination_token_account_record);
    }

    account_infos = [
        account_infos,
        vec![
            authority,
            payer,
            system_program,
            sysvar_instructions,
            token_program,
            associated_token_program,
        ],
    ]
    .concat();

    let transfer_ix = transfer_builder
        .build(TransferArgs::V1 {
            amount,
            authorization_data: None,
        })
        .unwrap()
        .instruction();

    if let Some(signer_seeds) = signer_seeds {
        return solana_program::program::invoke_signed(
            &transfer_ix,
            &account_infos[..],
            signer_seeds,
        )
        .map_err(Into::into);
    } else {
        return solana_program::program::invoke(&transfer_ix, &account_infos[..])
            .map_err(Into::into);
    }
}

pub fn lock<'info>(
    authority: AccountInfo<'info>,
    token_mint: AccountInfo<'info>,
    token_account: AccountInfo<'info>,
    token_account_owner: AccountInfo<'info>,
    token_metadata: AccountInfo<'info>,
    token_edition: AccountInfo<'info>,
    token_record: Option<AccountInfo<'info>>,
    payer: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    sysvar_instructions: AccountInfo<'info>,
    token_program: AccountInfo<'info>,
    signer_seeds: Option<&[&[&[u8]]; 1]>,
) -> Result<()> {
    let mut binding = LockBuilder::new();
    let lock_builder = binding
        .authority(authority.key())
        .token_owner(token_account_owner.key())
        .token(token_account.key())
        .mint(token_mint.key())
        .metadata(token_metadata.key())
        .edition(token_edition.key())
        .payer(payer.key())
        .system_program(system_program.key())
        .sysvar_instructions(sysvar_instructions.key())
        .spl_token_program(token_program.key());

    let mut account_infos = vec![
        authority,
        token_account_owner,
        token_account,
        token_mint,
        token_metadata,
        token_edition,
    ];

    if let Some(token_record) = token_record {
        lock_builder.token_record(token_record.key());
        account_infos.push(token_record);
    }

    account_infos = [
        account_infos,
        vec![payer, system_program, sysvar_instructions, token_program],
    ]
    .concat();

    let lock_ix = lock_builder
        .build(LockArgs::V1 {
            authorization_data: None,
        })
        .unwrap()
        .instruction();

    if let Some(signer_seeds) = signer_seeds {
        return solana_program::program::invoke_signed(&lock_ix, &account_infos[..], signer_seeds)
            .map_err(Into::into);
    } else {
        return solana_program::program::invoke(&lock_ix, &account_infos[..]).map_err(Into::into);
    }
}

pub fn unlock<'info>(
    authority: AccountInfo<'info>,
    token_mint: AccountInfo<'info>,
    token_account: AccountInfo<'info>,
    token_account_owner: AccountInfo<'info>,
    token_metadata: AccountInfo<'info>,
    token_edition: AccountInfo<'info>,
    token_record: Option<AccountInfo<'info>>,
    payer: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    sysvar_instructions: AccountInfo<'info>,
    token_program: AccountInfo<'info>,
    signer_seeds: Option<&[&[&[u8]]; 1]>,
) -> Result<()> {
    let mut binding = UnlockBuilder::new();
    let unlock_builder = binding
        .authority(authority.key())
        .token_owner(token_account_owner.key())
        .token(token_account.key())
        .mint(token_mint.key())
        .metadata(token_metadata.key())
        .edition(token_edition.key())
        .payer(payer.key())
        .system_program(system_program.key())
        .sysvar_instructions(sysvar_instructions.key())
        .spl_token_program(token_program.key());

    let mut account_infos = vec![
        authority,
        token_account_owner,
        token_account,
        token_mint,
        token_metadata,
        token_edition,
    ];

    if let Some(token_record) = token_record {
        unlock_builder.token_record(token_record.key());
        account_infos.push(token_record);
    }

    account_infos = [
        account_infos,
        vec![payer, system_program, sysvar_instructions, token_program],
    ]
    .concat();

    let unlock_ix = unlock_builder
        .build(UnlockArgs::V1 {
            authorization_data: None,
        })
        .unwrap()
        .instruction();

    if let Some(signer_seeds) = signer_seeds {
        return solana_program::program::invoke_signed(
            &unlock_ix,
            &account_infos[..],
            signer_seeds,
        )
        .map_err(Into::into);
    } else {
        return solana_program::program::invoke(&unlock_ix, &account_infos[..]).map_err(Into::into);
    }
}

pub fn delegate<'info>(
    args: DelegateArgs,
    delegate_record: Option<AccountInfo<'info>>,
    delegate: AccountInfo<'info>,
    metadata: AccountInfo<'info>,
    master_edition: AccountInfo<'info>,
    token_record: Option<AccountInfo<'info>>,
    mint: AccountInfo<'info>,
    token_account: AccountInfo<'info>,
    authority: AccountInfo<'info>,
    payer: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    sysvar_instructions: AccountInfo<'info>,
    token_program: AccountInfo<'info>,
    signer_seeds: Option<&[&[&[u8]]; 1]>,
) -> Result<()> {
    let mut binding = DelegateBuilder::new();
    let delegate_builder = binding
        .delegate(delegate.key())
        .metadata(metadata.key())
        .master_edition(master_edition.key())
        .mint(mint.key())
        .token(token_account.key())
        .authority(authority.key())
        .payer(payer.key())
        .system_program(system_program.key())
        .sysvar_instructions(sysvar_instructions.key())
        .spl_token_program(token_program.key());

    let mut account_infos = vec![];

    if let Some(delegate_record) = delegate_record {
        delegate_builder.delegate_record(delegate_record.key());
        account_infos.push(delegate_record);
    }

    account_infos = [account_infos, vec![delegate, metadata, master_edition]].concat();

    if let Some(token_record) = token_record {
        delegate_builder.token_record(token_record.key());
        account_infos.push(token_record);
    }

    account_infos = [
        account_infos,
        vec![
            mint,
            token_account,
            authority,
            payer,
            system_program,
            sysvar_instructions,
            token_program,
        ],
    ]
    .concat();

    let delegate_ix = delegate_builder.build(args).unwrap().instruction();

    if let Some(signer_seeds) = signer_seeds {
        return solana_program::program::invoke_signed(
            &delegate_ix,
            &account_infos[..],
            signer_seeds,
        )
        .map_err(Into::into);
    } else {
        return solana_program::program::invoke(&delegate_ix, &account_infos[..])
            .map_err(Into::into);
    }
}

pub fn revoke<'info>(
    args: RevokeArgs,
    delegate_record: Option<AccountInfo<'info>>,
    delegate: AccountInfo<'info>,
    metadata: AccountInfo<'info>,
    master_edition: AccountInfo<'info>,
    token_record: Option<AccountInfo<'info>>,
    mint: AccountInfo<'info>,
    token_account: AccountInfo<'info>,
    authority: AccountInfo<'info>,
    payer: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    sysvar_instructions: AccountInfo<'info>,
    token_program: AccountInfo<'info>,
    signer_seeds: Option<&[&[&[u8]]; 1]>,
) -> Result<()> {
    let mut binding = RevokeBuilder::new();
    let revoke_builder = binding
        .delegate(delegate.key())
        .metadata(metadata.key())
        .master_edition(master_edition.key())
        .mint(mint.key())
        .token(token_account.key())
        .authority(authority.key())
        .payer(payer.key())
        .system_program(system_program.key())
        .sysvar_instructions(sysvar_instructions.key())
        .spl_token_program(token_program.key());

    let mut account_infos = vec![];

    if let Some(delegate_record) = delegate_record {
        revoke_builder.delegate_record(delegate_record.key());
        account_infos.push(delegate_record);
    }

    account_infos = [account_infos, vec![delegate, metadata, master_edition]].concat();

    if let Some(token_record) = token_record {
        revoke_builder.token_record(token_record.key());
        account_infos.push(token_record);
    }

    account_infos = [
        account_infos,
        vec![
            mint,
            token_account,
            authority,
            payer,
            system_program,
            sysvar_instructions,
            token_program,
        ],
    ]
    .concat();

    let revoke_ix = revoke_builder.build(args).unwrap().instruction();

    if let Some(signer_seeds) = signer_seeds {
        return solana_program::program::invoke_signed(
            &revoke_ix,
            &account_infos[..],
            signer_seeds,
        )
        .map_err(Into::into);
    } else {
        return solana_program::program::invoke(&revoke_ix, &account_infos[..]).map_err(Into::into);
    }
}
