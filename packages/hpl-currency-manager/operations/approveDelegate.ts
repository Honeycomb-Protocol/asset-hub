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
  holderAccount: web3.PublicKey;
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
        holderAccount: args.holderAccount,
        delegate: args.delegate,
        owner: args.owner,
      },
      programId
    ),
  ];

  return createCtx(instructions);
}

type ApproveDelegateArgs = {
  holderAccount: HplHolderAccount;
  delegate: web3.PublicKey;
  programId?: web3.PublicKey;
};
export async function approveDelegate(
  honeycomb: Honeycomb,
  args: ApproveDelegateArgs
): Promise<ConfirmedContext> {
  const ctx = createApproveDelegateCtx({
    holderAccount: args.holderAccount.address,
    delegate: args.delegate,
    owner: honeycomb.identity().publicKey,
    programId: args.programId,
  });

  return honeycomb.rpc().sendAndConfirmTransaction(ctx);
}
