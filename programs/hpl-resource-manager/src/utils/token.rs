use {
    crate::Resource,
    anchor_lang::{
        prelude::*,
        solana_program::{
            instruction::Instruction, program::invoke_signed, system_instruction::create_account,
        },
    },
    spl_token_2022::{
        extension::{metadata_pointer, ExtensionType},
        instruction::{
            initialize_mint2, initialize_mint_close_authority, initialize_permanent_delegate,
        },
        state::Mint,
    },
    spl_token_metadata_interface::instrucetion::initialize,
};

#[derive(Clone, Debug, PartialEq)]
pub enum ExtensionInitializationParams {
    MintCloseAuthority {
        close_authority: Option<Pubkey>,
    },
    PermanentDelegate {
        delegate: Pubkey,
    },
    MetadataPointer {
        authority: Option<Pubkey>,
        metadata_address: Option<Pubkey>,
    },
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
    pub fn instruction(self, token_program_id: &Pubkey, mint: &Pubkey) -> Result<Instruction> {
        match self {
            Self::MintCloseAuthority { close_authority } => {
                initialize_mint_close_authority(token_program_id, mint, close_authority.as_ref())
                    .map_err(Into::into)
            }

            Self::PermanentDelegate { delegate } => {
                initialize_permanent_delegate(token_program_id, mint, &delegate).map_err(Into::into)
            }

            Self::MetadataPointer {
                authority,
                metadata_address,
            } => metadata_pointer::instruction::initialize(
                token_program_id,
                mint,
                authority,
                metadata_address,
            )
            .map_err(Into::into),
        }
    }
}

pub fn create_mint_with_extensions<'info>(
    project: &AccountInfo<'info>,
    mint_authority: &AccountInfo<'info>,
    freeze_authority: Option<&AccountInfo<'info>>,
    payer: AccountInfo<'info>,
    mint: AccountInfo<'info>,
    rent_sysvar: &Rent,
    token22_program: &AccountInfo<'info>,
    decimals: u8,
) -> Result<()> {
    let extension_initialization_params = vec![
        ExtensionInitializationParams::MintCloseAuthority {
            close_authority: Some(mint_authority.key()),
        },
        ExtensionInitializationParams::PermanentDelegate {
            delegate: mint_authority.key(),
        },
        ExtensionInitializationParams::MetadataPointer {
            authority: Some(mint_authority.key()),
            metadata_address: Some(mint.key()),
        },
    ];

    let extension_types = extension_initialization_params
        .iter()
        .map(|e| e.extension())
        .collect::<Vec<_>>();

    let space = ExtensionType::try_calculate_account_len::<Mint>(&extension_types).unwrap();

    // signature seeds for the mint authority
    let project_key = project.key();
    let mint_key = mint.key();
    let signer_seeds = Resource::static_seeds(&project_key, &mint_key);

    let account_instruction = create_account(
        &payer.key(),
        &mint_key,
        rent_sysvar.minimum_balance(space),
        space as u64,
        &token22_program.key(),
    );

    // invoking the mint account creation with the signer seeds
    invoke_signed(
        &account_instruction,
        &[payer, mint.to_owned()],
        &[&signer_seeds[..]],
    )?;

    for params in extension_initialization_params {
        let instruction = params
            .instruction(&token22_program.key(), &mint.key())
            .unwrap();
        // invoking the extensions instructions with the signer seeds
        invoke_signed(&instruction, &[mint.to_owned()], &[&signer_seeds[..]])?;
    }

    let mint_instruction = initialize_mint2(
        &token22_program.key(),
        &mint_key,
        &mint_authority.key(),
        Some(&freeze_authority.unwrap().key()),
        decimals,
    )?;

    // invoking the mint account creation with the signer seeds
    invoke_signed(&mint_instruction, &[mint], &[&signer_seeds[..]])?;

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ResourceMetadataArgs {
    pub name: String,
    pub symbol: String,
    pub uri: String,
}
pub fn create_metadata_for_mint<'info>(
    token22_program: AccountInfo<'info>,
    project: AccountInfo<'info>,
    mint: AccountInfo<'info>,
    mint_authority: AccountInfo<'info>,
    metadata: ResourceMetadataArgs,
) -> Result<()> {
    let project_key = project.key();
    let mint_key = mint.key();
    let signer_seeds = Resource::static_seeds(&project_key, &mint_key);

    let instruction = initialize(
        &token22_program.key(),
        &mint_key,
        &mint_authority.key(),
        &mint_key,
        &mint_authority.key(),
        metadata.name,
        metadata.symbol,
        metadata.uri,
    );

    invoke_signed(
        &instruction,
        &[
            mint.to_account_info(),
            mint_authority.to_account_info(),
            mint,
            mint_authority,
        ],
        &[&signer_seeds[..]],
    )?;

    Ok(())
}
