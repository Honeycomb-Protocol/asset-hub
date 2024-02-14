use {
  crate::{
      state::*,
      errors::ErrorCode,
      utils::Conditional,
  },
  anchor_lang::{prelude::*, solana_program::program::invoke},
  anchor_spl::{
    token::{Token, Mint, TokenAccount},
    associated_token::AssociatedToken
  },
  mpl_token_metadata::{instruction::BurnArgs, state::{Metadata, TokenMetadataAccount, ToAccountMeta}},
  hpl_hive_control::{
    program::HplHiveControl,
    state::Project
  },
  hpl_currency_manager::{
    state::{Currency, HolderAccount},
    program::HplCurrencyManager,
    cpi::{transfer_currency, burn_currency, accounts::{TransferCurrency, BurnCurrency}}
  },
  mpl_bubblegum::ID as MPL_BUBBLEGUM_ID,
  spl_account_compression::{program::SplAccountCompression, Noop},
};

/// Accounts used in create payment session instruction
#[derive(Accounts)]
pub struct StartPaymentSession<'info> {
  /// The payment structure account
  #[account(mut)]
  pub payment_structure: Account<'info, PaymentStructure>,

  /// The payment session account
  #[account(
    init, payer = payer,
    space = PaymentSession::get_initial_len(&Conditional::<bool>::new_mapped(
        &payment_structure.payments,
        &|_payment| false, 
    )),
    seeds = [b"payment_session", payment_structure.key().as_ref(), payer.key().as_ref()],
    bump
  )]
  pub payment_session: Account<'info, PaymentSession>,

  /// The payer wallet
  #[account(mut)]
  pub payer: Signer<'info>,

  /// Solana System Program
  pub system_program: Program<'info, System>,

  /// Solana Clock Sysvar
  pub clock_sysvar: Sysvar<'info, Clock>,
}

/// Create a payment session.
///
/// This function is used to create a new payment session.
///
/// # Parameters
///
/// - `ctx`: The program context that contains the accounts involved in the transaction.
///
/// # Example
///
/// ```no_run
/// # use my_program::*;
/// # fn main() -> ProgramResult {
/// # let ctx: Context<StartPaymentSession> = unimplemented!();
/// start_payment_session(ctx, args)?;
/// # Ok(())
/// # }
/// ```
pub fn start_payment_session(
  ctx: Context<StartPaymentSession>
) -> Result<()> {
  let payment_session = &mut ctx.accounts.payment_session;
  payment_session.set_defaults();

  payment_session.bump = ctx.bumps["payment_session"];
  payment_session.payment_structure = ctx.accounts.payment_structure.key();
  payment_session.payer = ctx.accounts.payer.key();
  payment_session.payments_status = Conditional::<bool>::new_mapped(
    &ctx.accounts.payment_structure.payments,
    &|_payment| false, 
  );

  ctx.accounts.payment_structure.active_sessions += 1;

  Ok(())
}

/// Accounts used in make a payment instruction
#[derive(Accounts)]
pub struct MakeHplCurrencyPayment<'info> {
  /// The payment structure account
  pub payment_structure: Box<Account<'info, PaymentStructure>>,

  /// The payment session account
  #[account(mut, has_one = payer, has_one = payment_structure)]
  pub payment_session: Box<Account<'info, PaymentSession>>,

  /// The project this currency is associated with
  #[account(mut)]
  pub project: Box<Account<'info, Project>>,

  /// The currency account
  #[account()]
  pub currency: Box<Account<'info, Currency>>,

  /// The currency mint
  #[account(mut)]
  pub mint: Box<Account<'info, Mint>>,

  /// The payer's holder account
  #[account()]
  pub holder_account: Box<Account<'info, HolderAccount>>,

  /// The payer's token account
  #[account(mut)]
  pub token_account: Box<Account<'info, TokenAccount>>,

  /// The wallet that receives the payment
  /// CHECK: This is not dangerous because we don't read or write from this account
  #[account()]
  pub beneficiary: Option<AccountInfo<'info>>,

  /// The receiver's holder account
  #[account(has_one = currency, constraint = beneficiary.is_some() && beneficiary_holder_account.owner == beneficiary.clone().unwrap().key())]
  pub beneficiary_holder_account: Option<Account<'info, HolderAccount>>,
  
  /// The receiver's token account
  #[account(mut)]
  pub beneficiary_token_account: Option<Account<'info, TokenAccount>>,

  /// HPL Vault to collect honeycomb fees
  /// CHECK: This is not dangerous because we don't read or write from this account
  #[account(mut)]
  pub vault: AccountInfo<'info>,

  /// The payer wallet
  #[account(mut)]
  pub payer: Signer<'info>,

  /// Solana System Program
  pub system_program: Program<'info, System>,

  /// SPL Token Program
  pub token_program: Program<'info, Token>,

  /// HPL Hive Control Program
  pub hive_control: Program<'info, HplHiveControl>,

  /// HPL Currency Manager Program
  pub hpl_currency_manager: Program<'info, HplCurrencyManager>,

  /// Solana Clock Sysvar
  pub clock_sysvar: Sysvar<'info, Clock>,

    /// NATIVE INSTRUCTIONS SYSVAR
  /// CHECK: This is not dangerous because we don't read or write from this account
  #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
  pub instructions_sysvar: AccountInfo<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct MakePaymentArgs {
  pub path: Vec<u8>
}


