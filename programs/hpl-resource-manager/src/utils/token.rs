use {
    crate::Resource,
    anchor_lang::prelude::*,
    spl_token_2022::{
        extension::{metadata_pointer, ExtensionType},
        instruction::{
            initialize_mint2, initialize_mint_close_authority, initialize_permanent_delegate,
        },
        solana_program::{
            instruction::Instruction,
            program::{invoke, invoke_signed},
            program_pack::Pack,
            system_instruction::create_account,
        },
        state::Mint,
    },
    spl_token_metadata_interface::instruction::initialize,
    std::ops::Deref,
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
    resource: &Account<'info, Resource>,
    payer: AccountInfo<'info>,
    mint: AccountInfo<'info>,
    rent_sysvar: &Rent,
    token22_program: &AccountInfo<'info>,
    decimals: u8,
    metadata: &ResourceMetadataArgs,
) -> Result<Mint> {
    let extension_initialization_params = vec![
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
    ];

    let extension_types = extension_initialization_params
        .iter()
        .map(|e| e.extension())
        .collect::<Vec<_>>();

    let space = ExtensionType::try_calculate_account_len::<Mint>(&extension_types).unwrap();

    // add the space for the metadata
    // space += 68 + 12 + metadata.name.len() + metadata.symbol.len() + metadata.uri.len();

    // signature seeds for the mint authority
    let account_instruction = create_account(
        &payer.key(),
        &mint.key(),
        rent_sysvar.minimum_balance(
            space + 68 + 12 + metadata.name.len() + metadata.symbol.len() + metadata.uri.len() + 8,
        ),
        space as u64,
        &token22_program.key(),
    );

    msg!("Creating mint account");

    // invoking the mint account creation with the signer seeds
    invoke(&account_instruction, &[payer, mint.to_owned()])?;

    for params in extension_initialization_params {
        let instruction = params
            .instruction(&token22_program.key(), &mint.key())
            .unwrap();

        msg!("Creating mint extension account");
        // invoking the extensions instructions with the signer seeds
        invoke(&instruction, &[mint.to_owned()])?;
    }

    let mint_instruction = initialize_mint2(
        &token22_program.key(),
        &mint.key(),
        &resource.key(),
        Some(&resource.key()),
        decimals,
    )?;

    // invoking the mint account creation with the signer seeds
    invoke(&mint_instruction, &[mint.to_owned()])?;
    msg!("Mint account created");

    let data = mint.try_borrow_data().unwrap();
    let slice = data.deref().to_vec();
    let mint_data = Mint::unpack_from_slice(&slice)?;

    Ok(mint_data)
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ResourceMetadataArgs {
    pub name: String,
    pub symbol: String,
    pub uri: String,
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

    msg!("Creating metadata account");
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
