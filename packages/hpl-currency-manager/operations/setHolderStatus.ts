import * as web3 from "@solana/web3.js";
import {
  ConfirmedContext,
  Honeycomb,
  OperationCtx,
  createCtx,
} from "@honeycomb-protocol/hive-control";
import {
  createSetHolderStatusInstruction,
  HolderStatus,
  PROGRAM_ID,
} from "../generated";
import { HplHolderAccount } from "../HplCurrency";

type CreateSetHolderStatusCtxArgs = {
  status: HolderStatus;
  holderAccount: web3.PublicKey;
  authority: web3.PublicKey;
  programId?: web3.PublicKey;
};
export function createSetHolderStatusCtx(
  args: CreateSetHolderStatusCtxArgs
): OperationCtx {
  const programId = args.programId || PROGRAM_ID;

  const instructions = [
    createSetHolderStatusInstruction(
      {
        holderAccount: args.holderAccount,
        authority: args.authority,
      },
      {
        status: args.status,
      },
      programId
    ),
  ];

  return createCtx(instructions);
}

type SetHolderStatusArgs = {
  status: HolderStatus;
  holderAccount: HplHolderAccount;
  programId?: web3.PublicKey;
};
export async function setHolderStatus(
  honeycomb: Honeycomb,
  args: SetHolderStatusArgs
): Promise<ConfirmedContext> {
  const ctx = createSetHolderStatusCtx({
    status: args.status,
    holderAccount: args.holderAccount.address,
    authority: honeycomb.identity().publicKey,
    programId: args.programId,
  });

  return honeycomb.rpc().sendAndConfirmTransaction(ctx);
}
