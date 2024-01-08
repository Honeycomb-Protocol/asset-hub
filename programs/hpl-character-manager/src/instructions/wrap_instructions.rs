use {
    crate::{errors::HplCharacterManagerError, state::*},
    anchor_lang::prelude::*,
    hpl_compression::{
        merkle_tree_apply_fn_deep, CompressedData, CompressedDataEvent, CompressedDataEventStream,
        ToNode,
    },
    hpl_hive_control::{program::HplHiveControl, state::Project},
    hpl_utils::Default,
    spl_account_compression::{program::SplAccountCompression, Noop},
};

/// Accounts used in init NFT instruction
#[derive(Accounts)]
pub struct WrapCharacter<'info> {
    // HIVE CONTROL
    #[account()]
    pub project: Box<Account<'info, Project>>,

    #[account()]
    pub character_model: Box<Account<'info, CharacterModel>>,

    #[account(
        mut,
        has_one = wallet,
        constraint = asset_custody.character_model.is_some() && asset_custody.character_model.unwrap() == character_model.key(),
        close = wallet,
    )]
    pub asset_custody: Box<Account<'info, AssetCustody>>,

    /// CHECK: unsafe
    #[account(mut)]
    pub merkle_tree: AccountInfo<'info>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub wallet: Signer<'info>,

    /// HPL Fee collection vault
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub vault: AccountInfo<'info>,

    /// NATIVE SYSTEM PROGRAM
    pub system_program: Program<'info, System>,

    /// HPL Hive Control Program
    pub hive_control: Program<'info, HplHiveControl>,

    /// SPL account compression program.
    pub compression_program: Program<'info, SplAccountCompression>,

    /// SPL Noop program.
    pub log_wrapper: Program<'info, Noop>,

    /// NATIVE CLOCK SYSVAR
    pub clock: Sysvar<'info, Clock>,

    /// NATIVE INSTRUCTIONS SYSVAR
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,
}

/// Init NFT
pub fn wrap_character(ctx: Context<WrapCharacter>) -> Result<()> {
    if ctx.accounts.asset_custody.source.is_none() {
        return Err(HplCharacterManagerError::CustodialAssetSourceNotFound.into());
    }

    let (leaf_idx, seq) = ctx
        .accounts
        .character_model
        .merkle_trees
        .assert_append(ctx.accounts.merkle_tree.to_account_info())?;

    let source = ctx.accounts.asset_custody.source.clone().unwrap();
    let character = CharacterSchema {
        owner: ctx.accounts.wallet.key(),
        source,
        used_by: CharacterUsedBy::None,
    };

    let event = CompressedDataEvent::Leaf {
        slot: ctx.accounts.clock.slot,
        tree_id: ctx.accounts.merkle_tree.key().to_bytes(),
        leaf_idx,
        seq,
        stream_type: character.event_stream(),
    };
    event.wrap(&ctx.accounts.log_wrapper)?;

    let character_model_seeds = &[
        b"character_model",
        ctx.accounts.character_model.project.as_ref(),
        ctx.accounts.character_model.key.as_ref(),
        &[ctx.accounts.character_model.bump],
    ];
    let character_model_signer = &[&character_model_seeds[..]];

    hpl_compression::append_leaf(
        character.to_compressed().to_node(),
        &ctx.accounts.character_model.to_account_info(),
        &ctx.accounts.merkle_tree,
        &ctx.accounts.compression_program,
        &ctx.accounts.log_wrapper,
        Some(character_model_signer),
    )?;

    Ok(())
}

/// Accounts used in init NFT instruction
#[derive(Accounts)]
#[instruction(args: UnwrapCharacterArgs)]
pub struct UnwrapCharacter<'info> {
    // HIVE CONTROL
    #[account()]
    pub project: Box<Account<'info, Project>>,

    #[account()]
    pub character_model: Box<Account<'info, CharacterModel>>,

    #[account(
        init, payer = wallet,
        space = AssetCustody::LEN,
        seeds = [
          b"asset_custody",
          args.character.id().as_ref()
        ],
        bump
      )]
    pub asset_custody: Box<Account<'info, AssetCustody>>,

    /// CHECK: unsafe
    #[account(mut)]
    pub merkle_tree: AccountInfo<'info>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub wallet: Signer<'info>,

    /// HPL Fee collection vault
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub vault: AccountInfo<'info>,

    /// NATIVE SYSTEM PROGRAM
    pub system_program: Program<'info, System>,

    /// HPL Hive Control Program
    pub hive_control: Program<'info, HplHiveControl>,

    /// SPL account compression program.
    pub compression_program: Program<'info, SplAccountCompression>,

    /// SPL Noop program.
    pub log_wrapper: Program<'info, Noop>,

    /// NATIVE CLOCK SYSVAR
    pub clock: Sysvar<'info, Clock>,

    /// NATIVE INSTRUCTIONS SYSVAR
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UnwrapCharacterArgs {
    root: [u8; 32],
    leaf_idx: u32,
    character: CharacterSchema,
}

/// Init NFT
pub fn unwrap_character<'info>(
    ctx: Context<'_, '_, '_, 'info, UnwrapCharacter<'info>>,
    args: UnwrapCharacterArgs,
) -> Result<()> {
    if args.character.used_by.is_used() {
        return Err(HplCharacterManagerError::CharacterInUse.into());
    }

    let merkle_tree_bytes = ctx.accounts.merkle_tree.try_borrow_data()?;
    let event = CompressedDataEvent::Leaf {
        slot: ctx.accounts.clock.slot,
        tree_id: ctx.accounts.merkle_tree.key().to_bytes(),
        leaf_idx: args.leaf_idx,
        seq: hpl_compression::merkle_tree_apply_fn!(merkle_tree_bytes get_seq) + 1,
        stream_type: CompressedDataEventStream::Empty,
    };
    event.wrap(&ctx.accounts.log_wrapper)?;

    let character_model_seeds = &[
        b"character_model",
        ctx.accounts.character_model.project.as_ref(),
        ctx.accounts.character_model.key.as_ref(),
        &[ctx.accounts.character_model.bump],
    ];
    let character_model_signer = &[&character_model_seeds[..]];

    hpl_compression::replace_leaf(
        args.root,
        args.character.to_compressed().to_node(),
        [0; 32],
        args.leaf_idx,
        &ctx.accounts.character_model.to_account_info(),
        &ctx.accounts.merkle_tree,
        &ctx.accounts.compression_program,
        &ctx.accounts.log_wrapper,
        ctx.remaining_accounts.to_vec(),
        Some(character_model_signer),
    )?;

    Ok(())
}
