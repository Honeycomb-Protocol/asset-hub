use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
    anchor_spl::token::{self, Mint, MintTo, SetAuthority, Token, TokenAccount, Transfer},
    hpl_hive_control::state::{DelegateAuthority, Project},
    hpl_utils::traits::Default,
    mpl_token_metadata::{
        instruction::{
            CollectionDetailsToggle, CollectionToggle, CreateArgs, RuleSetToggle, UpdateArgs,
            UsesToggle,
        },
        state::{AssetData, Data, Metadata, TokenMetadataAccount},
    },
    spl_account_compression::Noop,
};

/// Accounts used in create currency instruction
#[derive(Accounts)]
#[instruction(args: CreateCurrencyArgs)]
pub struct CreateCurrency<'info> {
    /// The project this currency is associated with.
    #[account()]
    pub project: Box<Account<'info, Project>>,

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
    /// CHECK: This is being checked inside the create_metadata instruction
    #[account(mut)]
    pub metadata: AccountInfo<'info>,

    /// [Option] Delegate authority account containing permissions of the wallet for the project
    #[account(has_one = authority)]
    pub delegate_authority: Option<Account<'info, DelegateAuthority>>,

    /// The wallet that holds the authority over the project
    pub authority: Signer<'info>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub payer: Signer<'info>,

    /// this account collects the protocol fee
    /// CHECK: This account is only used to collect platform fee
    #[account(mut)]
    pub vault: AccountInfo<'info>,

    /// The Solana System Program.
    pub system_program: Program<'info, System>,

    /// The Token Metadata Program ID.
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = mpl_token_metadata::ID)]
    pub token_metadata_program: AccountInfo<'info>,

    /// The Token Program ID.
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,

    /// SPL NOOP PROGRAM
    pub log_wrapper: Program<'info, Noop>,

    /// The Instructions System Variable Account.
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,

    /// The Clock System Variable Account.
    pub clock_sysvar: Sysvar<'info, Clock>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub struct CreateCurrencyArgs {
    /// The name of the currency.
    pub name: String,
    /// The symbol of the currency.
    pub symbol: String,
    /// The URI (Uniform Resource Identifier) associated with the currency.
    pub uri: String,
    /// The number of decimal places for the currency. Used to represent fractional values.
    pub decimals: u8,
    /// [Optional] The kind of permissioned currency. It is an enumeration of different permissioned currency kinds.
    pub kind: Option<PermissionedCurrencyKind>,
}

/// Create a new currency.
///
/// This function is used to create a new currency within a specific project.
///
/// # Parameters
///
/// - `ctx`: The program context that contains the accounts involved in the transaction.
/// - `args`: The arguments required to create the new currency. It includes the currency name,
/// symbol, URI, decimals, and an optional kind specifying the permissioned currency kind.
///
/// # Errors
///
/// This function can return errors if:
/// - There is an issue setting the default values for the currency account.
/// - The provided currency kind is not valid.
/// - There is an error while creating the associated metadata for the currency.
/// - The metadata creation process fails for any reason.
///
/// # Example
///
/// ```no_run
/// # use my_program::*;
/// # fn main() -> ProgramResult {
/// # let ctx: Context<CreateCurrency> = unimplemented!();
/// # let args: CreateCurrencyArgs = unimplemented!();
/// create_currency(ctx, args)?;
/// # Ok(())
/// # }
/// ```
pub fn create_currency(ctx: Context<CreateCurrency>, args: CreateCurrencyArgs) -> Result<()> {
    // Create a mutable reference to the currency account.
    let currency = &mut ctx.accounts.currency;

    // Set default values for the currency account.
    currency.set_defaults();

    // Set the currency bump using the provided context.
    currency.bump = ctx.bumps["currency"];

    // Set the project key and mint key for the currency account.
    currency.project = ctx.accounts.project.key();

    currency.mint = ctx.accounts.mint.key();

    // Set the currency kind, defaulting to non-custodial if not provided.
    currency.kind = CurrencyKind::Permissioned {
        kind: args.kind.unwrap_or(PermissionedCurrencyKind::NonCustodial),
    };
    // currency.created_at = ctx.accounts.clock_sysvar.unix_timestamp;

    // Generate currency seeds and signer to create the associated metadata.
    let currency_seeds = &[
        b"currency".as_ref(),
        currency.mint.as_ref(),
        &[currency.bump],
    ];
    let currency_signer = &[&currency_seeds[..]];

    // Create the currency metadata using hpl_utils::metadata::create function.
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
            decimals: Some(args.decimals),
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
        ctx.accounts.instructions_sysvar.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        Some(currency_signer),
    )?;

    Event::new_currency(currency.key(), &currency, &ctx.accounts.clock_sysvar)
        .wrap(ctx.accounts.log_wrapper.to_account_info())?;

    Ok(())
}

