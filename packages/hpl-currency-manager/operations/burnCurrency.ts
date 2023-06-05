import * as web3 from "@solana/web3.js";
import { Honeycomb, Operation, VAULT } from "@honeycomb-protocol/hive-control";
import { createBurnCurrencyInstruction, PROGRAM_ID } from "../generated";
import { HplHolderAccount } from "../HplCurrency";

type CreateBurnCurrencyOperationArgs = {
  amount: number;
  holderAccount: HplHolderAccount;
  programId?: web3.PublicKey;
};
export async function createBurnCurrencyOperation(
  honeycomb: Honeycomb,
  args: CreateBurnCurrencyOperationArgs
) {
  const programId = args.programId || PROGRAM_ID;

  const instructions = [
    createBurnCurrencyInstruction(
      {
        project: args.holderAccount.currency().project().address,
        currency: args.holderAccount.currency().address,
        holderAccount: args.holderAccount.address,
        mint: args.holderAccount.currency().mint,
        tokenAccount: args.holderAccount.tokenAccount,
        owner: args.holderAccount.owner,
        vault: VAULT,
      },
      {
        amount: args.amount,
      },
      programId
    ),
  ];

  return {
    operation: new Operation(honeycomb, instructions),
  };
}
