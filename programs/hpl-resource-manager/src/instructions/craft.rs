use {
    crate::{
        errors::ResourceErrorCode,
        utils::{use_burn_resource, use_mint_resource},
        HoldingAccountArgs, MintResourceArgs, Recipe, Resource,
    },
    anchor_lang::prelude::*,
    anchor_spl::token::Token,
    hpl_hive_control::state::Project,
    spl_account_compression::{program::SplAccountCompression, Noop},
    std::collections::HashMap,
};

#[derive(Accounts)]
pub struct CraftRecipe<'info> {
    #[account()]
    pub project: Box<Account<'info, Project>>,

    #[account(mut, has_one = project)]
    pub recipe: Box<Account<'info, Recipe>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub rent_sysvar: Sysvar<'info, Rent>,

    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token>,

    pub clock: Sysvar<'info, Clock>,

    pub log_wrapper: Program<'info, Noop>,

    pub compression_program: Program<'info, SplAccountCompression>,

    #[account(mut, has_one = project)]
    pub output_resource: Account<'info, Resource>,

    #[account(has_one = project)]
    pub input_resource_one: Account<'info, Resource>,

    #[account(has_one = project)]
    pub input_resource_two: Option<Account<'info, Resource>>,

    #[account(has_one = project)]
    pub input_resource_three: Option<Account<'info, Resource>>,

    #[account(has_one = project)]
    pub input_resource_four: Option<Account<'info, Resource>>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CraftRecipieArg {
    pub holding_state: HoldingAccountArgs,

    pub proof_size: u8, // proof size + 1 = account in remaining accounts
}

pub fn craft_recipe<'info>(
    ctx: Context<'_, '_, '_, 'info, CraftRecipe<'info>>,
    args: Vec<CraftRecipieArg>,
) -> Result<()> {
    let recipe = &mut ctx.accounts.recipe;
    let mut args_iter = args.into_iter();

    // remaining accounts
    let mut account_infos: std::slice::Iter<'_, AccountInfo<'info>> =
        ctx.remaining_accounts.into_iter();

    let output_stats = next_craft_recipie(args_iter.next().unwrap(), &mut account_infos);

    // stacking the inputs in a vector
    let mut resource_map = HashMap::new();
    resource_map.insert(
        ctx.accounts.input_resource_one.key(),
        (
            &mut ctx.accounts.input_resource_one,
            next_craft_recipie(args_iter.next().unwrap(), &mut account_infos),
        ),
    );

    if let Some(input_resource_two) = &mut ctx.accounts.input_resource_two {
        resource_map.insert(
            input_resource_two.key(),
            (
                input_resource_two,
                next_craft_recipie(args_iter.next().unwrap(), &mut account_infos),
            ),
        );
    }
    if let Some(input_resource_three) = &mut ctx.accounts.input_resource_three {
        resource_map.insert(
            input_resource_three.key(),
            (
                input_resource_three,
                next_craft_recipie(args_iter.next().unwrap(), &mut account_infos),
            ),
        );
    }
    if let Some(input_resource_four) = &mut ctx.accounts.input_resource_four {
        resource_map.insert(
            input_resource_four.key(),
            (
                input_resource_four,
                next_craft_recipie(args_iter.next().unwrap(), &mut account_infos),
            ),
        );
    }

    for input in recipe.inputs.iter() {
        if let Some(resource) = resource_map.get_mut(&input.resource) {
            use_burn_resource(
                &mut resource.0,
                resource.1 .1,
                &resource.1 .2,
                &ctx.accounts.clock,
                &ctx.accounts.log_wrapper,
                &ctx.accounts.compression_program,
                &resource.1 .0,
                input.amount,
            )?;
        } else {
            return Err(ResourceErrorCode::ResourceNotFound.into());
        }
    }

    // minting the output resource
    use_mint_resource(
        &mut ctx.accounts.output_resource,
        output_stats.1,
        &ctx.accounts.authority,
        output_stats.2,
        &ctx.accounts.clock.to_owned(),
        &ctx.accounts.log_wrapper.to_owned(),
        &ctx.accounts.compression_program.to_owned(),
        MintResourceArgs {
            amount: recipe.output.amount,
            holding_state: Some(output_stats.0),
        },
    )?;

    msg!("crafting a recipe");

    Ok(())
}

pub fn next_craft_recipie<'a, 'info>(
    recipe: CraftRecipieArg,
    remaining_accounts: &mut std::slice::Iter<'a, AccountInfo<'info>>,
) -> (
    HoldingAccountArgs,
    &'a AccountInfo<'info>,
    Vec<AccountInfo<'info>>,
) {
    let tree = remaining_accounts.next().unwrap();
    let infos = remaining_accounts.take(recipe.proof_size as usize).cloned();

    (recipe.holding_state, tree, infos.collect())
}
