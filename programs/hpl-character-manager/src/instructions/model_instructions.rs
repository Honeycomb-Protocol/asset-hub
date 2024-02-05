use {
    crate::{events::Event, state::*},
    anchor_lang::prelude::*,
    hpl_events::HplEvents,
    hpl_hive_control::{program::HplHiveControl, state::Project},
    hpl_toolkit::reallocate,
    hpl_toolkit::{CompressedDataEvent, Schema},
    spl_account_compression::{program::SplAccountCompression, Noop},
};

/// Accounts used in init NFT instruction
#[derive(Accounts)]
#[instruction(args: NewCharacterModelArgs)]
pub struct NewCharacterModel<'info> {
    // HIVE CONTROL
    #[account()]
    pub project: Box<Account<'info, Project>>,

    /// CHECK: this is not dangerous
    pub key: AccountInfo<'info>,

    #[account(
        init, payer = authority,
        space = CharacterModel::get_size(&args.attributes, &args.config),
        seeds = [b"character_model", project.key().as_ref(), key.key().as_ref()],
        bump
    )]
    pub character_model: Box<Account<'info, CharacterModel>>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    /// HPL Fee collection vault
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub vault: AccountInfo<'info>,

    /// NATIVE SYSTEM PROGRAM
    pub system_program: Program<'info, System>,

    /// HPL Hive Control Program
    pub hive_control: Program<'info, HplHiveControl>,

    /// HPL Events Program
    pub hpl_events: Program<'info, HplEvents>,

    /// NATIVE CLOCK SYSVAR
    pub clock: Sysvar<'info, Clock>,

    /// NATIVE INSTRUCTIONS SYSVAR
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct NewCharacterModelArgs {
    config: CharacterConfig,
    attributes: Schema,
}

/// Init NFT
pub fn new_character_model(
    ctx: Context<NewCharacterModel>,
    args: NewCharacterModelArgs,
) -> Result<()> {
    let character_model = &mut ctx.accounts.character_model;
    character_model.set_defaults();

    character_model.bump = ctx.bumps["character_model"];
    character_model.project = ctx.accounts.project.key();
    character_model.key = ctx.accounts.key.key();
    character_model.config = args.config;
    character_model.attributes = args.attributes;

    Event::character_model(
        character_model.key(),
        character_model.try_to_vec().unwrap(),
        &ctx.accounts.clock,
    )
    .emit(ctx.accounts.hpl_events.to_account_info())?;

    Ok(())
}

#[derive(Accounts)]
pub struct CreateNewCharactersTree<'info> {
    /// The project account.
    #[account(mut)]
    pub project: Account<'info, Project>,

    #[account(mut, has_one = project)]
    pub character_model: Box<Account<'info, CharacterModel>>,

    /// CHECK: This account must be all zeros
    #[account(zero)]
    pub merkle_tree: UncheckedAccount<'info>,

    /// The (delegate) authority of the project.
    pub authority: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: This is not dangerous
    #[account(mut)]
    pub vault: AccountInfo<'info>,

    /// The system program.
    pub system_program: Program<'info, System>,

    /// HPL Events Program
    pub hpl_events: Program<'info, HplEvents>,

    /// SPL Compression program.
    pub compression_program: Program<'info, SplAccountCompression>,

    /// SPL Noop program.
    pub log_wrapper: Program<'info, Noop>,

    /// SOLANA SYSVAR CLOCK
    pub clock: Sysvar<'info, Clock>,

    /// NATIVE RENT SYSVAR
    pub rent_sysvar: Sysvar<'info, Rent>,

    /// NATIVE INSTURCTIONS SYSVAR
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateNewCharactersTreeArgs {
    pub max_depth: u32,
    pub max_buffer_size: u32,
}

pub fn create_new_characters_tree(
    ctx: Context<CreateNewCharactersTree>,
    args: CreateNewCharactersTreeArgs,
) -> Result<()> {
    let character_model = &mut ctx.accounts.character_model;

    reallocate(
        32,
        character_model.to_account_info(),
        ctx.accounts.payer.to_account_info(),
        &ctx.accounts.rent_sysvar,
        &ctx.accounts.system_program,
    )?;

    character_model
        .merkle_trees
        .merkle_trees
        .push(ctx.accounts.merkle_tree.key());

    let event = CompressedDataEvent::tree(
        ctx.accounts.merkle_tree.key(),
        character_model.merkle_trees.schema.clone(),
        crate::ID,
        String::from("Character"),
    );
    event.wrap(&ctx.accounts.log_wrapper)?;

    let character_model_seeds = &[
        b"character_model",
        character_model.project.as_ref(),
        character_model.key.as_ref(),
        &[character_model.bump],
    ];
    let character_model_signer = &[&character_model_seeds[..]];

    hpl_toolkit::init_tree(
        args.max_depth,
        args.max_buffer_size,
        &character_model.to_account_info(),
        &ctx.accounts.merkle_tree,
        &ctx.accounts.compression_program,
        &ctx.accounts.log_wrapper,
        Some(character_model_signer),
    )?;

    Event::character_model(
        character_model.key(),
        character_model.try_to_vec().unwrap(),
        &ctx.accounts.clock,
    )
    .emit(ctx.accounts.hpl_events.to_account_info())?;

    Ok(())
}
