use {
    crate::{Recipe, Resource, ResourceAmountPair, XpPair},
    anchor_lang::prelude::*,
    anchor_spl::token_2022::Token2022,
    hpl_hive_control::state::Project,
};

#[derive(Accounts)]
#[instruction(args: InitilizeRecipieArgs)]
pub struct InitilizeRecipe<'info> {
    #[account()]
    pub project: Box<Account<'info, Project>>,

    /// CHECK: this is not dangerous. we are not reading & writing from it
    #[account()]
    pub key: AccountInfo<'info>,

    #[account(
        init,
        space = Recipe::get_len(args.amounts.len()),
        seeds = [
            b"recipe".as_ref(),
            project.key().as_ref(),
            key.key().as_ref(),
        ],
        bump,
        payer = payer,
    )]
    pub recipe: Box<Account<'info, Recipe>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub rent_sysvar: Sysvar<'info, Rent>,

    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token2022>,

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

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitilizeRecipieArgs {
    pub amounts: Vec<u64>,
    pub xp: XpPair,
}

pub fn initilize_recipe(ctx: Context<InitilizeRecipe>, args: InitilizeRecipieArgs) -> Result<()> {
    let recipe = &mut ctx.accounts.recipe;

    // verify the holding account leaf
    msg!("creating recipe account...");

    recipe.set_defaults();
    recipe.bump = ctx.bumps.recipe;
    recipe.project = ctx.accounts.project.key();
    recipe.key = ctx.accounts.key.key();
    recipe.xp = args.xp;

    // setting recipie's output
    recipe.output = ResourceAmountPair {
        amount: *args.amounts.get(0).unwrap_or(&0),
        resource: ctx.accounts.output_resource.key(),
    };

    // pushing resources with respect to thier amounts
    recipe.inputs.push(ResourceAmountPair {
        amount: *args.amounts.get(1).unwrap_or(&0),
        resource: ctx.accounts.input_resource_one.key(),
    });
    if let Some(input_resource_two) = &ctx.accounts.input_resource_two {
        recipe.inputs.push(ResourceAmountPair {
            amount: *args.amounts.get(2).unwrap_or(&0),
            resource: input_resource_two.key(),
        });
    }

    if let Some(input_resource_three) = &ctx.accounts.input_resource_three {
        recipe.inputs.push(ResourceAmountPair {
            amount: *args.amounts.get(3).unwrap_or(&0),
            resource: input_resource_three.key(),
        });
    }

    if let Some(input_resource_four) = &ctx.accounts.input_resource_four {
        recipe.inputs.push(ResourceAmountPair {
            amount: *args.amounts.get(4).unwrap_or(&0),
            resource: input_resource_four.key(),
        });
    }

    Ok(())
}
