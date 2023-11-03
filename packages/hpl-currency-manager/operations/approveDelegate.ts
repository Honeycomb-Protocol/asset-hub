import * as web3 from "@solana/web3.js";
import {
  HPL_HIVE_CONTROL_PROGRAM,
  Honeycomb,
  Operation,
  VAULT,
} from "@honeycomb-protocol/hive-control";
import { createApproveDelegateInstruction, PROGRAM_ID } from "../generated";
import { HplHolderAccount } from "../HplHolderAccount";

/**
 * Represents the arguments for creating an "Approve Delegate" operation.
 */
type CreateApproveDelegateOperationArgs = {
  amount: number;
  holderAccount: HplHolderAccount;
  delegate: web3.PublicKey;
  programId?: web3.PublicKey;
};

/**
 * Creates an "Approve Delegate" operation for the given holder account, approving a delegate
 * to spend a certain amount of tokens on behalf of the holder account.
 * @category Operation Builders
 * @param honeycomb The Honeycomb instance.
 * @param args The arguments for creating the "Approve Delegate" operation.
 * @returns An object containing the "Approve Delegate" operation.
 * @example
 * const honeycomb = new Honeycomb(...); // Initialize Honeycomb instance
 * const holderAccount = ...; // HplHolderAccount instance
 * const delegatePublicKey = ...; // Delegate public key
 * const amountToApprove = 100; // Number of tokens to approve
 *
 * // Create an "Approve Delegate" operation for the holder account
 * const operationArgs: CreateApproveDelegateOperationArgs = {
 *   amount: amountToApprove,
 *   holderAccount,
 *   delegate: delegatePublicKey,
 * };
 * const { operation } = await createApproveDelegateOperation(honeycomb, operationArgs);
 * operation.send();
 */
export async function createApproveDelegateOperation(
  honeycomb: Honeycomb,
  args: CreateApproveDelegateOperationArgs
) {
  // If programId is not provided, use the default PROGRAM_ID.
  const programId = args.programId || PROGRAM_ID;

  // Create the instruction for the "Approve Delegate" operation.
  const instructions = [
    createApproveDelegateInstruction(
      {
        project: args.holderAccount.currency().project().address,
        currency: args.holderAccount.currency().address,
        mint: args.holderAccount.currency().mint.address,
        holderAccount: args.holderAccount.address,
        tokenAccount: args.holderAccount.tokenAccount,
        delegate: args.delegate,
        owner: args.holderAccount.owner,
        payer: honeycomb.identity().address,
        vault: VAULT,
        hiveControl: HPL_HIVE_CONTROL_PROGRAM,
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      },
      { amount: args.amount },
      programId
    ),
  ];

  // Return the "Approve Delegate" operation wrapped in an object.
  return {
    operation: new Operation(honeycomb, instructions),
  };
}
