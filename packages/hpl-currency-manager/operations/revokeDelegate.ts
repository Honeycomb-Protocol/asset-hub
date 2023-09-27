import * as web3 from "@solana/web3.js";
import {
  Honeycomb,
  Operation,
  VAULT,
  HPL_HIVE_CONTROL_PROGRAM,
} from "@honeycomb-protocol/hive-control";
import { createRevokeDelegateInstruction, PROGRAM_ID } from "../generated";
import { HplHolderAccount } from "../HplCurrency";

/**
 * Represents the arguments for creating a "Revoke Delegate" operation.
 * @category Types
 */
type CreateRevokeDelegateOperationArgs = {
  holderAccount: HplHolderAccount;
  programId?: web3.PublicKey;
};

/**
 * Creates a "Revoke Delegate" operation to remove the delegation authority from the specified holder account.
 * @category Operation Builders
 * @param honeycomb The Honeycomb instance.
 * @param args The arguments for creating the "Revoke Delegate" operation.
 * @returns An object containing the "Revoke Delegate" operation.
 * @example
 * const honeycomb = new Honeycomb(...); // Initialize Honeycomb instance
 * const holderAccount = ...; // HplHolderAccount instance
 *
 * // Create a "Revoke Delegate" operation for the holder account
 * const operationArgs: CreateRevokeDelegateOperationArgs = {
 *   holderAccount,
 * };
 * const { operation } = await createRevokeDelegateOperation(honeycomb, operationArgs);
 * operation.send();
 */
export async function createRevokeDelegateOperation(
  honeycomb: Honeycomb,
  args: CreateRevokeDelegateOperationArgs
) {
  // If programId is not provided, use the default PROGRAM_ID.
  const programId = args.programId || PROGRAM_ID;

  // Create the instruction for the "Revoke Delegate" operation.
  const instructions = [
    createRevokeDelegateInstruction(
      {
        project: args.holderAccount.currency().project().address,
        currency: args.holderAccount.currency().address,
        mint: args.holderAccount.currency().mint.address,
        holderAccount: args.holderAccount.address,
        tokenAccount: args.holderAccount.tokenAccount,
        authority: honeycomb.identity().address,
        payer: honeycomb.identity().address,
        vault: VAULT,
        hiveControl: HPL_HIVE_CONTROL_PROGRAM,
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      },
      programId
    ),
  ];

  // Return the "Revoke Delegate" operation wrapped in an object.
  return {
    operation: new Operation(honeycomb, instructions),
  };
}
