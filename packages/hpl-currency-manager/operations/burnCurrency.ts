import * as web3 from "@solana/web3.js";
import {
  Honeycomb,
  Operation,
  VAULT,
  HPL_HIVE_CONTROL_PROGRAM,
} from "@honeycomb-protocol/hive-control";
import { createBurnCurrencyInstruction, PROGRAM_ID } from "../generated";
import { HplHolderAccount } from "../HplCurrency";

/**
 * Represents the arguments for creating a "Burn Currency" operation.
 */
type CreateBurnCurrencyOperationArgs = {
  amount: number;
  holderAccount: HplHolderAccount;
  programId?: web3.PublicKey;
};

/**
 * Creates a "Burn Currency" operation for the given holder account, burning a specific
 * amount of tokens from the holder account.
 * @category Operation Builders
 * @param honeycomb The Honeycomb instance.
 * @param args The arguments for creating the "Burn Currency" operation.
 * @returns An object containing the "Burn Currency" operation.
 * @example
 * const honeycomb = new Honeycomb(...); // Initialize Honeycomb instance
 * const holderAccount = ...; // HplHolderAccount instance
 * const amountToBurn = 50; // Number of tokens to burn
 *
 * // Create a "Burn Currency" operation for the holder account
 * const operationArgs: CreateBurnCurrencyOperationArgs = {
 *   amount: amountToBurn,
 *   holderAccount,
 * };
 * const { operation } = await createBurnCurrencyOperation(honeycomb, operationArgs);
 * operation.send();
 */
export async function createBurnCurrencyOperation(
  honeycomb: Honeycomb,
  args: CreateBurnCurrencyOperationArgs
) {
  // If programId is not provided, use the default PROGRAM_ID.
  const programId = args.programId || PROGRAM_ID;

  // Create the instruction for the "Burn Currency" operation.
  const instructions = [
    createBurnCurrencyInstruction(
      {
        project: args.holderAccount.currency().project().address,
        currency: args.holderAccount.currency().address,
        holderAccount: args.holderAccount.address,
        mint: args.holderAccount.currency().mint.address,
        tokenAccount: args.holderAccount.tokenAccount,
        owner: args.holderAccount.owner,
        payer: honeycomb.identity().address,
        vault: VAULT,
        hiveControl: HPL_HIVE_CONTROL_PROGRAM,
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      },
      {
        amount: args.amount,
      },
      programId
    ),
  ];

  // Return the "Burn Currency" operation wrapped in an object.
  return {
    operation: new Operation(honeycomb, instructions),
  };
}
