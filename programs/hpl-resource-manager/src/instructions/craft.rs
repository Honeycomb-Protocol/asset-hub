use {
    crate::{
        errors::ResourceErrorCode,
        utils::{use_burn_resource, use_mint_resource},
        BurnResourceArgs, HoldingAccountArgs, MintResourceArgs, Recipe, RecipeProof, Resource,
        ResourceKind,
    },
    anchor_lang::prelude::*,
    anchor_spl::token_2022::Token2022,
    hpl_hive_control::{
        cpi::{accounts::UpdateProfile, update_profile},
        instructions::UpdateProfileArgs,
        program::HplHiveControl,
        state::{
            CustomDataUpdates, PlatformData, PlatformDataUpdates, Project, UserCompressed, Wallets,
        },
    },
    hpl_toolkit::compression::*,
    spl_account_compression::{program::SplAccountCompression, Noop},
    std::collections::HashMap,
};

/* ************************** MINT RECIPE ******************************** */
#[derive(Accounts)]
#[instruction(params: CraftMintRecipeArgs)]
pub struct CraftMintRecipe<'info> {
    #[account()]
    pub project: Box<Account<'info, Project>>,

    #[account(mut, has_one = project)]
    pub recipe: Box<Account<'info, Recipe>>,

    #[account(
        init_if_needed,
        space = 8 + 1,
        seeds = [b"recipe_proof", recipe.key.as_ref(), params.user.leaf().as_ref()],
        payer = payer,
        bump,
    )]
    pub recipe_proof: Account<'info, RecipeProof>,

    #[account(mut, has_one = project)]
    pub output_resource: Box<Account<'info, Resource>>,

    /// CHECK: This is safe
    #[account(constraint = params.user.wallets.wallets.contains(wallet.key))]
    pub wallet: AccountInfo<'info>,

    // #[account(constraint = params.user.wallets.wallets.is_authority(authority.key))]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub rent_sysvar: Sysvar<'info, Rent>,

    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token2022>,

    /// CHECK: This is safe
    pub instructions_sysvar: AccountInfo<'info>,

    /// CHECK: This is safe
    pub vault: AccountInfo<'info>,

    /// HIVE CONTROL PROGRAM
    pub hive_control: Program<'info, HplHiveControl>,

    pub clock: Sysvar<'info, Clock>,

    pub log_wrapper: Program<'info, Noop>,

    pub compression_program: Program<'info, SplAccountCompression>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CraftMintProfileParams {
    pub root: [u8; 32],
    pub leaf_idx: u32,
    pub identity: String,
    pub info: [u8; 32],
    pub custom_data: [u8; 32],
    pub platform_data: PlatformData,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CraftMintRecipeArgs {
    pub user: CraftResourceUserParams,
    pub profile: CraftMintProfileParams,
    pub holding: Option<HoldingAccountArgs>,
    pub proof_size: [u8; 3],
}

