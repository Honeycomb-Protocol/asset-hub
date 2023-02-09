use {
    crate::{
        errors::ErrorCode,
        state::{
            Assembler, AssemblingAction, Creator, DelegateAuthority, DelegateAuthorityPermission,
            TokenStandard,
        },
        utils::{assert_authority, create_nft},
    },
    anchor_lang::{prelude::*, solana_program},
    anchor_spl::token::{self, Mint, Token},
    mpl_token_metadata::state::AssetData,
};

/// Accounts used in the create assembler instruction
#[derive(Accounts)]
pub struct CreateAssembler<'info> {
    /// Collection of the nfts generated by this assembler
    #[account(
      init,
      payer = payer,
      mint::decimals = 0,
      mint::authority = assembler,
      mint::freeze_authority = assembler,
    )]
    pub collection_mint: Account<'info, Mint>,

    /// Metadata account of the collection
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub collection_metadata: AccountInfo<'info>,

    /// Master Edition account of the collection
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub collection_master_edition: AccountInfo<'info>,

    /// Assembler state account
    #[account(
      init, payer = payer,
      space = Assembler::LEN ,
      seeds = [
        b"assembler".as_ref(),
        collection_mint.key().as_ref(),
      ],
      bump,
    )]
    pub assembler: Account<'info, Assembler>,

    /// The wallet that holds the authority over the assembler
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub authority: AccountInfo<'info>,

    /// The wallet that pays for the rent
    #[account(mut)]
    pub payer: Signer<'info>,

    /// NATIVE SYSTEM PROGRAM
    pub system_program: Program<'info, System>,

    /// SPL TOKEN PROGRAM
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,

    /// METAPLEX TOKEN METADATA PROGRAM
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: AccountInfo<'info>,

    /// SYSVAR RENT
    pub rent: Sysvar<'info, Rent>,

    /// NATIVE Instructions SYSVAR
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = solana_program::sysvar::instructions::ID)]
    pub sysvar_instructions: AccountInfo<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreateAssemblerArgs {
    assembling_action: AssemblingAction,
    collection_name: String,
    collection_symbol: String,
    collection_uri: String,
    collection_description: String,
    nft_base_uri: String,
    allow_duplicates: Option<bool>,
    default_royalty: Option<u16>,
    token_standard: Option<TokenStandard>,
    rule_set: Option<Pubkey>,
    default_creators: Vec<Creator>,
}

/// Create a new assembler
pub fn create_assembler(ctx: Context<CreateAssembler>, args: CreateAssemblerArgs) -> Result<()> {
    let assembler = &mut ctx.accounts.assembler;
    assembler.bump = ctx.bumps["assembler"];
    assembler.authority = ctx.accounts.authority.key();
    assembler.collection = ctx.accounts.collection_mint.key();
    assembler.collection_name = args.collection_name;
    assembler.collection_symbol = args.collection_symbol;
    assembler.collection_description = args.collection_description;
    assembler.nft_base_uri = args.nft_base_uri;
    assembler.assembling_action = args.assembling_action;
    assembler.nfts = 0;
    assembler.allow_duplicates = args.allow_duplicates.unwrap_or(false);
    assembler.default_royalty = args.default_royalty.unwrap_or(0);
    assembler.token_standard = args
        .token_standard
        .unwrap_or(crate::state::TokenStandard::NonFungible);
    assembler.rule_set = args.rule_set;
    assembler.default_creators = args.default_creators;

    let assembler_seeds = &[
        b"assembler".as_ref(),
        assembler.collection.as_ref(),
        &[assembler.bump],
    ];
    let assembler_signer = &[&assembler_seeds[..]];

    create_nft(
        AssetData {
            name: assembler.collection_name.clone(),
            symbol: assembler.collection_symbol.clone(),
            uri: args.collection_uri,
            seller_fee_basis_points: assembler.default_royalty,
            creators: Some(vec![mpl_token_metadata::state::Creator {
                address: assembler.key(),
                verified: true,
                share: 0,
            }]),
            primary_sale_happened: false,
            is_mutable: true,
            token_standard: mpl_token_metadata::state::TokenStandard::NonFungible,
            collection: None,
            uses: None,
            collection_details: None,
            rule_set: assembler.rule_set,
        },
        false,
        true,
        ctx.accounts.collection_metadata.to_account_info(),
        ctx.accounts.collection_master_edition.to_account_info(),
        ctx.accounts.collection_mint.to_account_info(),
        assembler.to_account_info(),
        ctx.accounts.payer.to_account_info(),
        assembler.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.sysvar_instructions.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        Some(assembler_signer),
    )?;

    Ok(())
}

