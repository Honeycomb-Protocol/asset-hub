import * as web3 from "@solana/web3.js";
import {
  HPL_HIVE_CONTROL_PROGRAM,
  Honeycomb,
  Operation,
  VAULT,
} from "@honeycomb-protocol/hive-control";
import { createMintCurrencyInstruction, PROGRAM_ID } from "../generated";
import { HplHolderAccount } from "../HplCurrency";

/**
 * Represents the arguments for creating a "Mint Currency" operation.
 * @category Types
 */
type CreateMintCurrencyOperationArgs = {
  amount: number;
  holderAccount: HplHolderAccount;
  programId?: web3.PublicKey;
};

/**
 * Creates a "Mint Currency" operation to mint new currency tokens and add them to the specified holder account.
 * @category Operation Builders
 * @param honeycomb The Honeycomb instance.
 * @param args The arguments for creating the "Mint Currency" operation.
 * @returns An object containing the "Mint Currency" operation.
 * @example
 * const honeycomb = new Honeycomb(...); // Initialize Honeycomb instance
 * const currency = ...; // HplCurrency instance
 * const holderAccount = ...; // HplHolderAccount instance
 * const amount = 100; // Amount to mint
 *
 * // Create a "Mint Currency" operation for the holder account and amount
 * const operationArgs: CreateMintCurrencyOperationArgs = {
 *   holderAccount,
 *   amount,
 * };
 * const { operation } = await createMintCurrencyOperation(honeycomb, operationArgs);
 * operation.send();
 */
export async function createMintCurrencyOperation(
  honeycomb: Honeycomb,
  args: CreateMintCurrencyOperationArgs
) {
  // If programId is not provided, use the default PROGRAM_ID.
  const programId = args.programId || PROGRAM_ID;

  // Create the instruction for the "Mint Currency" operation.
  const instructions = [
    createMintCurrencyInstruction(
      {
        currency: args.holderAccount.currency().address,
        holderAccount: args.holderAccount.address,
        mint: args.holderAccount.currency().mint.address,
        tokenAccount: args.holderAccount.tokenAccount,
        project: args.holderAccount.currency().project().address,
        delegateAuthority:
          honeycomb.identity().delegateAuthority()?.address || programId,
        authority: honeycomb.identity().address,
        payer: honeycomb.identity().address,
        vault: VAULT,
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      },
      {
        amount: args.amount,
      },
      programId
    ),
  ];

  // Return the "Mint Currency" operation wrapped in an object.
  return {
    operation: new Operation(honeycomb, instructions),
  };
}