/// Pays an asset.
///
/// This function is used to make payment.
///
/// # Parameters
///
/// - `ctx`: The program context that contains the accounts involved in the transaction.
///
/// # Example
///
/// ```no_run
/// # use my_program::*;
/// # fn main() -> ProgramResult {
/// # let ctx: Context<MakeHplCurrencyPayment> = unimplemented!();
/// make_hpl_currency_payment(ctx, args)?;
/// # Ok(())
/// # }
/// ```
pub fn make_hpl_currency_payment(
  ctx: Context<MakeHplCurrencyPayment>,
  args: MakePaymentArgs
) -> Result<()> {
  let payment_session = &mut ctx.accounts.payment_session;
  let payment = ctx.accounts.payment_structure.payments.get_item(args.path.clone())?;
  let payment_status = payment_session.payments_status.get_item_mut(args.path.clone())?;

  if *payment_status {
    return Err(ErrorCode::PaymentAlreadyMade.into());
  }

  let amount: u64;
  if let PaymentKind::HplCurrency{ address, amount: currency_amount } = payment.kind {
    amount = currency_amount;
    if !ctx.accounts.currency.key().eq(&address) {
      return Err(ErrorCode::InvalidHplCurrencyPayment.into());
    }
  } else {
    return Err(ErrorCode::InvalidPayment.into())
  }

  match payment.payment_method {
      PaymentMethod::Burn => {
        burn_currency(
          CpiContext::new(
            ctx.accounts.hpl_currency_manager.to_account_info(),
            BurnCurrency {
              project: ctx.accounts.project.to_account_info(),
              currency: ctx.accounts.currency.to_account_info(),
              holder_account: ctx.accounts.holder_account.to_account_info(),
              mint: ctx.accounts.mint.to_account_info(),
              token_account: ctx.accounts.token_account.to_account_info(),
              authority: ctx.accounts.payer.to_account_info(),
              payer: ctx.accounts.payer.to_account_info(),
              vault: ctx.accounts.vault.to_account_info(),
              system_program: ctx.accounts.system_program.to_account_info(),
              hive_control: ctx.accounts.hive_control.to_account_info(),
              token_program: ctx.accounts.token_program.to_account_info(),
              instructions_sysvar: ctx.accounts.instructions_sysvar.to_account_info()
            }
          ),
          amount
        )
      },
      PaymentMethod::Transfer(beneficiary) => {
        
        let beneficiary_info = ctx.accounts.beneficiary.clone().unwrap();

        if !beneficiary.eq(beneficiary_info.key) {
          return Err(ErrorCode::InvalidBeneficiary.into());
        }

        transfer_currency(
          CpiContext::new(
            ctx.accounts.hpl_currency_manager.to_account_info(),
            TransferCurrency {
              project: ctx.accounts.project.to_account_info(),
              currency: ctx.accounts.currency.to_account_info(),
              mint: ctx.accounts.mint.to_account_info(),
              sender_holder_account: ctx.accounts.holder_account.to_account_info(),
              sender_token_account: ctx.accounts.token_account.to_account_info(),
              receiver_holder_account: ctx.accounts.beneficiary_holder_account.clone().unwrap().to_account_info(),
              receiver_token_account: ctx.accounts.beneficiary_token_account.clone().unwrap().to_account_info(),
              owner: ctx.accounts.payer.to_account_info(),
              payer: ctx.accounts.payer.to_account_info(),
              vault: ctx.accounts.vault.to_account_info(),
              system_program: ctx.accounts.system_program.to_account_info(),
              hive_control: ctx.accounts.hive_control.to_account_info(),
              token_program: ctx.accounts.token_program.to_account_info(),
              instructions_sysvar: ctx.accounts.instructions_sysvar.to_account_info()
            }
          ),
          amount
        )
      }
  }?;

  *payment_status = true;

  Ok(())
}

