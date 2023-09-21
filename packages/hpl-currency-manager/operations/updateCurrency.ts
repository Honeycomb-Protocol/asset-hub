import * as web3 from "@solana/web3.js";
import { Honeycomb, Operation, VAULT } from "@honeycomb-protocol/hive-control";
import {
  createUpdateCurrencyInstruction,
  UpdateCurrencyArgs,
  PROGRAM_ID,
} from "../generated";
import { METADATA_PROGRAM_ID, metadataPda } from "../utils";
import { HplCurrency } from "../HplCurrency";
import { HPL_EVENTS_PROGRAM } from "@honeycomb-protocol/events";

/**
 * Represents the arguments for creating an "Update Currency" operation.
 * @category Types
 */
type CreateUpdateCurrencyOperationArgs = {
  args: UpdateCurrencyArgs;
  currency: HplCurrency;
  programId?: web3.PublicKey;
};

/**
 * Creates an "Update Currency" operation to update the properties of a Honeycomb currency.
 *
 * @category Operation Builders
 * @param honeycomb The Honeycomb instance.
 * @param args The arguments for creating the "Update Currency" operation.
 * @returns An object containing the "Update Currency" operation.
 *
 * @example
 * const honeycomb = new Honeycomb(...); // Initialize Honeycomb instance
 * const currency = ...; // Existing HplCurrency instance
 *
 * // Create an "Update Currency" operation to update the properties of the currency
 * const operationArgs: CreateUpdateCurrencyOperationArgs = {
 *   args: {
 *     name: "Updated Currency Name", // New name for the currency
 *     symbol: "SYM", // New symbol for the currency
 *   },
 *   currency, // Existing HplCurrency instance
 * };
 * const { operation } = await createUpdateCurrencyOperation(honeycomb, operationArgs);
 * operation.send();
 */
export async function createUpdateCurrencyOperation(
  honeycomb: Honeycomb,
  args: CreateUpdateCurrencyOperationArgs
) {
  // If programId is not provided, use the default PROGRAM_ID.
  const programId = args.programId || PROGRAM_ID;

  const [metadata] = metadataPda(args.currency.mint.address);

  // Create the instruction for the "Update Currency" operation.
  const instructions = [
    createUpdateCurrencyInstruction(
      {
        currency: args.currency.address,
        mint: args.currency.mint.address,
        metadata,
        project: args.currency.project().address,
        delegateAuthority:
          honeycomb.identity().delegateAuthority()?.address || programId,
        authority: honeycomb.identity().address,
        payer: honeycomb.identity().address,
        vault: VAULT,
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        tokenMetadataProgram: METADATA_PROGRAM_ID,
        hplEvents: HPL_EVENTS_PROGRAM,
        clockSysvar: web3.SYSVAR_CLOCK_PUBKEY,
      },
      {
        args: args.args,
      },
      programId
    ),
  ];

  // Return the "Update Currency" operation wrapped in an object.
  return {
    operation: new Operation(honeycomb, instructions),
  };
}