/// Accounts used in update currency instruction
#[derive(Accounts)]
pub struct UpdateCurrency<'info> {
    /// The project this currency is associated with.
    #[account()]
    pub project: Box<Account<'info, Project>>,

    /// Currency account
    #[account(has_one = project, has_one = mint)]
    pub currency: Account<'info, Currency>,

    /// Currency mint
    #[account()]
    pub mint: Account<'info, Mint>,

    /// Currency metadata
    /// CHECK: This is being checked inside the update_metadata instruction
    #[account(mut)]
    pub metadata: AccountInfo<'info>,

    /// [Option] Delegate authority account containing permissions of the wallet for the project
    #[account(has_one = authority)]
    pub delegate_authority: Option<Account<'info, DelegateAuthority>>,

    /// The wallet that holds the authority over the project
    pub authority: Signer<'info>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub payer: Signer<'info>,

    /// this account collects the protocol fee
    /// CHECK: This account is only used to collect platform fee
    #[account(mut)]
    pub vault: AccountInfo<'info>,

    /// System Program
    pub system_program: Program<'info, System>,

    /// The token metadata program account.
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = mpl_token_metadata::ID)]
    pub token_metadata_program: AccountInfo<'info>,

    /// SPL NOOP PROGRAM
    pub log_wrapper: Program<'info, Noop>,

    /// The Instructions System Variable Account.
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,

    /// The Clock System Variable Account.
    pub clock_sysvar: Sysvar<'info, Clock>,
}

/// Arguments for updating a currency.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub struct UpdateCurrencyArgs {
    /// [Option] The updated name of the currency. If `Some`, the name will be updated.
    pub name: Option<String>,

    /// [Option] The updated symbol of the currency. If `Some`, the symbol will be updated.
    pub symbol: Option<String>,

    /// [Option] The updated URI of the currency. If `Some`, the URI will be updated.
    pub uri: Option<String>,
}

/// Update the details of a currency.
///
/// This function allows updating the name, symbol, and URI of a currency. The `UpdateCurrencyArgs`
/// struct contains optional fields for each of these attributes, allowing for partial updates.
///
/// # Errors
/// This function may return an error if the provided metadata account is empty or if the metadata's
/// mint does not match the currency's mint.
///
/// # Arguments
/// - `ctx`: The context for the instruction, containing accounts and other data.
/// - `args`: The arguments specifying the updates to be applied to the currency.
pub fn update_currency(ctx: Context<UpdateCurrency>, args: UpdateCurrencyArgs) -> Result<()> {
    // Check if the metadata account is empty
    let metadata_account_info = &ctx.accounts.metadata;

    if metadata_account_info.data_is_empty() {
        msg!("Metadata account is empty");
        return Err(ErrorCode::InvalidMetadata.into());
    }

    // Validate that the metadata's mint matches the currency's mint
    let metadata: Metadata = Metadata::from_account_info(metadata_account_info)?;
    if metadata.mint != ctx.accounts.mint.key() {
        msg!("Metadata mint does not match NFT mint");
        return Err(ErrorCode::InvalidMetadata.into());
    }

    // Prepare the currency signer for updating metadata
    let currency_seeds = &[
        b"currency".as_ref(),
        ctx.accounts.currency.mint.as_ref(),
        &[ctx.accounts.currency.bump],
    ];
    let currency_signer = &[&currency_seeds[..]];

    // Update the metadata based on the provided arguments
    hpl_utils::metadata::update(
        UpdateArgs::V1 {
            new_update_authority: None,
            data: Some(Data {
                name: args.name.unwrap_or(metadata.data.name),
                symbol: args.symbol.unwrap_or(metadata.data.symbol),
                uri: args.uri.unwrap_or(metadata.data.uri),
                seller_fee_basis_points: 0,
                creators: None,
            }),
            primary_sale_happened: None,
            is_mutable: None,
            collection: CollectionToggle::None,
            collection_details: CollectionDetailsToggle::None,
            uses: UsesToggle::None,
            rule_set: RuleSetToggle::None,
            authorization_data: None,
        },
        None,
        None,
        ctx.accounts.mint.to_account_info(),
        ctx.accounts.metadata.to_account_info(),
        None,
        ctx.accounts.currency.to_account_info(),
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.instructions_sysvar.to_account_info(),
        None,
        None,
        Some(currency_signer),
    )?;

    Event::update_currency(
        ctx.accounts.currency.key(),
        &ctx.accounts.currency,
        &ctx.accounts.clock_sysvar,
    )
    .wrap(ctx.accounts.log_wrapper.to_account_info())?;
    Ok(())
}