/// Accounts used in make a payment instruction
#[derive(Accounts)]
pub struct MakeNftPayment<'info> {
  /// The payment structure account
  pub payment_structure: Box<Account<'info, PaymentStructure>>,

  /// The payment session account
  #[account(mut, has_one = payer, has_one = payment_structure)]
  pub payment_session: Box<Account<'info, PaymentSession>>,

  #[account(mut)]
  pub nft_mint: Box<Account<'info, Mint>>,

  /// Token account of the NFT
  #[account(mut, constraint = nft_account.mint == nft_mint.key() && nft_account.owner == payer.key())]
  pub nft_account: Box<Account<'info, TokenAccount>>,

  /// NFT token metadata
  /// CHECK: This is not dangerous because we don't read or write from this account
  #[account(mut)]
  pub nft_metadata: AccountInfo<'info>,

  /// NFT edition
  /// CHECK: This is not dangerous because we don't read or write from this account
  #[account(mut)]
  pub nft_edition: Option<AccountInfo<'info>>,

  /// NFT token record
  /// CHECK: This is not dangerous because we don't read or write from this account
  #[account(mut)]
  pub nft_token_record: Option<AccountInfo<'info>>,

  /// The account that will hold the nft sent on expedition
  #[account(mut)]
  pub deposit_account: Option<Account<'info, TokenAccount>>,

  /// Deposit token_record
  /// CHECK: This is not dangerous because we don't read or write from this account
  #[account(mut)]
  pub deposit_token_record: Option<AccountInfo<'info>>,

  /// The wallet that receives the payment
  /// CHECK: This is not dangerous because we don't read or write from this account
  #[account()]
  pub beneficiary: Option<AccountInfo<'info>>,

  /// The payer wallet
  #[account(mut)]
  pub payer: Signer<'info>,

  /// Solana System Program
  pub system_program: Program<'info, System>,

  /// SPL Token Program
  pub token_program: Program<'info, Token>,

  /// ASSOCIATED TOKEN PROGRAM
  pub associated_token_program: Program<'info, AssociatedToken>,

  /// CHECK: This is not dangerous because we don't read or write from this account
  pub authorization_rules_program: Option<AccountInfo<'info>>,

  /// CHECK: This is not dangerous because we don't read or write from this account
  pub authorization_rules: Option<AccountInfo<'info>>,

  /// Solana Clock Sysvar
  pub clock_sysvar: Sysvar<'info, Clock>,

  /// NATIVE INSTRUCTIONS SYSVAR
  /// CHECK: This is not dangerous because we don't read or write from this account
  #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
  pub instructions_sysvar: AccountInfo<'info>,
}

