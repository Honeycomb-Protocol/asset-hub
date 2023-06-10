import * as web3 from "@solana/web3.js";
import {
  HIVECONTROL_PROGRAM_ID,
  Honeycomb,
  HoneycombProject,
  Operation,
  VAULT,
} from "@honeycomb-protocol/hive-control";
import {
  createCreateCurrencyInstruction,
  CreateCurrencyArgs,
  createWrapCurrencyInstruction,
  PROGRAM_ID,
} from "../generated";
import { METADATA_PROGRAM_ID, currencyPda, metadataPda } from "../utils";

type CreateCurrencyArgsPack = CreateCurrencyArgs | { mint: web3.PublicKey };
const isArgsMint = (
  args: CreateCurrencyArgsPack
): args is { mint: web3.PublicKey } => "mint" in args;

type CreateCreateCurrencyOperationArgs = {
  args: CreateCurrencyArgsPack;
  project: HoneycombProject;
  programId?: web3.PublicKey;
};
export async function createCreateCurrencyOperation(
  honeycomb: Honeycomb,
  args: CreateCreateCurrencyOperationArgs
) {
  const programId = args.programId || PROGRAM_ID;

  const mint = web3.Keypair.generate();
  const [currency] = currencyPda(mint.publicKey);
  const [metadata] = metadataPda(mint.publicKey);

  const instructions = [
    isArgsMint(args.args)
      ? createWrapCurrencyInstruction(
          {
            currency,
            mint: mint.publicKey,
            project: args.project.address,
            delegateAuthority:
              honeycomb.identity().delegateAuthority()?.address || programId,
            authority: honeycomb.identity().address,
            payer: honeycomb.identity().address,
            vault: VAULT,
            instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
            hiveControlProgram: HIVECONTROL_PROGRAM_ID,
          },
          programId
        )
      : createCreateCurrencyInstruction(
          {
            currency,
            mint: mint.publicKey,
            metadata,
            project: args.project.address,
            delegateAuthority:
              honeycomb.identity().delegateAuthority()?.address || programId,
            authority: honeycomb.identity().address,
            payer: honeycomb.identity().address,
            vault: VAULT,
            instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
            tokenMetadataProgram: METADATA_PROGRAM_ID,
            hiveControlProgram: HIVECONTROL_PROGRAM_ID,
          },
          {
            args: args.args,
          },
          programId
        ),
  ];

  return {
    operation: new Operation(
      honeycomb,
      instructions,
      !isArgsMint(args.args) ? [mint] : undefined
    ),
    currency,
  };
}
