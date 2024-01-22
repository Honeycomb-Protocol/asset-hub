import * as web3 from "@solana/web3.js";
import {
  HPL_HIVE_CONTROL_PROGRAM,
  Honeycomb,
  Operation,
  VAULT,
} from "@honeycomb-protocol/hive-control";
import { createWrapCharacterInstruction, PROGRAM_ID } from "../../generated";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
} from "@solana/spl-account-compression";
import { createDepositAssetOperation } from "../custody";
import type { Asset } from "../../types";
import type { HplCharacterModel } from "../../CharacterModel";

/**
 * Represents the arguments for creating a "Create Currency" operation.
 * @category Types
 */
type CreateWrapAssetCustodyOperationArgs = {
  characterModel: HplCharacterModel;
  assetCustody: web3.PublicKey;
  programId?: web3.PublicKey;
};

/**
 * Creates a "Create Currency" operation for the given project and arguments, either
 * wrapping an existing mint or creating a new currency with a new mint.
 * @category Operation Builders
 * @param honeycomb The Honeycomb instance.
 * @param args The arguments for creating the "Create Currency" operation.
 * @returns An object containing the "Create Currency" operation and the currency address.
 * @example
 * const honeycomb = new Honeycomb(...); // Initialize Honeycomb instance
 * const project = ...; // HoneycombProject instance
 * const mintPublicKey = ...; // Mint public key for wrapping an existing currency
 * const wrapCharacterArgs = {
 *   name: "My Token",
 *   symbol: "MTK",
 *   decimals: 6,
 *   kind: CurrencyKind.Token,
 *   permissions: {
 *     mint: [mintAuthorityPublicKey],
 *     freeze: [],
 *     admin: [adminPublicKey],
 *     tokenOwner: [],
 *   },
 * };
 *
 * // Create a "Create Currency" operation
 * const operationArgs: CreateWrapAssetCustodyOperationArgs = {
 *   args: mintPublicKey ? { mint: mintPublicKey } : wrapCharacterArgs,
 *   project,
 * };
 * const { operation } = await createWrapCharacterOperation(honeycomb, operationArgs);
 * operation.send();
 */
export async function createWrapAssetCustodyOperation(
  honeycomb: Honeycomb,
  args: CreateWrapAssetCustodyOperationArgs
) {
  // If programId is not provided, use the default PROGRAM_ID.
  const programId = args.programId || PROGRAM_ID;

  const operation = new Operation(honeycomb, [
    createWrapCharacterInstruction(
      {
        project: args.characterModel.project,
        characterModel: args.characterModel.address,
        assetCustody: args.assetCustody,
        merkleTree: args.characterModel.activeCharactersMerkleTree,
        wallet: honeycomb.identity().address,
        vault: VAULT,
        systemProgram: web3.SystemProgram.programId,
        hiveControl: HPL_HIVE_CONTROL_PROGRAM,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      },
      programId
    ),
  ]);

  // Return the "Create Currency" operation wrapped in an object, along with the currency address.
  return {
    operation,
  };
}

type CreateWrapAssetOperationArgs = {
  asset: Asset;
  characterModel: HplCharacterModel;
  programId?: web3.PublicKey;
};

export async function createWrapAssetOperation(
  honeycomb: Honeycomb,
  args: CreateWrapAssetOperationArgs
) {
  const { operation: depositOperation, assetCustody } =
    await createDepositAssetOperation(honeycomb, args);

  const { operation: wrapOperation } = await createWrapAssetCustodyOperation(
    honeycomb,
    {
      characterModel: args.characterModel,
      assetCustody,
      programId: args.programId,
    }
  );

  return {
    operation: Operation.concat([depositOperation, wrapOperation]),
  };
}
