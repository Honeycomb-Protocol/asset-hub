use {
    crate::{errors::HplCharacterManagerError, state::*},
    anchor_lang::prelude::*,
    hpl_hive_control::{program::HplHiveControl, state::Project},
    hpl_toolkit::compression::{
        merkle_tree_apply_fn_deep, CompressedDataChunk, CompressedDataEvent, ToNode,
    },
    spl_account_compression::{program::SplAccountCompression, Noop},
};

/// Accounts used in init NFT instruction
#[derive(Accounts)]
pub struct UseCharacter<'info> {
    // HIVE CONTROL
    #[account()]
    pub project: Box<Account<'info, Project>>,

    #[account()]
    pub character_model: Box<Account<'info, CharacterModel>>,

    /// CHECK: unsafe
    #[account(mut)]
    pub merkle_tree: AccountInfo<'info>,

    /// The service that's using the character
    #[account(mut)]
    pub user: Signer<'info>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub owner: Signer<'info>,

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
pub struct UseCharacterArgs {
    pub root: [u8; 32],
    pub leaf_idx: u32,
    pub source_hash: [u8; 32],
    pub current_used_by: CharacterUsedBy,
    pub new_used_by: CharacterUsedBy,
}

/// Init NFT
pub fn use_character<'info>(
    ctx: Context<'_, '_, '_, 'info, UseCharacter<'info>>,
    args: UseCharacterArgs,
) -> Result<()> {
    ctx.accounts
        .character_model
        .assert_merkle_tree(ctx.accounts.merkle_tree.key())?;

    let mut character_compressed = CharacterSchemaCompressed {
        owner: ctx.accounts.owner.key(),
        source: args.source_hash,
        used_by: args.current_used_by.to_node(),
    };

    hpl_toolkit::verify_leaf(
        args.root,
        character_compressed.to_node(),
        args.leaf_idx,
        &ctx.accounts.merkle_tree,
        &ctx.accounts.compression_program,
        ctx.remaining_accounts.to_vec(),
    )?;

    if args.current_used_by.is_used() {
        if !args.current_used_by.match_user(ctx.accounts.user.key) {
            return Err(HplCharacterManagerError::CharacterInUse.into());
        }

        if args.new_used_by.is_used() && !args.new_used_by.match_used_by(&args.current_used_by) {
            return Err(HplCharacterManagerError::UsedByMismatch.into());
        }
    }

    let merkle_tree_bytes = ctx.accounts.merkle_tree.try_borrow_data()?;
    let event = CompressedDataEvent::Leaf {
        slot: ctx.accounts.clock.slot,
        tree_id: ctx.accounts.merkle_tree.key().to_bytes(),
        leaf_idx: args.leaf_idx,
        seq: hpl_toolkit::merkle_tree_apply_fn!(merkle_tree_bytes get_seq) + 1,
        stream_type: args.new_used_by.event_stream(),
    };
    event.wrap(&ctx.accounts.log_wrapper)?;

    let character_model_seeds = &[
        b"character_model",
        ctx.accounts.character_model.project.as_ref(),
        ctx.accounts.character_model.key.as_ref(),
        &[ctx.accounts.character_model.bump],
    ];
    let character_model_signer = &[&character_model_seeds[..]];

    let previous_leaf = character_compressed.to_node();
    character_compressed.used_by = args.new_used_by.to_node();
    let new_leaf = character_compressed.to_node();

    hpl_toolkit::replace_leaf(
        args.root,
        previous_leaf,
        new_leaf,
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

#[derive(Accounts)]
pub struct VerifyCharacter<'info> {
    // HIVE CONTROL
    #[account()]
    pub project: Box<Account<'info, Project>>,

    #[account()]
    pub character_model: Box<Account<'info, CharacterModel>>,

    /// CHECK: unsafe
    #[account(mut)]
    pub merkle_tree: AccountInfo<'info>,

    /// The wallet that owns the character
    /// CHECK: This is safe
    pub owner: AccountInfo<'info>,

    /// NATIVE SYSTEM PROGRAM
    pub system_program: Program<'info, System>,

    /// HPL Hive Control Program
    pub hive_control: Program<'info, HplHiveControl>,

    /// SPL account compression program.
    pub compression_program: Program<'info, SplAccountCompression>,

    /// SPL Noop program.
    pub log_wrapper: Program<'info, Noop>,

    /// NATIVE INSTRUCTIONS SYSVAR
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct VerifyCharacterArgs {
    pub root: [u8; 32],
    pub leaf_idx: u32,
    pub source: DataOrHash<CharacterSource>,
    pub used_by: DataOrHash<CharacterUsedBy>,
}

pub fn verify_character<'info>(
    ctx: Context<'_, '_, '_, 'info, VerifyCharacter<'info>>,
    args: VerifyCharacterArgs,
) -> Result<()> {
    ctx.accounts
        .character_model
        .assert_merkle_tree(ctx.accounts.merkle_tree.key())?;

    let source_hash = match args.source {
        DataOrHash::Data(data) => data.to_node(),
        DataOrHash::Hash(hash) => hash,
    };

    let used_by_hash = match args.used_by {
        DataOrHash::Data(data) => data.to_node(),
        DataOrHash::Hash(hash) => hash,
    };

    let character_compressed = CharacterSchemaCompressed {
        owner: ctx.accounts.owner.key(),
        source: source_hash,
        used_by: used_by_hash,
    };

    hpl_toolkit::verify_leaf(
        args.root,
        character_compressed.to_node(),
        args.leaf_idx,
        &ctx.accounts.merkle_tree,
        &ctx.accounts.compression_program,
        ctx.remaining_accounts.to_vec(),
    )?;

    Ok(())
}
