use {
    crate::{events::Event, state::*},
    anchor_lang::prelude::*,
    hpl_compression::Schema,
    hpl_events::HplEvents,
    hpl_hive_control::{program::HplHiveControl, state::Project},
    hpl_utils::traits::Default,
};

/// Accounts used in init NFT instruction
#[derive(Accounts)]
pub struct NewCharacterModel<'info> {
    // HIVE CONTROL
    #[account()]
    pub project: Box<Account<'info, Project>>,

    #[account()]
    pub character_model: Box<Account<'info, CharacterModel>>,

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
    character_model.config = args.config;
    character_model.attributes = args.attributes;

    Event::new_character_model(
        character_model.key(),
        character_model.try_to_vec().unwrap(),
        &ctx.accounts.clock,
    )
    .emit(ctx.accounts.hpl_events.to_account_info())?;

    Ok(())
}