pub fn craft_mint_recipe<'info>(
    ctx: Context<'_, '_, '_, 'info, CraftMintRecipe<'info>>,
    args: CraftMintRecipeArgs,
) -> Result<()> {
    let recipe = &mut ctx.accounts.recipe;
    let output_resource = &mut ctx.accounts.output_resource;

    let resourse_accounts = &ctx.remaining_accounts[0..args.proof_size[0] as usize];
    let mint_args = match &output_resource.kind {
        ResourceKind::Fungible { .. } => MintResourceArgs::Fungible {
            holding_state: args.holding,
            amount: recipe.output.amount,
        },

        ResourceKind::INF { .. } => MintResourceArgs::INF {
            holding_state: args.holding,
            characteristics: recipe.output_characteristics.to_owned(),
        },

        ResourceKind::NonFungible => MintResourceArgs::INF {
            holding_state: args.holding,
            characteristics: recipe.output_characteristics.to_owned(),
        },
    };

    use_mint_resource(
        output_resource,
        &resourse_accounts[0],
        &ctx.accounts.wallet,
        &resourse_accounts[1..],
        &ctx.accounts.clock,
        &ctx.accounts.log_wrapper,
        &ctx.accounts.compression_program,
        &mint_args,
    )?;

    msg!("MINT RECIPE: recipe minted.");

    // verify the user leaf node
    let user = args.user.leaf();
    let user_account =
        &ctx.remaining_accounts[args.proof_size[0] as usize..args.proof_size[1] as usize];
    verify_leaf(
        args.user.root,
        user,
        args.user.leaf_idx,
        &user_account[0],
        &ctx.accounts.compression_program,
        user_account[1..].to_vec(),
    )?;

    msg!("MINT RECIPE: user leaf verified.");

    let profile_proof = &ctx.remaining_accounts[args.proof_size[1] as usize..];
    let mut profile_ctx = CpiContext::new(
        ctx.accounts.hive_control.to_account_info(),
        UpdateProfile {
            clock: ctx.accounts.clock.to_account_info(),
            vault: ctx.accounts.vault.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
            merkle_tree: profile_proof[0].to_account_info(),
            log_wrapper: ctx.accounts.log_wrapper.to_account_info(),
            rent_sysvar: ctx.accounts.rent_sysvar.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            compression_program: ctx.accounts.compression_program.to_account_info(),
            instructions_sysvar: ctx.accounts.instructions_sysvar.to_account_info(),
        },
    );
    profile_ctx.remaining_accounts = profile_proof.to_vec();

    let platform_updates = PlatformDataUpdates {
        custom: CustomDataUpdates {
            current: args.profile.platform_data.custom,
            add: HashMap::new(),
            remove: Vec::new(),
        },
        add_achievements: Vec::new(),
        current_achievements: args.profile.platform_data.achievements,
        current_xp: args.profile.platform_data.xp,
        add_xp: args.profile.platform_data.xp + recipe.xp.increament,
    };

    // update the user profile with the new data
    update_profile(
        profile_ctx,
        UpdateProfileArgs {
            root: args.profile.root,
            leaf_idx: args.user.leaf_idx,
            project: ctx.accounts.project.key(),
            user_id: args.user.id,
            identity: args.profile.identity,
            info: DataOrHash::Hash(args.profile.info),
            platform_data: DataOrHash::Data(platform_updates),
            custom_data: DataOrHash::Hash(args.profile.custom_data),
        },
    )?;

    // recipe proof
    let recipe_proof = &mut ctx.accounts.recipe_proof;
    recipe_proof.user = user;

    Ok(())
}

/* ************************** BURN RECIPE ******************************** */
#[derive(Accounts)]
#[instruction(params: CraftBurnRecipeArgs)]
pub struct CraftBurnRecipe<'info> {
    pub project: Box<Account<'info, Project>>,

    #[account(mut, has_one = project)]
    pub recipe: Box<Account<'info, Recipe>>,

    /// CHECK: This is safe
    #[account(constraint = params.user.wallets.wallets.contains(wallet.key))]
    pub wallet: AccountInfo<'info>,

    #[account(
        mut,
        close = payer,
        constraint = recipe_proof.user == params.user.leaf(),
    )]
    pub recipe_proof: Account<'info, RecipeProof>,

    // #[account(constraint = params.user.wallets.assert_authority(&authority))]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub rent_sysvar: Sysvar<'info, Rent>,

    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token2022>,

    pub clock: Sysvar<'info, Clock>,

    pub log_wrapper: Program<'info, Noop>,

    pub compression_program: Program<'info, SplAccountCompression>,

    #[account(has_one = project)]
    pub input_resource_one: Box<Account<'info, Resource>>,

    #[account(has_one = project)]
    pub input_resource_two: Option<Box<Account<'info, Resource>>>,

    #[account(has_one = project)]
    pub input_resource_three: Option<Box<Account<'info, Resource>>>,

    #[account(has_one = project)]
    pub input_resource_four: Option<Box<Account<'info, Resource>>>,
}
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CraftResourceUserParams {
    pub id: u64,
    pub leaf_idx: u32,
    pub root: [u8; 32],
    pub info_hash: [u8; 32],
    pub wallets: Wallets,
}

