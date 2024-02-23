use {
    crate::{Resource, ResourseKind},
    anchor_lang::prelude::*,
    hpl_toolkit::HashMap,
    spl_token_2022::{
        extension::{group_member_pointer, group_pointer, metadata_pointer, ExtensionType},
        instruction::{
            burn, initialize_mint2, initialize_mint_close_authority, initialize_permanent_delegate,
            mint_to,
        },
        solana_program::{
            instruction::Instruction,
            program::{invoke, invoke_signed},
            program_pack::Pack,
            system_instruction::create_account,
        },
        state::Mint,
    },
    spl_token_metadata_interface::{
        instruction::{initialize, update_field},
        state::Field,
    },
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
    GroupPointer {
        authority: Option<Pubkey>,
        group_address: Option<Pubkey>,
    },
    GroupMemberPointer {
        authority: Option<Pubkey>,
        member_address: Option<Pubkey>,
    },
}
impl ExtensionInitializationParams {
    pub fn extension(&self) -> ExtensionType {
        match self {
            Self::MintCloseAuthority { .. } => ExtensionType::MintCloseAuthority,
            Self::PermanentDelegate { .. } => ExtensionType::PermanentDelegate,
            Self::MetadataPointer { .. } => ExtensionType::MetadataPointer,
            Self::GroupPointer { .. } => ExtensionType::GroupPointer,
            Self::GroupMemberPointer { .. } => ExtensionType::GroupMemberPointer,
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

            Self::GroupPointer {
                authority,
                group_address,
            } => group_pointer::instruction::initialize(
                token_program_id,
                mint,
                authority,
                group_address,
            )
            .map_err(Into::into),

            Self::GroupMemberPointer {
                authority,
                member_address,
            } => group_member_pointer::instruction::initialize(
                token_program_id,
                mint,
                authority,
                member_address,
            )
            .map_err(Into::into),
        }
    }
}

