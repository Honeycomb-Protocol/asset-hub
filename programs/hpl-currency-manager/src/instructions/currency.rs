use {
    crate::state::*,
    anchor_lang::prelude::*,
    anchor_spl::token::{
        self, Approve, FreezeAccount, Mint, MintTo, Revoke, ThawAccount, Token, TokenAccount,
    },
    hpl_hive_control::{
        program::HplHiveControl,
        state::{DelegateAuthority, Project},
    },
    hpl_utils::traits::Default,
    mpl_token_metadata::{instruction::CreateArgs, state::AssetData},
};

/// Accounts used in create currency instruction
#[derive(Accounts)]
#[instruction(args: CreateCurrencyArgs)]
pub struct CreateCurrency<'info> {
    /// Currency account
    #[account(
      init, payer = payer,
      space = Currency::LEN,
      seeds = [
        b"currency".as_ref(),
        mint.key().as_ref(),
      ],
      bump
    )]
    pub currency: Account<'info, Currency>,

    /// Currency mint
    #[account(
      init,
      payer = payer,
      mint::decimals = args.decimals,
      mint::authority = currency,
      mint::freeze_authority = currency,
    )]
    pub mint: Account<'info, Mint>,

    /// Currency metadata
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub metadata: AccountInfo<'info>,

    /// The project this currency is associated with.
    #[account(mut)]
    pub project: Box<Account<'info, Project>>,

    /// [Option] Delegate authority account containing permissions of the wallet for the project
    #[account(has_one = authority)]
    pub delegate_authority: Option<Account<'info, DelegateAuthority>>,

    /// The wallet that holds the authority over the project
    pub authority: Signer<'info>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: This account is only used to collect platform fee
    #[account(mut)]
    pub vault: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub sysvar_instructions: AccountInfo<'info>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    pub hive_control_program: Program<'info, HplHiveControl>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub struct CreateCurrencyArgs {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub decimals: u8,
    pub currency_type: Option<CurrencyType>,
}

/// Create a new currency
pub fn create_currency(ctx: Context<CreateCurrency>, args: CreateCurrencyArgs) -> Result<()> {
    let currency = &mut ctx.accounts.currency;
    currency.set_defaults();

    currency.bump = ctx.bumps["currency"];
    currency.project = ctx.accounts.project.key();
    currency.mint = ctx.accounts.mint.key();
    currency.currency_type = args.currency_type.unwrap_or(CurrencyType::NonCustodial);

    let currency_seeds = &[
        b"currency".as_ref(),
        currency.mint.as_ref(),
        &[currency.bump],
    ];
    let currency_signer = &[&currency_seeds[..]];

    hpl_utils::metadata::create(
        CreateArgs::V1 {
            asset_data: AssetData {
                name: args.name,
                symbol: args.symbol,
                uri: args.uri,
                seller_fee_basis_points: 0,
                creators: None,
                primary_sale_happened: false,
                is_mutable: true,
                token_standard: mpl_token_metadata::state::TokenStandard::Fungible,
                collection: None,
                uses: None,
                collection_details: None,
                rule_set: None,
            },
            decimals: None,
            print_supply: None,
        },
        false,
        true,
        ctx.accounts.metadata.to_account_info(),
        None,
        ctx.accounts.mint.to_account_info(),
        currency.to_account_info(),
        ctx.accounts.payer.to_account_info(),
        currency.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.sysvar_instructions.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        Some(currency_signer),
    )?;

    Ok(())
}

/// Accounts used in mint currency instruction
#[derive(Accounts)]
pub struct MintCurrency<'info> {
    /// Currency account
    #[account(has_one = project, has_one = mint)]
    pub currency: Account<'info, Currency>,

    /// Holder account
    #[account(has_one = currency, has_one = token_account, constraint = holder_account.owner == authority.key())]
    pub holder_account: Account<'info, HolderAccount>,

    /// Currency mint
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    /// Token account holding the currency
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,

    /// The project this currency is associated with.
    #[account(mut)]
    pub project: Box<Account<'info, Project>>,

    /// [Option] Delegate authority account containing permissions of the wallet for the project
    #[account(has_one = authority)]
    pub delegate_authority: Option<Account<'info, DelegateAuthority>>,

    /// The wallet that holds the authority over the project
    pub authority: Signer<'info>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: This account is only used to collect platform fee
    #[account(mut)]
    pub vault: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    pub hive_control_program: Program<'info, HplHiveControl>,
}

/// mint currency
pub fn mint_currency(ctx: Context<MintCurrency>, amount: u64) -> Result<()> {
    if ctx.accounts.currency.currency_type == CurrencyType::NonCustodial {
        let holder_seeds = &[
            b"holder_account",
            ctx.accounts.holder_account.token_account.as_ref(),
            &[ctx.accounts.holder_account.bump],
        ];
        let holder_signer = &[&holder_seeds[..]];

        token::thaw_account(CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            ThawAccount {
                account: ctx.accounts.token_account.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                authority: ctx.accounts.holder_account.to_account_info(),
            },
            holder_signer,
        ))?;

        token::revoke(CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Revoke {
                source: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.holder_account.to_account_info(),
            },
            holder_signer,
        ))?;
    }

    let currency_seeds = &[
        b"currency".as_ref(),
        ctx.accounts.currency.mint.as_ref(),
        &[ctx.accounts.currency.bump],
    ];
    let currency_signer = &[&currency_seeds[..]];

    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.currency.to_account_info(),
            },
            currency_signer,
        ),
        amount,
    )?;

    if ctx.accounts.currency.currency_type == CurrencyType::NonCustodial {
        let holder_seeds = &[
            b"holder_account",
            ctx.accounts.holder_account.token_account.as_ref(),
            &[ctx.accounts.holder_account.bump],
        ];
        let holder_signer = &[&holder_seeds[..]];

        token::approve(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Approve {
                    delegate: ctx.accounts.holder_account.to_account_info(),
                    to: ctx.accounts.token_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            ctx.accounts.token_account.amount,
        )?;

        token::freeze_account(CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            FreezeAccount {
                mint: ctx.accounts.mint.to_account_info(),
                account: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
            holder_signer,
        ))?;
    }

    Ok(())
}
