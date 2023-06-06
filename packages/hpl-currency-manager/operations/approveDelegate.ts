import * as web3 from "@solana/web3.js";
import { Honeycomb, Operation, VAULT } from "@honeycomb-protocol/hive-control";
import { createApproveDelegateInstruction, PROGRAM_ID } from "../generated";
import { HplHolderAccount } from "../HplCurrency";

type CreateApproveDelegateOperationArgs = {
  amount: number;
  holderAccount: HplHolderAccount;
  delegate: web3.PublicKey;
  programId?: web3.PublicKey;
};
export async function createApproveDelegateOperation(
  honeycomb: Honeycomb,
  args: CreateApproveDelegateOperationArgs
) {
  const programId = args.programId || PROGRAM_ID;

  const instructions = [
    createApproveDelegateInstruction(
      {
        project: args.holderAccount.currency().project().address,
        currency: args.holderAccount.currency().address,
        mint: args.holderAccount.currency().mint,
        holderAccount: args.holderAccount.address,
        tokenAccount: args.holderAccount.tokenAccount,
        delegate: args.delegate,
        authority: honeycomb.identity().address,
        owner: args.holderAccount.owner,
        vault: VAULT,
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      },
      { amount: args.amount },
      programId
    ),
  ];

  return {
    operation: new Operation(honeycomb, instructions),
  };
}
