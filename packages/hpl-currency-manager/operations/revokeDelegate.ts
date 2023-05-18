import * as web3 from "@solana/web3.js";
import {
  ConfirmedContext,
  Honeycomb,
  OperationCtx,
  createCtx,
} from "@honeycomb-protocol/hive-control";
import { createRevokeDelegateInstruction, PROGRAM_ID } from "../generated";
import { HplHolderAccount } from "../HplCurrency";

type CreateRevokeDelegateCtxArgs = {
  currency: web3.PublicKey;
  mint: web3.PublicKey;
  holderAccount: web3.PublicKey;
  tokenAccount: web3.PublicKey;
  authority: web3.PublicKey;
  programId?: web3.PublicKey;
};
export function createRevokeDelegateCtx(
  args: CreateRevokeDelegateCtxArgs
): OperationCtx {
  const programId = args.programId || PROGRAM_ID;

  const instructions = [
    createRevokeDelegateInstruction(
      {
        currency: args.currency,
        mint: args.mint,
        holderAccount: args.holderAccount,
        tokenAccount: args.tokenAccount,
        authority: args.authority,
      },
      programId
    ),
  ];

  return createCtx(instructions);
}

type RevokeDelegateArgs = {
  holderAccount: HplHolderAccount;
  programId?: web3.PublicKey;
};
export async function revokeDelegate(
  honeycomb: Honeycomb,
  args: RevokeDelegateArgs
): Promise<ConfirmedContext> {
  const ctx = createRevokeDelegateCtx({
    currency: args.holderAccount.currency().address,
    mint: args.holderAccount.currency().mint,
    holderAccount: args.holderAccount.address,
    tokenAccount: args.holderAccount.tokenAccount,
    authority: honeycomb.identity().publicKey,
    programId: args.programId,
  });

  return honeycomb
    .rpc()
    .sendAndConfirmTransaction(ctx, { skipPreflight: true });
}
