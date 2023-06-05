import * as web3 from "@solana/web3.js";
import {
  HIVECONTROL_PROGRAM_ID,
  Honeycomb,
  Operation,
  VAULT,
} from "@honeycomb-protocol/hive-control";
import { createMintCurrencyInstruction, PROGRAM_ID } from "../generated";
import { HplHolderAccount } from "../HplCurrency";

type CreateMintCurrencyOperationArgs = {
  amount: number;
  holderAccount: HplHolderAccount;
  programId?: web3.PublicKey;
};
export async function createMintCurrencyOperation(
  honeycomb: Honeycomb,
  args: CreateMintCurrencyOperationArgs
) {
  const programId = args.programId || PROGRAM_ID;

  const instructions = [
    createMintCurrencyInstruction(
      {
        currency: args.holderAccount.currency().address,
        holderAccount: args.holderAccount.address,
        mint: args.holderAccount.currency().mint,
        tokenAccount: args.holderAccount.tokenAccount,
        project: args.holderAccount.currency().project().address,
        delegateAuthority:
          honeycomb.identity().delegateAuthority()?.address || programId,
        authority: honeycomb.identity().address,
        payer: honeycomb.identity().address,
        vault: VAULT,
        hiveControlProgram: HIVECONTROL_PROGRAM_ID,
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
