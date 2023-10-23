import * as web3 from "@solana/web3.js";
import {
  Honeycomb,
  Operation,
  VAULT,
  HPL_HIVE_CONTROL_PROGRAM,
} from "@honeycomb-protocol/hive-control";
import { createTransferCurrencyInstruction, PROGRAM_ID } from "../generated";
import { HplHolderAccount } from "../HplCurrency";
import { createCreateHolderAccountOperation } from "./createHolderAccount";

/**
 * Represents the arguments for creating a "Transfer Currency" operation.
 * @category Types
 */
type CreateTransferCurrencyOperationArgs = {
  amount: number;
  holderAccount: HplHolderAccount;
  receiver: web3.PublicKey | HplHolderAccount;
  programId?: web3.PublicKey;
};

/**
 * Creates a "Transfer Currency" operation to transfer a specific amount of currency
 * from one holder account to another holder account.
 *
 * @category Operation Builders
 * @param honeycomb The Honeycomb instance.
 * @param args The arguments for creating the "Transfer Currency" operation.
 * @returns An object containing the "Transfer Currency" operation.
 *
 * @example
 * const honeycomb = new Honeycomb(...); // Initialize Honeycomb instance
 * const senderHolderAccount = ...; // Sender's HplHolderAccount instance
 * const receiverHolderAccount = ...; // Receiver's HplHolderAccount instance
 *
 * // Create a "Transfer Currency" operation to send 10 currency tokens from sender to receiver
 * const operationArgs: CreateTransferCurrencyOperationArgs = {
 *   amount: 10, // Transfer amount
 *   holderAccount: senderHolderAccount, // Sender's HplHolderAccount instance
 *   receiver: receiverHolderAccount, // Receiver's HplHolderAccount instance
 * };
 * const { operation } = await createTransferCurrencyOperation(honeycomb, operationArgs);
 * operation.send();
 */
export async function createTransferCurrencyOperation(
  honeycomb: Honeycomb,
  args: CreateTransferCurrencyOperationArgs
) {
  // If programId is not provided, use the default PROGRAM_ID.
  const programId = args.programId || PROGRAM_ID;

  const instructions: web3.TransactionInstruction[] = [];

  let receiverHolderAccount: web3.PublicKey,
    receiverTokenAccount: web3.PublicKey;

  // If the receiver is a public key, fetch the holder account and token account PDAs.
  if (args.receiver instanceof web3.PublicKey) {
    const accounts = honeycomb
      .pda()
      .currencyManager()
      .holderAccountWithTokenAccount(
        args.receiver,
        args.holderAccount.currency().mint.address,
        args.holderAccount.currency().kind,
        programId
      );
    receiverHolderAccount = accounts.holderAccount;
    receiverTokenAccount = accounts.tokenAccount;

    // If needed, create a new holder account for the receiver and add the corresponding instructions.
    instructions.unshift(
      ...(await createCreateHolderAccountOperation(honeycomb, {
        currency: args.holderAccount.currency(),
        owner: args.receiver,
        programId,
      }).then(({ operation }) => operation?.instructions || []))
    );
  } else {
    receiverHolderAccount = args.receiver.address;
    receiverTokenAccount = args.receiver.tokenAccount;
  }

  // Create the instruction for the "Transfer Currency" operation.
  instructions.push(
    createTransferCurrencyInstruction(
      {
        project: args.holderAccount.currency().project().address,
        currency: args.holderAccount.currency().address,
        mint: args.holderAccount.currency().mint.address,
        senderHolderAccount: args.holderAccount.address,
        senderTokenAccount: args.holderAccount.tokenAccount,
        receiverHolderAccount,
        receiverTokenAccount,
        owner: honeycomb.identity().address,
        payer: honeycomb.identity().address,
        vault: VAULT,
        hiveControl: HPL_HIVE_CONTROL_PROGRAM,
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      },
      {
        amount: args.amount,
      },
      programId
    )
  );

  // Return the "Transfer Currency" operation wrapped in an object.
  return {
    operation: new Operation(honeycomb, instructions),
  };
}
