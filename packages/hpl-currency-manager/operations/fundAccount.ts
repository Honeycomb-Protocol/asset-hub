import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import { createFundAccountInstruction, PROGRAM_ID } from "../generated";
import { holderAccountPdas } from "../utils";
import { Honeycomb, Operation, VAULT } from "@honeycomb-protocol/hive-control";
import { HplCurrency } from "../HplCurrency";
import { createCreateHolderAccountOperation } from "./createHolderAccount";

/**
 * Represents the arguments for creating a "Fund Account" operation.
 * @category Types
 */
type CreateFundAccountOperationArgs = {
  amount: number;
  currency: HplCurrency;
  receiverWallet: web3.PublicKey;
  programId?: web3.PublicKey;
};

/**
 * Creates a "Fund Account" operation to add funds to the specified holder account for the given currency.
 * If the receiver wallet does not have a holder account for the currency, a new holder account will be created.
 * @category Operation Builders
 * @param honeycomb The Honeycomb instance.
 * @param args The arguments for creating the "Fund Account" operation.
 * @returns An object containing the "Fund Account" operation and the holder account address.
 * @example
 * const honeycomb = new Honeycomb(...); // Initialize Honeycomb instance
 * const currency = ...; // HplCurrency instance
 * const receiverWallet = ...; // Receiver's wallet public key
 * const amount = 100; // Amount to fund
 *
 * // Create a "Fund Account" operation for the receiver and currency
 * const operationArgs: CreateFundAccountOperationArgs = {
 *   currency,
 *   receiverWallet,
 *   amount,
 * };
 * const { operation } = await createFundAccountOperation(honeycomb, operationArgs);
 * operation.send();
 */
export async function createFundAccountOperation(
  honeycomb: Honeycomb,
  args: CreateFundAccountOperationArgs
) {
  // If programId is not provided, use the default PROGRAM_ID.
  const programId = args.programId || PROGRAM_ID;

  // Get the source token account associated with the identity.
  const sourceTokenAccount = splToken.getAssociatedTokenAddressSync(
    args.currency.mint.address,
    honeycomb.identity().address
  );

  // Get the holder account and token account PDAs for the specified receiver wallet and currency.
  const { holderAccount, tokenAccount } = holderAccountPdas(
    args.receiverWallet,
    args.currency.mint.address,
    args.currency.kind,
    programId
  );

  // Create the instruction for the "Fund Account" operation.
  const instructions = [
    createFundAccountInstruction(
      {
        project: args.currency.project().address,
        currency: args.currency.address,
        mint: args.currency.mint.address,
        holderAccount,
        tokenAccount,
        sourceTokenAccount,
        authority: honeycomb.identity().address,
        wallet: honeycomb.identity().address,
        vault: VAULT,
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      },
      {
        amount: args.amount,
      },
      programId
    ),
  ];

  try {
    // Check if the receiver wallet already has a holder account for the currency.
    await args.currency.holderAccount(args.receiverWallet);
  } catch {
    // If not, create a new holder account for the receiver and add the corresponding instructions.
    instructions.unshift(
      ...(await createCreateHolderAccountOperation(honeycomb, {
        currency: args.currency,
        owner: args.receiverWallet,
        programId,
      }).then(({ operation }) => operation.instructions))
    );
  }

  // Return the "Fund Account" operation wrapped in an object, along with the holder account address.
  return {
    operation: new Operation(honeycomb, instructions),
    holderAccount,
  };
}
