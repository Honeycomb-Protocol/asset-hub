pub use {
    anchor_lang::{prelude::*, solana_program},
    mpl_token_metadata::{
        self,
        instruction::{
            builders::{
                BurnBuilder, CreateBuilder, DelegateBuilder, LockBuilder, MintBuilder,
                RevokeBuilder, TransferBuilder, UnlockBuilder, UpdateBuilder, VerifyBuilder,
            },
            BurnArgs, CreateArgs, DelegateArgs, InstructionBuilder, LockArgs, MintArgs, RevokeArgs,
            TransferArgs, UnlockArgs, UpdateArgs, VerificationArgs,
        },
        state::{AssetData, PrintSupply},
    },
};

pub fn lock<'info>(
    authority: AccountInfo<'info>,
    token_mint: AccountInfo<'info>,
    token_account: AccountInfo<'info>,
    token_account_owner: Option<AccountInfo<'info>>,
    token_metadata: AccountInfo<'info>,
    token_edition: Option<AccountInfo<'info>>,
    token_record: Option<AccountInfo<'info>>,
    payer: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    sysvar_instructions: AccountInfo<'info>,
    token_program: AccountInfo<'info>,
    authorization_rules_program: Option<AccountInfo<'info>>,
    authorization_rules: Option<AccountInfo<'info>>,
    signer_seeds: Option<&[&[&[u8]]; 1]>,
) -> Result<()> {
    let mut binding = LockBuilder::new();
    let lock_builder = binding
        .authority(authority.key())
        .token(token_account.key())
        .mint(token_mint.key())
        .metadata(token_metadata.key())
        .payer(payer.key())
        .system_program(system_program.key())
        .sysvar_instructions(sysvar_instructions.key())
        .spl_token_program(token_program.key());

    let mut account_infos = vec![authority];

    if let Some(token_account_owner) = token_account_owner {
        lock_builder.token_owner(token_account_owner.key());
        account_infos.push(token_account_owner);
    }

    account_infos = [
        account_infos,
        vec![token_account, token_mint, token_metadata],
    ]
    .concat();

    if let Some(token_edition) = token_edition {
        lock_builder.edition(token_edition.key());
        account_infos.push(token_edition);
    }

    if let Some(token_record) = token_record {
        lock_builder.token_record(token_record.key());
        account_infos.push(token_record);
    }

    account_infos = [
        account_infos,
        vec![payer, system_program, sysvar_instructions, token_program],
    ]
    .concat();

    if let Some(authorization_rules_program) = authorization_rules_program {
        lock_builder.authorization_rules_program(authorization_rules_program.key());
        account_infos.push(authorization_rules_program);
    }

    if let Some(authorization_rules) = authorization_rules {
        lock_builder.authorization_rules(authorization_rules.key());
        account_infos.push(authorization_rules);
    }

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
    token_account_owner: Option<AccountInfo<'info>>,
    token_metadata: AccountInfo<'info>,
    token_edition: Option<AccountInfo<'info>>,
    token_record: Option<AccountInfo<'info>>,
    payer: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    sysvar_instructions: AccountInfo<'info>,
    token_program: AccountInfo<'info>,
    authorization_rules_program: Option<AccountInfo<'info>>,
    authorization_rules: Option<AccountInfo<'info>>,
    signer_seeds: Option<&[&[&[u8]]; 1]>,
) -> Result<()> {
    let mut binding = UnlockBuilder::new();
    let unlock_builder = binding
        .authority(authority.key())
        .token(token_account.key())
        .mint(token_mint.key())
        .metadata(token_metadata.key())
        .payer(payer.key())
        .system_program(system_program.key())
        .sysvar_instructions(sysvar_instructions.key())
        .spl_token_program(token_program.key());

    let mut account_infos = vec![authority];

    if let Some(token_account_owner) = token_account_owner {
        unlock_builder.token_owner(token_account_owner.key());
        account_infos.push(token_account_owner);
    }

    account_infos = [
        account_infos,
        vec![token_account, token_mint, token_metadata],
    ]
    .concat();

    if let Some(token_edition) = token_edition {
        unlock_builder.edition(token_edition.key());
        account_infos.push(token_edition);
    }

    if let Some(token_record) = token_record {
        unlock_builder.token_record(token_record.key());
        account_infos.push(token_record);
    }

    account_infos = [
        account_infos,
        vec![payer, system_program, sysvar_instructions, token_program],
    ]
    .concat();

    if let Some(authorization_rules_program) = authorization_rules_program {
        unlock_builder.authorization_rules_program(authorization_rules_program.key());
        account_infos.push(authorization_rules_program);
    }

    if let Some(authorization_rules) = authorization_rules {
        unlock_builder.authorization_rules(authorization_rules.key());
        account_infos.push(authorization_rules);
    }

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
    master_edition: Option<AccountInfo<'info>>,
    token_record: Option<AccountInfo<'info>>,
    mint: AccountInfo<'info>,
    token_account: AccountInfo<'info>,
    authority: AccountInfo<'info>,
    payer: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    sysvar_instructions: AccountInfo<'info>,
    token_program: AccountInfo<'info>,
    authorization_rules_program: Option<AccountInfo<'info>>,
    authorization_rules: Option<AccountInfo<'info>>,
    signer_seeds: Option<&[&[&[u8]]; 1]>,
) -> Result<()> {
    let mut binding = DelegateBuilder::new();
    let delegate_builder = binding
        .delegate(delegate.key())
        .metadata(metadata.key())
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

    account_infos = [account_infos, vec![delegate, metadata]].concat();

    if let Some(master_edition) = master_edition {
        delegate_builder.master_edition(master_edition.key());
        account_infos.push(master_edition);
    }

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

    if let Some(authorization_rules_program) = authorization_rules_program {
        delegate_builder.authorization_rules_program(authorization_rules_program.key());
        account_infos.push(authorization_rules_program);
    }

    if let Some(authorization_rules) = authorization_rules {
        delegate_builder.authorization_rules(authorization_rules.key());
        account_infos.push(authorization_rules);
    }

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
    master_edition: Option<AccountInfo<'info>>,
    token_record: Option<AccountInfo<'info>>,
    mint: AccountInfo<'info>,
    token_account: AccountInfo<'info>,
    authority: AccountInfo<'info>,
    payer: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    sysvar_instructions: AccountInfo<'info>,
    token_program: AccountInfo<'info>,
    authorization_rules_program: Option<AccountInfo<'info>>,
    authorization_rules: Option<AccountInfo<'info>>,
    signer_seeds: Option<&[&[&[u8]]; 1]>,
) -> Result<()> {
    let mut binding = RevokeBuilder::new();
    let revoke_builder = binding
        .delegate(delegate.key())
        .metadata(metadata.key())
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

    account_infos = [account_infos, vec![delegate, metadata]].concat();

    if let Some(master_edition) = master_edition {
        revoke_builder.master_edition(master_edition.key());
        account_infos.push(master_edition);
    }

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

    if let Some(authorization_rules_program) = authorization_rules_program {
        revoke_builder.authorization_rules_program(authorization_rules_program.key());
        account_infos.push(authorization_rules_program);
    }

    if let Some(authorization_rules) = authorization_rules {
        revoke_builder.authorization_rules(authorization_rules.key());
        account_infos.push(authorization_rules);
    }

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