/// Accounts used in the create assembler instruction
#[derive(Accounts)]
pub struct UpdateAssembler<'info> {
    /// Assembler state account
    #[account(mut)]
    pub assembler: Account<'info, Assembler>,

    /// The wallet that holds the authority over the assembler
    pub authority: Signer<'info>,

    /// [Optional] the delegate of the assembler
    #[account(
        seeds = [
            b"delegate".as_ref(),
            assembler.key().as_ref(),
            assembler.authority.as_ref(),
            authority.key().as_ref(),
            format!("{:?}", delegate.permission).as_ref(),
        ],
        bump = delegate.bump,
    )]
    pub delegate: Option<Account<'info, DelegateAuthority>>,

    /// [Optional] The new wallet that will hold the authority over the assembler
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub new_authority: Option<AccountInfo<'info>>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct UpdateAssemblerArgs {
    assembling_action: AssemblingAction,
    nft_base_uri: String,
    allow_duplicates: Option<bool>,
    default_royalty: Option<u16>,
}

/// Update an assembler
pub fn update_assembler(ctx: Context<UpdateAssembler>, args: UpdateAssemblerArgs) -> Result<()> {
    assert_authority(
        ctx.accounts.authority.key(),
        &ctx.accounts.assembler,
        &ctx.accounts.delegate,
        &[DelegateAuthorityPermission::UpdateAssembler],
    )?;

    let assembler = &mut ctx.accounts.assembler;
    assembler.nft_base_uri = args.nft_base_uri;
    assembler.assembling_action = args.assembling_action;
    assembler.allow_duplicates = args.allow_duplicates.unwrap_or(assembler.allow_duplicates);
    assembler.default_royalty = args.default_royalty.unwrap_or(assembler.default_royalty);

    if let Some(new_authority) = &ctx.accounts.new_authority {
        if ctx.accounts.authority.key() == assembler.authority {
            assembler.authority = new_authority.key();
        } else {
            msg!("Only the current authority can update the authority");
            return Err(ErrorCode::Unauthorized.into());
        }
    }

    Ok(())
}

/// Accounts used in the create delegate authority instruction
#[derive(Accounts)]
#[instruction(args: CreateDelegateAuthorityArgs)]
pub struct CreateDelegateAuthority<'info> {
    /// Assembler state account
    #[account(mut)]
    pub assembler: Account<'info, Assembler>,

    /// the delegate authority account
    #[account(
        init, payer = payer,
        space = DelegateAuthority::LEN,
        seeds = [
            b"delegate".as_ref(),
            assembler.key().as_ref(),
            assembler.authority.as_ref(),
            authority.key().as_ref(),
            format!("{:?}", args.permission).as_ref(),
        ],
        bump,
    )]
    pub delegate_authority: Account<'info, DelegateAuthority>,

    /// the wallet that holds delegate authority
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub delegate: AccountInfo<'info>,

    /// The wallet that holds the authority over the assembler
    pub authority: Signer<'info>,

    /// The wallet that pays for everything
    #[account(mut)]
    pub payer: Signer<'info>,

    /// NATIVE SYSTEM PROGRAM
    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreateDelegateAuthorityArgs {
    pub permission: DelegateAuthorityPermission,
}

/// Create a delegate authority
pub fn create_delegate_authority(
    ctx: Context<CreateDelegateAuthority>,
    args: CreateDelegateAuthorityArgs,
) -> Result<()> {
    let delegate_authority = &mut ctx.accounts.delegate_authority;

    delegate_authority.authority = ctx.accounts.delegate.key();
    delegate_authority.permission = args.permission;

    Ok(())
}