/// Accounts used in the instruction to wrap a currency into an associated NFT (non-fungible token).
///
/// This struct represents the accounts required to execute the operation of wrapping a currency into
/// an NFT. The currency will be associated with a specific project, and it will be represented as
/// an NFT by minting a new NFT token with its own metadata.
#[derive(Accounts)]
pub struct WrapCurrency<'info> {
    /// The account representing the project to which the currency is associated.
    #[account(mut)]
    pub project: Box<Account<'info, Project>>,

    /// The account representing the currency to be wrapped into an NFT.
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

    /// The account representing the project to which the currency is associated.
    #[account()]
    pub mint: Account<'info, Mint>,

    /// [Option] The account representing the delegate authority containing permissions of the wallet for the project.
    #[account(has_one = authority)]
    pub delegate_authority: Option<Account<'info, DelegateAuthority>>,

    /// The wallet that holds the authority over the project.
    pub authority: Signer<'info>,

    /// The wallet that has the authority to mint tokens.
    pub mint_authority: Signer<'info>,

    /// The wallet that has the authority to freeze token accounts.
    pub freeze_authority: Signer<'info>,

    /// The wallet that pays for the rent.
    #[account(mut)]
    pub payer: Signer<'info>,

    /// this account collects the protocol fee
    /// CHECK: This account is only used to collect platform fee
    #[account(mut)]
    pub vault: AccountInfo<'info>,

    /// System Program
    pub system_program: Program<'info, System>,

    /// Token Program
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,

    /// SPL NOOP PROGRAM
    pub log_wrapper: Program<'info, Noop>,

    /// The Instructions System Variable Account.
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,

    /// The Clock System Variable Account.
    pub clock_sysvar: Sysvar<'info, Clock>,
}

/// Wrap a currency into an associated NFT (non-fungible token).
///
/// This function wraps the given currency into an NFT by updating the `Currency` account's fields
/// accordingly. The currency's `bump`, `project`, `mint`, and `kind` fields are set to the appropriate
/// values to represent that the currency is now associated with an NFT.
///
/// # Errors
///
/// This function will return an error if there are any issues during the wrapping process.
/// - An error may occur if the `Currency` account is not properly initialized or does not have enough space.
///
/// # Panics
///
/// This function should not panic under normal circumstances.
pub fn wrap_currency(ctx: Context<WrapCurrency>) -> Result<()> {
    // Get a mutable reference to the currency account and set its defaults.
    let currency = &mut ctx.accounts.currency;
    currency.set_defaults();

    currency.bump = ctx.bumps["currency"];
    currency.project = ctx.accounts.project.key();
    currency.mint = ctx.accounts.mint.key();
    currency.kind = CurrencyKind::Wrapped;

    token::set_authority(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            SetAuthority {
                account_or_mint: ctx.accounts.mint.to_account_info(),
                current_authority: ctx.accounts.mint_authority.to_account_info(),
            },
        ),
        token::spl_token::instruction::AuthorityType::MintTokens,
        Some(currency.key()),
    )?;

    token::set_authority(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            SetAuthority {
                account_or_mint: ctx.accounts.mint.to_account_info(),
                current_authority: ctx.accounts.freeze_authority.to_account_info(),
            },
        ),
        token::spl_token::instruction::AuthorityType::FreezeAccount,
        Some(currency.key()),
    )?;

    Event::new_currency(currency.key(), &currency, &ctx.accounts.clock_sysvar)
        .wrap(ctx.accounts.log_wrapper.to_account_info())?;

    // Return Ok to indicate the successful completion of the wrapping process.
    Ok(())
}

