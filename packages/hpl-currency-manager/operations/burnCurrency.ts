import * as web3 from "@solana/web3.js";
import {
  ConfirmedContext,
  Honeycomb,
  OperationCtx,
  createCtx,
} from "@honeycomb-protocol/hive-control";
import { createBurnCurrencyInstruction, PROGRAM_ID } from "../generated";
import { HplHolderAccount } from "../HplCurrency";

type CreateBurnCurrencyCtxArgs = {
  amount: number;
  currency: web3.PublicKey;
  mint: web3.PublicKey;
  holderAccount: web3.PublicKey;
  tokenAccount: web3.PublicKey;
  owner: web3.PublicKey;
  programId?: web3.PublicKey;
};
export function createBurnCurrencyCtx(
  args: CreateBurnCurrencyCtxArgs
): OperationCtx {
  const programId = args.programId || PROGRAM_ID;

  const instructions = [
    createBurnCurrencyInstruction(
      {
        currency: args.currency,
        holderAccount: args.holderAccount,
        mint: args.mint,
        tokenAccount: args.tokenAccount,
        owner: args.owner,
      },
      {
        amount: args.amount,
      },
      programId
    ),
  ];

  return createCtx(instructions);
}

type BurnCurrencyArgs = {
  amount: number;
  holderAccount: HplHolderAccount;
  programId?: web3.PublicKey;
};
export async function burnCurrency(
  honeycomb: Honeycomb,
  args: BurnCurrencyArgs
): Promise<ConfirmedContext> {
  const ctx = createBurnCurrencyCtx({
    amount: args.amount,
    currency: args.holderAccount.currency().address,
    mint: args.holderAccount.currency().mint,
    holderAccount: args.holderAccount.address,
    tokenAccount: args.holderAccount.tokenAccount,
    owner: honeycomb.identity().publicKey,
    programId: args.programId,
  });

  return honeycomb.rpc().sendAndConfirmTransaction(ctx);
}
