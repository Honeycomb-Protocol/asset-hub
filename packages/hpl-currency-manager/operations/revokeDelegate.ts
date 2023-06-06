import * as web3 from "@solana/web3.js";
import { Honeycomb, Operation, VAULT } from "@honeycomb-protocol/hive-control";
import { createRevokeDelegateInstruction, PROGRAM_ID } from "../generated";
import { HplHolderAccount } from "../HplCurrency";

type CreateRevokeDelegateOperationArgs = {
  holderAccount: HplHolderAccount;
  programId?: web3.PublicKey;
};
export async function createRevokeDelegateOperation(
  honeycomb: Honeycomb,
  args: CreateRevokeDelegateOperationArgs
) {
  const programId = args.programId || PROGRAM_ID;

  const instructions = [
    createRevokeDelegateInstruction(
      {
        project: args.holderAccount.currency().project().address,
        currency: args.holderAccount.currency().address,
        mint: args.holderAccount.currency().mint,
        holderAccount: args.holderAccount.address,
        tokenAccount: args.holderAccount.tokenAccount,
        authority: honeycomb.identity().address,
        vault: VAULT,
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      },
      programId
    ),
  ];

  return {
    operation: new Operation(honeycomb, instructions),
  };
}