/// Mint currency to a holder account.
///
/// This function is used to mint currency to a holder account. It updates the `HolderAccount`
/// by increasing the balance of the token account associated with the holder. It also updates the
/// `Currency` account's supply field to reflect the newly minted tokens.
///
/// # Inputs
///
/// - `currency`: The `Currency` account representing the currency being minted.
/// - `holder_account`: The `HolderAccount` account representing the holder to receive the minted tokens.
/// - `mint`: The `Mint` account associated with the currency.
/// - `token_account`: The `TokenAccount` account associated with the holder to receive the minted tokens.
/// - `project`: The `Project` account associated with the currency.
/// - `delegate_authority`: [Optional] The `DelegateAuthority` account containing permissions for the project.
/// - `authority`: The wallet that holds the authority over the project.
/// - `payer`: The wallet that pays for the minting transaction fees.
/// - `vault`: The account used to collect platform fees.
/// - `system_program`: The system program required for the transaction.
/// - `token_program`: The token program required for the token-related instructions.
/// - `instructions_sysvar`: The sysvar account required for instructions.
///
/// # Errors
///
/// This function will return an error if there are any issues during the minting process.
/// - An error may occur if the `HolderAccount` is not properly initialized or does not have enough space.
/// - An error may occur if the `Currency` or `Mint` accounts are not properly initialized or have incorrect data.
///
/// # Panics
///
/// This function should not panic under normal circumstances.
#[derive(Accounts)]
pub struct MintCurrency<'info> {
    /// The currency account representing the specific currency being minted.
    #[account(has_one = project, has_one = mint)]
    pub currency: Account<'info, Currency>,

    /// The holder account that will receive the newly minted tokens.
    #[account(has_one = currency, has_one = token_account)]
    pub holder_account: Account<'info, HolderAccount>,

    /// The mint account associated with the currency's token mint.
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    /// The token account where the newly minted tokens will be added.
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,

    /// The project this currency is associated with.
    #[account(mut)]
    pub project: Box<Account<'info, Project>>,

    /// [Option] Delegate authority account containing permissions of the wallet for the project.
    #[account(has_one = authority)]
    pub delegate_authority: Option<Account<'info, DelegateAuthority>>,

    /// The wallet that holds the authority over the project.
    pub authority: Signer<'info>,

    /// The wallet that pays for the rent.
    #[account(mut)]
    pub payer: Signer<'info>,

    /// this account collects the protocol fee
    /// CHECK: This account is only used to collect platform fee
    #[account(mut)]
    pub vault: AccountInfo<'info>,

    /// System Program.
    pub system_program: Program<'info, System>,

    /// SPL Token Program.
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,

    /// NATIVE INSTRUCTIONS SYSVAR.
    /// CHECK: This is only used to collect fee
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,
}

/// Mint new currency tokens and add them to the specified token account.
pub fn mint_currency(ctx: Context<MintCurrency>, amount: u64) -> Result<()> {
    // Check if the holder account is inactive, and if so, return an error.
    if ctx.accounts.holder_account.status == HolderStatus::Inactive {
        return Err(ErrorCode::InactiveHolder.into());
    }

    // Define the seeds for the currency account. This is used for signature verification
    // when minting new tokens.
    let currency_seeds = &[
        b"currency".as_ref(),
        ctx.accounts.currency.mint.as_ref(),
        &[ctx.accounts.currency.bump],
    ];
    let currency_signer = &[&currency_seeds[..]];

    // Mint new currency tokens and add them to the specified token account.
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

    // Return Ok to indicate the successful completion of the minting operation.
    Ok(())
}

/// Accounts used in the `fund_account` instruction.
#[derive(Accounts)]
pub struct FundAccount<'info> {
    /// The project account to which the currency is associated with.
    #[account(mut)]
    pub project: Box<Account<'info, Project>>,

    /// The currency account representing the specific currency being funded.
    #[account(has_one = mint, has_one = project)]
    pub currency: Account<'info, Currency>,

    /// The mint account associated with the currency's token mint.
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    /// The holder account that will receive the newly funded tokens.
    #[account(has_one = currency, has_one = token_account)]
    pub holder_account: Account<'info, HolderAccount>,

    /// The token account where the newly funded tokens will be added.
    #[account(mut, has_one = mint)]
    pub token_account: Account<'info, TokenAccount>,

    /// The source token account from which funds will be transferred.
    #[account(mut, has_one = mint, has_one = owner)]
    pub source_token_account: Account<'info, TokenAccount>,

    /// The owner of the source token account.
    #[account(mut)]
    pub owner: Signer<'info>,

    /// The wallet that pays for the fees.
    #[account(mut)]
    pub payer: Signer<'info>,

    /// this account collects the protocol fee
    /// CHECK: This account is only used to collect platform fee
    #[account(mut)]
    pub vault: AccountInfo<'info>,

    /// System Program
    pub system_program: Program<'info, System>,

    /// SPL Token Program
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,

    /// NATIVE INSTRUCTIONS SYSVAR.
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,
}

/// Fund the holder account with a specified amount of tokens.
pub fn fund_account(ctx: Context<FundAccount>, amount: u64) -> Result<()> {
    // Check if the holder account is inactive, and if so, return an error.
    if ctx.accounts.holder_account.status == HolderStatus::Inactive {
        return Err(ErrorCode::InactiveHolder.into());
    }

    // Transfer the specified amount of tokens from the source token account to the token account
    // associated with the holder account.
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.source_token_account.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        ),
        amount,
    )?;

    // Return Ok to indicate the successful completion of the funding operation.
    Ok(())
}
