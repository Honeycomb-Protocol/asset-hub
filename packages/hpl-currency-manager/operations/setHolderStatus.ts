import * as web3 from "@solana/web3.js";
import {
  Honeycomb,
  Operation,
  VAULT,
  HPL_HIVE_CONTROL_PROGRAM,
} from "@honeycomb-protocol/hive-control";
import {
  createSetHolderStatusInstruction,
  HolderStatus,
  PROGRAM_ID,
} from "../generated";
import { HplHolderAccount } from "../HplHolderAccount";
import { HPL_EVENTS_PROGRAM } from "@honeycomb-protocol/events";

/**
 * Represents the arguments for creating a "Set Holder Status" operation.
 * @category Types
 */
type CreateSetHolderStatusOperationArgs = {
  status: HolderStatus;
  holderAccount: HplHolderAccount;
  programId?: web3.PublicKey;
};

/**
 * Creates a "Set Holder Status" operation to update the status of the specified holder account.
 * @category Operation Builders
 * @param honeycomb The Honeycomb instance.
 * @param args The arguments for creating the "Set Holder Status" operation.
 * @returns An object containing the "Set Holder Status" operation.
 * @example
 * const honeycomb = new Honeycomb(...); // Initialize Honeycomb instance
 * const holderAccount = ...; // HplHolderAccount instance
 *
 * // Create a "Set Holder Status" operation for the holder account
 * const operationArgs: CreateSetHolderStatusOperationArgs = {
 *   status: HolderStatus.Active, // Set the desired status
 *   holderAccount,
 * };
 * const { operation } = await createSetHolderStatusOperation(honeycomb, operationArgs);
 * operation.send();
 */
export async function createSetHolderStatusOperation(
  honeycomb: Honeycomb,
  args: CreateSetHolderStatusOperationArgs
) {
  // If programId is not provided, use the default PROGRAM_ID.
  const programId = args.programId || PROGRAM_ID;

  // Create the instruction for the "Set Holder Status" operation.
  const instructions = [
    createSetHolderStatusInstruction(
      {
        project: args.holderAccount.currency().project().address,
        currency: args.holderAccount.currency().address,
        holderAccount: args.holderAccount.address,
        tokenAccount: args.holderAccount.tokenAccount,
        authority: honeycomb.identity().address,
        payer: honeycomb.identity().address,
        vault: VAULT,
        hiveControl: HPL_HIVE_CONTROL_PROGRAM,
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        hplEvents: HPL_EVENTS_PROGRAM,
        clockSysvar: web3.SYSVAR_CLOCK_PUBKEY,
      },
      {
        status: args.status,
      },
      programId
    ),
  ];

  // Return the "Set Holder Status" operation wrapped in an object.
  return {
    operation: new Operation(honeycomb, instructions),
  };
}
