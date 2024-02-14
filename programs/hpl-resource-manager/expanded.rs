#![feature(prelude_import)]
#[prelude_import]
use std::prelude::rust_2021::*;
#[macro_use]
extern crate std;
mod errors {
    use anchor_lang::prelude::*;
    #[repr(u32)]
    pub enum ResourceErrorCode {
        ResourceNotInitialized,
        InsufficientAmount,
    }
    #[automatically_derived]
    impl ::core::fmt::Debug for ResourceErrorCode {
        fn fmt(&self, f: &mut ::core::fmt::Formatter) -> ::core::fmt::Result {
            ::core::fmt::Formatter::write_str(
                f,
                match self {
                    ResourceErrorCode::ResourceNotInitialized => "ResourceNotInitialized",
                    ResourceErrorCode::InsufficientAmount => "InsufficientAmount",
                },
            )
        }
    }
    #[automatically_derived]
    impl ::core::clone::Clone for ResourceErrorCode {
        #[inline]
        fn clone(&self) -> ResourceErrorCode {
            *self
        }
    }
    #[automatically_derived]
    impl ::core::marker::Copy for ResourceErrorCode {}
    impl ResourceErrorCode {
        /// Gets the name of this [#enum_name].
        pub fn name(&self) -> String {
            match self {
                ResourceErrorCode::ResourceNotInitialized => {
                    "ResourceNotInitialized".to_string()
                }
                ResourceErrorCode::InsufficientAmount => "InsufficientAmount".to_string(),
            }
        }
    }
    impl From<ResourceErrorCode> for u32 {
        fn from(e: ResourceErrorCode) -> u32 {
            e as u32 + anchor_lang::error::ERROR_CODE_OFFSET
        }
    }
    impl From<ResourceErrorCode> for anchor_lang::error::Error {
        fn from(error_code: ResourceErrorCode) -> anchor_lang::error::Error {
            anchor_lang::error::Error::from(anchor_lang::error::AnchorError {
                error_name: error_code.name(),
                error_code_number: error_code.into(),
                error_msg: error_code.to_string(),
                error_origin: None,
                compared_values: None,
            })
        }
    }
    impl std::fmt::Display for ResourceErrorCode {
        fn fmt(
            &self,
            fmt: &mut std::fmt::Formatter<'_>,
        ) -> std::result::Result<(), std::fmt::Error> {
            match self {
                ResourceErrorCode::ResourceNotInitialized => {
                    fmt.write_fmt(format_args!("The resource is not initialized"))
                }
                ResourceErrorCode::InsufficientAmount => {
                    fmt.write_fmt(
                        format_args!(
                            "The amount provided is greater than the amount that is held in the account",
                        ),
                    )
                }
            }
        }
    }
}
mod instructions {
    pub mod holding {
        use {
            crate::{errors::ResourceErrorCode, Holding, HoldingAccountArgs, Resource},
            anchor_lang::prelude::*, anchor_spl::token::Token,
            hpl_compression::{verify_leaf, CompressedData, CompressedDataEvent, ToNode},
            hpl_hive_control::state::Project,
            spl_account_compression::{program::SplAccountCompression, Noop},
            spl_token_2022::ID as Token2022,
        };
        pub struct MintResource<'info> {
            #[account()]
            pub project: Box<Account<'info, Project>>,
            #[account(has_one = project, has_one = mint)]
            pub resource: Box<Account<'info, Resource>>,
            /// CHECK: this is not dangerous. we are not reading & writing from it
            #[account(mut, constraint = resource.mint = = mint.key())]
            pub mint: AccountInfo<'info>,
            /// CHECK: this is not dangerous. we are not reading & writing from it
            #[account(mut)]
            pub merkle_tree: AccountInfo<'info>,
            #[account(mut)]
            pub owner: Signer<'info>,
            #[account(mut)]
            pub payer: Signer<'info>,
            pub system_program: Program<'info, System>,
            /// CHECK: this is not dangerous. we are not reading & writing from it
            #[account(address = Token2022)]
            pub token22_program: AccountInfo<'info>,
            /// SPL TOKEN PROGRAM
            pub token_program: Program<'info, Token>,
            /// SPL Compression program.
            pub compression_program: Program<'info, SplAccountCompression>,
            /// SPL Noop program.
            pub log_wrapper: Program<'info, Noop>,
            pub clock: Sysvar<'info, Clock>,
        }
        #[automatically_derived]
        impl<'info> anchor_lang::Accounts<'info> for MintResource<'info>
        where
            'info: 'info,
        {
            #[inline(never)]
            fn try_accounts(
                __program_id: &anchor_lang::solana_program::pubkey::Pubkey,
                __accounts: &mut &[anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >],
                __ix_data: &[u8],
                __bumps: &mut std::collections::BTreeMap<String, u8>,
                __reallocs: &mut std::collections::BTreeSet<
                    anchor_lang::solana_program::pubkey::Pubkey,
                >,
            ) -> anchor_lang::Result<Self> {
                let project: Box<anchor_lang::accounts::account::Account<Project>> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("project"))?;
                let resource: Box<anchor_lang::accounts::account::Account<Resource>> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("resource"))?;
                let mint: AccountInfo = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("mint"))?;
                let merkle_tree: AccountInfo = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("merkle_tree"))?;
                let owner: Signer = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("owner"))?;
                let payer: Signer = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("payer"))?;
                let system_program: anchor_lang::accounts::program::Program<System> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("system_program"))?;
                let token22_program: AccountInfo = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("token22_program"))?;
                let token_program: anchor_lang::accounts::program::Program<Token> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("token_program"))?;
                let compression_program: anchor_lang::accounts::program::Program<
                    SplAccountCompression,
                > = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("compression_program"))?;
                let log_wrapper: anchor_lang::accounts::program::Program<Noop> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("log_wrapper"))?;
                let clock: Sysvar<Clock> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("clock"))?;
                {
                    let my_key = resource.project;
                    let target_key = project.key();
                    if my_key != target_key {
                        return Err(
                            anchor_lang::error::Error::from(
                                    anchor_lang::error::ErrorCode::ConstraintHasOne,
                                )
                                .with_account_name("resource")
                                .with_pubkeys((my_key, target_key)),
                        );
                    }
                }
                {
                    let my_key = resource.mint;
                    let target_key = mint.key();
                    if my_key != target_key {
                        return Err(
                            anchor_lang::error::Error::from(
                                    anchor_lang::error::ErrorCode::ConstraintHasOne,
                                )
                                .with_account_name("resource")
                                .with_pubkeys((my_key, target_key)),
                        );
                    }
                }
                if !mint.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("mint"),
                    );
                }
                if !(resource.mint == mint.key()) {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintRaw,
                            )
                            .with_account_name("mint"),
                    );
                }
                if !merkle_tree.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("merkle_tree"),
                    );
                }
                if !owner.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("owner"),
                    );
                }
                if !payer.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("payer"),
                    );
                }
                {
                    let actual = token22_program.key();
                    let expected = Token2022;
                    if actual != expected {
                        return Err(
                            anchor_lang::error::Error::from(
                                    anchor_lang::error::ErrorCode::ConstraintAddress,
                                )
                                .with_account_name("token22_program")
                                .with_pubkeys((actual, expected)),
                        );
                    }
                }
                Ok(MintResource {
                    project,
                    resource,
                    mint,
                    merkle_tree,
                    owner,
                    payer,
                    system_program,
                    token22_program,
                    token_program,
                    compression_program,
                    log_wrapper,
                    clock,
                })
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::ToAccountInfos<'info> for MintResource<'info>
        where
            'info: 'info,
        {
            fn to_account_infos(
                &self,
            ) -> Vec<anchor_lang::solana_program::account_info::AccountInfo<'info>> {
                let mut account_infos = ::alloc::vec::Vec::new();
                account_infos.extend(self.project.to_account_infos());
                account_infos.extend(self.resource.to_account_infos());
                account_infos.extend(self.mint.to_account_infos());
                account_infos.extend(self.merkle_tree.to_account_infos());
                account_infos.extend(self.owner.to_account_infos());
                account_infos.extend(self.payer.to_account_infos());
                account_infos.extend(self.system_program.to_account_infos());
                account_infos.extend(self.token22_program.to_account_infos());
                account_infos.extend(self.token_program.to_account_infos());
                account_infos.extend(self.compression_program.to_account_infos());
                account_infos.extend(self.log_wrapper.to_account_infos());
                account_infos.extend(self.clock.to_account_infos());
                account_infos
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::ToAccountMetas for MintResource<'info> {
            fn to_account_metas(
                &self,
                is_signer: Option<bool>,
            ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                let mut account_metas = ::alloc::vec::Vec::new();
                account_metas.extend(self.project.to_account_metas(None));
                account_metas.extend(self.resource.to_account_metas(None));
                account_metas.extend(self.mint.to_account_metas(None));
                account_metas.extend(self.merkle_tree.to_account_metas(None));
                account_metas.extend(self.owner.to_account_metas(None));
                account_metas.extend(self.payer.to_account_metas(None));
                account_metas.extend(self.system_program.to_account_metas(None));
                account_metas.extend(self.token22_program.to_account_metas(None));
                account_metas.extend(self.token_program.to_account_metas(None));
                account_metas.extend(self.compression_program.to_account_metas(None));
                account_metas.extend(self.log_wrapper.to_account_metas(None));
                account_metas.extend(self.clock.to_account_metas(None));
                account_metas
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::AccountsExit<'info> for MintResource<'info>
        where
            'info: 'info,
        {
            fn exit(
                &self,
                program_id: &anchor_lang::solana_program::pubkey::Pubkey,
            ) -> anchor_lang::Result<()> {
                anchor_lang::AccountsExit::exit(&self.mint, program_id)
                    .map_err(|e| e.with_account_name("mint"))?;
                anchor_lang::AccountsExit::exit(&self.merkle_tree, program_id)
                    .map_err(|e| e.with_account_name("merkle_tree"))?;
                anchor_lang::AccountsExit::exit(&self.owner, program_id)
                    .map_err(|e| e.with_account_name("owner"))?;
                anchor_lang::AccountsExit::exit(&self.payer, program_id)
                    .map_err(|e| e.with_account_name("payer"))?;
                Ok(())
            }
        }
        /// An internal, Anchor generated module. This is used (as an
        /// implementation detail), to generate a struct for a given
        /// `#[derive(Accounts)]` implementation, where each field is a Pubkey,
        /// instead of an `AccountInfo`. This is useful for clients that want
        /// to generate a list of accounts, without explicitly knowing the
        /// order all the fields should be in.
        ///
        /// To access the struct in this module, one should use the sibling
        /// `accounts` module (also generated), which re-exports this.
        pub(crate) mod __client_accounts_mint_resource {
            use super::*;
            use anchor_lang::prelude::borsh;
            /// Generated client accounts for [`MintResource`].
            pub struct MintResource {
                pub project: anchor_lang::solana_program::pubkey::Pubkey,
                pub resource: anchor_lang::solana_program::pubkey::Pubkey,
                pub mint: anchor_lang::solana_program::pubkey::Pubkey,
                pub merkle_tree: anchor_lang::solana_program::pubkey::Pubkey,
                pub owner: anchor_lang::solana_program::pubkey::Pubkey,
                pub payer: anchor_lang::solana_program::pubkey::Pubkey,
                pub system_program: anchor_lang::solana_program::pubkey::Pubkey,
                pub token22_program: anchor_lang::solana_program::pubkey::Pubkey,
                ///SPL TOKEN PROGRAM
                pub token_program: anchor_lang::solana_program::pubkey::Pubkey,
                ///SPL Compression program.
                pub compression_program: anchor_lang::solana_program::pubkey::Pubkey,
                ///SPL Noop program.
                pub log_wrapper: anchor_lang::solana_program::pubkey::Pubkey,
                pub clock: anchor_lang::solana_program::pubkey::Pubkey,
            }
            impl borsh::ser::BorshSerialize for MintResource
            where
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
            {
                fn serialize<W: borsh::maybestd::io::Write>(
                    &self,
                    writer: &mut W,
                ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
                    borsh::BorshSerialize::serialize(&self.project, writer)?;
                    borsh::BorshSerialize::serialize(&self.resource, writer)?;
                    borsh::BorshSerialize::serialize(&self.mint, writer)?;
                    borsh::BorshSerialize::serialize(&self.merkle_tree, writer)?;
                    borsh::BorshSerialize::serialize(&self.owner, writer)?;
                    borsh::BorshSerialize::serialize(&self.payer, writer)?;
                    borsh::BorshSerialize::serialize(&self.system_program, writer)?;
                    borsh::BorshSerialize::serialize(&self.token22_program, writer)?;
                    borsh::BorshSerialize::serialize(&self.token_program, writer)?;
                    borsh::BorshSerialize::serialize(&self.compression_program, writer)?;
                    borsh::BorshSerialize::serialize(&self.log_wrapper, writer)?;
                    borsh::BorshSerialize::serialize(&self.clock, writer)?;
                    Ok(())
                }
            }
            #[automatically_derived]
            impl anchor_lang::ToAccountMetas for MintResource {
                fn to_account_metas(
                    &self,
                    is_signer: Option<bool>,
                ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                    let mut account_metas = ::alloc::vec::Vec::new();
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.project,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.resource,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.mint,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.merkle_tree,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.owner,
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.payer,
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.system_program,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.token22_program,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.token_program,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.compression_program,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.log_wrapper,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.clock,
                                false,
                            ),
                        );
                    account_metas
                }
            }
        }
        /// An internal, Anchor generated module. This is used (as an
        /// implementation detail), to generate a CPI struct for a given
        /// `#[derive(Accounts)]` implementation, where each field is an
        /// AccountInfo.
        ///
        /// To access the struct in this module, one should use the sibling
        /// [`cpi::accounts`] module (also generated), which re-exports this.
        pub(crate) mod __cpi_client_accounts_mint_resource {
            use super::*;
            /// Generated CPI struct of the accounts for [`MintResource`].
            pub struct MintResource<'info> {
                pub project: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub resource: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub mint: anchor_lang::solana_program::account_info::AccountInfo<'info>,
                pub merkle_tree: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub owner: anchor_lang::solana_program::account_info::AccountInfo<'info>,
                pub payer: anchor_lang::solana_program::account_info::AccountInfo<'info>,
                pub system_program: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub token22_program: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                ///SPL TOKEN PROGRAM
                pub token_program: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                ///SPL Compression program.
                pub compression_program: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                ///SPL Noop program.
                pub log_wrapper: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub clock: anchor_lang::solana_program::account_info::AccountInfo<'info>,
            }
            #[automatically_derived]
            impl<'info> anchor_lang::ToAccountMetas for MintResource<'info> {
                fn to_account_metas(
                    &self,
                    is_signer: Option<bool>,
                ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                    let mut account_metas = ::alloc::vec::Vec::new();
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.project),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.resource),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.mint),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.merkle_tree),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.owner),
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.payer),
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.system_program),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.token22_program),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.token_program),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.compression_program),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.log_wrapper),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.clock),
                                false,
                            ),
                        );
                    account_metas
                }
            }
            #[automatically_derived]
            impl<'info> anchor_lang::ToAccountInfos<'info> for MintResource<'info> {
                fn to_account_infos(
                    &self,
                ) -> Vec<anchor_lang::solana_program::account_info::AccountInfo<'info>> {
                    let mut account_infos = ::alloc::vec::Vec::new();
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.project),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.resource),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.mint),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.merkle_tree,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.owner),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.payer),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.system_program,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.token22_program,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.token_program,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.compression_program,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.log_wrapper,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.clock),
                        );
                    account_infos
                }
            }
        }
        pub struct MintResourceArgs {
            pub holding_state: Option<HoldingAccountArgs>,
            pub amount: u64,
        }
        impl borsh::ser::BorshSerialize for MintResourceArgs
        where
            Option<HoldingAccountArgs>: borsh::ser::BorshSerialize,
            u64: borsh::ser::BorshSerialize,
        {
            fn serialize<W: borsh::maybestd::io::Write>(
                &self,
                writer: &mut W,
            ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
                borsh::BorshSerialize::serialize(&self.holding_state, writer)?;
                borsh::BorshSerialize::serialize(&self.amount, writer)?;
                Ok(())
            }
        }
        impl borsh::de::BorshDeserialize for MintResourceArgs
        where
            Option<HoldingAccountArgs>: borsh::BorshDeserialize,
            u64: borsh::BorshDeserialize,
        {
            fn deserialize_reader<R: borsh::maybestd::io::Read>(
                reader: &mut R,
            ) -> ::core::result::Result<Self, borsh::maybestd::io::Error> {
                Ok(Self {
                    holding_state: borsh::BorshDeserialize::deserialize_reader(reader)?,
                    amount: borsh::BorshDeserialize::deserialize_reader(reader)?,
                })
            }
        }
        pub fn mint_resource<'info>(
            ctx: Context<'_, '_, '_, 'info, MintResource<'info>>,
            args: MintResourceArgs,
        ) -> Result<()> {
            let resource = &mut ctx.accounts.resource;
            let (leaf_idx, seq) = resource
                .merkle_trees
                .assert_append(ctx.accounts.merkle_tree.to_account_info())?;
            if let Some(holding_state) = args.holding_state {
                verify_leaf(
                    holding_state.root,
                    holding_state.holding.to_compressed().to_node(),
                    holding_state.leaf_idx,
                    &ctx.accounts.merkle_tree.to_account_info(),
                    &ctx.accounts.compression_program,
                    ctx.remaining_accounts.to_vec(),
                )?;
                let bump_binding = [resource.bump];
                let signer_seeds = resource.seeds(&bump_binding);
                let new_holding_state = Holding {
                    holder: holding_state.holding.holder,
                    balance: holding_state.holding.balance + args.amount,
                };
                let event = CompressedDataEvent::Leaf {
                    slot: ctx.accounts.clock.slot,
                    tree_id: ctx.accounts.merkle_tree.key().to_bytes(),
                    leaf_idx: holding_state.leaf_idx,
                    seq,
                    stream_type: new_holding_state.event_stream(),
                };
                event.wrap(&ctx.accounts.log_wrapper)?;
                hpl_compression::replace_leaf(
                    holding_state.root,
                    holding_state.holding.to_compressed().to_node(),
                    new_holding_state.to_compressed().to_node(),
                    holding_state.leaf_idx,
                    &resource.to_account_info(),
                    &ctx.accounts.merkle_tree,
                    &ctx.accounts.compression_program,
                    &ctx.accounts.log_wrapper,
                    ctx.remaining_accounts.to_vec(),
                    Some(&[&signer_seeds[..]]),
                )?;
            } else {
                ::solana_program::log::sol_log("Minting without default holding state");
                let holding_account = Holding {
                    holder: ctx.accounts.owner.key(),
                    balance: args.amount,
                };
                ::solana_program::log::sol_log("Event Stream ");
                let event = CompressedDataEvent::Leaf {
                    slot: ctx.accounts.clock.slot,
                    tree_id: ctx.accounts.merkle_tree.key().to_bytes(),
                    leaf_idx,
                    seq,
                    stream_type: holding_account.event_stream(),
                };
                event.wrap(&ctx.accounts.log_wrapper)?;
                ::solana_program::log::sol_log("Compressing the holding account");
                let compressed_holding = holding_account.to_compressed();
                let bump_binding = [resource.bump];
                let signer_seeds = resource.seeds(&bump_binding);
                hpl_compression::append_leaf(
                    compressed_holding.to_node(),
                    &resource.to_account_info(),
                    &ctx.accounts.merkle_tree,
                    &ctx.accounts.compression_program,
                    &ctx.accounts.log_wrapper,
                    Some(&[&signer_seeds[..]]),
                )?;
            }
            ::solana_program::log::sol_log("Minting the token");
            Ok(())
        }
        pub struct BurnResource<'info> {
            #[account()]
            pub project: Box<Account<'info, Project>>,
            #[account(has_one = project, has_one = mint)]
            pub resource: Box<Account<'info, Resource>>,
            /// CHECK: this is not dangerous. we are not reading & writing from it
            #[account(mut)]
            pub mint: AccountInfo<'info>,
            /// CHECK: this is not dangerous. we are not reading & writing from it
            #[account(mut)]
            pub merkle_tree: AccountInfo<'info>,
            #[account(mut)]
            pub owner: Signer<'info>,
            #[account(mut)]
            pub payer: Signer<'info>,
            pub rent_sysvar: Sysvar<'info, Rent>,
            pub system_program: Program<'info, System>,
            /// CHECK: this is not dangerous. we are not reading & writing from it
            #[account(address = Token2022)]
            pub token22_program: AccountInfo<'info>,
            /// SPL TOKEN PROGRAM
            pub token_program: Program<'info, Token>,
            /// SPL Compression program.
            pub compression_program: Program<'info, SplAccountCompression>,
            /// SPL Noop program.
            pub log_wrapper: Program<'info, Noop>,
            pub clock: Sysvar<'info, Clock>,
        }
        #[automatically_derived]
        impl<'info> anchor_lang::Accounts<'info> for BurnResource<'info>
        where
            'info: 'info,
        {
            #[inline(never)]
            fn try_accounts(
                __program_id: &anchor_lang::solana_program::pubkey::Pubkey,
                __accounts: &mut &[anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >],
                __ix_data: &[u8],
                __bumps: &mut std::collections::BTreeMap<String, u8>,
                __reallocs: &mut std::collections::BTreeSet<
                    anchor_lang::solana_program::pubkey::Pubkey,
                >,
            ) -> anchor_lang::Result<Self> {
                let project: Box<anchor_lang::accounts::account::Account<Project>> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("project"))?;
                let resource: Box<anchor_lang::accounts::account::Account<Resource>> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("resource"))?;
                let mint: AccountInfo = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("mint"))?;
                let merkle_tree: AccountInfo = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("merkle_tree"))?;
                let owner: Signer = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("owner"))?;
                let payer: Signer = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("payer"))?;
                let rent_sysvar: Sysvar<Rent> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("rent_sysvar"))?;
                let system_program: anchor_lang::accounts::program::Program<System> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("system_program"))?;
                let token22_program: AccountInfo = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("token22_program"))?;
                let token_program: anchor_lang::accounts::program::Program<Token> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("token_program"))?;
                let compression_program: anchor_lang::accounts::program::Program<
                    SplAccountCompression,
                > = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("compression_program"))?;
                let log_wrapper: anchor_lang::accounts::program::Program<Noop> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("log_wrapper"))?;
                let clock: Sysvar<Clock> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("clock"))?;
                {
                    let my_key = resource.project;
                    let target_key = project.key();
                    if my_key != target_key {
                        return Err(
                            anchor_lang::error::Error::from(
                                    anchor_lang::error::ErrorCode::ConstraintHasOne,
                                )
                                .with_account_name("resource")
                                .with_pubkeys((my_key, target_key)),
                        );
                    }
                }
                {
                    let my_key = resource.mint;
                    let target_key = mint.key();
                    if my_key != target_key {
                        return Err(
                            anchor_lang::error::Error::from(
                                    anchor_lang::error::ErrorCode::ConstraintHasOne,
                                )
                                .with_account_name("resource")
                                .with_pubkeys((my_key, target_key)),
                        );
                    }
                }
                if !mint.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("mint"),
                    );
                }
                if !merkle_tree.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("merkle_tree"),
                    );
                }
                if !owner.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("owner"),
                    );
                }
                if !payer.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("payer"),
                    );
                }
                {
                    let actual = token22_program.key();
                    let expected = Token2022;
                    if actual != expected {
                        return Err(
                            anchor_lang::error::Error::from(
                                    anchor_lang::error::ErrorCode::ConstraintAddress,
                                )
                                .with_account_name("token22_program")
                                .with_pubkeys((actual, expected)),
                        );
                    }
                }
                Ok(BurnResource {
                    project,
                    resource,
                    mint,
                    merkle_tree,
                    owner,
                    payer,
                    rent_sysvar,
                    system_program,
                    token22_program,
                    token_program,
                    compression_program,
                    log_wrapper,
                    clock,
                })
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::ToAccountInfos<'info> for BurnResource<'info>
        where
            'info: 'info,
        {
            fn to_account_infos(
                &self,
            ) -> Vec<anchor_lang::solana_program::account_info::AccountInfo<'info>> {
                let mut account_infos = ::alloc::vec::Vec::new();
                account_infos.extend(self.project.to_account_infos());
                account_infos.extend(self.resource.to_account_infos());
                account_infos.extend(self.mint.to_account_infos());
                account_infos.extend(self.merkle_tree.to_account_infos());
                account_infos.extend(self.owner.to_account_infos());
                account_infos.extend(self.payer.to_account_infos());
                account_infos.extend(self.rent_sysvar.to_account_infos());
                account_infos.extend(self.system_program.to_account_infos());
                account_infos.extend(self.token22_program.to_account_infos());
                account_infos.extend(self.token_program.to_account_infos());
                account_infos.extend(self.compression_program.to_account_infos());
                account_infos.extend(self.log_wrapper.to_account_infos());
                account_infos.extend(self.clock.to_account_infos());
                account_infos
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::ToAccountMetas for BurnResource<'info> {
            fn to_account_metas(
                &self,
                is_signer: Option<bool>,
            ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                let mut account_metas = ::alloc::vec::Vec::new();
                account_metas.extend(self.project.to_account_metas(None));
                account_metas.extend(self.resource.to_account_metas(None));
                account_metas.extend(self.mint.to_account_metas(None));
                account_metas.extend(self.merkle_tree.to_account_metas(None));
                account_metas.extend(self.owner.to_account_metas(None));
                account_metas.extend(self.payer.to_account_metas(None));
                account_metas.extend(self.rent_sysvar.to_account_metas(None));
                account_metas.extend(self.system_program.to_account_metas(None));
                account_metas.extend(self.token22_program.to_account_metas(None));
                account_metas.extend(self.token_program.to_account_metas(None));
                account_metas.extend(self.compression_program.to_account_metas(None));
                account_metas.extend(self.log_wrapper.to_account_metas(None));
                account_metas.extend(self.clock.to_account_metas(None));
                account_metas
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::AccountsExit<'info> for BurnResource<'info>
        where
            'info: 'info,
        {
            fn exit(
                &self,
                program_id: &anchor_lang::solana_program::pubkey::Pubkey,
            ) -> anchor_lang::Result<()> {
                anchor_lang::AccountsExit::exit(&self.mint, program_id)
                    .map_err(|e| e.with_account_name("mint"))?;
                anchor_lang::AccountsExit::exit(&self.merkle_tree, program_id)
                    .map_err(|e| e.with_account_name("merkle_tree"))?;
                anchor_lang::AccountsExit::exit(&self.owner, program_id)
                    .map_err(|e| e.with_account_name("owner"))?;
                anchor_lang::AccountsExit::exit(&self.payer, program_id)
                    .map_err(|e| e.with_account_name("payer"))?;
                Ok(())
            }
        }
        /// An internal, Anchor generated module. This is used (as an
        /// implementation detail), to generate a struct for a given
        /// `#[derive(Accounts)]` implementation, where each field is a Pubkey,
        /// instead of an `AccountInfo`. This is useful for clients that want
        /// to generate a list of accounts, without explicitly knowing the
        /// order all the fields should be in.
        ///
        /// To access the struct in this module, one should use the sibling
        /// `accounts` module (also generated), which re-exports this.
        pub(crate) mod __client_accounts_burn_resource {
            use super::*;
            use anchor_lang::prelude::borsh;
            /// Generated client accounts for [`BurnResource`].
            pub struct BurnResource {
                pub project: anchor_lang::solana_program::pubkey::Pubkey,
                pub resource: anchor_lang::solana_program::pubkey::Pubkey,
                pub mint: anchor_lang::solana_program::pubkey::Pubkey,
                pub merkle_tree: anchor_lang::solana_program::pubkey::Pubkey,
                pub owner: anchor_lang::solana_program::pubkey::Pubkey,
                pub payer: anchor_lang::solana_program::pubkey::Pubkey,
                pub rent_sysvar: anchor_lang::solana_program::pubkey::Pubkey,
                pub system_program: anchor_lang::solana_program::pubkey::Pubkey,
                pub token22_program: anchor_lang::solana_program::pubkey::Pubkey,
                ///SPL TOKEN PROGRAM
                pub token_program: anchor_lang::solana_program::pubkey::Pubkey,
                ///SPL Compression program.
                pub compression_program: anchor_lang::solana_program::pubkey::Pubkey,
                ///SPL Noop program.
                pub log_wrapper: anchor_lang::solana_program::pubkey::Pubkey,
                pub clock: anchor_lang::solana_program::pubkey::Pubkey,
            }
            impl borsh::ser::BorshSerialize for BurnResource
            where
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
            {
                fn serialize<W: borsh::maybestd::io::Write>(
                    &self,
                    writer: &mut W,
                ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
                    borsh::BorshSerialize::serialize(&self.project, writer)?;
                    borsh::BorshSerialize::serialize(&self.resource, writer)?;
                    borsh::BorshSerialize::serialize(&self.mint, writer)?;
                    borsh::BorshSerialize::serialize(&self.merkle_tree, writer)?;
                    borsh::BorshSerialize::serialize(&self.owner, writer)?;
                    borsh::BorshSerialize::serialize(&self.payer, writer)?;
                    borsh::BorshSerialize::serialize(&self.rent_sysvar, writer)?;
                    borsh::BorshSerialize::serialize(&self.system_program, writer)?;
                    borsh::BorshSerialize::serialize(&self.token22_program, writer)?;
                    borsh::BorshSerialize::serialize(&self.token_program, writer)?;
                    borsh::BorshSerialize::serialize(&self.compression_program, writer)?;
                    borsh::BorshSerialize::serialize(&self.log_wrapper, writer)?;
                    borsh::BorshSerialize::serialize(&self.clock, writer)?;
                    Ok(())
                }
            }
            #[automatically_derived]
            impl anchor_lang::ToAccountMetas for BurnResource {
                fn to_account_metas(
                    &self,
                    is_signer: Option<bool>,
                ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                    let mut account_metas = ::alloc::vec::Vec::new();
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.project,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.resource,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.mint,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.merkle_tree,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.owner,
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.payer,
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.rent_sysvar,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.system_program,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.token22_program,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.token_program,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.compression_program,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.log_wrapper,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.clock,
                                false,
                            ),
                        );
                    account_metas
                }
            }
        }
        /// An internal, Anchor generated module. This is used (as an
        /// implementation detail), to generate a CPI struct for a given
        /// `#[derive(Accounts)]` implementation, where each field is an
        /// AccountInfo.
        ///
        /// To access the struct in this module, one should use the sibling
        /// [`cpi::accounts`] module (also generated), which re-exports this.
        pub(crate) mod __cpi_client_accounts_burn_resource {
            use super::*;
            /// Generated CPI struct of the accounts for [`BurnResource`].
            pub struct BurnResource<'info> {
                pub project: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub resource: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub mint: anchor_lang::solana_program::account_info::AccountInfo<'info>,
                pub merkle_tree: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub owner: anchor_lang::solana_program::account_info::AccountInfo<'info>,
                pub payer: anchor_lang::solana_program::account_info::AccountInfo<'info>,
                pub rent_sysvar: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub system_program: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub token22_program: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                ///SPL TOKEN PROGRAM
                pub token_program: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                ///SPL Compression program.
                pub compression_program: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                ///SPL Noop program.
                pub log_wrapper: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub clock: anchor_lang::solana_program::account_info::AccountInfo<'info>,
            }
            #[automatically_derived]
            impl<'info> anchor_lang::ToAccountMetas for BurnResource<'info> {
                fn to_account_metas(
                    &self,
                    is_signer: Option<bool>,
                ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                    let mut account_metas = ::alloc::vec::Vec::new();
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.project),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.resource),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.mint),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.merkle_tree),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.owner),
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.payer),
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.rent_sysvar),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.system_program),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.token22_program),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.token_program),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.compression_program),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.log_wrapper),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.clock),
                                false,
                            ),
                        );
                    account_metas
                }
            }
            #[automatically_derived]
            impl<'info> anchor_lang::ToAccountInfos<'info> for BurnResource<'info> {
                fn to_account_infos(
                    &self,
                ) -> Vec<anchor_lang::solana_program::account_info::AccountInfo<'info>> {
                    let mut account_infos = ::alloc::vec::Vec::new();
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.project),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.resource),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.mint),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.merkle_tree,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.owner),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.payer),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.rent_sysvar,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.system_program,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.token22_program,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.token_program,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.compression_program,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.log_wrapper,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.clock),
                        );
                    account_infos
                }
            }
        }
        pub struct BurnResourceArgs {
            pub holding_state: HoldingAccountArgs,
            pub amount: u64,
        }
        impl borsh::ser::BorshSerialize for BurnResourceArgs
        where
            HoldingAccountArgs: borsh::ser::BorshSerialize,
            u64: borsh::ser::BorshSerialize,
        {
            fn serialize<W: borsh::maybestd::io::Write>(
                &self,
                writer: &mut W,
            ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
                borsh::BorshSerialize::serialize(&self.holding_state, writer)?;
                borsh::BorshSerialize::serialize(&self.amount, writer)?;
                Ok(())
            }
        }
        impl borsh::de::BorshDeserialize for BurnResourceArgs
        where
            HoldingAccountArgs: borsh::BorshDeserialize,
            u64: borsh::BorshDeserialize,
        {
            fn deserialize_reader<R: borsh::maybestd::io::Read>(
                reader: &mut R,
            ) -> ::core::result::Result<Self, borsh::maybestd::io::Error> {
                Ok(Self {
                    holding_state: borsh::BorshDeserialize::deserialize_reader(reader)?,
                    amount: borsh::BorshDeserialize::deserialize_reader(reader)?,
                })
            }
        }
        pub fn burn_resource<'info>(
            ctx: Context<'_, '_, '_, 'info, BurnResource<'info>>,
            args: BurnResourceArgs,
        ) -> Result<()> {
            let resource = &mut ctx.accounts.resource;
            ::solana_program::log::sol_log("verifying leaf");
            verify_leaf(
                args.holding_state.root,
                args.holding_state.holding.to_compressed().to_node(),
                args.holding_state.leaf_idx,
                &ctx.accounts.merkle_tree.to_account_info(),
                &ctx.accounts.compression_program,
                ctx.remaining_accounts.to_vec(),
            )?;
            ::solana_program::log::sol_log("checking for InsufficientAmount");
            if args.amount > args.holding_state.holding.balance {
                return Err(ResourceErrorCode::InsufficientAmount.into());
            }
            let (_leaf_idx, seq) = resource
                .merkle_trees
                .assert_append(ctx.accounts.merkle_tree.to_account_info())?;
            let new_holding_state = Holding {
                holder: args.holding_state.holding.holder,
                balance: args.holding_state.holding.balance - args.amount,
            };
            let event = CompressedDataEvent::Leaf {
                slot: ctx.accounts.clock.slot,
                tree_id: ctx.accounts.merkle_tree.key().to_bytes(),
                leaf_idx: args.holding_state.leaf_idx,
                seq: seq,
                stream_type: new_holding_state.event_stream(),
            };
            event.wrap(&ctx.accounts.log_wrapper)?;
            let new_leaf;
            if args.holding_state.holding.balance - args.amount > 0 {
                new_leaf = new_holding_state.to_compressed().to_node();
            } else {
                new_leaf = [0; 32];
            }
            let bump_binding = [resource.bump];
            let signer_seeds = resource.seeds(&bump_binding);
            hpl_compression::replace_leaf(
                args.holding_state.root,
                args.holding_state.holding.to_compressed().to_node(),
                new_leaf,
                args.holding_state.leaf_idx,
                &resource.to_account_info(),
                &ctx.accounts.merkle_tree,
                &ctx.accounts.compression_program,
                &ctx.accounts.log_wrapper,
                ctx.remaining_accounts.to_vec(),
                Some(&[&signer_seeds[..]]),
            )?;
            Ok(())
        }
    }
    pub mod resource {
        use {
            crate::{
                utils::{
                    create_metadata_for_mint, create_mint_with_extensions,
                    ResourceMetadataArgs,
                },
                Resource, ResourseKind,
            },
            anchor_lang::prelude::*,
            anchor_spl::{associated_token::AssociatedToken, token::Token},
            hpl_compression::init_tree, hpl_hive_control::state::Project,
            hpl_utils::reallocate,
            spl_account_compression::{program::SplAccountCompression, Noop},
            spl_token_2022::ID as Token2022,
        };
        #[instruction(args:CreateResourceArgs)]
        pub struct CreateResource<'info> {
            #[account()]
            pub project: Box<Account<'info, Project>>,
            #[account(
                init,
                payer = payer,
                seeds = [b"resource".as_ref(),
                project.key().as_ref(),
                mint.key().as_ref()],
                space = Resource::get_size(&args.kind),
                bump,
            )]
            pub resource: Box<Account<'info, Resource>>,
            #[account(mut)]
            pub owner: Signer<'info>,
            #[account(mut)]
            pub payer: Signer<'info>,
            #[account(mut)]
            pub mint: Signer<'info>,
            pub system_program: Program<'info, System>,
            pub rent_sysvar: Sysvar<'info, Rent>,
            /// CHECK: this is not dangerous. we are not reading & writing from it
            #[account(address = Token2022)]
            pub token22_program: AccountInfo<'info>,
            /// SPL TOKEN PROGRAM
            pub token_program: Program<'info, Token>,
            /// ASSOCIATED TOKEN PROGRAM
            pub associated_token_program: Program<'info, AssociatedToken>,
        }
        #[automatically_derived]
        impl<'info> anchor_lang::Accounts<'info> for CreateResource<'info>
        where
            'info: 'info,
        {
            #[inline(never)]
            fn try_accounts(
                __program_id: &anchor_lang::solana_program::pubkey::Pubkey,
                __accounts: &mut &[anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >],
                __ix_data: &[u8],
                __bumps: &mut std::collections::BTreeMap<String, u8>,
                __reallocs: &mut std::collections::BTreeSet<
                    anchor_lang::solana_program::pubkey::Pubkey,
                >,
            ) -> anchor_lang::Result<Self> {
                let mut __ix_data = __ix_data;
                struct __Args {
                    args: CreateResourceArgs,
                }
                impl borsh::ser::BorshSerialize for __Args
                where
                    CreateResourceArgs: borsh::ser::BorshSerialize,
                {
                    fn serialize<W: borsh::maybestd::io::Write>(
                        &self,
                        writer: &mut W,
                    ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
                        borsh::BorshSerialize::serialize(&self.args, writer)?;
                        Ok(())
                    }
                }
                impl borsh::de::BorshDeserialize for __Args
                where
                    CreateResourceArgs: borsh::BorshDeserialize,
                {
                    fn deserialize_reader<R: borsh::maybestd::io::Read>(
                        reader: &mut R,
                    ) -> ::core::result::Result<Self, borsh::maybestd::io::Error> {
                        Ok(Self {
                            args: borsh::BorshDeserialize::deserialize_reader(reader)?,
                        })
                    }
                }
                let __Args { args } = __Args::deserialize(&mut __ix_data)
                    .map_err(|_| {
                        anchor_lang::error::ErrorCode::InstructionDidNotDeserialize
                    })?;
                let project: Box<anchor_lang::accounts::account::Account<Project>> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("project"))?;
                if __accounts.is_empty() {
                    return Err(
                        anchor_lang::error::ErrorCode::AccountNotEnoughKeys.into(),
                    );
                }
                let resource = &__accounts[0];
                *__accounts = &__accounts[1..];
                let owner: Signer = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("owner"))?;
                let payer: Signer = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("payer"))?;
                let mint: Signer = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("mint"))?;
                let system_program: anchor_lang::accounts::program::Program<System> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("system_program"))?;
                let rent_sysvar: Sysvar<Rent> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("rent_sysvar"))?;
                let token22_program: AccountInfo = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("token22_program"))?;
                let token_program: anchor_lang::accounts::program::Program<Token> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("token_program"))?;
                let associated_token_program: anchor_lang::accounts::program::Program<
                    AssociatedToken,
                > = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("associated_token_program"))?;
                let __anchor_rent = Rent::get()?;
                let (__pda_address, __bump) = Pubkey::find_program_address(
                    &[b"resource".as_ref(), project.key().as_ref(), mint.key().as_ref()],
                    __program_id,
                );
                __bumps.insert("resource".to_string(), __bump);
                if resource.key() != __pda_address {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintSeeds,
                            )
                            .with_account_name("resource")
                            .with_pubkeys((resource.key(), __pda_address)),
                    );
                }
                let resource = {
                    let actual_field = resource.to_account_info();
                    let actual_owner = actual_field.owner;
                    let space = Resource::get_size(&args.kind);
                    let pa: Box<anchor_lang::accounts::account::Account<Resource>> = if !false
                        || actual_owner
                            == &anchor_lang::solana_program::system_program::ID
                    {
                        let __current_lamports = resource.lamports();
                        if __current_lamports == 0 {
                            let space = space;
                            let lamports = __anchor_rent.minimum_balance(space);
                            let cpi_accounts = anchor_lang::system_program::CreateAccount {
                                from: payer.to_account_info(),
                                to: resource.to_account_info(),
                            };
                            let cpi_context = anchor_lang::context::CpiContext::new(
                                system_program.to_account_info(),
                                cpi_accounts,
                            );
                            anchor_lang::system_program::create_account(
                                cpi_context
                                    .with_signer(
                                        &[
                                            &[
                                                b"resource".as_ref(),
                                                project.key().as_ref(),
                                                mint.key().as_ref(),
                                                &[__bump][..],
                                            ][..],
                                        ],
                                    ),
                                lamports,
                                space as u64,
                                __program_id,
                            )?;
                        } else {
                            if payer.key() == resource.key() {
                                return Err(
                                    anchor_lang::error::Error::from(anchor_lang::error::AnchorError {
                                            error_name: anchor_lang::error::ErrorCode::TryingToInitPayerAsProgramAccount
                                                .name(),
                                            error_code_number: anchor_lang::error::ErrorCode::TryingToInitPayerAsProgramAccount
                                                .into(),
                                            error_msg: anchor_lang::error::ErrorCode::TryingToInitPayerAsProgramAccount
                                                .to_string(),
                                            error_origin: Some(
                                                anchor_lang::error::ErrorOrigin::Source(anchor_lang::error::Source {
                                                    filename: "programs/hpl-resource-manager/src/instructions/resource.rs",
                                                    line: 15u32,
                                                }),
                                            ),
                                            compared_values: None,
                                        })
                                        .with_pubkeys((payer.key(), resource.key())),
                                );
                            }
                            let required_lamports = __anchor_rent
                                .minimum_balance(space)
                                .max(1)
                                .saturating_sub(__current_lamports);
                            if required_lamports > 0 {
                                let cpi_accounts = anchor_lang::system_program::Transfer {
                                    from: payer.to_account_info(),
                                    to: resource.to_account_info(),
                                };
                                let cpi_context = anchor_lang::context::CpiContext::new(
                                    system_program.to_account_info(),
                                    cpi_accounts,
                                );
                                anchor_lang::system_program::transfer(
                                    cpi_context,
                                    required_lamports,
                                )?;
                            }
                            let cpi_accounts = anchor_lang::system_program::Allocate {
                                account_to_allocate: resource.to_account_info(),
                            };
                            let cpi_context = anchor_lang::context::CpiContext::new(
                                system_program.to_account_info(),
                                cpi_accounts,
                            );
                            anchor_lang::system_program::allocate(
                                cpi_context
                                    .with_signer(
                                        &[
                                            &[
                                                b"resource".as_ref(),
                                                project.key().as_ref(),
                                                mint.key().as_ref(),
                                                &[__bump][..],
                                            ][..],
                                        ],
                                    ),
                                space as u64,
                            )?;
                            let cpi_accounts = anchor_lang::system_program::Assign {
                                account_to_assign: resource.to_account_info(),
                            };
                            let cpi_context = anchor_lang::context::CpiContext::new(
                                system_program.to_account_info(),
                                cpi_accounts,
                            );
                            anchor_lang::system_program::assign(
                                cpi_context
                                    .with_signer(
                                        &[
                                            &[
                                                b"resource".as_ref(),
                                                project.key().as_ref(),
                                                mint.key().as_ref(),
                                                &[__bump][..],
                                            ][..],
                                        ],
                                    ),
                                __program_id,
                            )?;
                        }
                        Box::new(
                            match anchor_lang::accounts::account::Account::try_from_unchecked(
                                &resource,
                            ) {
                                Ok(val) => val,
                                Err(e) => return Err(e.with_account_name("resource")),
                            },
                        )
                    } else {
                        Box::new(
                            match anchor_lang::accounts::account::Account::try_from(
                                &resource,
                            ) {
                                Ok(val) => val,
                                Err(e) => return Err(e.with_account_name("resource")),
                            },
                        )
                    };
                    if false {
                        if space != actual_field.data_len() {
                            return Err(
                                anchor_lang::error::Error::from(
                                        anchor_lang::error::ErrorCode::ConstraintSpace,
                                    )
                                    .with_account_name("resource")
                                    .with_values((space, actual_field.data_len())),
                            );
                        }
                        if actual_owner != __program_id {
                            return Err(
                                anchor_lang::error::Error::from(
                                        anchor_lang::error::ErrorCode::ConstraintOwner,
                                    )
                                    .with_account_name("resource")
                                    .with_pubkeys((*actual_owner, *__program_id)),
                            );
                        }
                        {
                            let required_lamports = __anchor_rent.minimum_balance(space);
                            if pa.to_account_info().lamports() < required_lamports {
                                return Err(
                                    anchor_lang::error::Error::from(
                                            anchor_lang::error::ErrorCode::ConstraintRentExempt,
                                        )
                                        .with_account_name("resource"),
                                );
                            }
                        }
                    }
                    pa
                };
                if !resource.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("resource"),
                    );
                }
                if !__anchor_rent
                    .is_exempt(
                        resource.to_account_info().lamports(),
                        resource.to_account_info().try_data_len()?,
                    )
                {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintRentExempt,
                            )
                            .with_account_name("resource"),
                    );
                }
                if !owner.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("owner"),
                    );
                }
                if !payer.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("payer"),
                    );
                }
                if !mint.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("mint"),
                    );
                }
                {
                    let actual = token22_program.key();
                    let expected = Token2022;
                    if actual != expected {
                        return Err(
                            anchor_lang::error::Error::from(
                                    anchor_lang::error::ErrorCode::ConstraintAddress,
                                )
                                .with_account_name("token22_program")
                                .with_pubkeys((actual, expected)),
                        );
                    }
                }
                Ok(CreateResource {
                    project,
                    resource,
                    owner,
                    payer,
                    mint,
                    system_program,
                    rent_sysvar,
                    token22_program,
                    token_program,
                    associated_token_program,
                })
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::ToAccountInfos<'info> for CreateResource<'info>
        where
            'info: 'info,
        {
            fn to_account_infos(
                &self,
            ) -> Vec<anchor_lang::solana_program::account_info::AccountInfo<'info>> {
                let mut account_infos = ::alloc::vec::Vec::new();
                account_infos.extend(self.project.to_account_infos());
                account_infos.extend(self.resource.to_account_infos());
                account_infos.extend(self.owner.to_account_infos());
                account_infos.extend(self.payer.to_account_infos());
                account_infos.extend(self.mint.to_account_infos());
                account_infos.extend(self.system_program.to_account_infos());
                account_infos.extend(self.rent_sysvar.to_account_infos());
                account_infos.extend(self.token22_program.to_account_infos());
                account_infos.extend(self.token_program.to_account_infos());
                account_infos.extend(self.associated_token_program.to_account_infos());
                account_infos
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::ToAccountMetas for CreateResource<'info> {
            fn to_account_metas(
                &self,
                is_signer: Option<bool>,
            ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                let mut account_metas = ::alloc::vec::Vec::new();
                account_metas.extend(self.project.to_account_metas(None));
                account_metas.extend(self.resource.to_account_metas(None));
                account_metas.extend(self.owner.to_account_metas(None));
                account_metas.extend(self.payer.to_account_metas(None));
                account_metas.extend(self.mint.to_account_metas(None));
                account_metas.extend(self.system_program.to_account_metas(None));
                account_metas.extend(self.rent_sysvar.to_account_metas(None));
                account_metas.extend(self.token22_program.to_account_metas(None));
                account_metas.extend(self.token_program.to_account_metas(None));
                account_metas
                    .extend(self.associated_token_program.to_account_metas(None));
                account_metas
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::AccountsExit<'info> for CreateResource<'info>
        where
            'info: 'info,
        {
            fn exit(
                &self,
                program_id: &anchor_lang::solana_program::pubkey::Pubkey,
            ) -> anchor_lang::Result<()> {
                anchor_lang::AccountsExit::exit(&self.resource, program_id)
                    .map_err(|e| e.with_account_name("resource"))?;
                anchor_lang::AccountsExit::exit(&self.owner, program_id)
                    .map_err(|e| e.with_account_name("owner"))?;
                anchor_lang::AccountsExit::exit(&self.payer, program_id)
                    .map_err(|e| e.with_account_name("payer"))?;
                anchor_lang::AccountsExit::exit(&self.mint, program_id)
                    .map_err(|e| e.with_account_name("mint"))?;
                Ok(())
            }
        }
        /// An internal, Anchor generated module. This is used (as an
        /// implementation detail), to generate a struct for a given
        /// `#[derive(Accounts)]` implementation, where each field is a Pubkey,
        /// instead of an `AccountInfo`. This is useful for clients that want
        /// to generate a list of accounts, without explicitly knowing the
        /// order all the fields should be in.
        ///
        /// To access the struct in this module, one should use the sibling
        /// `accounts` module (also generated), which re-exports this.
        pub(crate) mod __client_accounts_create_resource {
            use super::*;
            use anchor_lang::prelude::borsh;
            /// Generated client accounts for [`CreateResource`].
            pub struct CreateResource {
                pub project: anchor_lang::solana_program::pubkey::Pubkey,
                pub resource: anchor_lang::solana_program::pubkey::Pubkey,
                pub owner: anchor_lang::solana_program::pubkey::Pubkey,
                pub payer: anchor_lang::solana_program::pubkey::Pubkey,
                pub mint: anchor_lang::solana_program::pubkey::Pubkey,
                pub system_program: anchor_lang::solana_program::pubkey::Pubkey,
                pub rent_sysvar: anchor_lang::solana_program::pubkey::Pubkey,
                pub token22_program: anchor_lang::solana_program::pubkey::Pubkey,
                ///SPL TOKEN PROGRAM
                pub token_program: anchor_lang::solana_program::pubkey::Pubkey,
                ///ASSOCIATED TOKEN PROGRAM
                pub associated_token_program: anchor_lang::solana_program::pubkey::Pubkey,
            }
            impl borsh::ser::BorshSerialize for CreateResource
            where
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
            {
                fn serialize<W: borsh::maybestd::io::Write>(
                    &self,
                    writer: &mut W,
                ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
                    borsh::BorshSerialize::serialize(&self.project, writer)?;
                    borsh::BorshSerialize::serialize(&self.resource, writer)?;
                    borsh::BorshSerialize::serialize(&self.owner, writer)?;
                    borsh::BorshSerialize::serialize(&self.payer, writer)?;
                    borsh::BorshSerialize::serialize(&self.mint, writer)?;
                    borsh::BorshSerialize::serialize(&self.system_program, writer)?;
                    borsh::BorshSerialize::serialize(&self.rent_sysvar, writer)?;
                    borsh::BorshSerialize::serialize(&self.token22_program, writer)?;
                    borsh::BorshSerialize::serialize(&self.token_program, writer)?;
                    borsh::BorshSerialize::serialize(
                        &self.associated_token_program,
                        writer,
                    )?;
                    Ok(())
                }
            }
            #[automatically_derived]
            impl anchor_lang::ToAccountMetas for CreateResource {
                fn to_account_metas(
                    &self,
                    is_signer: Option<bool>,
                ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                    let mut account_metas = ::alloc::vec::Vec::new();
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.project,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.resource,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.owner,
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.payer,
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.mint,
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.system_program,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.rent_sysvar,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.token22_program,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.token_program,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.associated_token_program,
                                false,
                            ),
                        );
                    account_metas
                }
            }
        }
        /// An internal, Anchor generated module. This is used (as an
        /// implementation detail), to generate a CPI struct for a given
        /// `#[derive(Accounts)]` implementation, where each field is an
        /// AccountInfo.
        ///
        /// To access the struct in this module, one should use the sibling
        /// [`cpi::accounts`] module (also generated), which re-exports this.
        pub(crate) mod __cpi_client_accounts_create_resource {
            use super::*;
            /// Generated CPI struct of the accounts for [`CreateResource`].
            pub struct CreateResource<'info> {
                pub project: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub resource: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub owner: anchor_lang::solana_program::account_info::AccountInfo<'info>,
                pub payer: anchor_lang::solana_program::account_info::AccountInfo<'info>,
                pub mint: anchor_lang::solana_program::account_info::AccountInfo<'info>,
                pub system_program: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub rent_sysvar: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub token22_program: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                ///SPL TOKEN PROGRAM
                pub token_program: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                ///ASSOCIATED TOKEN PROGRAM
                pub associated_token_program: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
            }
            #[automatically_derived]
            impl<'info> anchor_lang::ToAccountMetas for CreateResource<'info> {
                fn to_account_metas(
                    &self,
                    is_signer: Option<bool>,
                ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                    let mut account_metas = ::alloc::vec::Vec::new();
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.project),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.resource),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.owner),
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.payer),
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.mint),
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.system_program),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.rent_sysvar),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.token22_program),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.token_program),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.associated_token_program),
                                false,
                            ),
                        );
                    account_metas
                }
            }
            #[automatically_derived]
            impl<'info> anchor_lang::ToAccountInfos<'info> for CreateResource<'info> {
                fn to_account_infos(
                    &self,
                ) -> Vec<anchor_lang::solana_program::account_info::AccountInfo<'info>> {
                    let mut account_infos = ::alloc::vec::Vec::new();
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.project),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.resource),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.owner),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.payer),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.mint),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.system_program,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.rent_sysvar,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.token22_program,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.token_program,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.associated_token_program,
                            ),
                        );
                    account_infos
                }
            }
        }
        pub struct CreateResourceArgs {
            pub kind: ResourseKind,
            pub metadata: ResourceMetadataArgs,
            pub decimals: u8,
        }
        impl borsh::ser::BorshSerialize for CreateResourceArgs
        where
            ResourseKind: borsh::ser::BorshSerialize,
            ResourceMetadataArgs: borsh::ser::BorshSerialize,
            u8: borsh::ser::BorshSerialize,
        {
            fn serialize<W: borsh::maybestd::io::Write>(
                &self,
                writer: &mut W,
            ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
                borsh::BorshSerialize::serialize(&self.kind, writer)?;
                borsh::BorshSerialize::serialize(&self.metadata, writer)?;
                borsh::BorshSerialize::serialize(&self.decimals, writer)?;
                Ok(())
            }
        }
        impl borsh::de::BorshDeserialize for CreateResourceArgs
        where
            ResourseKind: borsh::BorshDeserialize,
            ResourceMetadataArgs: borsh::BorshDeserialize,
            u8: borsh::BorshDeserialize,
        {
            fn deserialize_reader<R: borsh::maybestd::io::Read>(
                reader: &mut R,
            ) -> ::core::result::Result<Self, borsh::maybestd::io::Error> {
                Ok(Self {
                    kind: borsh::BorshDeserialize::deserialize_reader(reader)?,
                    metadata: borsh::BorshDeserialize::deserialize_reader(reader)?,
                    decimals: borsh::BorshDeserialize::deserialize_reader(reader)?,
                })
            }
        }
        pub fn create_resource(
            ctx: Context<CreateResource>,
            args: CreateResourceArgs,
        ) -> Result<()> {
            let resource = &mut ctx.accounts.resource;
            resource.set_defaults();
            resource.bump = ctx.bumps["resource"];
            resource.project = ctx.accounts.project.key();
            resource.mint = ctx.accounts.mint.key();
            resource.kind = args.kind;
            create_mint_with_extensions(
                &resource,
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                &ctx.accounts.rent_sysvar,
                &ctx.accounts.token22_program.to_account_info(),
                args.decimals,
                &args.metadata,
            )?;
            create_metadata_for_mint(
                ctx.accounts.token22_program.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                &resource,
                args.metadata,
            )?;
            Ok(())
        }
        pub struct InitilizeResourceTree<'info> {
            #[account()]
            pub project: Box<Account<'info, Project>>,
            #[account(mut, has_one = project)]
            pub resource: Box<Account<'info, Resource>>,
            #[account(mut)]
            pub owner: Signer<'info>,
            #[account(mut)]
            pub payer: Signer<'info>,
            #[account(mut)]
            pub merkle_tree: Signer<'info>,
            pub rent_sysvar: Sysvar<'info, Rent>,
            pub system_program: Program<'info, System>,
            /// SPL TOKEN PROGRAM
            pub token_program: Program<'info, Token>,
            /// SPL Compression program.
            pub compression_program: Program<'info, SplAccountCompression>,
            /// SPL Noop program.
            pub log_wrapper: Program<'info, Noop>,
            pub clock: Sysvar<'info, Clock>,
        }
        #[automatically_derived]
        impl<'info> anchor_lang::Accounts<'info> for InitilizeResourceTree<'info>
        where
            'info: 'info,
        {
            #[inline(never)]
            fn try_accounts(
                __program_id: &anchor_lang::solana_program::pubkey::Pubkey,
                __accounts: &mut &[anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >],
                __ix_data: &[u8],
                __bumps: &mut std::collections::BTreeMap<String, u8>,
                __reallocs: &mut std::collections::BTreeSet<
                    anchor_lang::solana_program::pubkey::Pubkey,
                >,
            ) -> anchor_lang::Result<Self> {
                let project: Box<anchor_lang::accounts::account::Account<Project>> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("project"))?;
                let resource: Box<anchor_lang::accounts::account::Account<Resource>> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("resource"))?;
                let owner: Signer = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("owner"))?;
                let payer: Signer = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("payer"))?;
                let merkle_tree: Signer = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("merkle_tree"))?;
                let rent_sysvar: Sysvar<Rent> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("rent_sysvar"))?;
                let system_program: anchor_lang::accounts::program::Program<System> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("system_program"))?;
                let token_program: anchor_lang::accounts::program::Program<Token> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("token_program"))?;
                let compression_program: anchor_lang::accounts::program::Program<
                    SplAccountCompression,
                > = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("compression_program"))?;
                let log_wrapper: anchor_lang::accounts::program::Program<Noop> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("log_wrapper"))?;
                let clock: Sysvar<Clock> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("clock"))?;
                if !resource.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("resource"),
                    );
                }
                {
                    let my_key = resource.project;
                    let target_key = project.key();
                    if my_key != target_key {
                        return Err(
                            anchor_lang::error::Error::from(
                                    anchor_lang::error::ErrorCode::ConstraintHasOne,
                                )
                                .with_account_name("resource")
                                .with_pubkeys((my_key, target_key)),
                        );
                    }
                }
                if !owner.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("owner"),
                    );
                }
                if !payer.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("payer"),
                    );
                }
                if !merkle_tree.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("merkle_tree"),
                    );
                }
                Ok(InitilizeResourceTree {
                    project,
                    resource,
                    owner,
                    payer,
                    merkle_tree,
                    rent_sysvar,
                    system_program,
                    token_program,
                    compression_program,
                    log_wrapper,
                    clock,
                })
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::ToAccountInfos<'info> for InitilizeResourceTree<'info>
        where
            'info: 'info,
        {
            fn to_account_infos(
                &self,
            ) -> Vec<anchor_lang::solana_program::account_info::AccountInfo<'info>> {
                let mut account_infos = ::alloc::vec::Vec::new();
                account_infos.extend(self.project.to_account_infos());
                account_infos.extend(self.resource.to_account_infos());
                account_infos.extend(self.owner.to_account_infos());
                account_infos.extend(self.payer.to_account_infos());
                account_infos.extend(self.merkle_tree.to_account_infos());
                account_infos.extend(self.rent_sysvar.to_account_infos());
                account_infos.extend(self.system_program.to_account_infos());
                account_infos.extend(self.token_program.to_account_infos());
                account_infos.extend(self.compression_program.to_account_infos());
                account_infos.extend(self.log_wrapper.to_account_infos());
                account_infos.extend(self.clock.to_account_infos());
                account_infos
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::ToAccountMetas for InitilizeResourceTree<'info> {
            fn to_account_metas(
                &self,
                is_signer: Option<bool>,
            ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                let mut account_metas = ::alloc::vec::Vec::new();
                account_metas.extend(self.project.to_account_metas(None));
                account_metas.extend(self.resource.to_account_metas(None));
                account_metas.extend(self.owner.to_account_metas(None));
                account_metas.extend(self.payer.to_account_metas(None));
                account_metas.extend(self.merkle_tree.to_account_metas(None));
                account_metas.extend(self.rent_sysvar.to_account_metas(None));
                account_metas.extend(self.system_program.to_account_metas(None));
                account_metas.extend(self.token_program.to_account_metas(None));
                account_metas.extend(self.compression_program.to_account_metas(None));
                account_metas.extend(self.log_wrapper.to_account_metas(None));
                account_metas.extend(self.clock.to_account_metas(None));
                account_metas
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::AccountsExit<'info> for InitilizeResourceTree<'info>
        where
            'info: 'info,
        {
            fn exit(
                &self,
                program_id: &anchor_lang::solana_program::pubkey::Pubkey,
            ) -> anchor_lang::Result<()> {
                anchor_lang::AccountsExit::exit(&self.resource, program_id)
                    .map_err(|e| e.with_account_name("resource"))?;
                anchor_lang::AccountsExit::exit(&self.owner, program_id)
                    .map_err(|e| e.with_account_name("owner"))?;
                anchor_lang::AccountsExit::exit(&self.payer, program_id)
                    .map_err(|e| e.with_account_name("payer"))?;
                anchor_lang::AccountsExit::exit(&self.merkle_tree, program_id)
                    .map_err(|e| e.with_account_name("merkle_tree"))?;
                Ok(())
            }
        }
        /// An internal, Anchor generated module. This is used (as an
        /// implementation detail), to generate a struct for a given
        /// `#[derive(Accounts)]` implementation, where each field is a Pubkey,
        /// instead of an `AccountInfo`. This is useful for clients that want
        /// to generate a list of accounts, without explicitly knowing the
        /// order all the fields should be in.
        ///
        /// To access the struct in this module, one should use the sibling
        /// `accounts` module (also generated), which re-exports this.
        pub(crate) mod __client_accounts_initilize_resource_tree {
            use super::*;
            use anchor_lang::prelude::borsh;
            /// Generated client accounts for [`InitilizeResourceTree`].
            pub struct InitilizeResourceTree {
                pub project: anchor_lang::solana_program::pubkey::Pubkey,
                pub resource: anchor_lang::solana_program::pubkey::Pubkey,
                pub owner: anchor_lang::solana_program::pubkey::Pubkey,
                pub payer: anchor_lang::solana_program::pubkey::Pubkey,
                pub merkle_tree: anchor_lang::solana_program::pubkey::Pubkey,
                pub rent_sysvar: anchor_lang::solana_program::pubkey::Pubkey,
                pub system_program: anchor_lang::solana_program::pubkey::Pubkey,
                ///SPL TOKEN PROGRAM
                pub token_program: anchor_lang::solana_program::pubkey::Pubkey,
                ///SPL Compression program.
                pub compression_program: anchor_lang::solana_program::pubkey::Pubkey,
                ///SPL Noop program.
                pub log_wrapper: anchor_lang::solana_program::pubkey::Pubkey,
                pub clock: anchor_lang::solana_program::pubkey::Pubkey,
            }
            impl borsh::ser::BorshSerialize for InitilizeResourceTree
            where
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
            {
                fn serialize<W: borsh::maybestd::io::Write>(
                    &self,
                    writer: &mut W,
                ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
                    borsh::BorshSerialize::serialize(&self.project, writer)?;
                    borsh::BorshSerialize::serialize(&self.resource, writer)?;
                    borsh::BorshSerialize::serialize(&self.owner, writer)?;
                    borsh::BorshSerialize::serialize(&self.payer, writer)?;
                    borsh::BorshSerialize::serialize(&self.merkle_tree, writer)?;
                    borsh::BorshSerialize::serialize(&self.rent_sysvar, writer)?;
                    borsh::BorshSerialize::serialize(&self.system_program, writer)?;
                    borsh::BorshSerialize::serialize(&self.token_program, writer)?;
                    borsh::BorshSerialize::serialize(&self.compression_program, writer)?;
                    borsh::BorshSerialize::serialize(&self.log_wrapper, writer)?;
                    borsh::BorshSerialize::serialize(&self.clock, writer)?;
                    Ok(())
                }
            }
            #[automatically_derived]
            impl anchor_lang::ToAccountMetas for InitilizeResourceTree {
                fn to_account_metas(
                    &self,
                    is_signer: Option<bool>,
                ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                    let mut account_metas = ::alloc::vec::Vec::new();
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.project,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.resource,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.owner,
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.payer,
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.merkle_tree,
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.rent_sysvar,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.system_program,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.token_program,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.compression_program,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.log_wrapper,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.clock,
                                false,
                            ),
                        );
                    account_metas
                }
            }
        }
        /// An internal, Anchor generated module. This is used (as an
        /// implementation detail), to generate a CPI struct for a given
        /// `#[derive(Accounts)]` implementation, where each field is an
        /// AccountInfo.
        ///
        /// To access the struct in this module, one should use the sibling
        /// [`cpi::accounts`] module (also generated), which re-exports this.
        pub(crate) mod __cpi_client_accounts_initilize_resource_tree {
            use super::*;
            /// Generated CPI struct of the accounts for [`InitilizeResourceTree`].
            pub struct InitilizeResourceTree<'info> {
                pub project: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub resource: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub owner: anchor_lang::solana_program::account_info::AccountInfo<'info>,
                pub payer: anchor_lang::solana_program::account_info::AccountInfo<'info>,
                pub merkle_tree: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub rent_sysvar: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub system_program: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                ///SPL TOKEN PROGRAM
                pub token_program: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                ///SPL Compression program.
                pub compression_program: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                ///SPL Noop program.
                pub log_wrapper: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub clock: anchor_lang::solana_program::account_info::AccountInfo<'info>,
            }
            #[automatically_derived]
            impl<'info> anchor_lang::ToAccountMetas for InitilizeResourceTree<'info> {
                fn to_account_metas(
                    &self,
                    is_signer: Option<bool>,
                ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                    let mut account_metas = ::alloc::vec::Vec::new();
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.project),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.resource),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.owner),
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.payer),
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.merkle_tree),
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.rent_sysvar),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.system_program),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.token_program),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.compression_program),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.log_wrapper),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.clock),
                                false,
                            ),
                        );
                    account_metas
                }
            }
            #[automatically_derived]
            impl<'info> anchor_lang::ToAccountInfos<'info>
            for InitilizeResourceTree<'info> {
                fn to_account_infos(
                    &self,
                ) -> Vec<anchor_lang::solana_program::account_info::AccountInfo<'info>> {
                    let mut account_infos = ::alloc::vec::Vec::new();
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.project),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.resource),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.owner),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.payer),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.merkle_tree,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.rent_sysvar,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.system_program,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.token_program,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.compression_program,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.log_wrapper,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.clock),
                        );
                    account_infos
                }
            }
        }
        pub struct InitilizeResourceTreeArgs {
            pub max_depth: u32,
            pub max_buffer_size: u32,
        }
        impl borsh::ser::BorshSerialize for InitilizeResourceTreeArgs
        where
            u32: borsh::ser::BorshSerialize,
            u32: borsh::ser::BorshSerialize,
        {
            fn serialize<W: borsh::maybestd::io::Write>(
                &self,
                writer: &mut W,
            ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
                borsh::BorshSerialize::serialize(&self.max_depth, writer)?;
                borsh::BorshSerialize::serialize(&self.max_buffer_size, writer)?;
                Ok(())
            }
        }
        impl borsh::de::BorshDeserialize for InitilizeResourceTreeArgs
        where
            u32: borsh::BorshDeserialize,
            u32: borsh::BorshDeserialize,
        {
            fn deserialize_reader<R: borsh::maybestd::io::Read>(
                reader: &mut R,
            ) -> ::core::result::Result<Self, borsh::maybestd::io::Error> {
                Ok(Self {
                    max_depth: borsh::BorshDeserialize::deserialize_reader(reader)?,
                    max_buffer_size: borsh::BorshDeserialize::deserialize_reader(reader)?,
                })
            }
        }
        pub fn initilize_resource_tree(
            ctx: Context<InitilizeResourceTree>,
            args: InitilizeResourceTreeArgs,
        ) -> Result<()> {
            let resource = &mut ctx.accounts.resource;
            ::solana_program::log::sol_log(
                "Reallocating resource account to fit the merkle tree.",
            );
            reallocate(
                32,
                resource.to_account_info(),
                ctx.accounts.payer.to_account_info(),
                &ctx.accounts.rent_sysvar,
                &ctx.accounts.system_program,
            )?;
            ::solana_program::log::sol_log("Initializing the resource tree.");
            resource.merkle_trees.merkle_trees.push(ctx.accounts.merkle_tree.key());
            ::solana_program::log::sol_log("Creating the merkle tree for the resource.");
            let bump_binding = [resource.bump];
            let signer_seeds = resource.seeds(&bump_binding);
            init_tree(
                args.max_depth,
                args.max_buffer_size,
                &resource.to_account_info(),
                &ctx.accounts.merkle_tree,
                &ctx.accounts.compression_program,
                &ctx.accounts.log_wrapper,
                Some(&[&signer_seeds[..]]),
            )?;
            Ok(())
        }
    }
    pub mod unwrap {
        use {
            crate::{
                errors::ResourceErrorCode, utils::mint_tokens, Holding,
                HoldingAccountArgs, Resource,
            },
            anchor_lang::prelude::*,
            anchor_spl::{
                associated_token::AssociatedToken, token::{Token, TokenAccount},
            },
            hpl_compression::{verify_leaf, CompressedData, CompressedDataEvent, ToNode},
            hpl_hive_control::state::Project,
            spl_account_compression::{program::SplAccountCompression, Noop},
            spl_token_2022::ID as Token2022,
        };
        pub struct UnWrapResource<'info> {
            #[account()]
            pub project: Box<Account<'info, Project>>,
            #[account(has_one = project, has_one = mint)]
            pub resource: Box<Account<'info, Resource>>,
            /// CHECK: this is not dangerous. we are not reading & writing from it
            #[account(mut, constraint = resource.mint = = mint.key())]
            pub mint: AccountInfo<'info>,
            /// CHECK: this is not dangerous. we are not reading & writing from it
            #[account(mut)]
            pub merkle_tree: AccountInfo<'info>,
            #[account(
                init_if_needed,
                payer = payer,
                associated_token::mint = mint,
                associated_token::authority = owner
            )]
            pub recipient_account: Box<Account<'info, TokenAccount>>,
            #[account(mut)]
            pub owner: Signer<'info>,
            #[account(mut)]
            pub payer: Signer<'info>,
            pub rent_sysvar: Sysvar<'info, Rent>,
            pub system_program: Program<'info, System>,
            /// CHECK: this is not dangerous. we are not reading & writing from it
            #[account(address = Token2022)]
            pub token22_program: AccountInfo<'info>,
            /// SPL TOKEN PROGRAM
            pub token_program: Program<'info, Token>,
            /// SPL Compression program.
            pub compression_program: Program<'info, SplAccountCompression>,
            /// SPL Noop program.
            pub log_wrapper: Program<'info, Noop>,
            pub clock: Sysvar<'info, Clock>,
            pub associated_token_program: Program<'info, AssociatedToken>,
        }
        #[automatically_derived]
        impl<'info> anchor_lang::Accounts<'info> for UnWrapResource<'info>
        where
            'info: 'info,
        {
            #[inline(never)]
            fn try_accounts(
                __program_id: &anchor_lang::solana_program::pubkey::Pubkey,
                __accounts: &mut &[anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >],
                __ix_data: &[u8],
                __bumps: &mut std::collections::BTreeMap<String, u8>,
                __reallocs: &mut std::collections::BTreeSet<
                    anchor_lang::solana_program::pubkey::Pubkey,
                >,
            ) -> anchor_lang::Result<Self> {
                let project: Box<anchor_lang::accounts::account::Account<Project>> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("project"))?;
                let resource: Box<anchor_lang::accounts::account::Account<Resource>> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("resource"))?;
                let mint: AccountInfo = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("mint"))?;
                let merkle_tree: AccountInfo = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("merkle_tree"))?;
                if __accounts.is_empty() {
                    return Err(
                        anchor_lang::error::ErrorCode::AccountNotEnoughKeys.into(),
                    );
                }
                let recipient_account = &__accounts[0];
                *__accounts = &__accounts[1..];
                let owner: Signer = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("owner"))?;
                let payer: Signer = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("payer"))?;
                let rent_sysvar: Sysvar<Rent> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("rent_sysvar"))?;
                let system_program: anchor_lang::accounts::program::Program<System> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("system_program"))?;
                let token22_program: AccountInfo = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("token22_program"))?;
                let token_program: anchor_lang::accounts::program::Program<Token> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("token_program"))?;
                let compression_program: anchor_lang::accounts::program::Program<
                    SplAccountCompression,
                > = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("compression_program"))?;
                let log_wrapper: anchor_lang::accounts::program::Program<Noop> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("log_wrapper"))?;
                let clock: Sysvar<Clock> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("clock"))?;
                let associated_token_program: anchor_lang::accounts::program::Program<
                    AssociatedToken,
                > = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("associated_token_program"))?;
                let __anchor_rent = Rent::get()?;
                let recipient_account: Box<
                    anchor_lang::accounts::account::Account<TokenAccount>,
                > = {
                    let owner_program = AsRef::<AccountInfo>::as_ref(&recipient_account)
                        .owner;
                    if !true
                        || owner_program
                            == &anchor_lang::solana_program::system_program::ID
                    {
                        let cpi_program = associated_token_program.to_account_info();
                        let cpi_accounts = ::anchor_spl::associated_token::Create {
                            payer: payer.to_account_info(),
                            associated_token: recipient_account.to_account_info(),
                            authority: owner.to_account_info(),
                            mint: mint.to_account_info(),
                            system_program: system_program.to_account_info(),
                            token_program: token_program.to_account_info(),
                        };
                        let cpi_ctx = anchor_lang::context::CpiContext::new(
                            cpi_program,
                            cpi_accounts,
                        );
                        ::anchor_spl::associated_token::create(cpi_ctx)?;
                    }
                    let pa: Box<anchor_lang::accounts::account::Account<TokenAccount>> = Box::new(
                        match anchor_lang::accounts::account::Account::try_from_unchecked(
                            &recipient_account,
                        ) {
                            Ok(val) => val,
                            Err(e) => {
                                return Err(e.with_account_name("recipient_account"));
                            }
                        },
                    );
                    if true {
                        if pa.mint != mint.key() {
                            return Err(
                                anchor_lang::error::Error::from(
                                        anchor_lang::error::ErrorCode::ConstraintTokenMint,
                                    )
                                    .with_account_name("recipient_account")
                                    .with_pubkeys((pa.mint, mint.key())),
                            );
                        }
                        if pa.owner != owner.key() {
                            return Err(
                                anchor_lang::error::Error::from(
                                        anchor_lang::error::ErrorCode::ConstraintTokenOwner,
                                    )
                                    .with_account_name("recipient_account")
                                    .with_pubkeys((pa.owner, owner.key())),
                            );
                        }
                        if owner_program != &token_program.key() {
                            return Err(
                                anchor_lang::error::Error::from(
                                        anchor_lang::error::ErrorCode::ConstraintAssociatedTokenTokenProgram,
                                    )
                                    .with_account_name("recipient_account")
                                    .with_pubkeys((*owner_program, token_program.key())),
                            );
                        }
                        if pa.key()
                            != ::anchor_spl::associated_token::get_associated_token_address(
                                &owner.key(),
                                &mint.key(),
                            )
                        {
                            return Err(
                                anchor_lang::error::Error::from(
                                        anchor_lang::error::ErrorCode::AccountNotAssociatedTokenAccount,
                                    )
                                    .with_account_name("recipient_account"),
                            );
                        }
                    }
                    pa
                };
                if !recipient_account.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("recipient_account"),
                    );
                }
                if !__anchor_rent
                    .is_exempt(
                        recipient_account.to_account_info().lamports(),
                        recipient_account.to_account_info().try_data_len()?,
                    )
                {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintRentExempt,
                            )
                            .with_account_name("recipient_account"),
                    );
                }
                {
                    let my_key = resource.project;
                    let target_key = project.key();
                    if my_key != target_key {
                        return Err(
                            anchor_lang::error::Error::from(
                                    anchor_lang::error::ErrorCode::ConstraintHasOne,
                                )
                                .with_account_name("resource")
                                .with_pubkeys((my_key, target_key)),
                        );
                    }
                }
                {
                    let my_key = resource.mint;
                    let target_key = mint.key();
                    if my_key != target_key {
                        return Err(
                            anchor_lang::error::Error::from(
                                    anchor_lang::error::ErrorCode::ConstraintHasOne,
                                )
                                .with_account_name("resource")
                                .with_pubkeys((my_key, target_key)),
                        );
                    }
                }
                if !mint.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("mint"),
                    );
                }
                if !(resource.mint == mint.key()) {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintRaw,
                            )
                            .with_account_name("mint"),
                    );
                }
                if !merkle_tree.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("merkle_tree"),
                    );
                }
                if !owner.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("owner"),
                    );
                }
                if !payer.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("payer"),
                    );
                }
                {
                    let actual = token22_program.key();
                    let expected = Token2022;
                    if actual != expected {
                        return Err(
                            anchor_lang::error::Error::from(
                                    anchor_lang::error::ErrorCode::ConstraintAddress,
                                )
                                .with_account_name("token22_program")
                                .with_pubkeys((actual, expected)),
                        );
                    }
                }
                Ok(UnWrapResource {
                    project,
                    resource,
                    mint,
                    merkle_tree,
                    recipient_account,
                    owner,
                    payer,
                    rent_sysvar,
                    system_program,
                    token22_program,
                    token_program,
                    compression_program,
                    log_wrapper,
                    clock,
                    associated_token_program,
                })
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::ToAccountInfos<'info> for UnWrapResource<'info>
        where
            'info: 'info,
        {
            fn to_account_infos(
                &self,
            ) -> Vec<anchor_lang::solana_program::account_info::AccountInfo<'info>> {
                let mut account_infos = ::alloc::vec::Vec::new();
                account_infos.extend(self.project.to_account_infos());
                account_infos.extend(self.resource.to_account_infos());
                account_infos.extend(self.mint.to_account_infos());
                account_infos.extend(self.merkle_tree.to_account_infos());
                account_infos.extend(self.recipient_account.to_account_infos());
                account_infos.extend(self.owner.to_account_infos());
                account_infos.extend(self.payer.to_account_infos());
                account_infos.extend(self.rent_sysvar.to_account_infos());
                account_infos.extend(self.system_program.to_account_infos());
                account_infos.extend(self.token22_program.to_account_infos());
                account_infos.extend(self.token_program.to_account_infos());
                account_infos.extend(self.compression_program.to_account_infos());
                account_infos.extend(self.log_wrapper.to_account_infos());
                account_infos.extend(self.clock.to_account_infos());
                account_infos.extend(self.associated_token_program.to_account_infos());
                account_infos
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::ToAccountMetas for UnWrapResource<'info> {
            fn to_account_metas(
                &self,
                is_signer: Option<bool>,
            ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                let mut account_metas = ::alloc::vec::Vec::new();
                account_metas.extend(self.project.to_account_metas(None));
                account_metas.extend(self.resource.to_account_metas(None));
                account_metas.extend(self.mint.to_account_metas(None));
                account_metas.extend(self.merkle_tree.to_account_metas(None));
                account_metas.extend(self.recipient_account.to_account_metas(None));
                account_metas.extend(self.owner.to_account_metas(None));
                account_metas.extend(self.payer.to_account_metas(None));
                account_metas.extend(self.rent_sysvar.to_account_metas(None));
                account_metas.extend(self.system_program.to_account_metas(None));
                account_metas.extend(self.token22_program.to_account_metas(None));
                account_metas.extend(self.token_program.to_account_metas(None));
                account_metas.extend(self.compression_program.to_account_metas(None));
                account_metas.extend(self.log_wrapper.to_account_metas(None));
                account_metas.extend(self.clock.to_account_metas(None));
                account_metas
                    .extend(self.associated_token_program.to_account_metas(None));
                account_metas
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::AccountsExit<'info> for UnWrapResource<'info>
        where
            'info: 'info,
        {
            fn exit(
                &self,
                program_id: &anchor_lang::solana_program::pubkey::Pubkey,
            ) -> anchor_lang::Result<()> {
                anchor_lang::AccountsExit::exit(&self.mint, program_id)
                    .map_err(|e| e.with_account_name("mint"))?;
                anchor_lang::AccountsExit::exit(&self.merkle_tree, program_id)
                    .map_err(|e| e.with_account_name("merkle_tree"))?;
                anchor_lang::AccountsExit::exit(&self.recipient_account, program_id)
                    .map_err(|e| e.with_account_name("recipient_account"))?;
                anchor_lang::AccountsExit::exit(&self.owner, program_id)
                    .map_err(|e| e.with_account_name("owner"))?;
                anchor_lang::AccountsExit::exit(&self.payer, program_id)
                    .map_err(|e| e.with_account_name("payer"))?;
                Ok(())
            }
        }
        /// An internal, Anchor generated module. This is used (as an
        /// implementation detail), to generate a struct for a given
        /// `#[derive(Accounts)]` implementation, where each field is a Pubkey,
        /// instead of an `AccountInfo`. This is useful for clients that want
        /// to generate a list of accounts, without explicitly knowing the
        /// order all the fields should be in.
        ///
        /// To access the struct in this module, one should use the sibling
        /// `accounts` module (also generated), which re-exports this.
        pub(crate) mod __client_accounts_un_wrap_resource {
            use super::*;
            use anchor_lang::prelude::borsh;
            /// Generated client accounts for [`UnWrapResource`].
            pub struct UnWrapResource {
                pub project: anchor_lang::solana_program::pubkey::Pubkey,
                pub resource: anchor_lang::solana_program::pubkey::Pubkey,
                pub mint: anchor_lang::solana_program::pubkey::Pubkey,
                pub merkle_tree: anchor_lang::solana_program::pubkey::Pubkey,
                pub recipient_account: anchor_lang::solana_program::pubkey::Pubkey,
                pub owner: anchor_lang::solana_program::pubkey::Pubkey,
                pub payer: anchor_lang::solana_program::pubkey::Pubkey,
                pub rent_sysvar: anchor_lang::solana_program::pubkey::Pubkey,
                pub system_program: anchor_lang::solana_program::pubkey::Pubkey,
                pub token22_program: anchor_lang::solana_program::pubkey::Pubkey,
                ///SPL TOKEN PROGRAM
                pub token_program: anchor_lang::solana_program::pubkey::Pubkey,
                ///SPL Compression program.
                pub compression_program: anchor_lang::solana_program::pubkey::Pubkey,
                ///SPL Noop program.
                pub log_wrapper: anchor_lang::solana_program::pubkey::Pubkey,
                pub clock: anchor_lang::solana_program::pubkey::Pubkey,
                pub associated_token_program: anchor_lang::solana_program::pubkey::Pubkey,
            }
            impl borsh::ser::BorshSerialize for UnWrapResource
            where
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
            {
                fn serialize<W: borsh::maybestd::io::Write>(
                    &self,
                    writer: &mut W,
                ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
                    borsh::BorshSerialize::serialize(&self.project, writer)?;
                    borsh::BorshSerialize::serialize(&self.resource, writer)?;
                    borsh::BorshSerialize::serialize(&self.mint, writer)?;
                    borsh::BorshSerialize::serialize(&self.merkle_tree, writer)?;
                    borsh::BorshSerialize::serialize(&self.recipient_account, writer)?;
                    borsh::BorshSerialize::serialize(&self.owner, writer)?;
                    borsh::BorshSerialize::serialize(&self.payer, writer)?;
                    borsh::BorshSerialize::serialize(&self.rent_sysvar, writer)?;
                    borsh::BorshSerialize::serialize(&self.system_program, writer)?;
                    borsh::BorshSerialize::serialize(&self.token22_program, writer)?;
                    borsh::BorshSerialize::serialize(&self.token_program, writer)?;
                    borsh::BorshSerialize::serialize(&self.compression_program, writer)?;
                    borsh::BorshSerialize::serialize(&self.log_wrapper, writer)?;
                    borsh::BorshSerialize::serialize(&self.clock, writer)?;
                    borsh::BorshSerialize::serialize(
                        &self.associated_token_program,
                        writer,
                    )?;
                    Ok(())
                }
            }
            #[automatically_derived]
            impl anchor_lang::ToAccountMetas for UnWrapResource {
                fn to_account_metas(
                    &self,
                    is_signer: Option<bool>,
                ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                    let mut account_metas = ::alloc::vec::Vec::new();
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.project,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.resource,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.mint,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.merkle_tree,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.recipient_account,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.owner,
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.payer,
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.rent_sysvar,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.system_program,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.token22_program,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.token_program,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.compression_program,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.log_wrapper,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.clock,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.associated_token_program,
                                false,
                            ),
                        );
                    account_metas
                }
            }
        }
        /// An internal, Anchor generated module. This is used (as an
        /// implementation detail), to generate a CPI struct for a given
        /// `#[derive(Accounts)]` implementation, where each field is an
        /// AccountInfo.
        ///
        /// To access the struct in this module, one should use the sibling
        /// [`cpi::accounts`] module (also generated), which re-exports this.
        pub(crate) mod __cpi_client_accounts_un_wrap_resource {
            use super::*;
            /// Generated CPI struct of the accounts for [`UnWrapResource`].
            pub struct UnWrapResource<'info> {
                pub project: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub resource: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub mint: anchor_lang::solana_program::account_info::AccountInfo<'info>,
                pub merkle_tree: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub recipient_account: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub owner: anchor_lang::solana_program::account_info::AccountInfo<'info>,
                pub payer: anchor_lang::solana_program::account_info::AccountInfo<'info>,
                pub rent_sysvar: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub system_program: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub token22_program: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                ///SPL TOKEN PROGRAM
                pub token_program: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                ///SPL Compression program.
                pub compression_program: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                ///SPL Noop program.
                pub log_wrapper: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub clock: anchor_lang::solana_program::account_info::AccountInfo<'info>,
                pub associated_token_program: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
            }
            #[automatically_derived]
            impl<'info> anchor_lang::ToAccountMetas for UnWrapResource<'info> {
                fn to_account_metas(
                    &self,
                    is_signer: Option<bool>,
                ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                    let mut account_metas = ::alloc::vec::Vec::new();
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.project),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.resource),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.mint),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.merkle_tree),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.recipient_account),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.owner),
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.payer),
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.rent_sysvar),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.system_program),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.token22_program),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.token_program),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.compression_program),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.log_wrapper),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.clock),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.associated_token_program),
                                false,
                            ),
                        );
                    account_metas
                }
            }
            #[automatically_derived]
            impl<'info> anchor_lang::ToAccountInfos<'info> for UnWrapResource<'info> {
                fn to_account_infos(
                    &self,
                ) -> Vec<anchor_lang::solana_program::account_info::AccountInfo<'info>> {
                    let mut account_infos = ::alloc::vec::Vec::new();
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.project),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.resource),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.mint),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.merkle_tree,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.recipient_account,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.owner),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.payer),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.rent_sysvar,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.system_program,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.token22_program,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.token_program,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.compression_program,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.log_wrapper,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.clock),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.associated_token_program,
                            ),
                        );
                    account_infos
                }
            }
        }
        pub struct UnWrapResourceArgs {
            pub holding_state: HoldingAccountArgs,
            pub amount: u64,
        }
        impl borsh::ser::BorshSerialize for UnWrapResourceArgs
        where
            HoldingAccountArgs: borsh::ser::BorshSerialize,
            u64: borsh::ser::BorshSerialize,
        {
            fn serialize<W: borsh::maybestd::io::Write>(
                &self,
                writer: &mut W,
            ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
                borsh::BorshSerialize::serialize(&self.holding_state, writer)?;
                borsh::BorshSerialize::serialize(&self.amount, writer)?;
                Ok(())
            }
        }
        impl borsh::de::BorshDeserialize for UnWrapResourceArgs
        where
            HoldingAccountArgs: borsh::BorshDeserialize,
            u64: borsh::BorshDeserialize,
        {
            fn deserialize_reader<R: borsh::maybestd::io::Read>(
                reader: &mut R,
            ) -> ::core::result::Result<Self, borsh::maybestd::io::Error> {
                Ok(Self {
                    holding_state: borsh::BorshDeserialize::deserialize_reader(reader)?,
                    amount: borsh::BorshDeserialize::deserialize_reader(reader)?,
                })
            }
        }
        pub fn unwrap_resource<'info>(
            ctx: Context<'_, '_, '_, 'info, UnWrapResource<'info>>,
            args: UnWrapResourceArgs,
        ) -> Result<()> {
            let resource = &mut ctx.accounts.resource;
            verify_leaf(
                args.holding_state.root,
                args.holding_state.holding.to_compressed().to_node(),
                args.holding_state.leaf_idx,
                &ctx.accounts.merkle_tree.to_account_info(),
                &ctx.accounts.compression_program,
                ctx.remaining_accounts.to_vec(),
            )?;
            if args.amount > args.holding_state.holding.balance {
                return Err(ResourceErrorCode::InsufficientAmount.into());
            }
            let (_leaf_idx, seq) = resource
                .merkle_trees
                .assert_append(ctx.accounts.merkle_tree.to_account_info())?;
            let new_holding_state = Holding {
                holder: args.holding_state.holding.holder,
                balance: args.holding_state.holding.balance - args.amount,
            };
            let event = CompressedDataEvent::Leaf {
                slot: ctx.accounts.clock.slot,
                tree_id: ctx.accounts.merkle_tree.key().to_bytes(),
                leaf_idx: args.holding_state.leaf_idx,
                seq: seq,
                stream_type: new_holding_state.event_stream(),
            };
            event.wrap(&ctx.accounts.log_wrapper)?;
            let new_leaf;
            if args.holding_state.holding.balance - args.amount > 0 {
                new_leaf = new_holding_state.to_compressed().to_node();
            } else {
                new_leaf = [0; 32];
            }
            let bump_binding = [resource.bump];
            let signer_seeds = resource.seeds(&bump_binding);
            hpl_compression::replace_leaf(
                args.holding_state.root,
                args.holding_state.holding.to_compressed().to_node(),
                new_leaf,
                args.holding_state.leaf_idx,
                &resource.to_account_info(),
                &ctx.accounts.merkle_tree,
                &ctx.accounts.compression_program,
                &ctx.accounts.log_wrapper,
                ctx.remaining_accounts.to_vec(),
                Some(&[&signer_seeds[..]]),
            )?;
            mint_tokens(
                &ctx.accounts.token_program,
                &ctx.accounts.mint,
                &ctx.accounts.recipient_account.to_account_info(),
                &ctx.accounts.owner.to_account_info(),
                &resource,
                args.amount,
            )?;
            Ok(())
        }
    }
    pub mod wrap {
        use {
            crate::{
                errors::ResourceErrorCode, utils::burn_tokens, Holding,
                HoldingAccountArgs, Resource,
            },
            anchor_lang::prelude::*,
            anchor_spl::{
                associated_token::AssociatedToken,
                token::{Token, TokenAccount, close_account, CloseAccount},
            },
            hpl_compression::{verify_leaf, CompressedData, CompressedDataEvent, ToNode},
            hpl_hive_control::state::Project,
            spl_account_compression::{program::SplAccountCompression, Noop},
            spl_token_2022::ID as Token2022,
        };
        pub struct WrapResource<'info> {
            #[account()]
            pub project: Box<Account<'info, Project>>,
            #[account(has_one = project, has_one = mint)]
            pub resource: Box<Account<'info, Resource>>,
            /// CHECK: this is not dangerous. we are not reading & writing from it
            #[account(mut, constraint = resource.mint = = mint.key())]
            pub mint: AccountInfo<'info>,
            /// CHECK: this is not dangerous. we are not reading & writing from it
            #[account(mut)]
            pub merkle_tree: AccountInfo<'info>,
            #[account(
                mut,
                constraint = token_account.owner = = owner.key(),
                constraint = token_account.mint = = mint.key()
            )]
            pub token_account: Box<Account<'info, TokenAccount>>,
            #[account(mut)]
            pub owner: Signer<'info>,
            #[account(mut)]
            pub payer: Signer<'info>,
            pub rent_sysvar: Sysvar<'info, Rent>,
            pub system_program: Program<'info, System>,
            /// CHECK: this is not dangerous. we are not reading & writing from it
            #[account(address = Token2022)]
            pub token22_program: AccountInfo<'info>,
            /// SPL TOKEN PROGRAM
            pub token_program: Program<'info, Token>,
            /// SPL Compression program.
            pub compression_program: Program<'info, SplAccountCompression>,
            /// SPL Noop program.
            pub log_wrapper: Program<'info, Noop>,
            pub clock: Sysvar<'info, Clock>,
            pub associated_token_program: Program<'info, AssociatedToken>,
        }
        #[automatically_derived]
        impl<'info> anchor_lang::Accounts<'info> for WrapResource<'info>
        where
            'info: 'info,
        {
            #[inline(never)]
            fn try_accounts(
                __program_id: &anchor_lang::solana_program::pubkey::Pubkey,
                __accounts: &mut &[anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >],
                __ix_data: &[u8],
                __bumps: &mut std::collections::BTreeMap<String, u8>,
                __reallocs: &mut std::collections::BTreeSet<
                    anchor_lang::solana_program::pubkey::Pubkey,
                >,
            ) -> anchor_lang::Result<Self> {
                let project: Box<anchor_lang::accounts::account::Account<Project>> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("project"))?;
                let resource: Box<anchor_lang::accounts::account::Account<Resource>> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("resource"))?;
                let mint: AccountInfo = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("mint"))?;
                let merkle_tree: AccountInfo = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("merkle_tree"))?;
                let token_account: Box<
                    anchor_lang::accounts::account::Account<TokenAccount>,
                > = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("token_account"))?;
                let owner: Signer = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("owner"))?;
                let payer: Signer = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("payer"))?;
                let rent_sysvar: Sysvar<Rent> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("rent_sysvar"))?;
                let system_program: anchor_lang::accounts::program::Program<System> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("system_program"))?;
                let token22_program: AccountInfo = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("token22_program"))?;
                let token_program: anchor_lang::accounts::program::Program<Token> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("token_program"))?;
                let compression_program: anchor_lang::accounts::program::Program<
                    SplAccountCompression,
                > = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("compression_program"))?;
                let log_wrapper: anchor_lang::accounts::program::Program<Noop> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("log_wrapper"))?;
                let clock: Sysvar<Clock> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("clock"))?;
                let associated_token_program: anchor_lang::accounts::program::Program<
                    AssociatedToken,
                > = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("associated_token_program"))?;
                {
                    let my_key = resource.project;
                    let target_key = project.key();
                    if my_key != target_key {
                        return Err(
                            anchor_lang::error::Error::from(
                                    anchor_lang::error::ErrorCode::ConstraintHasOne,
                                )
                                .with_account_name("resource")
                                .with_pubkeys((my_key, target_key)),
                        );
                    }
                }
                {
                    let my_key = resource.mint;
                    let target_key = mint.key();
                    if my_key != target_key {
                        return Err(
                            anchor_lang::error::Error::from(
                                    anchor_lang::error::ErrorCode::ConstraintHasOne,
                                )
                                .with_account_name("resource")
                                .with_pubkeys((my_key, target_key)),
                        );
                    }
                }
                if !mint.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("mint"),
                    );
                }
                if !(resource.mint == mint.key()) {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintRaw,
                            )
                            .with_account_name("mint"),
                    );
                }
                if !merkle_tree.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("merkle_tree"),
                    );
                }
                if !token_account.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("token_account"),
                    );
                }
                if !(token_account.owner == owner.key()) {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintRaw,
                            )
                            .with_account_name("token_account"),
                    );
                }
                if !(token_account.mint == mint.key()) {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintRaw,
                            )
                            .with_account_name("token_account"),
                    );
                }
                if !owner.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("owner"),
                    );
                }
                if !payer.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("payer"),
                    );
                }
                {
                    let actual = token22_program.key();
                    let expected = Token2022;
                    if actual != expected {
                        return Err(
                            anchor_lang::error::Error::from(
                                    anchor_lang::error::ErrorCode::ConstraintAddress,
                                )
                                .with_account_name("token22_program")
                                .with_pubkeys((actual, expected)),
                        );
                    }
                }
                Ok(WrapResource {
                    project,
                    resource,
                    mint,
                    merkle_tree,
                    token_account,
                    owner,
                    payer,
                    rent_sysvar,
                    system_program,
                    token22_program,
                    token_program,
                    compression_program,
                    log_wrapper,
                    clock,
                    associated_token_program,
                })
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::ToAccountInfos<'info> for WrapResource<'info>
        where
            'info: 'info,
        {
            fn to_account_infos(
                &self,
            ) -> Vec<anchor_lang::solana_program::account_info::AccountInfo<'info>> {
                let mut account_infos = ::alloc::vec::Vec::new();
                account_infos.extend(self.project.to_account_infos());
                account_infos.extend(self.resource.to_account_infos());
                account_infos.extend(self.mint.to_account_infos());
                account_infos.extend(self.merkle_tree.to_account_infos());
                account_infos.extend(self.token_account.to_account_infos());
                account_infos.extend(self.owner.to_account_infos());
                account_infos.extend(self.payer.to_account_infos());
                account_infos.extend(self.rent_sysvar.to_account_infos());
                account_infos.extend(self.system_program.to_account_infos());
                account_infos.extend(self.token22_program.to_account_infos());
                account_infos.extend(self.token_program.to_account_infos());
                account_infos.extend(self.compression_program.to_account_infos());
                account_infos.extend(self.log_wrapper.to_account_infos());
                account_infos.extend(self.clock.to_account_infos());
                account_infos.extend(self.associated_token_program.to_account_infos());
                account_infos
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::ToAccountMetas for WrapResource<'info> {
            fn to_account_metas(
                &self,
                is_signer: Option<bool>,
            ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                let mut account_metas = ::alloc::vec::Vec::new();
                account_metas.extend(self.project.to_account_metas(None));
                account_metas.extend(self.resource.to_account_metas(None));
                account_metas.extend(self.mint.to_account_metas(None));
                account_metas.extend(self.merkle_tree.to_account_metas(None));
                account_metas.extend(self.token_account.to_account_metas(None));
                account_metas.extend(self.owner.to_account_metas(None));
                account_metas.extend(self.payer.to_account_metas(None));
                account_metas.extend(self.rent_sysvar.to_account_metas(None));
                account_metas.extend(self.system_program.to_account_metas(None));
                account_metas.extend(self.token22_program.to_account_metas(None));
                account_metas.extend(self.token_program.to_account_metas(None));
                account_metas.extend(self.compression_program.to_account_metas(None));
                account_metas.extend(self.log_wrapper.to_account_metas(None));
                account_metas.extend(self.clock.to_account_metas(None));
                account_metas
                    .extend(self.associated_token_program.to_account_metas(None));
                account_metas
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::AccountsExit<'info> for WrapResource<'info>
        where
            'info: 'info,
        {
            fn exit(
                &self,
                program_id: &anchor_lang::solana_program::pubkey::Pubkey,
            ) -> anchor_lang::Result<()> {
                anchor_lang::AccountsExit::exit(&self.mint, program_id)
                    .map_err(|e| e.with_account_name("mint"))?;
                anchor_lang::AccountsExit::exit(&self.merkle_tree, program_id)
                    .map_err(|e| e.with_account_name("merkle_tree"))?;
                anchor_lang::AccountsExit::exit(&self.token_account, program_id)
                    .map_err(|e| e.with_account_name("token_account"))?;
                anchor_lang::AccountsExit::exit(&self.owner, program_id)
                    .map_err(|e| e.with_account_name("owner"))?;
                anchor_lang::AccountsExit::exit(&self.payer, program_id)
                    .map_err(|e| e.with_account_name("payer"))?;
                Ok(())
            }
        }
        /// An internal, Anchor generated module. This is used (as an
        /// implementation detail), to generate a struct for a given
        /// `#[derive(Accounts)]` implementation, where each field is a Pubkey,
        /// instead of an `AccountInfo`. This is useful for clients that want
        /// to generate a list of accounts, without explicitly knowing the
        /// order all the fields should be in.
        ///
        /// To access the struct in this module, one should use the sibling
        /// `accounts` module (also generated), which re-exports this.
        pub(crate) mod __client_accounts_wrap_resource {
            use super::*;
            use anchor_lang::prelude::borsh;
            /// Generated client accounts for [`WrapResource`].
            pub struct WrapResource {
                pub project: anchor_lang::solana_program::pubkey::Pubkey,
                pub resource: anchor_lang::solana_program::pubkey::Pubkey,
                pub mint: anchor_lang::solana_program::pubkey::Pubkey,
                pub merkle_tree: anchor_lang::solana_program::pubkey::Pubkey,
                pub token_account: anchor_lang::solana_program::pubkey::Pubkey,
                pub owner: anchor_lang::solana_program::pubkey::Pubkey,
                pub payer: anchor_lang::solana_program::pubkey::Pubkey,
                pub rent_sysvar: anchor_lang::solana_program::pubkey::Pubkey,
                pub system_program: anchor_lang::solana_program::pubkey::Pubkey,
                pub token22_program: anchor_lang::solana_program::pubkey::Pubkey,
                ///SPL TOKEN PROGRAM
                pub token_program: anchor_lang::solana_program::pubkey::Pubkey,
                ///SPL Compression program.
                pub compression_program: anchor_lang::solana_program::pubkey::Pubkey,
                ///SPL Noop program.
                pub log_wrapper: anchor_lang::solana_program::pubkey::Pubkey,
                pub clock: anchor_lang::solana_program::pubkey::Pubkey,
                pub associated_token_program: anchor_lang::solana_program::pubkey::Pubkey,
            }
            impl borsh::ser::BorshSerialize for WrapResource
            where
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
            {
                fn serialize<W: borsh::maybestd::io::Write>(
                    &self,
                    writer: &mut W,
                ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
                    borsh::BorshSerialize::serialize(&self.project, writer)?;
                    borsh::BorshSerialize::serialize(&self.resource, writer)?;
                    borsh::BorshSerialize::serialize(&self.mint, writer)?;
                    borsh::BorshSerialize::serialize(&self.merkle_tree, writer)?;
                    borsh::BorshSerialize::serialize(&self.token_account, writer)?;
                    borsh::BorshSerialize::serialize(&self.owner, writer)?;
                    borsh::BorshSerialize::serialize(&self.payer, writer)?;
                    borsh::BorshSerialize::serialize(&self.rent_sysvar, writer)?;
                    borsh::BorshSerialize::serialize(&self.system_program, writer)?;
                    borsh::BorshSerialize::serialize(&self.token22_program, writer)?;
                    borsh::BorshSerialize::serialize(&self.token_program, writer)?;
                    borsh::BorshSerialize::serialize(&self.compression_program, writer)?;
                    borsh::BorshSerialize::serialize(&self.log_wrapper, writer)?;
                    borsh::BorshSerialize::serialize(&self.clock, writer)?;
                    borsh::BorshSerialize::serialize(
                        &self.associated_token_program,
                        writer,
                    )?;
                    Ok(())
                }
            }
            #[automatically_derived]
            impl anchor_lang::ToAccountMetas for WrapResource {
                fn to_account_metas(
                    &self,
                    is_signer: Option<bool>,
                ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                    let mut account_metas = ::alloc::vec::Vec::new();
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.project,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.resource,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.mint,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.merkle_tree,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.token_account,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.owner,
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.payer,
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.rent_sysvar,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.system_program,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.token22_program,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.token_program,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.compression_program,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.log_wrapper,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.clock,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.associated_token_program,
                                false,
                            ),
                        );
                    account_metas
                }
            }
        }
        /// An internal, Anchor generated module. This is used (as an
        /// implementation detail), to generate a CPI struct for a given
        /// `#[derive(Accounts)]` implementation, where each field is an
        /// AccountInfo.
        ///
        /// To access the struct in this module, one should use the sibling
        /// [`cpi::accounts`] module (also generated), which re-exports this.
        pub(crate) mod __cpi_client_accounts_wrap_resource {
            use super::*;
            /// Generated CPI struct of the accounts for [`WrapResource`].
            pub struct WrapResource<'info> {
                pub project: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub resource: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub mint: anchor_lang::solana_program::account_info::AccountInfo<'info>,
                pub merkle_tree: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub token_account: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub owner: anchor_lang::solana_program::account_info::AccountInfo<'info>,
                pub payer: anchor_lang::solana_program::account_info::AccountInfo<'info>,
                pub rent_sysvar: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub system_program: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub token22_program: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                ///SPL TOKEN PROGRAM
                pub token_program: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                ///SPL Compression program.
                pub compression_program: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                ///SPL Noop program.
                pub log_wrapper: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub clock: anchor_lang::solana_program::account_info::AccountInfo<'info>,
                pub associated_token_program: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
            }
            #[automatically_derived]
            impl<'info> anchor_lang::ToAccountMetas for WrapResource<'info> {
                fn to_account_metas(
                    &self,
                    is_signer: Option<bool>,
                ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                    let mut account_metas = ::alloc::vec::Vec::new();
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.project),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.resource),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.mint),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.merkle_tree),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.token_account),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.owner),
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.payer),
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.rent_sysvar),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.system_program),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.token22_program),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.token_program),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.compression_program),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.log_wrapper),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.clock),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.associated_token_program),
                                false,
                            ),
                        );
                    account_metas
                }
            }
            #[automatically_derived]
            impl<'info> anchor_lang::ToAccountInfos<'info> for WrapResource<'info> {
                fn to_account_infos(
                    &self,
                ) -> Vec<anchor_lang::solana_program::account_info::AccountInfo<'info>> {
                    let mut account_infos = ::alloc::vec::Vec::new();
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.project),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.resource),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.mint),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.merkle_tree,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.token_account,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.owner),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.payer),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.rent_sysvar,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.system_program,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.token22_program,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.token_program,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.compression_program,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.log_wrapper,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.clock),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.associated_token_program,
                            ),
                        );
                    account_infos
                }
            }
        }
        pub struct WrapResourceArgs {
            pub holding_state: HoldingAccountArgs,
            pub amount: u64,
        }
        impl borsh::ser::BorshSerialize for WrapResourceArgs
        where
            HoldingAccountArgs: borsh::ser::BorshSerialize,
            u64: borsh::ser::BorshSerialize,
        {
            fn serialize<W: borsh::maybestd::io::Write>(
                &self,
                writer: &mut W,
            ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
                borsh::BorshSerialize::serialize(&self.holding_state, writer)?;
                borsh::BorshSerialize::serialize(&self.amount, writer)?;
                Ok(())
            }
        }
        impl borsh::de::BorshDeserialize for WrapResourceArgs
        where
            HoldingAccountArgs: borsh::BorshDeserialize,
            u64: borsh::BorshDeserialize,
        {
            fn deserialize_reader<R: borsh::maybestd::io::Read>(
                reader: &mut R,
            ) -> ::core::result::Result<Self, borsh::maybestd::io::Error> {
                Ok(Self {
                    holding_state: borsh::BorshDeserialize::deserialize_reader(reader)?,
                    amount: borsh::BorshDeserialize::deserialize_reader(reader)?,
                })
            }
        }
        pub fn wrap_resource<'info>(
            ctx: Context<'_, '_, '_, 'info, WrapResource<'info>>,
            args: WrapResourceArgs,
        ) -> Result<()> {
            let resource = &mut ctx.accounts.resource;
            if args.amount > ctx.accounts.token_account.amount {
                return Err(ResourceErrorCode::InsufficientAmount.into());
            }
            burn_tokens(
                &ctx.accounts.token_program,
                &ctx.accounts.mint,
                &ctx.accounts.token_account.to_account_info(),
                &ctx.accounts.owner.to_account_info(),
                &resource,
                args.amount,
            )?;
            if args.amount == ctx.accounts.token_account.amount {
                close_account(
                    CpiContext::new(
                        ctx.accounts.token_program.to_account_info(),
                        CloseAccount {
                            account: ctx.accounts.token_account.to_account_info(),
                            destination: ctx.accounts.owner.to_account_info(),
                            authority: ctx.accounts.owner.to_account_info(),
                        },
                    ),
                )?;
            }
            verify_leaf(
                args.holding_state.root,
                args.holding_state.holding.to_compressed().to_node(),
                args.holding_state.leaf_idx,
                &ctx.accounts.merkle_tree.to_account_info(),
                &ctx.accounts.compression_program,
                ctx.remaining_accounts.to_vec(),
            )?;
            let (_leaf_idx, seq) = resource
                .merkle_trees
                .assert_append(ctx.accounts.merkle_tree.to_account_info())?;
            let new_holding_state = Holding {
                holder: args.holding_state.holding.holder,
                balance: args.holding_state.holding.balance + args.amount,
            };
            let event = CompressedDataEvent::Leaf {
                slot: ctx.accounts.clock.slot,
                tree_id: ctx.accounts.merkle_tree.key().to_bytes(),
                leaf_idx: args.holding_state.leaf_idx,
                seq: seq,
                stream_type: new_holding_state.event_stream(),
            };
            event.wrap(&ctx.accounts.log_wrapper)?;
            let bump_binding = [resource.bump];
            let signer_seeds = resource.seeds(&bump_binding);
            hpl_compression::replace_leaf(
                args.holding_state.root,
                args.holding_state.holding.to_compressed().to_node(),
                new_holding_state.to_compressed().to_node(),
                args.holding_state.leaf_idx,
                &resource.to_account_info(),
                &ctx.accounts.merkle_tree,
                &ctx.accounts.compression_program,
                &ctx.accounts.log_wrapper,
                ctx.remaining_accounts.to_vec(),
                Some(&[&signer_seeds[..]]),
            )?;
            Ok(())
        }
    }
    pub use {holding::*, resource::*, unwrap::*, wrap::*};
}
mod states {
    pub mod holding_state {
        use {
            anchor_lang::{prelude::*, solana_program::keccak},
            hpl_compression::{
                compressed_account, CompressedData, CompressedSchema, Schema,
                SchemaValue, ToNode,
            },
            spl_account_compression::Node, std::collections::HashMap,
        };
        /// Resource holding state
        pub struct Holding {
            pub holder: Pubkey,
            pub balance: u64,
        }
        impl borsh::ser::BorshSerialize for Holding
        where
            Pubkey: borsh::ser::BorshSerialize,
            u64: borsh::ser::BorshSerialize,
        {
            fn serialize<W: borsh::maybestd::io::Write>(
                &self,
                writer: &mut W,
            ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
                borsh::BorshSerialize::serialize(&self.holder, writer)?;
                borsh::BorshSerialize::serialize(&self.balance, writer)?;
                Ok(())
            }
        }
        impl borsh::de::BorshDeserialize for Holding
        where
            Pubkey: borsh::BorshDeserialize,
            u64: borsh::BorshDeserialize,
        {
            fn deserialize_reader<R: borsh::maybestd::io::Read>(
                reader: &mut R,
            ) -> ::core::result::Result<Self, borsh::maybestd::io::Error> {
                Ok(Self {
                    holder: borsh::BorshDeserialize::deserialize_reader(reader)?,
                    balance: borsh::BorshDeserialize::deserialize_reader(reader)?,
                })
            }
        }
        #[automatically_derived]
        impl ::core::clone::Clone for Holding {
            #[inline]
            fn clone(&self) -> Holding {
                Holding {
                    holder: ::core::clone::Clone::clone(&self.holder),
                    balance: ::core::clone::Clone::clone(&self.balance),
                }
            }
        }
        impl CompressedData for Holding {}
        impl CompressedSchema for Holding {
            fn schema() -> Schema {
                let mut holding = HashMap::new();
                holding.insert(String::from("holder"), Pubkey::schema());
                holding.insert(String::from("balance"), u64::schema());
                Schema::Object(holding)
            }
            fn schema_value(&self) -> SchemaValue {
                let mut holding = HashMap::new();
                holding.insert(String::from("holder"), self.holder.schema_value());
                holding.insert(String::from("balance"), self.balance.schema_value());
                SchemaValue::Object(holding)
            }
        }
        impl Holding {
            pub fn to_compressed(&self) -> HoldingCompressed {
                HoldingCompressed {
                    holder: self.holder.clone(),
                    balance: self.balance.clone(),
                }
            }
        }
        pub struct HoldingCompressed {
            pub holder: Pubkey,
            pub balance: u64,
        }
        impl borsh::ser::BorshSerialize for HoldingCompressed
        where
            Pubkey: borsh::ser::BorshSerialize,
            u64: borsh::ser::BorshSerialize,
        {
            fn serialize<W: borsh::maybestd::io::Write>(
                &self,
                writer: &mut W,
            ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
                borsh::BorshSerialize::serialize(&self.holder, writer)?;
                borsh::BorshSerialize::serialize(&self.balance, writer)?;
                Ok(())
            }
        }
        impl borsh::de::BorshDeserialize for HoldingCompressed
        where
            Pubkey: borsh::BorshDeserialize,
            u64: borsh::BorshDeserialize,
        {
            fn deserialize_reader<R: borsh::maybestd::io::Read>(
                reader: &mut R,
            ) -> ::core::result::Result<Self, borsh::maybestd::io::Error> {
                Ok(Self {
                    holder: borsh::BorshDeserialize::deserialize_reader(reader)?,
                    balance: borsh::BorshDeserialize::deserialize_reader(reader)?,
                })
            }
        }
        #[automatically_derived]
        impl ::core::clone::Clone for HoldingCompressed {
            #[inline]
            fn clone(&self) -> HoldingCompressed {
                HoldingCompressed {
                    holder: ::core::clone::Clone::clone(&self.holder),
                    balance: ::core::clone::Clone::clone(&self.balance),
                }
            }
        }
        impl ToNode for HoldingCompressed {
            fn to_node(&self) -> Node {
                keccak::hashv(
                        &[
                            "Holding".as_bytes(),
                            self.holder.to_node().as_ref(),
                            self.balance.to_node().as_ref(),
                        ],
                    )
                    .to_bytes()
            }
        }
        pub struct HoldingAccountArgs {
            pub holding: Holding,
            pub root: [u8; 32],
            pub leaf_idx: u32,
        }
        impl borsh::ser::BorshSerialize for HoldingAccountArgs
        where
            Holding: borsh::ser::BorshSerialize,
            [u8; 32]: borsh::ser::BorshSerialize,
            u32: borsh::ser::BorshSerialize,
        {
            fn serialize<W: borsh::maybestd::io::Write>(
                &self,
                writer: &mut W,
            ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
                borsh::BorshSerialize::serialize(&self.holding, writer)?;
                borsh::BorshSerialize::serialize(&self.root, writer)?;
                borsh::BorshSerialize::serialize(&self.leaf_idx, writer)?;
                Ok(())
            }
        }
        impl borsh::de::BorshDeserialize for HoldingAccountArgs
        where
            Holding: borsh::BorshDeserialize,
            [u8; 32]: borsh::BorshDeserialize,
            u32: borsh::BorshDeserialize,
        {
            fn deserialize_reader<R: borsh::maybestd::io::Read>(
                reader: &mut R,
            ) -> ::core::result::Result<Self, borsh::maybestd::io::Error> {
                Ok(Self {
                    holding: borsh::BorshDeserialize::deserialize_reader(reader)?,
                    root: borsh::BorshDeserialize::deserialize_reader(reader)?,
                    leaf_idx: borsh::BorshDeserialize::deserialize_reader(reader)?,
                })
            }
        }
        #[automatically_derived]
        impl ::core::clone::Clone for HoldingAccountArgs {
            #[inline]
            fn clone(&self) -> HoldingAccountArgs {
                HoldingAccountArgs {
                    holding: ::core::clone::Clone::clone(&self.holding),
                    root: ::core::clone::Clone::clone(&self.root),
                    leaf_idx: ::core::clone::Clone::clone(&self.leaf_idx),
                }
            }
        }
    }
    pub mod resource_state {
        use {
            anchor_lang::prelude::*,
            hpl_compression::{CompressedSchema, ControlledMerkleTrees, Schema},
        };
        pub struct Resource {
            /// Bump seed for the PDA
            pub bump: u8,
            /// The project this resouce is associated with
            pub project: Pubkey,
            /// The mint of this resource
            pub mint: Pubkey,
            /// token account trees
            pub merkle_trees: ControlledMerkleTrees,
            pub kind: ResourseKind,
        }
        impl borsh::ser::BorshSerialize for Resource
        where
            u8: borsh::ser::BorshSerialize,
            Pubkey: borsh::ser::BorshSerialize,
            Pubkey: borsh::ser::BorshSerialize,
            ControlledMerkleTrees: borsh::ser::BorshSerialize,
            ResourseKind: borsh::ser::BorshSerialize,
        {
            fn serialize<W: borsh::maybestd::io::Write>(
                &self,
                writer: &mut W,
            ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
                borsh::BorshSerialize::serialize(&self.bump, writer)?;
                borsh::BorshSerialize::serialize(&self.project, writer)?;
                borsh::BorshSerialize::serialize(&self.mint, writer)?;
                borsh::BorshSerialize::serialize(&self.merkle_trees, writer)?;
                borsh::BorshSerialize::serialize(&self.kind, writer)?;
                Ok(())
            }
        }
        impl borsh::de::BorshDeserialize for Resource
        where
            u8: borsh::BorshDeserialize,
            Pubkey: borsh::BorshDeserialize,
            Pubkey: borsh::BorshDeserialize,
            ControlledMerkleTrees: borsh::BorshDeserialize,
            ResourseKind: borsh::BorshDeserialize,
        {
            fn deserialize_reader<R: borsh::maybestd::io::Read>(
                reader: &mut R,
            ) -> ::core::result::Result<Self, borsh::maybestd::io::Error> {
                Ok(Self {
                    bump: borsh::BorshDeserialize::deserialize_reader(reader)?,
                    project: borsh::BorshDeserialize::deserialize_reader(reader)?,
                    mint: borsh::BorshDeserialize::deserialize_reader(reader)?,
                    merkle_trees: borsh::BorshDeserialize::deserialize_reader(reader)?,
                    kind: borsh::BorshDeserialize::deserialize_reader(reader)?,
                })
            }
        }
        #[automatically_derived]
        impl ::core::clone::Clone for Resource {
            #[inline]
            fn clone(&self) -> Resource {
                Resource {
                    bump: ::core::clone::Clone::clone(&self.bump),
                    project: ::core::clone::Clone::clone(&self.project),
                    mint: ::core::clone::Clone::clone(&self.mint),
                    merkle_trees: ::core::clone::Clone::clone(&self.merkle_trees),
                    kind: ::core::clone::Clone::clone(&self.kind),
                }
            }
        }
        #[automatically_derived]
        impl anchor_lang::AccountSerialize for Resource {
            fn try_serialize<W: std::io::Write>(
                &self,
                writer: &mut W,
            ) -> anchor_lang::Result<()> {
                if writer.write_all(&[10, 160, 2, 1, 42, 207, 51, 212]).is_err() {
                    return Err(
                        anchor_lang::error::ErrorCode::AccountDidNotSerialize.into(),
                    );
                }
                if AnchorSerialize::serialize(self, writer).is_err() {
                    return Err(
                        anchor_lang::error::ErrorCode::AccountDidNotSerialize.into(),
                    );
                }
                Ok(())
            }
        }
        #[automatically_derived]
        impl anchor_lang::AccountDeserialize for Resource {
            fn try_deserialize(buf: &mut &[u8]) -> anchor_lang::Result<Self> {
                if buf.len() < [10, 160, 2, 1, 42, 207, 51, 212].len() {
                    return Err(
                        anchor_lang::error::ErrorCode::AccountDiscriminatorNotFound
                            .into(),
                    );
                }
                let given_disc = &buf[..8];
                if &[10, 160, 2, 1, 42, 207, 51, 212] != given_disc {
                    return Err(
                        anchor_lang::error::Error::from(anchor_lang::error::AnchorError {
                                error_name: anchor_lang::error::ErrorCode::AccountDiscriminatorMismatch
                                    .name(),
                                error_code_number: anchor_lang::error::ErrorCode::AccountDiscriminatorMismatch
                                    .into(),
                                error_msg: anchor_lang::error::ErrorCode::AccountDiscriminatorMismatch
                                    .to_string(),
                                error_origin: Some(
                                    anchor_lang::error::ErrorOrigin::Source(anchor_lang::error::Source {
                                        filename: "programs/hpl-resource-manager/src/states/resource_state.rs",
                                        line: 6u32,
                                    }),
                                ),
                                compared_values: None,
                            })
                            .with_account_name("Resource"),
                    );
                }
                Self::try_deserialize_unchecked(buf)
            }
            fn try_deserialize_unchecked(buf: &mut &[u8]) -> anchor_lang::Result<Self> {
                let mut data: &[u8] = &buf[8..];
                AnchorDeserialize::deserialize(&mut data)
                    .map_err(|_| {
                        anchor_lang::error::ErrorCode::AccountDidNotDeserialize.into()
                    })
            }
        }
        #[automatically_derived]
        impl anchor_lang::Discriminator for Resource {
            const DISCRIMINATOR: [u8; 8] = [10, 160, 2, 1, 42, 207, 51, 212];
        }
        #[automatically_derived]
        impl anchor_lang::Owner for Resource {
            fn owner() -> Pubkey {
                crate::ID
            }
        }
        pub enum ResourseKind {
            Fungible,
            NonFungible { characterstics: Schema },
        }
        impl borsh::ser::BorshSerialize for ResourseKind
        where
            Schema: borsh::ser::BorshSerialize,
        {
            fn serialize<W: borsh::maybestd::io::Write>(
                &self,
                writer: &mut W,
            ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
                let variant_idx: u8 = match self {
                    ResourseKind::Fungible => 0u8,
                    ResourseKind::NonFungible { .. } => 1u8,
                };
                writer.write_all(&variant_idx.to_le_bytes())?;
                match self {
                    ResourseKind::Fungible => {}
                    ResourseKind::NonFungible { characterstics } => {
                        borsh::BorshSerialize::serialize(characterstics, writer)?;
                    }
                }
                Ok(())
            }
        }
        impl borsh::de::BorshDeserialize for ResourseKind
        where
            Schema: borsh::BorshDeserialize,
        {
            fn deserialize_reader<R: borsh::maybestd::io::Read>(
                reader: &mut R,
            ) -> ::core::result::Result<Self, borsh::maybestd::io::Error> {
                let tag = <u8 as borsh::de::BorshDeserialize>::deserialize_reader(
                    reader,
                )?;
                <Self as borsh::de::EnumExt>::deserialize_variant(reader, tag)
            }
        }
        impl borsh::de::EnumExt for ResourseKind
        where
            Schema: borsh::BorshDeserialize,
        {
            fn deserialize_variant<R: borsh::maybestd::io::Read>(
                reader: &mut R,
                variant_idx: u8,
            ) -> ::core::result::Result<Self, borsh::maybestd::io::Error> {
                let mut return_value = match variant_idx {
                    0u8 => ResourseKind::Fungible,
                    1u8 => {
                        ResourseKind::NonFungible {
                            characterstics: borsh::BorshDeserialize::deserialize_reader(
                                reader,
                            )?,
                        }
                    }
                    _ => {
                        return Err(
                            borsh::maybestd::io::Error::new(
                                borsh::maybestd::io::ErrorKind::InvalidInput,
                                {
                                    let res = ::alloc::fmt::format(
                                        format_args!("Unexpected variant index: {0:?}", variant_idx),
                                    );
                                    res
                                },
                            ),
                        );
                    }
                };
                Ok(return_value)
            }
        }
        #[automatically_derived]
        impl ::core::clone::Clone for ResourseKind {
            #[inline]
            fn clone(&self) -> ResourseKind {
                match self {
                    ResourseKind::Fungible => ResourseKind::Fungible,
                    ResourseKind::NonFungible { characterstics: __self_0 } => {
                        ResourseKind::NonFungible {
                            characterstics: ::core::clone::Clone::clone(__self_0),
                        }
                    }
                }
            }
        }
        impl Resource {
            pub const LEN: usize = 8 + 1 + 32 + 32 + 1 + 4;
            pub fn get_size(kind: &ResourseKind) -> usize {
                let mut size = Self::LEN;
                size += kind.try_to_vec().unwrap().len();
                size += super::Holding::schema().size_for_borsh();
                size
            }
            pub fn set_defaults(&mut self) {
                self.bump = 0;
                self.project = Pubkey::default();
                self.mint = Pubkey::default();
                self.kind = ResourseKind::Fungible;
                self
                    .merkle_trees = ControlledMerkleTrees {
                    active: 0,
                    merkle_trees: Vec::new(),
                    schema: super::Holding::schema(),
                };
            }
            pub fn seeds<'a>(&'a self, bump: &'a [u8]) -> Vec<&'a [u8]> {
                let resource_signer_seeds: Vec<&'a [u8]> = <[_]>::into_vec(
                    #[rustc_box]
                    ::alloc::boxed::Box::new([
                        b"resource".as_ref(),
                        self.project.as_ref(),
                        self.mint.as_ref(),
                        bump,
                    ]),
                );
                resource_signer_seeds
            }
        }
    }
    pub use {holding_state::*, resource_state::*};
}
mod utils {
    pub mod token {
        use {
            crate::Resource, anchor_lang::prelude::*, core::slice,
            spl_token_2022::{
                extension::{
                    metadata_pointer::{self, MetadataPointer},
                    BaseStateWithExtensions, ExtensionType, StateWithExtensionsMut,
                },
                instruction::{
                    burn, initialize_mint2, initialize_mint_close_authority,
                    initialize_permanent_delegate, mint_to,
                },
                solana_program::{
                    instruction::Instruction, program::{invoke, invoke_signed},
                    program_pack::Pack, system_instruction::create_account,
                },
                state::Mint,
            },
            spl_token_metadata_interface::{
                instruction::{initialize, update_field},
                state::{Field, TokenMetadata},
            },
            std::ops::Deref,
        };
        pub enum ExtensionInitializationParams {
            MintCloseAuthority { close_authority: Option<Pubkey> },
            PermanentDelegate { delegate: Pubkey },
            MetadataPointer {
                authority: Option<Pubkey>,
                metadata_address: Option<Pubkey>,
            },
        }
        #[automatically_derived]
        impl ::core::clone::Clone for ExtensionInitializationParams {
            #[inline]
            fn clone(&self) -> ExtensionInitializationParams {
                match self {
                    ExtensionInitializationParams::MintCloseAuthority {
                        close_authority: __self_0,
                    } => {
                        ExtensionInitializationParams::MintCloseAuthority {
                            close_authority: ::core::clone::Clone::clone(__self_0),
                        }
                    }
                    ExtensionInitializationParams::PermanentDelegate {
                        delegate: __self_0,
                    } => {
                        ExtensionInitializationParams::PermanentDelegate {
                            delegate: ::core::clone::Clone::clone(__self_0),
                        }
                    }
                    ExtensionInitializationParams::MetadataPointer {
                        authority: __self_0,
                        metadata_address: __self_1,
                    } => {
                        ExtensionInitializationParams::MetadataPointer {
                            authority: ::core::clone::Clone::clone(__self_0),
                            metadata_address: ::core::clone::Clone::clone(__self_1),
                        }
                    }
                }
            }
        }
        #[automatically_derived]
        impl ::core::fmt::Debug for ExtensionInitializationParams {
            fn fmt(&self, f: &mut ::core::fmt::Formatter) -> ::core::fmt::Result {
                match self {
                    ExtensionInitializationParams::MintCloseAuthority {
                        close_authority: __self_0,
                    } => {
                        ::core::fmt::Formatter::debug_struct_field1_finish(
                            f,
                            "MintCloseAuthority",
                            "close_authority",
                            &__self_0,
                        )
                    }
                    ExtensionInitializationParams::PermanentDelegate {
                        delegate: __self_0,
                    } => {
                        ::core::fmt::Formatter::debug_struct_field1_finish(
                            f,
                            "PermanentDelegate",
                            "delegate",
                            &__self_0,
                        )
                    }
                    ExtensionInitializationParams::MetadataPointer {
                        authority: __self_0,
                        metadata_address: __self_1,
                    } => {
                        ::core::fmt::Formatter::debug_struct_field2_finish(
                            f,
                            "MetadataPointer",
                            "authority",
                            __self_0,
                            "metadata_address",
                            &__self_1,
                        )
                    }
                }
            }
        }
        #[automatically_derived]
        impl ::core::marker::StructuralPartialEq for ExtensionInitializationParams {}
        #[automatically_derived]
        impl ::core::cmp::PartialEq for ExtensionInitializationParams {
            #[inline]
            fn eq(&self, other: &ExtensionInitializationParams) -> bool {
                let __self_tag = ::core::intrinsics::discriminant_value(self);
                let __arg1_tag = ::core::intrinsics::discriminant_value(other);
                __self_tag == __arg1_tag
                    && match (self, other) {
                        (
                            ExtensionInitializationParams::MintCloseAuthority {
                                close_authority: __self_0,
                            },
                            ExtensionInitializationParams::MintCloseAuthority {
                                close_authority: __arg1_0,
                            },
                        ) => *__self_0 == *__arg1_0,
                        (
                            ExtensionInitializationParams::PermanentDelegate {
                                delegate: __self_0,
                            },
                            ExtensionInitializationParams::PermanentDelegate {
                                delegate: __arg1_0,
                            },
                        ) => *__self_0 == *__arg1_0,
                        (
                            ExtensionInitializationParams::MetadataPointer {
                                authority: __self_0,
                                metadata_address: __self_1,
                            },
                            ExtensionInitializationParams::MetadataPointer {
                                authority: __arg1_0,
                                metadata_address: __arg1_1,
                            },
                        ) => *__self_0 == *__arg1_0 && *__self_1 == *__arg1_1,
                        _ => unsafe { ::core::intrinsics::unreachable() }
                    }
            }
        }
        impl ExtensionInitializationParams {
            pub fn extension(&self) -> ExtensionType {
                match self {
                    Self::MintCloseAuthority { .. } => ExtensionType::MintCloseAuthority,
                    Self::PermanentDelegate { .. } => ExtensionType::PermanentDelegate,
                    Self::MetadataPointer { .. } => ExtensionType::MetadataPointer,
                }
            }
            /// Generate an appropriate initialization instruction for the given mint
            pub fn instruction(
                self,
                token_program_id: &Pubkey,
                mint: &Pubkey,
            ) -> Result<Instruction> {
                match self {
                    Self::MintCloseAuthority { close_authority } => {
                        initialize_mint_close_authority(
                                token_program_id,
                                mint,
                                close_authority.as_ref(),
                            )
                            .map_err(Into::into)
                    }
                    Self::PermanentDelegate { delegate } => {
                        initialize_permanent_delegate(token_program_id, mint, &delegate)
                            .map_err(Into::into)
                    }
                    Self::MetadataPointer { authority, metadata_address } => {
                        metadata_pointer::instruction::initialize(
                                token_program_id,
                                mint,
                                authority,
                                metadata_address,
                            )
                            .map_err(Into::into)
                    }
                }
            }
        }
        pub fn create_mint_with_extensions<'info>(
            resource: &Account<'info, Resource>,
            payer: AccountInfo<'info>,
            mint: AccountInfo<'info>,
            rent_sysvar: &Rent,
            token22_program: &AccountInfo<'info>,
            decimals: u8,
            metadata: &ResourceMetadataArgs,
        ) -> Result<Mint> {
            let extension_initialization_params = <[_]>::into_vec(
                #[rustc_box]
                ::alloc::boxed::Box::new([
                    ExtensionInitializationParams::MintCloseAuthority {
                        close_authority: Some(resource.key()),
                    },
                    ExtensionInitializationParams::PermanentDelegate {
                        delegate: resource.key(),
                    },
                    ExtensionInitializationParams::MetadataPointer {
                        authority: Some(resource.key()),
                        metadata_address: Some(mint.key()),
                    },
                ]),
            );
            let extension_types = extension_initialization_params
                .iter()
                .map(|e| e.extension())
                .collect::<Vec<_>>();
            let space = ExtensionType::try_calculate_account_len::<
                Mint,
            >(&extension_types)
                .unwrap();
            let account_instruction = create_account(
                &payer.key(),
                &mint.key(),
                rent_sysvar
                    .minimum_balance(
                        space + 68 + 12 + metadata.name.len() + metadata.symbol.len()
                            + metadata.uri.len() + 8 + 32 + 32,
                    ),
                space as u64,
                &token22_program.key(),
            );
            ::solana_program::log::sol_log("Creating mint account");
            invoke(&account_instruction, &[payer, mint.to_owned()])?;
            for params in extension_initialization_params {
                let instruction = params
                    .instruction(&token22_program.key(), &mint.key())
                    .unwrap();
                ::solana_program::log::sol_log("Creating mint extension account");
                invoke(&instruction, &[mint.to_owned()])?;
            }
            let mint_instruction = initialize_mint2(
                &token22_program.key(),
                &mint.key(),
                &resource.key(),
                Some(&resource.key()),
                decimals,
            )?;
            invoke(&mint_instruction, &[mint.to_owned()])?;
            ::solana_program::log::sol_log("Mint account created");
            let data = mint.try_borrow_data().unwrap();
            let slice = data.deref().to_vec();
            let mint_data = Mint::unpack_from_slice(&slice)?;
            Ok(mint_data)
        }
        pub struct ResourceMetadataArgs {
            pub name: String,
            pub symbol: String,
            pub uri: String,
        }
        impl borsh::ser::BorshSerialize for ResourceMetadataArgs
        where
            String: borsh::ser::BorshSerialize,
            String: borsh::ser::BorshSerialize,
            String: borsh::ser::BorshSerialize,
        {
            fn serialize<W: borsh::maybestd::io::Write>(
                &self,
                writer: &mut W,
            ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
                borsh::BorshSerialize::serialize(&self.name, writer)?;
                borsh::BorshSerialize::serialize(&self.symbol, writer)?;
                borsh::BorshSerialize::serialize(&self.uri, writer)?;
                Ok(())
            }
        }
        impl borsh::de::BorshDeserialize for ResourceMetadataArgs
        where
            String: borsh::BorshDeserialize,
            String: borsh::BorshDeserialize,
            String: borsh::BorshDeserialize,
        {
            fn deserialize_reader<R: borsh::maybestd::io::Read>(
                reader: &mut R,
            ) -> ::core::result::Result<Self, borsh::maybestd::io::Error> {
                Ok(Self {
                    name: borsh::BorshDeserialize::deserialize_reader(reader)?,
                    symbol: borsh::BorshDeserialize::deserialize_reader(reader)?,
                    uri: borsh::BorshDeserialize::deserialize_reader(reader)?,
                })
            }
        }
        pub fn create_metadata_for_mint<'info>(
            token22_program: AccountInfo<'info>,
            mint: AccountInfo<'info>,
            resource: &Account<'info, Resource>,
            metadata: ResourceMetadataArgs,
        ) -> Result<()> {
            let mint_key = mint.key();
            let instruction = initialize(
                &token22_program.key(),
                &mint_key,
                &resource.key(),
                &mint_key,
                &resource.key(),
                metadata.name,
                metadata.symbol,
                metadata.uri,
            );
            ::solana_program::log::sol_log("Creating metadata account");
            invoke_signed(
                &instruction,
                &[
                    mint.to_account_info(),
                    resource.to_account_info(),
                    mint,
                    resource.to_account_info(),
                ],
                &[&resource.seeds(&[resource.bump])[..]],
            )?;
            Ok(())
        }
        pub struct ResourceMetadataUpdateArgs {
            pub name: Option<String>,
            pub symbol: Option<String>,
            pub uri: Option<String>,
            pub field: Option<String>,
            pub value: Option<String>,
        }
        impl borsh::ser::BorshSerialize for ResourceMetadataUpdateArgs
        where
            Option<String>: borsh::ser::BorshSerialize,
            Option<String>: borsh::ser::BorshSerialize,
            Option<String>: borsh::ser::BorshSerialize,
            Option<String>: borsh::ser::BorshSerialize,
            Option<String>: borsh::ser::BorshSerialize,
        {
            fn serialize<W: borsh::maybestd::io::Write>(
                &self,
                writer: &mut W,
            ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
                borsh::BorshSerialize::serialize(&self.name, writer)?;
                borsh::BorshSerialize::serialize(&self.symbol, writer)?;
                borsh::BorshSerialize::serialize(&self.uri, writer)?;
                borsh::BorshSerialize::serialize(&self.field, writer)?;
                borsh::BorshSerialize::serialize(&self.value, writer)?;
                Ok(())
            }
        }
        impl borsh::de::BorshDeserialize for ResourceMetadataUpdateArgs
        where
            Option<String>: borsh::BorshDeserialize,
            Option<String>: borsh::BorshDeserialize,
            Option<String>: borsh::BorshDeserialize,
            Option<String>: borsh::BorshDeserialize,
            Option<String>: borsh::BorshDeserialize,
        {
            fn deserialize_reader<R: borsh::maybestd::io::Read>(
                reader: &mut R,
            ) -> ::core::result::Result<Self, borsh::maybestd::io::Error> {
                Ok(Self {
                    name: borsh::BorshDeserialize::deserialize_reader(reader)?,
                    symbol: borsh::BorshDeserialize::deserialize_reader(reader)?,
                    uri: borsh::BorshDeserialize::deserialize_reader(reader)?,
                    field: borsh::BorshDeserialize::deserialize_reader(reader)?,
                    value: borsh::BorshDeserialize::deserialize_reader(reader)?,
                })
            }
        }
        pub fn update_metadata_for_mint<'info>(
            token22_program: AccountInfo<'info>,
            mint: AccountInfo<'info>,
            resource: &Account<'info, Resource>,
            metadata: ResourceMetadataUpdateArgs,
        ) -> Result<()> {
            let mut instructions: Vec<Instruction> = ::alloc::vec::Vec::new();
            if let Some(name) = metadata.name {
                instructions
                    .push(
                        update_field(
                            &token22_program.key(),
                            &mint.key(),
                            &resource.key(),
                            Field::Name,
                            name,
                        ),
                    );
            }
            if let Some(symbol) = metadata.symbol {
                instructions
                    .push(
                        update_field(
                            &token22_program.key(),
                            &mint.key(),
                            &resource.key(),
                            Field::Symbol,
                            symbol,
                        ),
                    );
            }
            if let Some(uri) = metadata.uri {
                instructions
                    .push(
                        update_field(
                            &token22_program.key(),
                            &mint.key(),
                            &resource.key(),
                            Field::Uri,
                            uri,
                        ),
                    );
            }
            if let Some(field) = metadata.field {
                if let Some(value) = metadata.value {
                    instructions
                        .push(
                            update_field(
                                &token22_program.key(),
                                &mint.key(),
                                &resource.key(),
                                Field::Key(field),
                                value,
                            ),
                        );
                }
            }
            for instruction in instructions {
                ::solana_program::log::sol_log("Updating metadata account");
                invoke_signed(
                    &instruction,
                    &[
                        mint.to_owned(),
                        resource.to_account_info(),
                        mint.to_owned(),
                        resource.to_account_info(),
                    ],
                    &[&resource.seeds(&[resource.bump])[..]],
                )?;
            }
            Ok(())
        }
        pub fn get_mint_metadata<'info>(
            mint: AccountInfo<'info>,
        ) -> Result<TokenMetadata> {
            let data = mint.try_borrow_data().unwrap();
            let slice = data.deref().to_vec();
            let mint_size = 170 as usize;
            let mint_data = TokenMetadata::deserialize(&mut &slice[mint_size..])?;
            Ok(mint_data)
        }
        pub fn update_compressed_supply<'info>(
            token22_program: AccountInfo<'info>,
            mint: AccountInfo<'info>,
            resource: &Account<'info, Resource>,
            amount: u64,
        ) -> Result<()> {
            let resource_metadata = get_mint_metadata(mint.to_account_info()).unwrap();
            let mut new_supply = 0;
            if resource_metadata.additional_metadata.len() > 0 {
                new_supply = resource_metadata
                    .additional_metadata
                    .iter()
                    .find_map(|(key, value)| {
                        if key == "compressed_supply" {
                            Some(value.parse::<u64>().unwrap())
                        } else {
                            None
                        }
                    })
                    .unwrap();
            }
            update_metadata_for_mint(
                token22_program.to_account_info(),
                mint.to_account_info(),
                &resource,
                ResourceMetadataUpdateArgs {
                    field: Some("compressed_supply".to_string()),
                    value: Some((new_supply + amount).to_string()),
                    name: None,
                    symbol: None,
                    uri: None,
                },
            )?;
            Ok(())
        }
        pub fn mint_tokens<'info>(
            token_program_id: &AccountInfo<'info>,
            mint: &AccountInfo<'info>,
            token_account: &AccountInfo<'info>,
            receiver: &AccountInfo<'info>,
            resource: &Account<'info, Resource>,
            amount: u64,
        ) -> Result<()> {
            let mint_to_instruction = mint_to(
                    &token_program_id.key(),
                    &mint.key(),
                    &token_account.key(),
                    &receiver.key(),
                    &[&receiver.key()],
                    amount,
                )
                .unwrap();
            ::solana_program::log::sol_log("Minting to account");
            invoke(
                    &mint_to_instruction,
                    &[
                        mint.to_owned(),
                        token_account.to_owned(),
                        receiver.to_owned(),
                        resource.to_account_info(),
                    ],
                )
                .unwrap();
            Ok(())
        }
        pub fn burn_tokens<'info>(
            token_program_id: &AccountInfo<'info>,
            mint: &AccountInfo<'info>,
            token_account: &AccountInfo<'info>,
            receiver: &AccountInfo<'info>,
            resource: &Account<'info, Resource>,
            amount: u64,
        ) -> Result<()> {
            let burn_instruction = burn(
                    &token_program_id.key(),
                    &token_account.key(),
                    &mint.key(),
                    &receiver.key(),
                    &[&receiver.key()],
                    amount,
                )
                .unwrap();
            ::solana_program::log::sol_log("Burning from account");
            invoke(
                    &burn_instruction,
                    &[
                        token_account.to_owned(),
                        mint.to_owned(),
                        receiver.to_owned(),
                        receiver.to_account_info(),
                    ],
                )
                .unwrap();
            Ok(())
        }
    }
    pub use token::*;
}
use anchor_lang::prelude::*;
use instructions::*;
use states::*;
/// The static program ID
pub static ID: anchor_lang::solana_program::pubkey::Pubkey = anchor_lang::solana_program::pubkey::Pubkey::new_from_array([
    76u8,
    180u8,
    221u8,
    161u8,
    208u8,
    73u8,
    103u8,
    81u8,
    13u8,
    55u8,
    34u8,
    27u8,
    46u8,
    138u8,
    204u8,
    149u8,
    148u8,
    73u8,
    155u8,
    54u8,
    107u8,
    89u8,
    148u8,
    44u8,
    219u8,
    212u8,
    194u8,
    87u8,
    152u8,
    190u8,
    164u8,
    103u8,
]);
/// Confirms that a given pubkey is equivalent to the program ID
pub fn check_id(id: &anchor_lang::solana_program::pubkey::Pubkey) -> bool {
    id == &ID
}
/// Returns the program ID
pub fn id() -> anchor_lang::solana_program::pubkey::Pubkey {
    ID
}
use self::hpl_resource_manager::*;
/// # Safety
#[no_mangle]
pub unsafe extern "C" fn entrypoint(input: *mut u8) -> u64 {
    let (program_id, accounts, instruction_data) = unsafe {
        ::solana_program::entrypoint::deserialize(input)
    };
    match entry(&program_id, &accounts, &instruction_data) {
        Ok(()) => ::solana_program::entrypoint::SUCCESS,
        Err(error) => error.into(),
    }
}
/// The Anchor codegen exposes a programming model where a user defines
/// a set of methods inside of a `#[program]` module in a way similar
/// to writing RPC request handlers. The macro then generates a bunch of
/// code wrapping these user defined methods into something that can be
/// executed on Solana.
///
/// These methods fall into one categorie for now.
///
/// Global methods - regular methods inside of the `#[program]`.
///
/// Care must be taken by the codegen to prevent collisions between
/// methods in these different namespaces. For this reason, Anchor uses
/// a variant of sighash to perform method dispatch, rather than
/// something like a simple enum variant discriminator.
///
/// The execution flow of the generated code can be roughly outlined:
///
/// * Start program via the entrypoint.
/// * Strip method identifier off the first 8 bytes of the instruction
///   data and invoke the identified method. The method identifier
///   is a variant of sighash. See docs.rs for `anchor_lang` for details.
/// * If the method identifier is an IDL identifier, execute the IDL
///   instructions, which are a special set of hardcoded instructions
///   baked into every Anchor program. Then exit.
/// * Otherwise, the method identifier is for a user defined
///   instruction, i.e., one of the methods in the user defined
///   `#[program]` module. Perform method dispatch, i.e., execute the
///   big match statement mapping method identifier to method handler
///   wrapper.
/// * Run the method handler wrapper. This wraps the code the user
///   actually wrote, deserializing the accounts, constructing the
///   context, invoking the user's code, and finally running the exit
///   routine, which typically persists account changes.
///
/// The `entry` function here, defines the standard entry to a Solana
/// program, where execution begins.
pub fn entry(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    data: &[u8],
) -> anchor_lang::solana_program::entrypoint::ProgramResult {
    try_entry(program_id, accounts, data)
        .map_err(|e| {
            e.log();
            e.into()
        })
}
fn try_entry(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    data: &[u8],
) -> anchor_lang::Result<()> {
    if *program_id != ID {
        return Err(anchor_lang::error::ErrorCode::DeclaredProgramIdMismatch.into());
    }
    if data.len() < 8 {
        return Err(anchor_lang::error::ErrorCode::InstructionMissing.into());
    }
    dispatch(program_id, accounts, data)
}
/// Module representing the program.
pub mod program {
    use super::*;
    /// Type representing the program.
    pub struct HplResourceManager;
    #[automatically_derived]
    impl ::core::clone::Clone for HplResourceManager {
        #[inline]
        fn clone(&self) -> HplResourceManager {
            HplResourceManager
        }
    }
    impl anchor_lang::Id for HplResourceManager {
        fn id() -> Pubkey {
            ID
        }
    }
}
/// Performs method dispatch.
///
/// Each method in an anchor program is uniquely defined by a namespace
/// and a rust identifier (i.e., the name given to the method). These
/// two pieces can be combined to creater a method identifier,
/// specifically, Anchor uses
///
/// Sha256("<namespace>:<rust-identifier>")[..8],
///
/// where the namespace can be one type. "global" for a
/// regular instruction.
///
/// With this 8 byte identifier, Anchor performs method dispatch,
/// matching the given 8 byte identifier to the associated method
/// handler, which leads to user defined code being eventually invoked.
fn dispatch(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    data: &[u8],
) -> anchor_lang::Result<()> {
    let mut ix_data: &[u8] = data;
    let sighash: [u8; 8] = {
        let mut sighash: [u8; 8] = [0; 8];
        sighash.copy_from_slice(&ix_data[..8]);
        ix_data = &ix_data[8..];
        sighash
    };
    use anchor_lang::Discriminator;
    match sighash {
        instruction::CreateResource::DISCRIMINATOR => {
            __private::__global::create_resource(program_id, accounts, ix_data)
        }
        instruction::InitilizeResourceTree::DISCRIMINATOR => {
            __private::__global::initilize_resource_tree(program_id, accounts, ix_data)
        }
        instruction::MintResource::DISCRIMINATOR => {
            __private::__global::mint_resource(program_id, accounts, ix_data)
        }
        instruction::BurnResource::DISCRIMINATOR => {
            __private::__global::burn_resource(program_id, accounts, ix_data)
        }
        instruction::WrapResource::DISCRIMINATOR => {
            __private::__global::wrap_resource(program_id, accounts, ix_data)
        }
        instruction::UnwrapResource::DISCRIMINATOR => {
            __private::__global::unwrap_resource(program_id, accounts, ix_data)
        }
        anchor_lang::idl::IDL_IX_TAG_LE => {
            __private::__idl::__idl_dispatch(program_id, accounts, &ix_data)
        }
        anchor_lang::event::EVENT_IX_TAG_LE => {
            Err(anchor_lang::error::ErrorCode::EventInstructionStub.into())
        }
        _ => Err(anchor_lang::error::ErrorCode::InstructionFallbackNotFound.into()),
    }
}
/// Create a private module to not clutter the program's namespace.
/// Defines an entrypoint for each individual instruction handler
/// wrapper.
mod __private {
    use super::*;
    /// __idl mod defines handlers for injected Anchor IDL instructions.
    pub mod __idl {
        use super::*;
        #[inline(never)]
        #[cfg(not(feature = "no-idl"))]
        pub fn __idl_dispatch(
            program_id: &Pubkey,
            accounts: &[AccountInfo],
            idl_ix_data: &[u8],
        ) -> anchor_lang::Result<()> {
            let mut accounts = accounts;
            let mut data: &[u8] = idl_ix_data;
            let ix = anchor_lang::idl::IdlInstruction::deserialize(&mut data)
                .map_err(|_| {
                    anchor_lang::error::ErrorCode::InstructionDidNotDeserialize
                })?;
            match ix {
                anchor_lang::idl::IdlInstruction::Create { data_len } => {
                    let mut bumps = std::collections::BTreeMap::new();
                    let mut reallocs = std::collections::BTreeSet::new();
                    let mut accounts = IdlCreateAccounts::try_accounts(
                        program_id,
                        &mut accounts,
                        &[],
                        &mut bumps,
                        &mut reallocs,
                    )?;
                    __idl_create_account(program_id, &mut accounts, data_len)?;
                    accounts.exit(program_id)?;
                }
                anchor_lang::idl::IdlInstruction::Resize { data_len } => {
                    let mut bumps = std::collections::BTreeMap::new();
                    let mut reallocs = std::collections::BTreeSet::new();
                    let mut accounts = IdlResizeAccount::try_accounts(
                        program_id,
                        &mut accounts,
                        &[],
                        &mut bumps,
                        &mut reallocs,
                    )?;
                    __idl_resize_account(program_id, &mut accounts, data_len)?;
                    accounts.exit(program_id)?;
                }
                anchor_lang::idl::IdlInstruction::Close => {
                    let mut bumps = std::collections::BTreeMap::new();
                    let mut reallocs = std::collections::BTreeSet::new();
                    let mut accounts = IdlCloseAccount::try_accounts(
                        program_id,
                        &mut accounts,
                        &[],
                        &mut bumps,
                        &mut reallocs,
                    )?;
                    __idl_close_account(program_id, &mut accounts)?;
                    accounts.exit(program_id)?;
                }
                anchor_lang::idl::IdlInstruction::CreateBuffer => {
                    let mut bumps = std::collections::BTreeMap::new();
                    let mut reallocs = std::collections::BTreeSet::new();
                    let mut accounts = IdlCreateBuffer::try_accounts(
                        program_id,
                        &mut accounts,
                        &[],
                        &mut bumps,
                        &mut reallocs,
                    )?;
                    __idl_create_buffer(program_id, &mut accounts)?;
                    accounts.exit(program_id)?;
                }
                anchor_lang::idl::IdlInstruction::Write { data } => {
                    let mut bumps = std::collections::BTreeMap::new();
                    let mut reallocs = std::collections::BTreeSet::new();
                    let mut accounts = IdlAccounts::try_accounts(
                        program_id,
                        &mut accounts,
                        &[],
                        &mut bumps,
                        &mut reallocs,
                    )?;
                    __idl_write(program_id, &mut accounts, data)?;
                    accounts.exit(program_id)?;
                }
                anchor_lang::idl::IdlInstruction::SetAuthority { new_authority } => {
                    let mut bumps = std::collections::BTreeMap::new();
                    let mut reallocs = std::collections::BTreeSet::new();
                    let mut accounts = IdlAccounts::try_accounts(
                        program_id,
                        &mut accounts,
                        &[],
                        &mut bumps,
                        &mut reallocs,
                    )?;
                    __idl_set_authority(program_id, &mut accounts, new_authority)?;
                    accounts.exit(program_id)?;
                }
                anchor_lang::idl::IdlInstruction::SetBuffer => {
                    let mut bumps = std::collections::BTreeMap::new();
                    let mut reallocs = std::collections::BTreeSet::new();
                    let mut accounts = IdlSetBuffer::try_accounts(
                        program_id,
                        &mut accounts,
                        &[],
                        &mut bumps,
                        &mut reallocs,
                    )?;
                    __idl_set_buffer(program_id, &mut accounts)?;
                    accounts.exit(program_id)?;
                }
            }
            Ok(())
        }
        use anchor_lang::idl::ERASED_AUTHORITY;
        pub struct IdlAccount {
            pub authority: Pubkey,
            pub data_len: u32,
        }
        #[automatically_derived]
        impl ::core::fmt::Debug for IdlAccount {
            fn fmt(&self, f: &mut ::core::fmt::Formatter) -> ::core::fmt::Result {
                ::core::fmt::Formatter::debug_struct_field2_finish(
                    f,
                    "IdlAccount",
                    "authority",
                    &self.authority,
                    "data_len",
                    &&self.data_len,
                )
            }
        }
        impl borsh::ser::BorshSerialize for IdlAccount
        where
            Pubkey: borsh::ser::BorshSerialize,
            u32: borsh::ser::BorshSerialize,
        {
            fn serialize<W: borsh::maybestd::io::Write>(
                &self,
                writer: &mut W,
            ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
                borsh::BorshSerialize::serialize(&self.authority, writer)?;
                borsh::BorshSerialize::serialize(&self.data_len, writer)?;
                Ok(())
            }
        }
        impl borsh::de::BorshDeserialize for IdlAccount
        where
            Pubkey: borsh::BorshDeserialize,
            u32: borsh::BorshDeserialize,
        {
            fn deserialize_reader<R: borsh::maybestd::io::Read>(
                reader: &mut R,
            ) -> ::core::result::Result<Self, borsh::maybestd::io::Error> {
                Ok(Self {
                    authority: borsh::BorshDeserialize::deserialize_reader(reader)?,
                    data_len: borsh::BorshDeserialize::deserialize_reader(reader)?,
                })
            }
        }
        #[automatically_derived]
        impl ::core::clone::Clone for IdlAccount {
            #[inline]
            fn clone(&self) -> IdlAccount {
                IdlAccount {
                    authority: ::core::clone::Clone::clone(&self.authority),
                    data_len: ::core::clone::Clone::clone(&self.data_len),
                }
            }
        }
        #[automatically_derived]
        impl anchor_lang::AccountSerialize for IdlAccount {
            fn try_serialize<W: std::io::Write>(
                &self,
                writer: &mut W,
            ) -> anchor_lang::Result<()> {
                if writer.write_all(&[24, 70, 98, 191, 58, 144, 123, 158]).is_err() {
                    return Err(
                        anchor_lang::error::ErrorCode::AccountDidNotSerialize.into(),
                    );
                }
                if AnchorSerialize::serialize(self, writer).is_err() {
                    return Err(
                        anchor_lang::error::ErrorCode::AccountDidNotSerialize.into(),
                    );
                }
                Ok(())
            }
        }
        #[automatically_derived]
        impl anchor_lang::AccountDeserialize for IdlAccount {
            fn try_deserialize(buf: &mut &[u8]) -> anchor_lang::Result<Self> {
                if buf.len() < [24, 70, 98, 191, 58, 144, 123, 158].len() {
                    return Err(
                        anchor_lang::error::ErrorCode::AccountDiscriminatorNotFound
                            .into(),
                    );
                }
                let given_disc = &buf[..8];
                if &[24, 70, 98, 191, 58, 144, 123, 158] != given_disc {
                    return Err(
                        anchor_lang::error::Error::from(anchor_lang::error::AnchorError {
                                error_name: anchor_lang::error::ErrorCode::AccountDiscriminatorMismatch
                                    .name(),
                                error_code_number: anchor_lang::error::ErrorCode::AccountDiscriminatorMismatch
                                    .into(),
                                error_msg: anchor_lang::error::ErrorCode::AccountDiscriminatorMismatch
                                    .to_string(),
                                error_origin: Some(
                                    anchor_lang::error::ErrorOrigin::Source(anchor_lang::error::Source {
                                        filename: "programs/hpl-resource-manager/src/lib.rs",
                                        line: 12u32,
                                    }),
                                ),
                                compared_values: None,
                            })
                            .with_account_name("IdlAccount"),
                    );
                }
                Self::try_deserialize_unchecked(buf)
            }
            fn try_deserialize_unchecked(buf: &mut &[u8]) -> anchor_lang::Result<Self> {
                let mut data: &[u8] = &buf[8..];
                AnchorDeserialize::deserialize(&mut data)
                    .map_err(|_| {
                        anchor_lang::error::ErrorCode::AccountDidNotDeserialize.into()
                    })
            }
        }
        #[automatically_derived]
        impl anchor_lang::Discriminator for IdlAccount {
            const DISCRIMINATOR: [u8; 8] = [24, 70, 98, 191, 58, 144, 123, 158];
        }
        impl IdlAccount {
            pub fn address(program_id: &Pubkey) -> Pubkey {
                let program_signer = Pubkey::find_program_address(&[], program_id).0;
                Pubkey::create_with_seed(&program_signer, IdlAccount::seed(), program_id)
                    .expect("Seed is always valid")
            }
            pub fn seed() -> &'static str {
                "anchor:idl"
            }
        }
        impl anchor_lang::Owner for IdlAccount {
            fn owner() -> Pubkey {
                crate::ID
            }
        }
        pub struct IdlCreateAccounts<'info> {
            #[account(signer)]
            pub from: AccountInfo<'info>,
            #[account(mut)]
            pub to: AccountInfo<'info>,
            #[account(seeds = [], bump)]
            pub base: AccountInfo<'info>,
            pub system_program: Program<'info, System>,
            #[account(executable)]
            pub program: AccountInfo<'info>,
        }
        #[automatically_derived]
        impl<'info> anchor_lang::Accounts<'info> for IdlCreateAccounts<'info>
        where
            'info: 'info,
        {
            #[inline(never)]
            fn try_accounts(
                __program_id: &anchor_lang::solana_program::pubkey::Pubkey,
                __accounts: &mut &[anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >],
                __ix_data: &[u8],
                __bumps: &mut std::collections::BTreeMap<String, u8>,
                __reallocs: &mut std::collections::BTreeSet<
                    anchor_lang::solana_program::pubkey::Pubkey,
                >,
            ) -> anchor_lang::Result<Self> {
                let from: AccountInfo = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("from"))?;
                let to: AccountInfo = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("to"))?;
                let base: AccountInfo = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("base"))?;
                let system_program: anchor_lang::accounts::program::Program<System> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("system_program"))?;
                let program: AccountInfo = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("program"))?;
                if !from.is_signer {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintSigner,
                            )
                            .with_account_name("from"),
                    );
                }
                if !to.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("to"),
                    );
                }
                let (__pda_address, __bump) = Pubkey::find_program_address(
                    &[],
                    &__program_id,
                );
                __bumps.insert("base".to_string(), __bump);
                if base.key() != __pda_address {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintSeeds,
                            )
                            .with_account_name("base")
                            .with_pubkeys((base.key(), __pda_address)),
                    );
                }
                if !program.to_account_info().executable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintExecutable,
                            )
                            .with_account_name("program"),
                    );
                }
                Ok(IdlCreateAccounts {
                    from,
                    to,
                    base,
                    system_program,
                    program,
                })
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::ToAccountInfos<'info> for IdlCreateAccounts<'info>
        where
            'info: 'info,
        {
            fn to_account_infos(
                &self,
            ) -> Vec<anchor_lang::solana_program::account_info::AccountInfo<'info>> {
                let mut account_infos = ::alloc::vec::Vec::new();
                account_infos.extend(self.from.to_account_infos());
                account_infos.extend(self.to.to_account_infos());
                account_infos.extend(self.base.to_account_infos());
                account_infos.extend(self.system_program.to_account_infos());
                account_infos.extend(self.program.to_account_infos());
                account_infos
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::ToAccountMetas for IdlCreateAccounts<'info> {
            fn to_account_metas(
                &self,
                is_signer: Option<bool>,
            ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                let mut account_metas = ::alloc::vec::Vec::new();
                account_metas.extend(self.from.to_account_metas(Some(true)));
                account_metas.extend(self.to.to_account_metas(None));
                account_metas.extend(self.base.to_account_metas(None));
                account_metas.extend(self.system_program.to_account_metas(None));
                account_metas.extend(self.program.to_account_metas(None));
                account_metas
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::AccountsExit<'info> for IdlCreateAccounts<'info>
        where
            'info: 'info,
        {
            fn exit(
                &self,
                program_id: &anchor_lang::solana_program::pubkey::Pubkey,
            ) -> anchor_lang::Result<()> {
                anchor_lang::AccountsExit::exit(&self.to, program_id)
                    .map_err(|e| e.with_account_name("to"))?;
                Ok(())
            }
        }
        /// An internal, Anchor generated module. This is used (as an
        /// implementation detail), to generate a struct for a given
        /// `#[derive(Accounts)]` implementation, where each field is a Pubkey,
        /// instead of an `AccountInfo`. This is useful for clients that want
        /// to generate a list of accounts, without explicitly knowing the
        /// order all the fields should be in.
        ///
        /// To access the struct in this module, one should use the sibling
        /// `accounts` module (also generated), which re-exports this.
        pub(crate) mod __client_accounts_idl_create_accounts {
            use super::*;
            use anchor_lang::prelude::borsh;
            /// Generated client accounts for [`IdlCreateAccounts`].
            pub struct IdlCreateAccounts {
                pub from: anchor_lang::solana_program::pubkey::Pubkey,
                pub to: anchor_lang::solana_program::pubkey::Pubkey,
                pub base: anchor_lang::solana_program::pubkey::Pubkey,
                pub system_program: anchor_lang::solana_program::pubkey::Pubkey,
                pub program: anchor_lang::solana_program::pubkey::Pubkey,
            }
            impl borsh::ser::BorshSerialize for IdlCreateAccounts
            where
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
            {
                fn serialize<W: borsh::maybestd::io::Write>(
                    &self,
                    writer: &mut W,
                ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
                    borsh::BorshSerialize::serialize(&self.from, writer)?;
                    borsh::BorshSerialize::serialize(&self.to, writer)?;
                    borsh::BorshSerialize::serialize(&self.base, writer)?;
                    borsh::BorshSerialize::serialize(&self.system_program, writer)?;
                    borsh::BorshSerialize::serialize(&self.program, writer)?;
                    Ok(())
                }
            }
            #[automatically_derived]
            impl anchor_lang::ToAccountMetas for IdlCreateAccounts {
                fn to_account_metas(
                    &self,
                    is_signer: Option<bool>,
                ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                    let mut account_metas = ::alloc::vec::Vec::new();
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.from,
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.to,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.base,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.system_program,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.program,
                                false,
                            ),
                        );
                    account_metas
                }
            }
        }
        /// An internal, Anchor generated module. This is used (as an
        /// implementation detail), to generate a CPI struct for a given
        /// `#[derive(Accounts)]` implementation, where each field is an
        /// AccountInfo.
        ///
        /// To access the struct in this module, one should use the sibling
        /// [`cpi::accounts`] module (also generated), which re-exports this.
        pub(crate) mod __cpi_client_accounts_idl_create_accounts {
            use super::*;
            /// Generated CPI struct of the accounts for [`IdlCreateAccounts`].
            pub struct IdlCreateAccounts<'info> {
                pub from: anchor_lang::solana_program::account_info::AccountInfo<'info>,
                pub to: anchor_lang::solana_program::account_info::AccountInfo<'info>,
                pub base: anchor_lang::solana_program::account_info::AccountInfo<'info>,
                pub system_program: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub program: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
            }
            #[automatically_derived]
            impl<'info> anchor_lang::ToAccountMetas for IdlCreateAccounts<'info> {
                fn to_account_metas(
                    &self,
                    is_signer: Option<bool>,
                ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                    let mut account_metas = ::alloc::vec::Vec::new();
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.from),
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.to),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.base),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.system_program),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.program),
                                false,
                            ),
                        );
                    account_metas
                }
            }
            #[automatically_derived]
            impl<'info> anchor_lang::ToAccountInfos<'info> for IdlCreateAccounts<'info> {
                fn to_account_infos(
                    &self,
                ) -> Vec<anchor_lang::solana_program::account_info::AccountInfo<'info>> {
                    let mut account_infos = ::alloc::vec::Vec::new();
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.from),
                        );
                    account_infos
                        .extend(anchor_lang::ToAccountInfos::to_account_infos(&self.to));
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.base),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.system_program,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.program),
                        );
                    account_infos
                }
            }
        }
        pub struct IdlAccounts<'info> {
            #[account(mut, has_one = authority)]
            pub idl: Account<'info, IdlAccount>,
            #[account(constraint = authority.key!= &ERASED_AUTHORITY)]
            pub authority: Signer<'info>,
        }
        #[automatically_derived]
        impl<'info> anchor_lang::Accounts<'info> for IdlAccounts<'info>
        where
            'info: 'info,
        {
            #[inline(never)]
            fn try_accounts(
                __program_id: &anchor_lang::solana_program::pubkey::Pubkey,
                __accounts: &mut &[anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >],
                __ix_data: &[u8],
                __bumps: &mut std::collections::BTreeMap<String, u8>,
                __reallocs: &mut std::collections::BTreeSet<
                    anchor_lang::solana_program::pubkey::Pubkey,
                >,
            ) -> anchor_lang::Result<Self> {
                let idl: anchor_lang::accounts::account::Account<IdlAccount> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("idl"))?;
                let authority: Signer = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("authority"))?;
                if !idl.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("idl"),
                    );
                }
                {
                    let my_key = idl.authority;
                    let target_key = authority.key();
                    if my_key != target_key {
                        return Err(
                            anchor_lang::error::Error::from(
                                    anchor_lang::error::ErrorCode::ConstraintHasOne,
                                )
                                .with_account_name("idl")
                                .with_pubkeys((my_key, target_key)),
                        );
                    }
                }
                if !(authority.key != &ERASED_AUTHORITY) {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintRaw,
                            )
                            .with_account_name("authority"),
                    );
                }
                Ok(IdlAccounts { idl, authority })
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::ToAccountInfos<'info> for IdlAccounts<'info>
        where
            'info: 'info,
        {
            fn to_account_infos(
                &self,
            ) -> Vec<anchor_lang::solana_program::account_info::AccountInfo<'info>> {
                let mut account_infos = ::alloc::vec::Vec::new();
                account_infos.extend(self.idl.to_account_infos());
                account_infos.extend(self.authority.to_account_infos());
                account_infos
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::ToAccountMetas for IdlAccounts<'info> {
            fn to_account_metas(
                &self,
                is_signer: Option<bool>,
            ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                let mut account_metas = ::alloc::vec::Vec::new();
                account_metas.extend(self.idl.to_account_metas(None));
                account_metas.extend(self.authority.to_account_metas(None));
                account_metas
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::AccountsExit<'info> for IdlAccounts<'info>
        where
            'info: 'info,
        {
            fn exit(
                &self,
                program_id: &anchor_lang::solana_program::pubkey::Pubkey,
            ) -> anchor_lang::Result<()> {
                anchor_lang::AccountsExit::exit(&self.idl, program_id)
                    .map_err(|e| e.with_account_name("idl"))?;
                Ok(())
            }
        }
        /// An internal, Anchor generated module. This is used (as an
        /// implementation detail), to generate a struct for a given
        /// `#[derive(Accounts)]` implementation, where each field is a Pubkey,
        /// instead of an `AccountInfo`. This is useful for clients that want
        /// to generate a list of accounts, without explicitly knowing the
        /// order all the fields should be in.
        ///
        /// To access the struct in this module, one should use the sibling
        /// `accounts` module (also generated), which re-exports this.
        pub(crate) mod __client_accounts_idl_accounts {
            use super::*;
            use anchor_lang::prelude::borsh;
            /// Generated client accounts for [`IdlAccounts`].
            pub struct IdlAccounts {
                pub idl: anchor_lang::solana_program::pubkey::Pubkey,
                pub authority: anchor_lang::solana_program::pubkey::Pubkey,
            }
            impl borsh::ser::BorshSerialize for IdlAccounts
            where
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
            {
                fn serialize<W: borsh::maybestd::io::Write>(
                    &self,
                    writer: &mut W,
                ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
                    borsh::BorshSerialize::serialize(&self.idl, writer)?;
                    borsh::BorshSerialize::serialize(&self.authority, writer)?;
                    Ok(())
                }
            }
            #[automatically_derived]
            impl anchor_lang::ToAccountMetas for IdlAccounts {
                fn to_account_metas(
                    &self,
                    is_signer: Option<bool>,
                ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                    let mut account_metas = ::alloc::vec::Vec::new();
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.idl,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.authority,
                                true,
                            ),
                        );
                    account_metas
                }
            }
        }
        /// An internal, Anchor generated module. This is used (as an
        /// implementation detail), to generate a CPI struct for a given
        /// `#[derive(Accounts)]` implementation, where each field is an
        /// AccountInfo.
        ///
        /// To access the struct in this module, one should use the sibling
        /// [`cpi::accounts`] module (also generated), which re-exports this.
        pub(crate) mod __cpi_client_accounts_idl_accounts {
            use super::*;
            /// Generated CPI struct of the accounts for [`IdlAccounts`].
            pub struct IdlAccounts<'info> {
                pub idl: anchor_lang::solana_program::account_info::AccountInfo<'info>,
                pub authority: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
            }
            #[automatically_derived]
            impl<'info> anchor_lang::ToAccountMetas for IdlAccounts<'info> {
                fn to_account_metas(
                    &self,
                    is_signer: Option<bool>,
                ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                    let mut account_metas = ::alloc::vec::Vec::new();
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.idl),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.authority),
                                true,
                            ),
                        );
                    account_metas
                }
            }
            #[automatically_derived]
            impl<'info> anchor_lang::ToAccountInfos<'info> for IdlAccounts<'info> {
                fn to_account_infos(
                    &self,
                ) -> Vec<anchor_lang::solana_program::account_info::AccountInfo<'info>> {
                    let mut account_infos = ::alloc::vec::Vec::new();
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.idl),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.authority,
                            ),
                        );
                    account_infos
                }
            }
        }
        pub struct IdlResizeAccount<'info> {
            #[account(mut, has_one = authority)]
            pub idl: Account<'info, IdlAccount>,
            #[account(mut, constraint = authority.key!= &ERASED_AUTHORITY)]
            pub authority: Signer<'info>,
            pub system_program: Program<'info, System>,
        }
        #[automatically_derived]
        impl<'info> anchor_lang::Accounts<'info> for IdlResizeAccount<'info>
        where
            'info: 'info,
        {
            #[inline(never)]
            fn try_accounts(
                __program_id: &anchor_lang::solana_program::pubkey::Pubkey,
                __accounts: &mut &[anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >],
                __ix_data: &[u8],
                __bumps: &mut std::collections::BTreeMap<String, u8>,
                __reallocs: &mut std::collections::BTreeSet<
                    anchor_lang::solana_program::pubkey::Pubkey,
                >,
            ) -> anchor_lang::Result<Self> {
                let idl: anchor_lang::accounts::account::Account<IdlAccount> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("idl"))?;
                let authority: Signer = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("authority"))?;
                let system_program: anchor_lang::accounts::program::Program<System> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("system_program"))?;
                if !idl.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("idl"),
                    );
                }
                {
                    let my_key = idl.authority;
                    let target_key = authority.key();
                    if my_key != target_key {
                        return Err(
                            anchor_lang::error::Error::from(
                                    anchor_lang::error::ErrorCode::ConstraintHasOne,
                                )
                                .with_account_name("idl")
                                .with_pubkeys((my_key, target_key)),
                        );
                    }
                }
                if !authority.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("authority"),
                    );
                }
                if !(authority.key != &ERASED_AUTHORITY) {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintRaw,
                            )
                            .with_account_name("authority"),
                    );
                }
                Ok(IdlResizeAccount {
                    idl,
                    authority,
                    system_program,
                })
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::ToAccountInfos<'info> for IdlResizeAccount<'info>
        where
            'info: 'info,
        {
            fn to_account_infos(
                &self,
            ) -> Vec<anchor_lang::solana_program::account_info::AccountInfo<'info>> {
                let mut account_infos = ::alloc::vec::Vec::new();
                account_infos.extend(self.idl.to_account_infos());
                account_infos.extend(self.authority.to_account_infos());
                account_infos.extend(self.system_program.to_account_infos());
                account_infos
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::ToAccountMetas for IdlResizeAccount<'info> {
            fn to_account_metas(
                &self,
                is_signer: Option<bool>,
            ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                let mut account_metas = ::alloc::vec::Vec::new();
                account_metas.extend(self.idl.to_account_metas(None));
                account_metas.extend(self.authority.to_account_metas(None));
                account_metas.extend(self.system_program.to_account_metas(None));
                account_metas
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::AccountsExit<'info> for IdlResizeAccount<'info>
        where
            'info: 'info,
        {
            fn exit(
                &self,
                program_id: &anchor_lang::solana_program::pubkey::Pubkey,
            ) -> anchor_lang::Result<()> {
                anchor_lang::AccountsExit::exit(&self.idl, program_id)
                    .map_err(|e| e.with_account_name("idl"))?;
                anchor_lang::AccountsExit::exit(&self.authority, program_id)
                    .map_err(|e| e.with_account_name("authority"))?;
                Ok(())
            }
        }
        /// An internal, Anchor generated module. This is used (as an
        /// implementation detail), to generate a struct for a given
        /// `#[derive(Accounts)]` implementation, where each field is a Pubkey,
        /// instead of an `AccountInfo`. This is useful for clients that want
        /// to generate a list of accounts, without explicitly knowing the
        /// order all the fields should be in.
        ///
        /// To access the struct in this module, one should use the sibling
        /// `accounts` module (also generated), which re-exports this.
        pub(crate) mod __client_accounts_idl_resize_account {
            use super::*;
            use anchor_lang::prelude::borsh;
            /// Generated client accounts for [`IdlResizeAccount`].
            pub struct IdlResizeAccount {
                pub idl: anchor_lang::solana_program::pubkey::Pubkey,
                pub authority: anchor_lang::solana_program::pubkey::Pubkey,
                pub system_program: anchor_lang::solana_program::pubkey::Pubkey,
            }
            impl borsh::ser::BorshSerialize for IdlResizeAccount
            where
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
            {
                fn serialize<W: borsh::maybestd::io::Write>(
                    &self,
                    writer: &mut W,
                ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
                    borsh::BorshSerialize::serialize(&self.idl, writer)?;
                    borsh::BorshSerialize::serialize(&self.authority, writer)?;
                    borsh::BorshSerialize::serialize(&self.system_program, writer)?;
                    Ok(())
                }
            }
            #[automatically_derived]
            impl anchor_lang::ToAccountMetas for IdlResizeAccount {
                fn to_account_metas(
                    &self,
                    is_signer: Option<bool>,
                ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                    let mut account_metas = ::alloc::vec::Vec::new();
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.idl,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.authority,
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.system_program,
                                false,
                            ),
                        );
                    account_metas
                }
            }
        }
        /// An internal, Anchor generated module. This is used (as an
        /// implementation detail), to generate a CPI struct for a given
        /// `#[derive(Accounts)]` implementation, where each field is an
        /// AccountInfo.
        ///
        /// To access the struct in this module, one should use the sibling
        /// [`cpi::accounts`] module (also generated), which re-exports this.
        pub(crate) mod __cpi_client_accounts_idl_resize_account {
            use super::*;
            /// Generated CPI struct of the accounts for [`IdlResizeAccount`].
            pub struct IdlResizeAccount<'info> {
                pub idl: anchor_lang::solana_program::account_info::AccountInfo<'info>,
                pub authority: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub system_program: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
            }
            #[automatically_derived]
            impl<'info> anchor_lang::ToAccountMetas for IdlResizeAccount<'info> {
                fn to_account_metas(
                    &self,
                    is_signer: Option<bool>,
                ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                    let mut account_metas = ::alloc::vec::Vec::new();
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.idl),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.authority),
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.system_program),
                                false,
                            ),
                        );
                    account_metas
                }
            }
            #[automatically_derived]
            impl<'info> anchor_lang::ToAccountInfos<'info> for IdlResizeAccount<'info> {
                fn to_account_infos(
                    &self,
                ) -> Vec<anchor_lang::solana_program::account_info::AccountInfo<'info>> {
                    let mut account_infos = ::alloc::vec::Vec::new();
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.idl),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.authority,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.system_program,
                            ),
                        );
                    account_infos
                }
            }
        }
        pub struct IdlCreateBuffer<'info> {
            #[account(zero)]
            pub buffer: Account<'info, IdlAccount>,
            #[account(constraint = authority.key!= &ERASED_AUTHORITY)]
            pub authority: Signer<'info>,
        }
        #[automatically_derived]
        impl<'info> anchor_lang::Accounts<'info> for IdlCreateBuffer<'info>
        where
            'info: 'info,
        {
            #[inline(never)]
            fn try_accounts(
                __program_id: &anchor_lang::solana_program::pubkey::Pubkey,
                __accounts: &mut &[anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >],
                __ix_data: &[u8],
                __bumps: &mut std::collections::BTreeMap<String, u8>,
                __reallocs: &mut std::collections::BTreeSet<
                    anchor_lang::solana_program::pubkey::Pubkey,
                >,
            ) -> anchor_lang::Result<Self> {
                if __accounts.is_empty() {
                    return Err(
                        anchor_lang::error::ErrorCode::AccountNotEnoughKeys.into(),
                    );
                }
                let buffer = &__accounts[0];
                *__accounts = &__accounts[1..];
                let authority: Signer = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("authority"))?;
                let __anchor_rent = Rent::get()?;
                let buffer: anchor_lang::accounts::account::Account<IdlAccount> = {
                    let mut __data: &[u8] = &buffer.try_borrow_data()?;
                    let mut __disc_bytes = [0u8; 8];
                    __disc_bytes.copy_from_slice(&__data[..8]);
                    let __discriminator = u64::from_le_bytes(__disc_bytes);
                    if __discriminator != 0 {
                        return Err(
                            anchor_lang::error::Error::from(
                                    anchor_lang::error::ErrorCode::ConstraintZero,
                                )
                                .with_account_name("buffer"),
                        );
                    }
                    match anchor_lang::accounts::account::Account::try_from_unchecked(
                        &buffer,
                    ) {
                        Ok(val) => val,
                        Err(e) => return Err(e.with_account_name("buffer")),
                    }
                };
                if !buffer.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("buffer"),
                    );
                }
                if !__anchor_rent
                    .is_exempt(
                        buffer.to_account_info().lamports(),
                        buffer.to_account_info().try_data_len()?,
                    )
                {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintRentExempt,
                            )
                            .with_account_name("buffer"),
                    );
                }
                if !(authority.key != &ERASED_AUTHORITY) {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintRaw,
                            )
                            .with_account_name("authority"),
                    );
                }
                Ok(IdlCreateBuffer {
                    buffer,
                    authority,
                })
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::ToAccountInfos<'info> for IdlCreateBuffer<'info>
        where
            'info: 'info,
        {
            fn to_account_infos(
                &self,
            ) -> Vec<anchor_lang::solana_program::account_info::AccountInfo<'info>> {
                let mut account_infos = ::alloc::vec::Vec::new();
                account_infos.extend(self.buffer.to_account_infos());
                account_infos.extend(self.authority.to_account_infos());
                account_infos
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::ToAccountMetas for IdlCreateBuffer<'info> {
            fn to_account_metas(
                &self,
                is_signer: Option<bool>,
            ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                let mut account_metas = ::alloc::vec::Vec::new();
                account_metas.extend(self.buffer.to_account_metas(None));
                account_metas.extend(self.authority.to_account_metas(None));
                account_metas
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::AccountsExit<'info> for IdlCreateBuffer<'info>
        where
            'info: 'info,
        {
            fn exit(
                &self,
                program_id: &anchor_lang::solana_program::pubkey::Pubkey,
            ) -> anchor_lang::Result<()> {
                anchor_lang::AccountsExit::exit(&self.buffer, program_id)
                    .map_err(|e| e.with_account_name("buffer"))?;
                Ok(())
            }
        }
        /// An internal, Anchor generated module. This is used (as an
        /// implementation detail), to generate a struct for a given
        /// `#[derive(Accounts)]` implementation, where each field is a Pubkey,
        /// instead of an `AccountInfo`. This is useful for clients that want
        /// to generate a list of accounts, without explicitly knowing the
        /// order all the fields should be in.
        ///
        /// To access the struct in this module, one should use the sibling
        /// `accounts` module (also generated), which re-exports this.
        pub(crate) mod __client_accounts_idl_create_buffer {
            use super::*;
            use anchor_lang::prelude::borsh;
            /// Generated client accounts for [`IdlCreateBuffer`].
            pub struct IdlCreateBuffer {
                pub buffer: anchor_lang::solana_program::pubkey::Pubkey,
                pub authority: anchor_lang::solana_program::pubkey::Pubkey,
            }
            impl borsh::ser::BorshSerialize for IdlCreateBuffer
            where
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
            {
                fn serialize<W: borsh::maybestd::io::Write>(
                    &self,
                    writer: &mut W,
                ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
                    borsh::BorshSerialize::serialize(&self.buffer, writer)?;
                    borsh::BorshSerialize::serialize(&self.authority, writer)?;
                    Ok(())
                }
            }
            #[automatically_derived]
            impl anchor_lang::ToAccountMetas for IdlCreateBuffer {
                fn to_account_metas(
                    &self,
                    is_signer: Option<bool>,
                ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                    let mut account_metas = ::alloc::vec::Vec::new();
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.buffer,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.authority,
                                true,
                            ),
                        );
                    account_metas
                }
            }
        }
        /// An internal, Anchor generated module. This is used (as an
        /// implementation detail), to generate a CPI struct for a given
        /// `#[derive(Accounts)]` implementation, where each field is an
        /// AccountInfo.
        ///
        /// To access the struct in this module, one should use the sibling
        /// [`cpi::accounts`] module (also generated), which re-exports this.
        pub(crate) mod __cpi_client_accounts_idl_create_buffer {
            use super::*;
            /// Generated CPI struct of the accounts for [`IdlCreateBuffer`].
            pub struct IdlCreateBuffer<'info> {
                pub buffer: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub authority: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
            }
            #[automatically_derived]
            impl<'info> anchor_lang::ToAccountMetas for IdlCreateBuffer<'info> {
                fn to_account_metas(
                    &self,
                    is_signer: Option<bool>,
                ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                    let mut account_metas = ::alloc::vec::Vec::new();
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.buffer),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.authority),
                                true,
                            ),
                        );
                    account_metas
                }
            }
            #[automatically_derived]
            impl<'info> anchor_lang::ToAccountInfos<'info> for IdlCreateBuffer<'info> {
                fn to_account_infos(
                    &self,
                ) -> Vec<anchor_lang::solana_program::account_info::AccountInfo<'info>> {
                    let mut account_infos = ::alloc::vec::Vec::new();
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.buffer),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.authority,
                            ),
                        );
                    account_infos
                }
            }
        }
        pub struct IdlSetBuffer<'info> {
            #[account(mut, constraint = buffer.authority = = idl.authority)]
            pub buffer: Account<'info, IdlAccount>,
            #[account(mut, has_one = authority)]
            pub idl: Account<'info, IdlAccount>,
            #[account(constraint = authority.key!= &ERASED_AUTHORITY)]
            pub authority: Signer<'info>,
        }
        #[automatically_derived]
        impl<'info> anchor_lang::Accounts<'info> for IdlSetBuffer<'info>
        where
            'info: 'info,
        {
            #[inline(never)]
            fn try_accounts(
                __program_id: &anchor_lang::solana_program::pubkey::Pubkey,
                __accounts: &mut &[anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >],
                __ix_data: &[u8],
                __bumps: &mut std::collections::BTreeMap<String, u8>,
                __reallocs: &mut std::collections::BTreeSet<
                    anchor_lang::solana_program::pubkey::Pubkey,
                >,
            ) -> anchor_lang::Result<Self> {
                let buffer: anchor_lang::accounts::account::Account<IdlAccount> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("buffer"))?;
                let idl: anchor_lang::accounts::account::Account<IdlAccount> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("idl"))?;
                let authority: Signer = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("authority"))?;
                if !buffer.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("buffer"),
                    );
                }
                if !(buffer.authority == idl.authority) {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintRaw,
                            )
                            .with_account_name("buffer"),
                    );
                }
                if !idl.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("idl"),
                    );
                }
                {
                    let my_key = idl.authority;
                    let target_key = authority.key();
                    if my_key != target_key {
                        return Err(
                            anchor_lang::error::Error::from(
                                    anchor_lang::error::ErrorCode::ConstraintHasOne,
                                )
                                .with_account_name("idl")
                                .with_pubkeys((my_key, target_key)),
                        );
                    }
                }
                if !(authority.key != &ERASED_AUTHORITY) {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintRaw,
                            )
                            .with_account_name("authority"),
                    );
                }
                Ok(IdlSetBuffer {
                    buffer,
                    idl,
                    authority,
                })
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::ToAccountInfos<'info> for IdlSetBuffer<'info>
        where
            'info: 'info,
        {
            fn to_account_infos(
                &self,
            ) -> Vec<anchor_lang::solana_program::account_info::AccountInfo<'info>> {
                let mut account_infos = ::alloc::vec::Vec::new();
                account_infos.extend(self.buffer.to_account_infos());
                account_infos.extend(self.idl.to_account_infos());
                account_infos.extend(self.authority.to_account_infos());
                account_infos
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::ToAccountMetas for IdlSetBuffer<'info> {
            fn to_account_metas(
                &self,
                is_signer: Option<bool>,
            ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                let mut account_metas = ::alloc::vec::Vec::new();
                account_metas.extend(self.buffer.to_account_metas(None));
                account_metas.extend(self.idl.to_account_metas(None));
                account_metas.extend(self.authority.to_account_metas(None));
                account_metas
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::AccountsExit<'info> for IdlSetBuffer<'info>
        where
            'info: 'info,
        {
            fn exit(
                &self,
                program_id: &anchor_lang::solana_program::pubkey::Pubkey,
            ) -> anchor_lang::Result<()> {
                anchor_lang::AccountsExit::exit(&self.buffer, program_id)
                    .map_err(|e| e.with_account_name("buffer"))?;
                anchor_lang::AccountsExit::exit(&self.idl, program_id)
                    .map_err(|e| e.with_account_name("idl"))?;
                Ok(())
            }
        }
        /// An internal, Anchor generated module. This is used (as an
        /// implementation detail), to generate a struct for a given
        /// `#[derive(Accounts)]` implementation, where each field is a Pubkey,
        /// instead of an `AccountInfo`. This is useful for clients that want
        /// to generate a list of accounts, without explicitly knowing the
        /// order all the fields should be in.
        ///
        /// To access the struct in this module, one should use the sibling
        /// `accounts` module (also generated), which re-exports this.
        pub(crate) mod __client_accounts_idl_set_buffer {
            use super::*;
            use anchor_lang::prelude::borsh;
            /// Generated client accounts for [`IdlSetBuffer`].
            pub struct IdlSetBuffer {
                pub buffer: anchor_lang::solana_program::pubkey::Pubkey,
                pub idl: anchor_lang::solana_program::pubkey::Pubkey,
                pub authority: anchor_lang::solana_program::pubkey::Pubkey,
            }
            impl borsh::ser::BorshSerialize for IdlSetBuffer
            where
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
            {
                fn serialize<W: borsh::maybestd::io::Write>(
                    &self,
                    writer: &mut W,
                ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
                    borsh::BorshSerialize::serialize(&self.buffer, writer)?;
                    borsh::BorshSerialize::serialize(&self.idl, writer)?;
                    borsh::BorshSerialize::serialize(&self.authority, writer)?;
                    Ok(())
                }
            }
            #[automatically_derived]
            impl anchor_lang::ToAccountMetas for IdlSetBuffer {
                fn to_account_metas(
                    &self,
                    is_signer: Option<bool>,
                ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                    let mut account_metas = ::alloc::vec::Vec::new();
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.buffer,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.idl,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.authority,
                                true,
                            ),
                        );
                    account_metas
                }
            }
        }
        /// An internal, Anchor generated module. This is used (as an
        /// implementation detail), to generate a CPI struct for a given
        /// `#[derive(Accounts)]` implementation, where each field is an
        /// AccountInfo.
        ///
        /// To access the struct in this module, one should use the sibling
        /// [`cpi::accounts`] module (also generated), which re-exports this.
        pub(crate) mod __cpi_client_accounts_idl_set_buffer {
            use super::*;
            /// Generated CPI struct of the accounts for [`IdlSetBuffer`].
            pub struct IdlSetBuffer<'info> {
                pub buffer: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub idl: anchor_lang::solana_program::account_info::AccountInfo<'info>,
                pub authority: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
            }
            #[automatically_derived]
            impl<'info> anchor_lang::ToAccountMetas for IdlSetBuffer<'info> {
                fn to_account_metas(
                    &self,
                    is_signer: Option<bool>,
                ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                    let mut account_metas = ::alloc::vec::Vec::new();
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.buffer),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.idl),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.authority),
                                true,
                            ),
                        );
                    account_metas
                }
            }
            #[automatically_derived]
            impl<'info> anchor_lang::ToAccountInfos<'info> for IdlSetBuffer<'info> {
                fn to_account_infos(
                    &self,
                ) -> Vec<anchor_lang::solana_program::account_info::AccountInfo<'info>> {
                    let mut account_infos = ::alloc::vec::Vec::new();
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.buffer),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.idl),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.authority,
                            ),
                        );
                    account_infos
                }
            }
        }
        pub struct IdlCloseAccount<'info> {
            #[account(mut, has_one = authority, close = sol_destination)]
            pub account: Account<'info, IdlAccount>,
            #[account(constraint = authority.key!= &ERASED_AUTHORITY)]
            pub authority: Signer<'info>,
            #[account(mut)]
            pub sol_destination: AccountInfo<'info>,
        }
        #[automatically_derived]
        impl<'info> anchor_lang::Accounts<'info> for IdlCloseAccount<'info>
        where
            'info: 'info,
        {
            #[inline(never)]
            fn try_accounts(
                __program_id: &anchor_lang::solana_program::pubkey::Pubkey,
                __accounts: &mut &[anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >],
                __ix_data: &[u8],
                __bumps: &mut std::collections::BTreeMap<String, u8>,
                __reallocs: &mut std::collections::BTreeSet<
                    anchor_lang::solana_program::pubkey::Pubkey,
                >,
            ) -> anchor_lang::Result<Self> {
                let account: anchor_lang::accounts::account::Account<IdlAccount> = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("account"))?;
                let authority: Signer = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("authority"))?;
                let sol_destination: AccountInfo = anchor_lang::Accounts::try_accounts(
                        __program_id,
                        __accounts,
                        __ix_data,
                        __bumps,
                        __reallocs,
                    )
                    .map_err(|e| e.with_account_name("sol_destination"))?;
                if !account.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("account"),
                    );
                }
                {
                    let my_key = account.authority;
                    let target_key = authority.key();
                    if my_key != target_key {
                        return Err(
                            anchor_lang::error::Error::from(
                                    anchor_lang::error::ErrorCode::ConstraintHasOne,
                                )
                                .with_account_name("account")
                                .with_pubkeys((my_key, target_key)),
                        );
                    }
                }
                {
                    if account.key() == sol_destination.key() {
                        return Err(
                            anchor_lang::error::Error::from(
                                    anchor_lang::error::ErrorCode::ConstraintClose,
                                )
                                .with_account_name("account"),
                        );
                    }
                }
                if !(authority.key != &ERASED_AUTHORITY) {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintRaw,
                            )
                            .with_account_name("authority"),
                    );
                }
                if !sol_destination.to_account_info().is_writable {
                    return Err(
                        anchor_lang::error::Error::from(
                                anchor_lang::error::ErrorCode::ConstraintMut,
                            )
                            .with_account_name("sol_destination"),
                    );
                }
                Ok(IdlCloseAccount {
                    account,
                    authority,
                    sol_destination,
                })
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::ToAccountInfos<'info> for IdlCloseAccount<'info>
        where
            'info: 'info,
        {
            fn to_account_infos(
                &self,
            ) -> Vec<anchor_lang::solana_program::account_info::AccountInfo<'info>> {
                let mut account_infos = ::alloc::vec::Vec::new();
                account_infos.extend(self.account.to_account_infos());
                account_infos.extend(self.authority.to_account_infos());
                account_infos.extend(self.sol_destination.to_account_infos());
                account_infos
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::ToAccountMetas for IdlCloseAccount<'info> {
            fn to_account_metas(
                &self,
                is_signer: Option<bool>,
            ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                let mut account_metas = ::alloc::vec::Vec::new();
                account_metas.extend(self.account.to_account_metas(None));
                account_metas.extend(self.authority.to_account_metas(None));
                account_metas.extend(self.sol_destination.to_account_metas(None));
                account_metas
            }
        }
        #[automatically_derived]
        impl<'info> anchor_lang::AccountsExit<'info> for IdlCloseAccount<'info>
        where
            'info: 'info,
        {
            fn exit(
                &self,
                program_id: &anchor_lang::solana_program::pubkey::Pubkey,
            ) -> anchor_lang::Result<()> {
                {
                    let sol_destination = &self.sol_destination;
                    anchor_lang::AccountsClose::close(
                            &self.account,
                            sol_destination.to_account_info(),
                        )
                        .map_err(|e| e.with_account_name("account"))?;
                }
                anchor_lang::AccountsExit::exit(&self.sol_destination, program_id)
                    .map_err(|e| e.with_account_name("sol_destination"))?;
                Ok(())
            }
        }
        /// An internal, Anchor generated module. This is used (as an
        /// implementation detail), to generate a struct for a given
        /// `#[derive(Accounts)]` implementation, where each field is a Pubkey,
        /// instead of an `AccountInfo`. This is useful for clients that want
        /// to generate a list of accounts, without explicitly knowing the
        /// order all the fields should be in.
        ///
        /// To access the struct in this module, one should use the sibling
        /// `accounts` module (also generated), which re-exports this.
        pub(crate) mod __client_accounts_idl_close_account {
            use super::*;
            use anchor_lang::prelude::borsh;
            /// Generated client accounts for [`IdlCloseAccount`].
            pub struct IdlCloseAccount {
                pub account: anchor_lang::solana_program::pubkey::Pubkey,
                pub authority: anchor_lang::solana_program::pubkey::Pubkey,
                pub sol_destination: anchor_lang::solana_program::pubkey::Pubkey,
            }
            impl borsh::ser::BorshSerialize for IdlCloseAccount
            where
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
                anchor_lang::solana_program::pubkey::Pubkey: borsh::ser::BorshSerialize,
            {
                fn serialize<W: borsh::maybestd::io::Write>(
                    &self,
                    writer: &mut W,
                ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
                    borsh::BorshSerialize::serialize(&self.account, writer)?;
                    borsh::BorshSerialize::serialize(&self.authority, writer)?;
                    borsh::BorshSerialize::serialize(&self.sol_destination, writer)?;
                    Ok(())
                }
            }
            #[automatically_derived]
            impl anchor_lang::ToAccountMetas for IdlCloseAccount {
                fn to_account_metas(
                    &self,
                    is_signer: Option<bool>,
                ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                    let mut account_metas = ::alloc::vec::Vec::new();
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.account,
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                self.authority,
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                self.sol_destination,
                                false,
                            ),
                        );
                    account_metas
                }
            }
        }
        /// An internal, Anchor generated module. This is used (as an
        /// implementation detail), to generate a CPI struct for a given
        /// `#[derive(Accounts)]` implementation, where each field is an
        /// AccountInfo.
        ///
        /// To access the struct in this module, one should use the sibling
        /// [`cpi::accounts`] module (also generated), which re-exports this.
        pub(crate) mod __cpi_client_accounts_idl_close_account {
            use super::*;
            /// Generated CPI struct of the accounts for [`IdlCloseAccount`].
            pub struct IdlCloseAccount<'info> {
                pub account: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub authority: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
                pub sol_destination: anchor_lang::solana_program::account_info::AccountInfo<
                    'info,
                >,
            }
            #[automatically_derived]
            impl<'info> anchor_lang::ToAccountMetas for IdlCloseAccount<'info> {
                fn to_account_metas(
                    &self,
                    is_signer: Option<bool>,
                ) -> Vec<anchor_lang::solana_program::instruction::AccountMeta> {
                    let mut account_metas = ::alloc::vec::Vec::new();
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.account),
                                false,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                                anchor_lang::Key::key(&self.authority),
                                true,
                            ),
                        );
                    account_metas
                        .push(
                            anchor_lang::solana_program::instruction::AccountMeta::new(
                                anchor_lang::Key::key(&self.sol_destination),
                                false,
                            ),
                        );
                    account_metas
                }
            }
            #[automatically_derived]
            impl<'info> anchor_lang::ToAccountInfos<'info> for IdlCloseAccount<'info> {
                fn to_account_infos(
                    &self,
                ) -> Vec<anchor_lang::solana_program::account_info::AccountInfo<'info>> {
                    let mut account_infos = ::alloc::vec::Vec::new();
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(&self.account),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.authority,
                            ),
                        );
                    account_infos
                        .extend(
                            anchor_lang::ToAccountInfos::to_account_infos(
                                &self.sol_destination,
                            ),
                        );
                    account_infos
                }
            }
        }
        use std::cell::{Ref, RefMut};
        pub trait IdlTrailingData<'info> {
            fn trailing_data(self) -> Ref<'info, [u8]>;
            fn trailing_data_mut(self) -> RefMut<'info, [u8]>;
        }
        impl<'a, 'info: 'a> IdlTrailingData<'a> for &'a Account<'info, IdlAccount> {
            fn trailing_data(self) -> Ref<'a, [u8]> {
                let info: &AccountInfo<'info> = self.as_ref();
                Ref::map(info.try_borrow_data().unwrap(), |d| &d[44..])
            }
            fn trailing_data_mut(self) -> RefMut<'a, [u8]> {
                let info: &AccountInfo<'info> = self.as_ref();
                RefMut::map(info.try_borrow_mut_data().unwrap(), |d| &mut d[44..])
            }
        }
        #[inline(never)]
        pub fn __idl_create_account(
            program_id: &Pubkey,
            accounts: &mut IdlCreateAccounts,
            data_len: u64,
        ) -> anchor_lang::Result<()> {
            ::solana_program::log::sol_log("Instruction: IdlCreateAccount");
            if program_id != accounts.program.key {
                return Err(
                    anchor_lang::error::ErrorCode::IdlInstructionInvalidProgram.into(),
                );
            }
            let from = accounts.from.key;
            let (base, nonce) = Pubkey::find_program_address(&[], program_id);
            let seed = IdlAccount::seed();
            let owner = accounts.program.key;
            let to = Pubkey::create_with_seed(&base, seed, owner).unwrap();
            let space = std::cmp::min(8 + 32 + 4 + data_len as usize, 10_000);
            let rent = Rent::get()?;
            let lamports = rent.minimum_balance(space);
            let seeds = &[&[nonce][..]];
            let ix = anchor_lang::solana_program::system_instruction::create_account_with_seed(
                from,
                &to,
                &base,
                seed,
                lamports,
                space as u64,
                owner,
            );
            anchor_lang::solana_program::program::invoke_signed(
                &ix,
                &[
                    accounts.from.clone(),
                    accounts.to.clone(),
                    accounts.base.clone(),
                    accounts.system_program.to_account_info().clone(),
                ],
                &[seeds],
            )?;
            let mut idl_account = {
                let mut account_data = accounts.to.try_borrow_data()?;
                let mut account_data_slice: &[u8] = &account_data;
                IdlAccount::try_deserialize_unchecked(&mut account_data_slice)?
            };
            idl_account.authority = *accounts.from.key;
            let mut data = accounts.to.try_borrow_mut_data()?;
            let dst: &mut [u8] = &mut data;
            let mut cursor = std::io::Cursor::new(dst);
            idl_account.try_serialize(&mut cursor)?;
            Ok(())
        }
        #[inline(never)]
        pub fn __idl_resize_account(
            program_id: &Pubkey,
            accounts: &mut IdlResizeAccount,
            data_len: u64,
        ) -> anchor_lang::Result<()> {
            ::solana_program::log::sol_log("Instruction: IdlResizeAccount");
            let data_len: usize = data_len as usize;
            if accounts.idl.data_len != 0 {
                return Err(anchor_lang::error::ErrorCode::IdlAccountNotEmpty.into());
            }
            let new_account_space = accounts
                .idl
                .to_account_info()
                .data_len()
                .checked_add(
                    std::cmp::min(
                        data_len
                            .checked_sub(accounts.idl.to_account_info().data_len())
                            .expect(
                                "data_len should always be >= the current account space",
                            ),
                        10_000,
                    ),
                )
                .unwrap();
            if new_account_space > accounts.idl.to_account_info().data_len() {
                let sysvar_rent = Rent::get()?;
                let new_rent_minimum = sysvar_rent.minimum_balance(new_account_space);
                anchor_lang::system_program::transfer(
                    anchor_lang::context::CpiContext::new(
                        accounts.system_program.to_account_info(),
                        anchor_lang::system_program::Transfer {
                            from: accounts.authority.to_account_info(),
                            to: accounts.idl.to_account_info().clone(),
                        },
                    ),
                    new_rent_minimum
                        .checked_sub(accounts.idl.to_account_info().lamports())
                        .unwrap(),
                )?;
                accounts.idl.to_account_info().realloc(new_account_space, false)?;
            }
            Ok(())
        }
        #[inline(never)]
        pub fn __idl_close_account(
            program_id: &Pubkey,
            accounts: &mut IdlCloseAccount,
        ) -> anchor_lang::Result<()> {
            ::solana_program::log::sol_log("Instruction: IdlCloseAccount");
            Ok(())
        }
        #[inline(never)]
        pub fn __idl_create_buffer(
            program_id: &Pubkey,
            accounts: &mut IdlCreateBuffer,
        ) -> anchor_lang::Result<()> {
            ::solana_program::log::sol_log("Instruction: IdlCreateBuffer");
            let mut buffer = &mut accounts.buffer;
            buffer.authority = *accounts.authority.key;
            Ok(())
        }
        #[inline(never)]
        pub fn __idl_write(
            program_id: &Pubkey,
            accounts: &mut IdlAccounts,
            idl_data: Vec<u8>,
        ) -> anchor_lang::Result<()> {
            ::solana_program::log::sol_log("Instruction: IdlWrite");
            let prev_len: usize = ::std::convert::TryInto::<
                usize,
            >::try_into(accounts.idl.data_len)
                .unwrap();
            let new_len: usize = prev_len.checked_add(idl_data.len()).unwrap() as usize;
            accounts
                .idl
                .data_len = accounts
                .idl
                .data_len
                .checked_add(
                    ::std::convert::TryInto::<u32>::try_into(idl_data.len()).unwrap(),
                )
                .unwrap();
            use IdlTrailingData;
            let mut idl_bytes = accounts.idl.trailing_data_mut();
            let idl_expansion = &mut idl_bytes[prev_len..new_len];
            if idl_expansion.len() != idl_data.len() {
                return Err(
                    anchor_lang::error::Error::from(anchor_lang::error::AnchorError {
                            error_name: anchor_lang::error::ErrorCode::RequireEqViolated
                                .name(),
                            error_code_number: anchor_lang::error::ErrorCode::RequireEqViolated
                                .into(),
                            error_msg: anchor_lang::error::ErrorCode::RequireEqViolated
                                .to_string(),
                            error_origin: Some(
                                anchor_lang::error::ErrorOrigin::Source(anchor_lang::error::Source {
                                    filename: "programs/hpl-resource-manager/src/lib.rs",
                                    line: 12u32,
                                }),
                            ),
                            compared_values: None,
                        })
                        .with_values((idl_expansion.len(), idl_data.len())),
                );
            }
            idl_expansion.copy_from_slice(&idl_data[..]);
            Ok(())
        }
        #[inline(never)]
        pub fn __idl_set_authority(
            program_id: &Pubkey,
            accounts: &mut IdlAccounts,
            new_authority: Pubkey,
        ) -> anchor_lang::Result<()> {
            ::solana_program::log::sol_log("Instruction: IdlSetAuthority");
            accounts.idl.authority = new_authority;
            Ok(())
        }
        #[inline(never)]
        pub fn __idl_set_buffer(
            program_id: &Pubkey,
            accounts: &mut IdlSetBuffer,
        ) -> anchor_lang::Result<()> {
            ::solana_program::log::sol_log("Instruction: IdlSetBuffer");
            accounts.idl.data_len = accounts.buffer.data_len;
            use IdlTrailingData;
            let buffer_len = ::std::convert::TryInto::<
                usize,
            >::try_into(accounts.buffer.data_len)
                .unwrap();
            let mut target = accounts.idl.trailing_data_mut();
            let source = &accounts.buffer.trailing_data()[..buffer_len];
            if target.len() < buffer_len {
                return Err(
                    anchor_lang::error::Error::from(anchor_lang::error::AnchorError {
                            error_name: anchor_lang::error::ErrorCode::RequireGteViolated
                                .name(),
                            error_code_number: anchor_lang::error::ErrorCode::RequireGteViolated
                                .into(),
                            error_msg: anchor_lang::error::ErrorCode::RequireGteViolated
                                .to_string(),
                            error_origin: Some(
                                anchor_lang::error::ErrorOrigin::Source(anchor_lang::error::Source {
                                    filename: "programs/hpl-resource-manager/src/lib.rs",
                                    line: 12u32,
                                }),
                            ),
                            compared_values: None,
                        })
                        .with_values((target.len(), buffer_len)),
                );
            }
            target[..buffer_len].copy_from_slice(source);
            Ok(())
        }
    }
    /// __global mod defines wrapped handlers for global instructions.
    pub mod __global {
        use super::*;
        #[inline(never)]
        pub fn create_resource(
            __program_id: &Pubkey,
            __accounts: &[AccountInfo],
            __ix_data: &[u8],
        ) -> anchor_lang::Result<()> {
            ::solana_program::log::sol_log("Instruction: CreateResource");
            let ix = instruction::CreateResource::deserialize(&mut &__ix_data[..])
                .map_err(|_| {
                    anchor_lang::error::ErrorCode::InstructionDidNotDeserialize
                })?;
            let instruction::CreateResource { args } = ix;
            let mut __bumps = std::collections::BTreeMap::new();
            let mut __reallocs = std::collections::BTreeSet::new();
            let mut __remaining_accounts: &[AccountInfo] = __accounts;
            let mut __accounts = CreateResource::try_accounts(
                __program_id,
                &mut __remaining_accounts,
                __ix_data,
                &mut __bumps,
                &mut __reallocs,
            )?;
            let result = hpl_resource_manager::create_resource(
                anchor_lang::context::Context::new(
                    __program_id,
                    &mut __accounts,
                    __remaining_accounts,
                    __bumps,
                ),
                args,
            )?;
            __accounts.exit(__program_id)
        }
        #[inline(never)]
        pub fn initilize_resource_tree(
            __program_id: &Pubkey,
            __accounts: &[AccountInfo],
            __ix_data: &[u8],
        ) -> anchor_lang::Result<()> {
            ::solana_program::log::sol_log("Instruction: InitilizeResourceTree");
            let ix = instruction::InitilizeResourceTree::deserialize(&mut &__ix_data[..])
                .map_err(|_| {
                    anchor_lang::error::ErrorCode::InstructionDidNotDeserialize
                })?;
            let instruction::InitilizeResourceTree { args } = ix;
            let mut __bumps = std::collections::BTreeMap::new();
            let mut __reallocs = std::collections::BTreeSet::new();
            let mut __remaining_accounts: &[AccountInfo] = __accounts;
            let mut __accounts = InitilizeResourceTree::try_accounts(
                __program_id,
                &mut __remaining_accounts,
                __ix_data,
                &mut __bumps,
                &mut __reallocs,
            )?;
            let result = hpl_resource_manager::initilize_resource_tree(
                anchor_lang::context::Context::new(
                    __program_id,
                    &mut __accounts,
                    __remaining_accounts,
                    __bumps,
                ),
                args,
            )?;
            __accounts.exit(__program_id)
        }
        #[inline(never)]
        pub fn mint_resource(
            __program_id: &Pubkey,
            __accounts: &[AccountInfo],
            __ix_data: &[u8],
        ) -> anchor_lang::Result<()> {
            ::solana_program::log::sol_log("Instruction: MintResource");
            let ix = instruction::MintResource::deserialize(&mut &__ix_data[..])
                .map_err(|_| {
                    anchor_lang::error::ErrorCode::InstructionDidNotDeserialize
                })?;
            let instruction::MintResource { args } = ix;
            let mut __bumps = std::collections::BTreeMap::new();
            let mut __reallocs = std::collections::BTreeSet::new();
            let mut __remaining_accounts: &[AccountInfo] = __accounts;
            let mut __accounts = MintResource::try_accounts(
                __program_id,
                &mut __remaining_accounts,
                __ix_data,
                &mut __bumps,
                &mut __reallocs,
            )?;
            let result = hpl_resource_manager::mint_resource(
                anchor_lang::context::Context::new(
                    __program_id,
                    &mut __accounts,
                    __remaining_accounts,
                    __bumps,
                ),
                args,
            )?;
            __accounts.exit(__program_id)
        }
        #[inline(never)]
        pub fn burn_resource(
            __program_id: &Pubkey,
            __accounts: &[AccountInfo],
            __ix_data: &[u8],
        ) -> anchor_lang::Result<()> {
            ::solana_program::log::sol_log("Instruction: BurnResource");
            let ix = instruction::BurnResource::deserialize(&mut &__ix_data[..])
                .map_err(|_| {
                    anchor_lang::error::ErrorCode::InstructionDidNotDeserialize
                })?;
            let instruction::BurnResource { args } = ix;
            let mut __bumps = std::collections::BTreeMap::new();
            let mut __reallocs = std::collections::BTreeSet::new();
            let mut __remaining_accounts: &[AccountInfo] = __accounts;
            let mut __accounts = BurnResource::try_accounts(
                __program_id,
                &mut __remaining_accounts,
                __ix_data,
                &mut __bumps,
                &mut __reallocs,
            )?;
            let result = hpl_resource_manager::burn_resource(
                anchor_lang::context::Context::new(
                    __program_id,
                    &mut __accounts,
                    __remaining_accounts,
                    __bumps,
                ),
                args,
            )?;
            __accounts.exit(__program_id)
        }
        #[inline(never)]
        pub fn wrap_resource(
            __program_id: &Pubkey,
            __accounts: &[AccountInfo],
            __ix_data: &[u8],
        ) -> anchor_lang::Result<()> {
            ::solana_program::log::sol_log("Instruction: WrapResource");
            let ix = instruction::WrapResource::deserialize(&mut &__ix_data[..])
                .map_err(|_| {
                    anchor_lang::error::ErrorCode::InstructionDidNotDeserialize
                })?;
            let instruction::WrapResource { args } = ix;
            let mut __bumps = std::collections::BTreeMap::new();
            let mut __reallocs = std::collections::BTreeSet::new();
            let mut __remaining_accounts: &[AccountInfo] = __accounts;
            let mut __accounts = WrapResource::try_accounts(
                __program_id,
                &mut __remaining_accounts,
                __ix_data,
                &mut __bumps,
                &mut __reallocs,
            )?;
            let result = hpl_resource_manager::wrap_resource(
                anchor_lang::context::Context::new(
                    __program_id,
                    &mut __accounts,
                    __remaining_accounts,
                    __bumps,
                ),
                args,
            )?;
            __accounts.exit(__program_id)
        }
        #[inline(never)]
        pub fn unwrap_resource(
            __program_id: &Pubkey,
            __accounts: &[AccountInfo],
            __ix_data: &[u8],
        ) -> anchor_lang::Result<()> {
            ::solana_program::log::sol_log("Instruction: UnwrapResource");
            let ix = instruction::UnwrapResource::deserialize(&mut &__ix_data[..])
                .map_err(|_| {
                    anchor_lang::error::ErrorCode::InstructionDidNotDeserialize
                })?;
            let instruction::UnwrapResource { args } = ix;
            let mut __bumps = std::collections::BTreeMap::new();
            let mut __reallocs = std::collections::BTreeSet::new();
            let mut __remaining_accounts: &[AccountInfo] = __accounts;
            let mut __accounts = UnWrapResource::try_accounts(
                __program_id,
                &mut __remaining_accounts,
                __ix_data,
                &mut __bumps,
                &mut __reallocs,
            )?;
            let result = hpl_resource_manager::unwrap_resource(
                anchor_lang::context::Context::new(
                    __program_id,
                    &mut __accounts,
                    __remaining_accounts,
                    __bumps,
                ),
                args,
            )?;
            __accounts.exit(__program_id)
        }
    }
}
pub mod hpl_resource_manager {
    use super::*;
    pub fn create_resource(
        ctx: Context<CreateResource>,
        args: CreateResourceArgs,
    ) -> Result<()> {
        instructions::create_resource(ctx, args)
    }
    pub fn initilize_resource_tree(
        ctx: Context<InitilizeResourceTree>,
        args: InitilizeResourceTreeArgs,
    ) -> Result<()> {
        instructions::initilize_resource_tree(ctx, args)
    }
    pub fn mint_resource<'info>(
        ctx: Context<'_, '_, '_, 'info, MintResource<'info>>,
        args: MintResourceArgs,
    ) -> Result<()> {
        instructions::mint_resource(ctx, args)
    }
    pub fn burn_resource<'info>(
        ctx: Context<'_, '_, '_, 'info, BurnResource<'info>>,
        args: BurnResourceArgs,
    ) -> Result<()> {
        instructions::burn_resource(ctx, args)
    }
    pub fn wrap_resource<'info>(
        ctx: Context<'_, '_, '_, 'info, WrapResource<'info>>,
        args: WrapResourceArgs,
    ) -> Result<()> {
        instructions::wrap_resource(ctx, args)
    }
    pub fn unwrap_resource<'info>(
        ctx: Context<'_, '_, '_, 'info, UnWrapResource<'info>>,
        args: UnWrapResourceArgs,
    ) -> Result<()> {
        instructions::unwrap_resource(ctx, args)
    }
}
/// An Anchor generated module containing the program's set of
/// instructions, where each method handler in the `#[program]` mod is
/// associated with a struct defining the input arguments to the
/// method. These should be used directly, when one wants to serialize
/// Anchor instruction data, for example, when speciying
/// instructions on a client.
pub mod instruction {
    use super::*;
    /// Instruction.
    pub struct CreateResource {
        pub args: CreateResourceArgs,
    }
    impl borsh::ser::BorshSerialize for CreateResource
    where
        CreateResourceArgs: borsh::ser::BorshSerialize,
    {
        fn serialize<W: borsh::maybestd::io::Write>(
            &self,
            writer: &mut W,
        ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
            borsh::BorshSerialize::serialize(&self.args, writer)?;
            Ok(())
        }
    }
    impl borsh::de::BorshDeserialize for CreateResource
    where
        CreateResourceArgs: borsh::BorshDeserialize,
    {
        fn deserialize_reader<R: borsh::maybestd::io::Read>(
            reader: &mut R,
        ) -> ::core::result::Result<Self, borsh::maybestd::io::Error> {
            Ok(Self {
                args: borsh::BorshDeserialize::deserialize_reader(reader)?,
            })
        }
    }
    impl anchor_lang::Discriminator for CreateResource {
        const DISCRIMINATOR: [u8; 8] = [42, 4, 153, 170, 163, 159, 188, 194];
    }
    impl anchor_lang::InstructionData for CreateResource {}
    impl anchor_lang::Owner for CreateResource {
        fn owner() -> Pubkey {
            ID
        }
    }
    /// Instruction.
    pub struct InitilizeResourceTree {
        pub args: InitilizeResourceTreeArgs,
    }
    impl borsh::ser::BorshSerialize for InitilizeResourceTree
    where
        InitilizeResourceTreeArgs: borsh::ser::BorshSerialize,
    {
        fn serialize<W: borsh::maybestd::io::Write>(
            &self,
            writer: &mut W,
        ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
            borsh::BorshSerialize::serialize(&self.args, writer)?;
            Ok(())
        }
    }
    impl borsh::de::BorshDeserialize for InitilizeResourceTree
    where
        InitilizeResourceTreeArgs: borsh::BorshDeserialize,
    {
        fn deserialize_reader<R: borsh::maybestd::io::Read>(
            reader: &mut R,
        ) -> ::core::result::Result<Self, borsh::maybestd::io::Error> {
            Ok(Self {
                args: borsh::BorshDeserialize::deserialize_reader(reader)?,
            })
        }
    }
    impl anchor_lang::Discriminator for InitilizeResourceTree {
        const DISCRIMINATOR: [u8; 8] = [28, 77, 36, 158, 111, 178, 59, 83];
    }
    impl anchor_lang::InstructionData for InitilizeResourceTree {}
    impl anchor_lang::Owner for InitilizeResourceTree {
        fn owner() -> Pubkey {
            ID
        }
    }
    /// Instruction.
    pub struct MintResource {
        pub args: MintResourceArgs,
    }
    impl borsh::ser::BorshSerialize for MintResource
    where
        MintResourceArgs: borsh::ser::BorshSerialize,
    {
        fn serialize<W: borsh::maybestd::io::Write>(
            &self,
            writer: &mut W,
        ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
            borsh::BorshSerialize::serialize(&self.args, writer)?;
            Ok(())
        }
    }
    impl borsh::de::BorshDeserialize for MintResource
    where
        MintResourceArgs: borsh::BorshDeserialize,
    {
        fn deserialize_reader<R: borsh::maybestd::io::Read>(
            reader: &mut R,
        ) -> ::core::result::Result<Self, borsh::maybestd::io::Error> {
            Ok(Self {
                args: borsh::BorshDeserialize::deserialize_reader(reader)?,
            })
        }
    }
    impl anchor_lang::Discriminator for MintResource {
        const DISCRIMINATOR: [u8; 8] = [2, 118, 133, 91, 220, 176, 214, 105];
    }
    impl anchor_lang::InstructionData for MintResource {}
    impl anchor_lang::Owner for MintResource {
        fn owner() -> Pubkey {
            ID
        }
    }
    /// Instruction.
    pub struct BurnResource {
        pub args: BurnResourceArgs,
    }
    impl borsh::ser::BorshSerialize for BurnResource
    where
        BurnResourceArgs: borsh::ser::BorshSerialize,
    {
        fn serialize<W: borsh::maybestd::io::Write>(
            &self,
            writer: &mut W,
        ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
            borsh::BorshSerialize::serialize(&self.args, writer)?;
            Ok(())
        }
    }
    impl borsh::de::BorshDeserialize for BurnResource
    where
        BurnResourceArgs: borsh::BorshDeserialize,
    {
        fn deserialize_reader<R: borsh::maybestd::io::Read>(
            reader: &mut R,
        ) -> ::core::result::Result<Self, borsh::maybestd::io::Error> {
            Ok(Self {
                args: borsh::BorshDeserialize::deserialize_reader(reader)?,
            })
        }
    }
    impl anchor_lang::Discriminator for BurnResource {
        const DISCRIMINATOR: [u8; 8] = [252, 54, 4, 35, 74, 224, 187, 19];
    }
    impl anchor_lang::InstructionData for BurnResource {}
    impl anchor_lang::Owner for BurnResource {
        fn owner() -> Pubkey {
            ID
        }
    }
    /// Instruction.
    pub struct WrapResource {
        pub args: WrapResourceArgs,
    }
    impl borsh::ser::BorshSerialize for WrapResource
    where
        WrapResourceArgs: borsh::ser::BorshSerialize,
    {
        fn serialize<W: borsh::maybestd::io::Write>(
            &self,
            writer: &mut W,
        ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
            borsh::BorshSerialize::serialize(&self.args, writer)?;
            Ok(())
        }
    }
    impl borsh::de::BorshDeserialize for WrapResource
    where
        WrapResourceArgs: borsh::BorshDeserialize,
    {
        fn deserialize_reader<R: borsh::maybestd::io::Read>(
            reader: &mut R,
        ) -> ::core::result::Result<Self, borsh::maybestd::io::Error> {
            Ok(Self {
                args: borsh::BorshDeserialize::deserialize_reader(reader)?,
            })
        }
    }
    impl anchor_lang::Discriminator for WrapResource {
        const DISCRIMINATOR: [u8; 8] = [176, 14, 174, 210, 16, 217, 89, 245];
    }
    impl anchor_lang::InstructionData for WrapResource {}
    impl anchor_lang::Owner for WrapResource {
        fn owner() -> Pubkey {
            ID
        }
    }
    /// Instruction.
    pub struct UnwrapResource {
        pub args: UnWrapResourceArgs,
    }
    impl borsh::ser::BorshSerialize for UnwrapResource
    where
        UnWrapResourceArgs: borsh::ser::BorshSerialize,
    {
        fn serialize<W: borsh::maybestd::io::Write>(
            &self,
            writer: &mut W,
        ) -> ::core::result::Result<(), borsh::maybestd::io::Error> {
            borsh::BorshSerialize::serialize(&self.args, writer)?;
            Ok(())
        }
    }
    impl borsh::de::BorshDeserialize for UnwrapResource
    where
        UnWrapResourceArgs: borsh::BorshDeserialize,
    {
        fn deserialize_reader<R: borsh::maybestd::io::Read>(
            reader: &mut R,
        ) -> ::core::result::Result<Self, borsh::maybestd::io::Error> {
            Ok(Self {
                args: borsh::BorshDeserialize::deserialize_reader(reader)?,
            })
        }
    }
    impl anchor_lang::Discriminator for UnwrapResource {
        const DISCRIMINATOR: [u8; 8] = [110, 83, 236, 85, 230, 247, 205, 106];
    }
    impl anchor_lang::InstructionData for UnwrapResource {}
    impl anchor_lang::Owner for UnwrapResource {
        fn owner() -> Pubkey {
            ID
        }
    }
}
/// An Anchor generated module, providing a set of structs
/// mirroring the structs deriving `Accounts`, where each field is
/// a `Pubkey`. This is useful for specifying accounts for a client.
pub mod accounts {
    pub use crate::__client_accounts_un_wrap_resource::*;
    pub use crate::__client_accounts_mint_resource::*;
    pub use crate::__client_accounts_initilize_resource_tree::*;
    pub use crate::__client_accounts_burn_resource::*;
    pub use crate::__client_accounts_wrap_resource::*;
    pub use crate::__client_accounts_create_resource::*;
}
