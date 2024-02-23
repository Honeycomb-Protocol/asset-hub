use {
    crate::{
        errors::ResourceErrorCode, utils::burn_tokens, Holding, HoldingAccountArgs, Resource,
    }, anchor_lang::prelude::*, anchor_spl::{
        associated_token::AssociatedToken, token::{close_account, CloseAccount}, token_2022::Token2022, token_interface::{ Mint, TokenAccount}
    }, hpl_hive_control::state::Project, hpl_toolkit::compression::{verify_leaf, CompressedData, CompressedDataEvent, ToNode}, spl_account_compression::{program::SplAccountCompression, Noop}
};

#[derive(Accounts)]
pub struct WrapResource<'info> {
    #[account()]
    pub project: Box<Account<'info, Project>>,

    #[account(has_one = project, has_one = mint)]
    pub resource: Box<Account<'info, Resource>>,

    #[account(mut, constraint = resource.mint == mint.key())]
    pub mint: Box<InterfaceAccount<'info, Mint>>,

    /// CHECK: this is not dangerous. we are not reading & writing from it
    #[account(mut)]
    pub merkle_tree: AccountInfo<'info>,

    #[account(
        mut, 
        constraint = token_account.owner == owner.key(),
        constraint = token_account.mint == mint.key()
    )]
    pub token_account: Box<InterfaceAccount<'info, TokenAccount>>,

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
pub enum WrapResourceArgs {
    Fungible {
        amount: u64,
        holding_state: HoldingAccountArgs,
    },

    INF {
        holding_state: HoldingAccountArgs,
    },
}

pub fn wrap_resource<'info>(
    ctx: Context<'_, '_, '_, 'info, WrapResource<'info>>,
    args: WrapResourceArgs,
) -> Result<()> {

    let resource = &mut ctx.accounts.resource;

    match args {
        WrapResourceArgs::Fungible { amount, holding_state } => {
            if amount > ctx.accounts.token_account.amount {
                return Err(ResourceErrorCode::InsufficientAmount.into());
            }
        
            msg!("burning tokens");
             // transfer the amount to the owner
             burn_tokens(
                &ctx.accounts.token_program,
                &ctx.accounts.mint.to_account_info(),
                &ctx.accounts.token_account.to_account_info(),
                &ctx.accounts.owner.to_account_info(),
                amount,
            )?;
        
        
            // close the account if the amount is zero after the burning the desired amount
            if amount == ctx.accounts.token_account.amount {
                msg!("closing account");
                close_account(
                    CpiContext::new(
                        ctx.accounts.token_program.to_account_info(),
                        CloseAccount {
                            account: ctx.accounts.token_account.to_account_info(),
                            destination: ctx.accounts.owner.to_account_info(),
                            authority: ctx.accounts.owner.to_account_info(),
                        }
                    ),
                )?;
            }
            
            msg!("verifying leaf");
            // verify the holding account leaf
            verify_leaf(
                holding_state.root,
                holding_state.holding.to_compressed().to_node(),
                holding_state.leaf_idx,
                &ctx.accounts.merkle_tree.to_account_info(),
                &ctx.accounts.compression_program,
                ctx.remaining_accounts.to_vec(),
            )?;
        
        
            let (_leaf_idx, seq) = resource
                .merkle_trees
                .assert_append(ctx.accounts.merkle_tree.to_account_info())?;
        
            let new_holding_state = Holding::Fungible { 
                holder:  ctx.accounts.owner.key(), 
                balance: holding_state.holding.get_balance() + amount,
            };
        
            msg!("creating event");
            let event = CompressedDataEvent::Leaf {
                slot: ctx.accounts.clock.slot,
                tree_id: ctx.accounts.merkle_tree.key().to_bytes(),
                leaf_idx: holding_state.leaf_idx,
                seq: seq,
                stream_type: new_holding_state.event_stream(),
            };
            event.wrap(&ctx.accounts.log_wrapper)?;
        
            let bump_binding = [resource.bump];
            let signer_seeds = resource.seeds(&bump_binding);
        
            msg!("updating leaf");
            // update the compressed token account using controlled merkle tree
            hpl_toolkit::compression::replace_leaf(
                holding_state.root,
                holding_state.holding.to_compressed().to_node(),
                new_holding_state.to_compressed().to_node(),
                holding_state.leaf_idx,
                &resource.to_account_info(),
                &ctx.accounts.merkle_tree,
                &ctx.accounts.compression_program,
                &ctx.accounts.log_wrapper,
                ctx.remaining_accounts.to_vec(),
                Some(&[&signer_seeds[..]]),
            )?;
        },

        WrapResourceArgs::INF { .. } => {},
    }
    

    Ok(())
}