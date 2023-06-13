import * as web3 from "@solana/web3.js";
import { Honeycomb, Operation, VAULT } from "@honeycomb-protocol/hive-control";
import {
  createUpdateCurrencyInstruction,
  UpdateCurrencyArgs,
  PROGRAM_ID,
} from "../generated";
import { METADATA_PROGRAM_ID, metadataPda } from "../utils";
import { HplCurrency } from "../HplCurrency";

type CreateUpdateCurrencyOperationArgs = {
  args: UpdateCurrencyArgs;
  currency: HplCurrency;
  programId?: web3.PublicKey;
};
export async function createUpdateCurrencyOperation(
  honeycomb: Honeycomb,
  args: CreateUpdateCurrencyOperationArgs
) {
  const programId = args.programId || PROGRAM_ID;

  const [metadata] = metadataPda(args.currency.mint.address);
  const [edition] = metadataPda(args.currency.mint.address, {
    __kind: "edition",
  });

  const instructions = [
    createUpdateCurrencyInstruction(
      {
        currency: args.currency.address,
        mint: args.currency.mint.address,
        metadata,
        edition,
        project: args.currency.project().address,
        delegateAuthority:
          honeycomb.identity().delegateAuthority()?.address || programId,
        authority: honeycomb.identity().address,
        payer: honeycomb.identity().address,
        vault: VAULT,
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        tokenMetadataProgram: METADATA_PROGRAM_ID,
      },
      {
        args: args.args,
      },
      programId
    ),
  ];

  return {
    operation: new Operation(honeycomb, instructions),
  };
}
