import * as web3 from "@solana/web3.js";
import {
  ConfirmedContext,
  Honeycomb,
  OperationCtx,
  createCtx,
} from "@honeycomb-protocol/hive-control";
import { createApproveDelegateInstruction, PROGRAM_ID } from "../generated";
import { HplHolderAccount } from "../HplCurrency";

type CreateApproveDelegateCtxArgs = {
  amount: number;
  currency: web3.PublicKey;
  mint: web3.PublicKey;
  holderAccount: web3.PublicKey;
  tokenAccount: web3.PublicKey;
  delegate: web3.PublicKey;
  owner: web3.PublicKey;
  programId?: web3.PublicKey;
};
export function createApproveDelegateCtx(
  args: CreateApproveDelegateCtxArgs
): OperationCtx {
  const programId = args.programId || PROGRAM_ID;

  const instructions = [
    createApproveDelegateInstruction(
      {
        currency: args.currency,
        mint: args.mint,
        holderAccount: args.holderAccount,
        tokenAccount: args.tokenAccount,
        delegate: args.delegate,
        owner: args.owner,
      },
      { amount: args.amount },
      programId
    ),
  ];

  return createCtx(instructions);
}

type ApproveDelegateArgs = {
  amount: number;
  holderAccount: HplHolderAccount;
  delegate: web3.PublicKey;
  programId?: web3.PublicKey;
};
export async function approveDelegate(
  honeycomb: Honeycomb,
  args: ApproveDelegateArgs
): Promise<ConfirmedContext> {
  const ctx = createApproveDelegateCtx({
    amount: args.amount,
    currency: args.holderAccount.currency().address,
    mint: args.holderAccount.currency().mint,
    holderAccount: args.holderAccount.address,
    tokenAccount: args.holderAccount.tokenAccount,
    delegate: args.delegate,
    owner: honeycomb.identity().publicKey,
    programId: args.programId,
  });

  return honeycomb
    .rpc()
    .sendAndConfirmTransaction(ctx, { skipPreflight: true });
}
