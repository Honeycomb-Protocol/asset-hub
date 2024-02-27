use {
    crate::{
        errors::ResourceErrorCode,
        utils::{
            create_metadata_for_mint, init_collection_mint, mint_tokens,
            ExtensionInitializationParams, ResourceMetadataArgs,
        },
        Holding, HoldingAccountArgs, NonFungibleHolder, Resource,
    },
    anchor_lang::prelude::*,
    anchor_spl::{
        associated_token::AssociatedToken,
        token_interface::{Token2022, TokenAccount},
    },
    hpl_hive_control::state::Project,
    hpl_toolkit::{
        compression::{CompressedDataEvent, ToNode},
        CompressedData, HashMap,
    },
    spl_account_compression::{program::SplAccountCompression, Noop},
    spl_token_2022::{
        extension::ExtensionType,
        instruction::initialize_mint2,
        solana_program::{program::invoke, system_instruction::create_account},
        state::Mint,
    },
};

#[derive(Accounts)]
pub struct UnWrapResource<'info> {
    #[account()]
    pub project: Box<Account<'info, Project>>,

    #[account(has_one = project, has_one = mint)]
    pub resource: Box<Account<'info, Resource>>,

    /// CHECK: this is not dangerous. we are not reading & writing from it
    #[account()]
    pub group: Option<AccountInfo<'info>>,

    /// CHECK: this is not dangerous. we are not reading & writing from it
    #[account(mut)]
    pub merkle_tree: AccountInfo<'info>,

    /// CHECK: this is not dangerous. we are not reading & writing from it
    #[account(mut, constraint = resource.mint == mint.key())]
    pub mint: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = owner
    )]
    pub recipient_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub rent_sysvar: Sysvar<'info, Rent>,

    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token2022>,

    pub compression_program: Program<'info, SplAccountCompression>,

    pub log_wrapper: Program<'info, Noop>,

    pub clock: Sysvar<'info, Clock>,

    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub enum UnWrapResourceArgs {
    Fungible {
        holding_state: HoldingAccountArgs,
        amount: u64,
    },

    INF {
        holding_state: HoldingAccountArgs,
        metadata: ResourceMetadataArgs,
        characteristics: HashMap<String, String>,
    },
}

pub fn unwrap_resource<'info>(
    ctx: Context<'_, '_, '_, 'info, UnWrapResource<'info>>,
    args: UnWrapResourceArgs,
) -> Result<()> {
    let resource = &mut ctx.accounts.resource;

    match &args {
        UnWrapResourceArgs::Fungible {
            holding_state,
            amount,
        } => {
            wrap_fungible_resource(
                &ctx.accounts.token_program,
                &ctx.accounts.mint,
                &ctx.accounts.recipient_account.to_account_info(),
                resource,
                &ctx.accounts.merkle_tree,
                &ctx.remaining_accounts,
                &ctx.accounts.clock,
                &ctx.accounts.log_wrapper,
                &ctx.accounts.compression_program,
                holding_state.to_owned(),
                *amount,
            )?;
        }

        UnWrapResourceArgs::INF {
            holding_state,
            metadata,
            characteristics: _,
        } => {
            // create the non fungible member account
            wrap_non_fungible_resource(
                &ctx.accounts.mint,
                resource,
                &ctx.accounts.merkle_tree,
                &ctx.remaining_accounts,
                &ctx.accounts.clock,
                &ctx.accounts.log_wrapper,
                &ctx.accounts.compression_program,
                holding_state,
            )?;

            // create the non fungible member account
            create_non_fungible_member(
                &ctx.accounts.token_program,
                resource,
                &ctx.accounts.payer,
                ctx.accounts.group.as_ref().unwrap(),
                &ctx.accounts.mint,
                &ctx.accounts.rent_sysvar,
                &args,
            )?;

            // create metadata for the mint
            create_metadata_for_mint(
                &ctx.accounts.token_program,
                ctx.accounts.mint.to_account_info(),
                &resource,
                metadata.to_owned(),
            )?;

            // create the member account
            init_collection_mint(
                &ctx.accounts.token_program,
                ctx.accounts.group.as_ref().unwrap(),
                &ctx.accounts.mint,
                &resource,
            )?;
        }
    }

    Ok(())
}