/// Pays an asset.
///
/// This function is used to make payment.
///
/// # Parameters
///
/// - `ctx`: The program context that contains the accounts involved in the transaction.
///
/// # Example
///
/// ```no_run
/// # use my_program::*;
/// # fn main() -> ProgramResult {
/// # let ctx: Context<MakePayment> = unimplemented!();
/// make_payment(ctx, args)?;
/// # Ok(())
/// # }
/// ```
pub fn make_nft_payment(
  ctx: Context<MakeNftPayment>,
  args: MakePaymentArgs
) -> Result<()> {
  let payment_session = &mut ctx.accounts.payment_session;
  let payment = ctx.accounts.payment_structure.payments.get_item(args.path.clone())?;
  let payment_status = payment_session.payments_status.get_item_mut(args.path)?;

  if *payment_status {
    return Err(ErrorCode::PaymentAlreadyMade.into());
  }

  let amount: u64 = 1;
  if let PaymentKind::Nft(nft_payment) = payment.kind {

    if let NftPayment::Mint(mint) = nft_payment {
      if !mint.eq(&ctx.accounts.nft_mint.key()) {
        msg!("NFT mint criteria does not match");
        return Err(ErrorCode::InvalidNftPayment.into());
      }
    } else {
      let metadata_account_info = &ctx.accounts.nft_metadata;

      if metadata_account_info.data_is_empty() {
          msg!("Metadata account is empty");
          return Err(ErrorCode::InvalidMetadata.into());
      }
  
      let metadata: Metadata = Metadata::from_account_info(metadata_account_info)?;
      if metadata.mint != ctx.accounts.nft_mint.key() {
          msg!("Metadata mint does not match NFT mint");
          return Err(ErrorCode::InvalidMetadata.into());
      }

      match nft_payment {
        NftPayment::Collection(collection) => {
          if metadata.collection.is_none() {
            msg!("Metadata collection is empty");
            return Err(ErrorCode::InvalidMetadata.into());
          }
          let metadata_collection = metadata.collection.unwrap();
          if !collection.eq(&metadata_collection.key) && metadata_collection.verified {
            msg!("NFT collection criteria does not match");
            return Err(ErrorCode::InvalidNftPayment.into());
          }
        },
        NftPayment::Creator(creator) => {
          if metadata.data.creators.is_none() {
            msg!("Metadata creators is empty");
            return Err(ErrorCode::InvalidMetadata.into());
          }
          let metadata_creators = metadata.data.creators.unwrap();
          if !metadata_creators.iter().any(|creator_info| creator_info.address.eq(&creator)) {
            msg!("NFT creator criteria does not match");
            return Err(ErrorCode::InvalidNftPayment.into());
          }
        },
        NftPayment::Tree(_) => {
          msg!("Tree payment is not supported in this instruction");
          return Err(ErrorCode::InvalidNftPayment.into());
        }
        _ => {}
      }
    }
  } else {
    return Err(ErrorCode::InvalidPayment.into())
  }

  match payment.payment_method {
    PaymentMethod::Burn => {
      crate::metadata::burn(
        BurnArgs::V1 { amount },
        ctx.accounts.payer.to_account_info(),
        None,
        ctx.accounts.nft_metadata.to_account_info(),
        ctx.accounts.nft_edition.clone(),
        ctx.accounts.nft_mint.to_account_info(),
        ctx.accounts.nft_account.to_account_info(),
        None,
        None,
        None,
        None,
        ctx.accounts.nft_token_record.clone(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.instructions_sysvar.clone(),
        ctx.accounts.token_program.to_account_info(),
        None
      )
    },
    PaymentMethod::Transfer(beneficiary) => {
      let beneficiary_info = ctx.accounts.beneficiary.clone().unwrap();

      if !beneficiary.eq(beneficiary_info.key) {
        return Err(ErrorCode::InvalidBeneficiary.into());
      }

      crate::metadata::transfer(
        amount,
        ctx.accounts.nft_account.to_account_info(),
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.deposit_account.clone().unwrap().to_account_info(),
        beneficiary_info,
        ctx.accounts.nft_mint.to_account_info(),
        ctx.accounts.nft_metadata.to_account_info(),
        ctx.accounts.nft_edition.clone(),
        ctx.accounts.nft_token_record.clone(),
        ctx.accounts.deposit_token_record.clone(),
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        ctx.accounts.associated_token_program.to_account_info(),
        ctx.accounts.instructions_sysvar.to_account_info(),
        ctx.accounts.authorization_rules_program.clone(),
        ctx.accounts.authorization_rules.clone(),
        None,
      )
    }
  }?;

  
  *payment_status = true;

  Ok(())
}

/// Accounts used in make a payment instruction
#[derive(Accounts)]
pub struct MakeCNftPayment<'info> {
  /// The payment structure account
  pub payment_structure: Account<'info, PaymentStructure>,

  /// The payment session account
  #[account(mut, has_one = payer, has_one = payment_structure)]
  pub payment_session: Account<'info, PaymentSession>,

  /// CHECK: unsafe
  #[account(mut)]
  pub merkle_tree: UncheckedAccount<'info>,

  /// CHECK: unsafe
  pub tree_authority: UncheckedAccount<'info>,

  /// CHECK: unsafe
  pub creator_hash: UncheckedAccount<'info>,

  /// CHECK: unsafe
  pub data_hash: UncheckedAccount<'info>,

  /// CHECK: unsafe
  pub root: UncheckedAccount<'info>,

  /// The wallet that receives the payment
  /// CHECK: This is not dangerous because we don't read or write from this account
  #[account()]
  pub beneficiary: Option<AccountInfo<'info>>,

  /// The payer wallet
  #[account(mut)]
  pub payer: Signer<'info>,

  /// Solana System Program
  pub system_program: Program<'info, System>,

  /// MPL Bubblegum program for cNFTs
  /// CHECK: This is not dangerous
  #[account(mut, constraint = bubblegum_program.key().eq(&MPL_BUBBLEGUM_ID))]
  pub bubblegum_program: AccountInfo<'info>,

  /// SPL Compression Program
  pub compression_program: Program<'info, SplAccountCompression>,

  /// SPL NOOP Program
  pub log_wrapper: Program<'info, Noop>,

  /// Solana Clock Sysvar
  pub clock_sysvar: Sysvar<'info, Clock>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct MakeCnftPaymentArgs {
  pub path: Vec<u8>,
  pub nonce: u64,
  pub index: u32,
}