pub fn create_mint_with_extensions<'info>(
    resource: &Account<'info, Resource>,
    payer: &AccountInfo<'info>,
    mint: &AccountInfo<'info>,
    rent_sysvar: &Rent,
    token22_program: &AccountInfo<'info>,
    decimals: u8,
    metadata: &ResourceMetadataArgs,
    kind: &ResourseKind,
) -> Result<Mint> {
    let mut extension_initialization_params = vec![
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

    // if the resource is an NFT, add the group pointer extension
    if matches!(
        kind,
        ResourseKind::INF {
            characteristics: _,
            supply: _
        }
    ) {
        extension_initialization_params.push(ExtensionInitializationParams::GroupPointer {
            authority: Some(resource.key()),
            group_address: Some(mint.key()),
        });
    }

    let extension_types = extension_initialization_params
        .iter()
        .map(|e| e.extension())
        .collect::<Vec<_>>();

    let account_space = ExtensionType::try_calculate_account_len::<Mint>(&extension_types).unwrap();

    let mut space = account_space;
    // calculate the space required for the metadata
    space += 68 + 12 + metadata.name.len() + metadata.symbol.len() + metadata.uri.len() + 4;

    // calculate the space required for the INF characteristics
    if let ResourseKind::INF {
        characteristics,
        supply: _,
    } = kind
    {
        space += characteristics
            .iter()
            .map(|key| key.len() + 32)
            .sum::<usize>();
    }

    // signature seeds for the mint authority
    let account_instruction = create_account(
        &payer.key(),
        &mint.key(),
        rent_sysvar.minimum_balance(space),
        account_space as u64,
        &token22_program.key(),
    );

    msg!("Creating mint account");

    // invoking the mint account creation with the signer seeds
    invoke(
        &account_instruction,
        &[payer.to_account_info(), mint.to_owned()],
    )?;

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
    invoke(&mint_instruction, &[mint.to_account_info()])?;
    msg!("Mint account created");

    let data = mint.try_borrow_data().unwrap();
    let slice = data.deref().to_vec();
    let mint_data = Mint::unpack_from_slice(&slice)?;

    Ok(mint_data)
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ResourceMetadataArgs {
    pub name: String,
    pub symbol: String,
    pub uri: String,
}
pub fn create_metadata_for_mint<'info>(
    token22_program: &AccountInfo<'info>,
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

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ResourceMetadataUpdateArgs {
    pub name: Option<String>,
    pub symbol: Option<String>,
    pub uri: Option<String>,
    pub additional_metadata: HashMap<String, String>,
}

pub fn update_metadata_for_mint<'info>(
    token22_program: AccountInfo<'info>,
    mint: AccountInfo<'info>,
    resource: &Account<'info, Resource>,
    metadata: ResourceMetadataUpdateArgs,
) -> Result<()> {
    let mut instructions: Vec<Instruction> = vec![];
    if let Some(name) = metadata.name {
        instructions.push(update_field(
            &token22_program.key(),
            &mint.key(),
            &resource.key(),
            Field::Name,
            name,
        ));
    }

    if let Some(symbol) = metadata.symbol {
        instructions.push(update_field(
            &token22_program.key(),
            &mint.key(),
            &resource.key(),
            Field::Symbol,
            symbol,
        ));
    }

    if let Some(uri) = metadata.uri {
        instructions.push(update_field(
            &token22_program.key(),
            &mint.key(),
            &resource.key(),
            Field::Uri,
            uri,
        ));
    }

    for (key, value) in metadata.additional_metadata {
        instructions.push(update_field(
            &token22_program.key(),
            &mint.key(),
            &resource.key(),
            Field::Key(key),
            value,
        ));
    }

    for instruction in instructions {
        msg!("Updating metadata account");
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

// pub fn get_mint_metadata<'info>(mint: AccountInfo<'info>) -> Result<TokenMetadata> {
//     let buffer = mint.try_borrow_data()?;
//     let mint = StateWithExtensions::<Mint>::unpack(&buffer)?;

//     mint.get_variable_len_extension::<TokenMetadata>()
//         .map_err(|err| err.into())
// }

// pub fn update_compressed_supply<'info>(
//     token22_program: AccountInfo<'info>,
//     mint: AccountInfo<'info>,
//     resource: &Account<'info, Resource>,
//     amount: u64,
//     is_burning: bool,
// ) -> Result<()> {
//     let resource_metadata = get_mint_metadata(mint.to_account_info())?;
//     let mut supply = 0;

//     if resource_metadata.additional_metadata.len() > 0 {
//         supply = resource_metadata
//             .additional_metadata
//             .iter()
//             .find_map(|(key, value)| {
//                 if key == "compressed_supply" {
//                     Some(value.parse::<u64>().unwrap())
//                 } else {
//                     None
//                 }
//             })
//             .unwrap();
//     }

//     if is_burning {
//         supply -= amount;
//     } else {
//         supply += amount;
//     }
//     // updateing the compressed supply from mint's metadata
//     update_metadata_for_mint(
//         token22_program.to_account_info(),
//         mint.to_account_info(),
//         &resource,
//         ResourceMetadataUpdateArgs {
//             field: Some("compressed_supply".to_string()),
//             value: Some(supply.to_string()),
//             name: None,
//             symbol: None,
//             uri: None,
//         },
//     )?;

//     Ok(())
// }

pub fn mint_tokens<'info>(
    token_program_id: &AccountInfo<'info>,
    mint: &AccountInfo<'info>,
    token_account: &AccountInfo<'info>,
    resource: &Account<'info, Resource>,
    amount: u64,
) -> Result<()> {
    let mint_to_instruction = mint_to(
        &token_program_id.key(),
        &mint.key(),
        &token_account.key(),
        &resource.key(),
        &[&resource.key()],
        amount,
    )
    .unwrap();

    msg!("Minting to account");
    invoke_signed(
        &mint_to_instruction,
        &[
            mint.to_owned(),
            token_account.to_owned(),
            resource.to_account_info(),
        ],
        &[&resource.seeds(&[resource.bump])[..]],
    )?;

    Ok(())
}

pub fn burn_tokens<'info>(
    token_program_id: &AccountInfo<'info>,
    mint: &AccountInfo<'info>,
    token_account: &AccountInfo<'info>,
    receiver: &AccountInfo<'info>,
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

    msg!("Burning from account");
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

pub fn init_collection<'info>(
    token_program: &AccountInfo<'info>,
    mint: AccountInfo<'info>,
    resource: &Account<'info, Resource>,
    max_size: u32,
) -> Result<()> {
    let instruction = spl_token_group_interface::instruction::initialize_group(
        &token_program.key(),
        &mint.key(),
        &mint.key(),
        &resource.key(),
        Some(resource.key()),
        max_size,
    );

    invoke_signed(
        &instruction,
        &[mint.to_account_info(), mint, resource.to_account_info()],
        &[&resource.seeds(&[resource.bump])[..]],
    )?;

    Ok(())
}

pub fn init_collection_mint<'info>(
    token_program: &AccountInfo<'info>,
    collection: &AccountInfo<'info>,
    mint: &AccountInfo<'info>,
    resource: &Account<'info, Resource>,
) -> Result<()> {
    let instruction = spl_token_group_interface::instruction::initialize_member(
        &token_program.key(),
        &mint.key(),
        &mint.key(),
        &resource.key(),
        &collection.key(),
        &resource.key(),
    );

    invoke_signed(
        &instruction,
        &[
            mint.to_account_info(),
            mint.to_account_info(),
            resource.to_account_info(),
            collection.to_account_info(),
            resource.to_account_info(),
        ],
        &[&resource.seeds(&[resource.bump])[..]],
    )?;

    Ok(())
}