impl CraftResourceUserParams {
    pub fn leaf(&self) -> [u8; 32] {
        UserCompressed {
            id: self.id,
            info: self.info_hash,
            wallets: self.wallets.to_node(),
        }
        .to_node()
    }
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CraftBurnHoldingParams {
    pub holding_state: HoldingAccountArgs,
    pub proof_size: u8, // proof size + 1 = account in remaining accounts
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CraftBurnRecipeArgs {
    pub user: CraftResourceUserParams,
    pub holdings: Vec<CraftBurnHoldingParams>,
}

pub fn next_craft_recipe<'a, 'info>(
    recipe: CraftBurnHoldingParams,
    remaining_accounts: &'a [AccountInfo<'info>],
    previous_pointer: &mut usize,
) -> (
    HoldingAccountArgs,
    &'a AccountInfo<'info>,
    &'a [AccountInfo<'info>],
) {
    if *previous_pointer >= remaining_accounts.len() {
        msg!("remaining account length {:?}", remaining_accounts.len());
        panic!("not enough accounts to craft the recipe");
    }

    let ponter = *previous_pointer + recipe.proof_size as usize;
    let accounts = &remaining_accounts[*previous_pointer..ponter];
    msg!("proof size: {}", recipe.proof_size);
    msg!("previous pointer: {}", *previous_pointer);

    // update the pointer
    *previous_pointer += recipe.proof_size as usize;

    (recipe.holding_state, &accounts[0], &accounts[1..])
}

pub fn craft_burn_recipe<'info>(
    ctx: Context<'_, '_, '_, 'info, CraftBurnRecipe<'info>>,
    args: CraftBurnRecipeArgs,
) -> Result<()> {
    let remaining_accounts = ctx.remaining_accounts;
    let recipe = &mut ctx.accounts.recipe;
    let mut args_iter = args.holdings.into_iter();

    // cursor for the remaining accounts to be used in the recipe
    let mut pointer: usize = 0;
    let point = &mut pointer;

    // stakeing the inputs in an directory for easy access
    let mut resource_map = HashMap::new();
    resource_map.insert(
        ctx.accounts.input_resource_one.key(),
        (
            &mut ctx.accounts.input_resource_one,
            next_craft_recipe(args_iter.next().unwrap(), remaining_accounts, point),
        ),
    );

    if let Some(input_resource_two) = &mut ctx.accounts.input_resource_two {
        msg!("resource 2");
        resource_map.insert(
            input_resource_two.key(),
            (
                input_resource_two,
                next_craft_recipe(args_iter.next().unwrap(), remaining_accounts, point),
            ),
        );
    }

    if let Some(input_resource_three) = &mut ctx.accounts.input_resource_three {
        msg!("resource 3");
        resource_map.insert(
            input_resource_three.key(),
            (
                input_resource_three,
                next_craft_recipe(args_iter.next().unwrap(), remaining_accounts, point),
            ),
        );
    }

    if let Some(input_resource_four) = &mut ctx.accounts.input_resource_four {
        msg!("resource 5");
        resource_map.insert(
            input_resource_four.key(),
            (
                input_resource_four,
                next_craft_recipe(args_iter.next().unwrap(), remaining_accounts, point),
            ),
        );
    };

    // burning the input resources
    for input in recipe.inputs.iter() {
        if let Some(resource) = resource_map.get_mut(&input.resource) {
            msg!("burning the input resources {:?}", resource.0.key());

            let holding_state = resource.1 .0.to_owned();
            let args = match resource.0.kind {
                ResourceKind::Fungible { .. } => BurnResourceArgs::Fungible {
                    holding_state: holding_state,
                    amount: input.amount,
                },

                ResourceKind::INF { .. } => BurnResourceArgs::INF {
                    holding_state: holding_state,
                },

                ResourceKind::NonFungible => BurnResourceArgs::INF {
                    holding_state: holding_state,
                },
            };

            use_burn_resource(
                &mut resource.0,
                &resource.1 .1,
                &resource.1 .2,
                &ctx.accounts.clock,
                &ctx.accounts.log_wrapper,
                &ctx.accounts.compression_program,
                &args,
            )?;
        } else {
            return Err(ResourceErrorCode::ResourceNotFound.into());
        }
    }

    msg!("recipe burned. proof created.");

    Ok(())
}