/// Pays an asset.
///
/// This function is used to make payment.
///
/// # Parameters
///
/// - `ctx`: The program context that contains the accounts involved in the transaction.
///
/// # Example
///
/// ```no_run
/// # use my_program::*;
/// # fn main() -> ProgramResult {
/// # let ctx: Context<MakeCNftPayment> = unimplemented!();
/// make_cnft_payment(ctx, args)?;
/// # Ok(())
/// # }
/// ```
pub fn make_cnft_payment<'info>(
  ctx: Context<'_, '_, '_, 'info, MakeCNftPayment<'info>>,
  args: MakeCnftPaymentArgs
) -> Result<()> {
  let payment_session = &mut ctx.accounts.payment_session;
  let payment = ctx.accounts.payment_structure.payments.get_item(args.path.clone())?;
  let payment_status = payment_session.payments_status.get_item_mut(args.path)?;

  if *payment_status {
    return Err(ErrorCode::PaymentAlreadyMade.into());
  }

  match payment.payment_method {
      PaymentMethod::Burn => {},
      PaymentMethod::Transfer(beneficiary) => {
        let beneficiary_info = ctx.accounts.beneficiary.clone().unwrap();

        if !beneficiary.eq(beneficiary_info.key) {
          return Err(ErrorCode::InvalidBeneficiary.into());
        }
        let ix = mpl_bubblegum::instructions::TransferBuilder::new()
          .tree_config(ctx.accounts.tree_authority.key())
          .leaf_owner(ctx.accounts.payer.key(), true)
          .leaf_delegate(ctx.accounts.payer.key(), true)
          .new_leaf_owner(ctx.accounts.beneficiary.clone().unwrap().key())
          .merkle_tree(ctx.accounts.merkle_tree.key())
          .log_wrapper(ctx.accounts.log_wrapper.key())
          .compression_program(ctx.accounts.compression_program.key())
          .system_program(ctx.accounts.system_program.key())
          .add_remaining_accounts(&ctx.remaining_accounts.iter().map(|f| f.to_account_meta()).collect::<Vec<_>>()).instruction();

        invoke(
          &ix,
          &[
            vec![
              ctx.accounts.tree_authority.to_account_info(),
              ctx.accounts.payer.to_account_info(),
              ctx.accounts.payer.to_account_info(),
              ctx.accounts.beneficiary.clone().unwrap().to_account_info(),
              ctx.accounts.merkle_tree.to_account_info(),
              ctx.accounts.log_wrapper.to_account_info(),
              ctx.accounts.compression_program.to_account_info(),
              ctx.accounts.system_program.to_account_info(),
            ],
            ctx.remaining_accounts.to_vec()
          ].concat()
        )?;
      }
  }


  *payment_status = true;

  Ok(())
}

/// Accounts used in close payment session instruction
#[derive(Accounts)]
pub struct ClosePaymentSession<'info> {
  /// The payment structure account
  #[account(mut)]
  pub payment_structure: Account<'info, PaymentStructure>,

  /// The payment session account
  #[account(mut, has_one = payer, close = payer)]
  pub payment_session: Account<'info, PaymentSession>,

  /// The payer wallet
  #[account(mut)]
  pub payer: Signer<'info>,

  /// Solana Clock Sysvar
  pub clock_sysvar: Sysvar<'info, Clock>,
}

/// Create a payment session.
///
/// This function is used to closes a new payment session.
///
/// # Parameters
///
/// - `ctx`: The program context that contains the accounts involved in the transaction.
///
/// # Example
///
/// ```no_run
/// # use my_program::*;
/// # fn main() -> ProgramResult {
/// # let ctx: Context<ClosePaymentSession> = unimplemented!();
/// close_payment_session(ctx, args)?;
/// # Ok(())
/// # }
/// ```
pub fn close_payment_session(
  ctx: Context<ClosePaymentSession>
) -> Result<()> {
  let payment_session = &mut ctx.accounts.payment_session;

  payment_session.eval_status()?;

  ctx.accounts.payment_structure.active_sessions -= 1;

  Ok(())
}