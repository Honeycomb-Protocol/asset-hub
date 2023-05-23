import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import {
  ConfirmedContext,
  Honeycomb,
  OperationCtx,
  createCtx,
} from "@honeycomb-protocol/hive-control";
import {
  createFundAccountInstruction,
  CurrencyKind,
  PROGRAM_ID,
} from "../generated";
import { HplHolderAccount } from "../HplCurrency";
import { holderAccountPdas } from "../utils";

type CreateFundAccountCtxArgs = {
  amount: number;
  project: web3.PublicKey;
  currency: web3.PublicKey;
  currencyKind: CurrencyKind;
  mint: web3.PublicKey;
  receiverWallet: web3.PublicKey;
  wallet: web3.PublicKey;
  programId?: web3.PublicKey;
};
export function createFundAccountCtx(
  args: CreateFundAccountCtxArgs
): OperationCtx {
  const programId = args.programId || PROGRAM_ID;

  const sourceTokenAccount = splToken.getAssociatedTokenAddressSync(
    args.mint,
    args.wallet
  );
  const { holderAccount, tokenAccount } = holderAccountPdas(
    args.receiverWallet,
    args.mint,
    args.currencyKind,
    splToken.TOKEN_PROGRAM_ID,
    programId
  );

  const instructions = [
    createFundAccountInstruction(
      {
        currency: args.currency,
        mint: args.mint,
        holderAccount,
        tokenAccount,
        sourceTokenAccount,
        wallet: args.wallet,
      },
      {
        amount: args.amount,
      },
      programId
    ),
  ];

  return createCtx(instructions);
}

type FundAccountArgs = {
  amount: number;
  holderAccount: HplHolderAccount;
  programId?: web3.PublicKey;
};
export async function fundAccount(
  honeycomb: Honeycomb,
  args: FundAccountArgs
): Promise<ConfirmedContext> {
  const ctx = createFundAccountCtx({
    amount: args.amount,
    project: args.holderAccount.currency().project().address,
    currency: args.holderAccount.currency().address,
    currencyKind: args.holderAccount.currency().kind,
    mint: args.holderAccount.currency().mint,
    receiverWallet: args.holderAccount.owner,
    wallet: honeycomb.identity().publicKey,
    programId: args.programId,
  });

  return honeycomb.rpc().sendAndConfirmTransaction(ctx);
}
