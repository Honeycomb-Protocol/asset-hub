import * as web3 from "@solana/web3.js";
import { Honeycomb, Operation, VAULT } from "@honeycomb-protocol/hive-control";
import {
  createSetHolderStatusInstruction,
  HolderStatus,
  PROGRAM_ID,
} from "../generated";
import { HplHolderAccount } from "../HplCurrency";

type CreateSetHolderStatusOperationArgs = {
  status: HolderStatus;
  holderAccount: HplHolderAccount;
  programId?: web3.PublicKey;
};
export async function createSetHolderStatusOperation(
  honeycomb: Honeycomb,
  args: CreateSetHolderStatusOperationArgs
) {
  const programId = args.programId || PROGRAM_ID;

  const instructions = [
    createSetHolderStatusInstruction(
      {
        project: args.holderAccount.currency().project().address,
        currency: args.holderAccount.currency().address,
        holderAccount: args.holderAccount.address,
        tokenAccount: args.holderAccount.tokenAccount,
        authority: honeycomb.identity().address,
        vault: VAULT,
      },
      {
        status: args.status,
      },
      programId
    ),
  ];

  return {
    operation: new Operation(honeycomb, instructions),
  };
}
