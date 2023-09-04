import * as web3 from "@solana/web3.js";
import { Honeycomb, Operation, VAULT } from "@honeycomb-protocol/hive-control";
import {
  createCreateHolderAccountInstruction,
  createWrapHolderAccountInstruction,
  PROGRAM_ID,
} from "../generated";
import { holderAccountPdas } from "../utils";
import { ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { HplCurrency } from "../HplCurrency";
import { SPL_NOOP_PROGRAM_ID } from "@solana/spl-account-compression";

/**
 * Represents the arguments for creating a "Create Holder Account" operation.
 * @category Types
 */
type CreateCreateHolderAccountOperationArgs = {
  currency: HplCurrency;
  owner: web3.PublicKey;
  programId?: web3.PublicKey;
};

/**
 * Creates a "Create Holder Account" operation for the given owner and currency,
 * creating a new holder account and token account for the specified currency.
 *
 * If the token account `already exists` (In case of wrapped currency) then "Wrap Holder Account" instruction will be created.
 *
 * @category Operation Builders
 * @param honeycomb The Honeycomb instance.
 * @param args The arguments for creating the "Create Holder Account" operation.
 * @returns An object containing the "Create Holder Account" operation and the holder account address.
 * @example
 * const honeycomb = new Honeycomb(...); // Initialize Honeycomb instance
 * const currency = ...; // HplCurrency instance
 * const ownerPublicKey = ...; // Owner's public key
 *
 * // Create a "Create Holder Account" operation for the owner and currency
 * const operationArgs: CreateCreateHolderAccountOperationArgs = {
 *   currency,
 *   owner: ownerPublicKey,
 * };
 * const { operation } = await createCreateHolderAccountOperation(honeycomb, operationArgs);
 * operation.send();
 */
export async function createCreateHolderAccountOperation(
  honeycomb: Honeycomb,
  args: CreateCreateHolderAccountOperationArgs
) {
  // If programId is not provided, use the default PROGRAM_ID.
  const programId = args.programId || PROGRAM_ID;

  // Get the holder account and token account PDAs for the specified owner and currency.
  const { holderAccount, tokenAccount } = holderAccountPdas(
    args.owner,
    args.currency.mint.address,
    args.currency.kind,
    programId
  );

  const wrap = args.currency.kind.__kind === "Wrapped";
  const needed = {
    tokenAccount: !(await honeycomb.rpc().getBalance(tokenAccount)),
    holderAccount: !(await honeycomb.rpc().getBalance(holderAccount)),
  };

  const instructions: web3.TransactionInstruction[] = [];
  if (wrap) {
    if (needed.holderAccount) {
      instructions.push(
        createWrapHolderAccountInstruction(
          {
            project: args.currency.project().address,
            currency: args.currency.address,
            holderAccount,
            tokenAccount,
            mint: args.currency.mint.address,
            owner: args.owner,
            payer: honeycomb.identity().address,
            vault: VAULT,
            instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
            logWrapper: SPL_NOOP_PROGRAM_ID,
            clockSysvar: web3.SYSVAR_CLOCK_PUBKEY,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          },
          programId
        )
      );
    }
  } else {
    if (needed.holderAccount || needed.tokenAccount) {
      instructions.push(
        createCreateHolderAccountInstruction(
          {
            project: args.currency.project().address,
            currency: args.currency.address,
            holderAccount,
            tokenAccount,
            mint: args.currency.mint.address,
            owner: args.owner,
            payer: honeycomb.identity().address,
            vault: VAULT,
            instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
            logWrapper: SPL_NOOP_PROGRAM_ID,
            clockSysvar: web3.SYSVAR_CLOCK_PUBKEY,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          },
          programId
        )
      );
    }
  }
  // Return the "Create Holder Account" operation wrapped in an object, along with the holder account address.
  return {
    operation: instructions.length
      ? new Operation(honeycomb, instructions)
      : null,
    holderAccount,
    tokenAccount,
  };
}
