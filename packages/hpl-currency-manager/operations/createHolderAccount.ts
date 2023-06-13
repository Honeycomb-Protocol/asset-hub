import * as web3 from "@solana/web3.js";
import { Honeycomb, Operation, VAULT } from "@honeycomb-protocol/hive-control";
import { createCreateHolderAccountInstruction, PROGRAM_ID } from "../generated";
import { holderAccountPdas, metadataPda } from "../utils";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { HplCurrency } from "../HplCurrency";

type CreateCreateHolderAccountOperationArgs = {
  currency: HplCurrency;
  owner: web3.PublicKey;
  programId?: web3.PublicKey;
};
export async function createCreateHolderAccountOperation(
  honeycomb: Honeycomb,
  args: CreateCreateHolderAccountOperationArgs
) {
  const programId = args.programId || PROGRAM_ID;

  const { holderAccount, tokenAccount } = holderAccountPdas(
    args.owner,
    args.currency.mint.address,
    args.currency.kind,
    TOKEN_PROGRAM_ID,
    programId
  );
  const [metadata] = metadataPda(args.currency.mint.address);

  const instructions = [
    createCreateHolderAccountInstruction(
      {
        project: args.currency.project().address,
        currency: args.currency.address,
        holderAccount,
        tokenAccount,
        mint: args.currency.mint.address,
        owner: args.owner,
        payer: honeycomb.identity().address,
        vault: VAULT,
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      },
      programId
    ),
  ];

  return {
    operation: new Operation(honeycomb, instructions),
    holderAccount,
  };
}