pub fn wrap_fungible_resource<'info>(
    token_program: &AccountInfo<'info>,
    mint: &AccountInfo<'info>,
    recipient_account: &AccountInfo<'info>,
    resource: &mut Account<'info, Resource>,
    merkle_tree: &AccountInfo<'info>,
    remaining_accounts: &[AccountInfo<'info>],
    clock: &Sysvar<'info, Clock>,
    log_wrapper: &Program<'info, Noop>,
    compression_program: &Program<'info, SplAccountCompression>,
    holding_state: HoldingAccountArgs,
    amount: u64,
) -> Result<()> {
    msg!("burning funglible resource");
    if let Holding::Fungible { holder, balance } = holding_state.holding {
        if amount > balance {
            return Err(ResourceErrorCode::InsufficientAmount.into());
        }

        let (_leaf_idx, seq) = resource
            .merkle_trees
            .assert_append(merkle_tree.to_account_info())?;

        let new_holding_state = Holding::Fungible {
            holder: holder,
            balance: balance,
        };

        msg!("creating event");
        let event = CompressedDataEvent::Leaf {
            slot: clock.slot,
            tree_id: merkle_tree.key().to_bytes(),
            leaf_idx: holding_state.leaf_idx,
            seq: seq,
            stream_type: new_holding_state.event_stream(),
        };
        event.wrap(&log_wrapper)?;

        let new_leaf;
        if balance - amount > 0 {
            new_leaf = new_holding_state.to_compressed().to_node();
        } else {
            new_leaf = [0; 32];
        }

        let bump_binding = [resource.bump];
        let signer_seeds = resource.seeds(&bump_binding);

        // update the compressed token account using controlled merkle tree
        hpl_toolkit::compression::replace_leaf(
            holding_state.root,
            new_holding_state.to_compressed().to_node(),
            new_leaf,
            holding_state.leaf_idx,
            &resource.to_account_info(),
            &merkle_tree,
            &compression_program,
            &log_wrapper,
            remaining_accounts.to_vec(),
            Some(&[&signer_seeds[..]]),
        )?;

        msg!("minting tokens");

        // transfer the amount to the owner
        mint_tokens(token_program, mint, recipient_account, &resource, amount)?;
    } else {
        return Err(ResourceErrorCode::InvalidHoldingState.into());
    }

    Ok(())
}

pub fn wrap_non_fungible_resource<'info>(
    mint: &AccountInfo<'info>,
    resource: &mut Account<'info, Resource>,
    merkle_tree: &AccountInfo<'info>,
    remaining_accounts: &[AccountInfo<'info>],
    clock: &Sysvar<'info, Clock>,
    log_wrapper: &Program<'info, Noop>,
    compression_program: &Program<'info, SplAccountCompression>,
    holding_state: &HoldingAccountArgs,
) -> Result<()> {
    msg!("burning funglible resource");
    if let Holding::INF {
        holder,
        characteristics,
    } = &holding_state.holding
    {
        let (_leaf_idx, seq) = resource
            .merkle_trees
            .assert_append(merkle_tree.to_account_info())?;

        let new_holding_state;
        if let NonFungibleHolder::Holder(holder) = holder {
            new_holding_state = Holding::INF {
                characteristics: characteristics.to_owned(),
                holder: NonFungibleHolder::Eject {
                    mint: mint.key(),
                    holder: *holder,
                },
            };
        } else {
            return Err(ResourceErrorCode::InvalidHoldingState.into());
        }

        msg!("creating event");
        let event = CompressedDataEvent::Leaf {
            slot: clock.slot,
            tree_id: merkle_tree.key().to_bytes(),
            leaf_idx: holding_state.leaf_idx,
            seq: seq,
            stream_type: new_holding_state.event_stream(),
        };
        event.wrap(&log_wrapper)?;

        let bump_binding = [resource.bump];
        let signer_seeds = resource.seeds(&bump_binding);

        // update the compressed token account using controlled merkle tree
        hpl_toolkit::compression::replace_leaf(
            holding_state.root,
            holding_state.holding.to_compressed().to_node(),
            new_holding_state.to_compressed().to_node(),
            holding_state.leaf_idx,
            &resource.to_account_info(),
            &merkle_tree,
            &compression_program,
            &log_wrapper,
            remaining_accounts.to_vec(),
            Some(&[&signer_seeds[..]]),
        )?;
    } else {
        return Err(ResourceErrorCode::InvalidHoldingState.into());
    }

    Ok(())
}

pub fn create_non_fungible_member<'info>(
    token22_program: &AccountInfo<'info>,
    resource: &Account<'info, Resource>,
    payer: &AccountInfo<'info>,
    group: &AccountInfo<'info>,
    mint: &AccountInfo<'info>,
    rent_sysvar: &Rent,
    args: &UnWrapResourceArgs,
) -> Result<()> {
    if let UnWrapResourceArgs::INF {
        holding_state: _,
        metadata,
        characteristics,
    } = args
    {
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
            ExtensionInitializationParams::GroupPointer {
                authority: Some(resource.key()),
                group_address: Some(group.key()),
            },
            ExtensionInitializationParams::GroupMemberPointer {
                authority: Some(resource.key()),
                member_address: Some(mint.key()),
            },
        ];

        let extension_types = extension_initialization_params
            .iter()
            .map(|e| e.extension())
            .collect::<Vec<_>>();

        let mut space = ExtensionType::try_calculate_account_len::<Mint>(&extension_types).unwrap();

        // calculate the space required for the metadata
        space += 68 + 12 + metadata.name.len() + metadata.symbol.len() + metadata.uri.len();

        // calculate the space required for the INF characteristics
        space += characteristics
            .iter()
            .map(|(key, value)| key.len() + value.len())
            .sum::<usize>();

        // signature seeds for the mint authority
        let account_instruction = create_account(
            &payer.key(),
            &mint.key(),
            rent_sysvar.minimum_balance(space),
            space as u64,
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
            0,
        )?;

        // invoking the mint account creation with the signer seeds
        invoke(&mint_instruction, &[mint.to_owned()])?;
    } else {
        return Err(ResourceErrorCode::InvalidHoldingState.into());
    }

    Ok(())
}
