use {
    crate::{
        errors::ResourceErrorCode,
        utils::{use_burn_resource, use_mint_resource},
        BurnResourceArgs, HoldingAccountArgs, MintResourceArgs, Recipe, Resource, ResourceKind,
    },
    anchor_lang::prelude::*,
    anchor_spl::token_2022::Token2022,
    hpl_hive_control::state::{Project, User},
    spl_account_compression::{program::SplAccountCompression, Noop},
    std::collections::HashMap,
};

#[derive(Accounts)]
pub struct CraftRecipe<'info> {
    #[account()]
    pub project: Box<Account<'info, Project>>,

    #[account(mut, has_one = project)]
    pub recipe: Box<Account<'info, Recipe>>,

    pub user: Box<Account<'info, User>>,

    /// CHECK: This is safe
    #[account(constraint = user.wallets.contains(wallet.key))]
    pub wallet: AccountInfo<'info>,

    #[account(constraint = user.is_authority(authority.key))]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub rent_sysvar: Sysvar<'info, Rent>,

    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token2022>,

    pub clock: Sysvar<'info, Clock>,

    pub log_wrapper: Program<'info, Noop>,

    pub compression_program: Program<'info, SplAccountCompression>,

    #[account(mut, has_one = project)]
    pub output_resource: Box<Account<'info, Resource>>,

    #[account(has_one = project)]
    pub input_resource_one: Box<Account<'info, Resource>>,

    #[account(has_one = project)]
    pub input_resource_two: Option<Box<Account<'info, Resource>>>,

    #[account(has_one = project)]
    pub input_resource_three: Option<Box<Account<'info, Resource>>>,

    #[account(has_one = project)]
    pub input_resource_four: Option<Box<Account<'info, Resource>>>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CraftRecipeArg {
    pub holding_state: Option<HoldingAccountArgs>,
    pub proof_size: u8, // proof size + 1 = account in remaining accounts
}

pub fn craft_recipe<'info>(
    ctx: Context<'_, '_, '_, 'info, CraftRecipe<'info>>,
    args: Vec<CraftRecipeArg>,
) -> Result<()> {
    let recipe = &mut ctx.accounts.recipe;
    let mut args_iter = args.into_iter();

    // cursor for the remaining accounts to be used in the recipe
    let mut pointer: usize = 0;
    let point = &mut pointer;

    let remaining_accounts = ctx.remaining_accounts;
    let output_stats = next_craft_recipe(args_iter.next().unwrap(), remaining_accounts, point);

    // stacking the inputs in an directory for easy access
    msg!("resource 1");
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
    }

    // burning the input resources
    for input in recipe.inputs.iter() {
        if let Some(resource) = resource_map.get_mut(&input.resource) {
            msg!("burning the input resources {:?}", resource.1 .1.key());

            let holding_state = resource.1 .0.to_owned().unwrap();
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

    let args = match &ctx.accounts.output_resource.kind {
        ResourceKind::Fungible { .. } => MintResourceArgs::Fungible {
            holding_state: output_stats.0,
            amount: recipe.output.amount,
        },

        ResourceKind::INF { .. } => MintResourceArgs::INF {
            holding_state: output_stats.0,
            characteristics: recipe.output_characteristics.to_owned(),
        },

        ResourceKind::NonFungible => MintResourceArgs::INF {
            holding_state: output_stats.0,
            characteristics: recipe.output_characteristics.to_owned(),
        },
    };

    use_mint_resource(
        &mut ctx.accounts.output_resource,
        &output_stats.1,
        &ctx.accounts.wallet,
        output_stats.2,
        &ctx.accounts.clock,
        &ctx.accounts.log_wrapper,
        &ctx.accounts.compression_program,
        &args,
    )?;

    msg!("recipe crafted");

    Ok(())
}

pub fn next_craft_recipe<'a, 'info>(
    recipe: CraftRecipeArg,
    remaining_accounts: &'a [AccountInfo<'info>],
    previous_pointer: &mut usize,
) -> (
    Option<HoldingAccountArgs>,
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
