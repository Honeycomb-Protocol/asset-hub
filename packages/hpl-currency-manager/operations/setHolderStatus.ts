import * as web3 from "@solana/web3.js";
import { Honeycomb, Operation, VAULT } from "@honeycomb-protocol/hive-control";
import {
  createSetHolderStatusInstruction,
  HolderStatus,
  PROGRAM_ID,
} from "../generated";
import { HplHolderAccount } from "../HplCurrency";
import { SPL_NOOP_PROGRAM_ID } from "@solana/spl-account-compression";

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
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        logWrapper: SPL_NOOP_PROGRAM_ID,
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
