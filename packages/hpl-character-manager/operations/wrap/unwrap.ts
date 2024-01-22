import * as web3 from "@solana/web3.js";
import {
  HPL_HIVE_CONTROL_PROGRAM,
  Honeycomb,
  Operation,
  VAULT,
} from "@honeycomb-protocol/hive-control";
import { createUnwrapCharacterInstruction, PROGRAM_ID } from "../../generated";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
} from "@solana/spl-account-compression";
import { createWithdrawAssetOperation } from "../custody";
import type { HplCharacter } from "../../Character";
import type { HplCharacterModel } from "../../CharacterModel";

/**
 * Represents the arguments for creating a "Create Currency" operation.
 * @category Types
 */
type CreateUnwrapCharacterToAssetCustodyOperationArgs = {
  characterModel: HplCharacterModel;
  character: HplCharacter;
  programId?: web3.PublicKey;
};

/**
 * Creates a "Create Currency" operation for the given project and arguments, either
 * unwrapping an existing mint or creating a new currency with a new mint.
 * @category Operation Builders
 * @param honeycomb The Honeycomb instance.
 * @param args The arguments for creating the "Create Currency" operation.
 * @returns An object containing the "Create Currency" operation and the currency address.
 * @example
 * const honeycomb = new Honeycomb(...); // Initialize Honeycomb instance
 * const project = ...; // HoneycombProject instance
 * const mintPublicKey = ...; // Mint public key for unwrapping an existing currency
 * const unwrapCharacterArgs = {
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
 * const operationArgs: CreateUnwrapCharacterToAssetCustodyOperationArgs = {
 *   args: mintPublicKey ? { mint: mintPublicKey } : unwrapCharacterArgs,
 *   project,
 * };
 * const { operation } = await createUnwrapCharacterOperation(honeycomb, operationArgs);
 * operation.send();
 */
export async function createUnwrapCharacterToAssetCustodyOperation(
  honeycomb: Honeycomb,
  args: CreateUnwrapCharacterToAssetCustodyOperationArgs
) {
  // If programId is not provided, use the default PROGRAM_ID.
  const programId = args.programId || PROGRAM_ID;

  const proofPack = await args.character.proof(honeycomb.rpcEndpoint);

  if (!proofPack) throw new Error("Proof not found for this character");

  const { root, proof } = proofPack;

  const [assetCustody] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("asset_custody"), args.character.source.mint.toBuffer()],
    PROGRAM_ID
  );

  const operation = new Operation(honeycomb, [
    createUnwrapCharacterInstruction(
      {
        project: args.characterModel.project,
        characterModel: args.characterModel.address,
        assetCustody,
        merkleTree: args.character.merkleTree,
        wallet: honeycomb.identity().address,
        vault: VAULT,
        systemProgram: web3.SystemProgram.programId,
        hiveControl: HPL_HIVE_CONTROL_PROGRAM,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        anchorRemainingAccounts: proof.map((pubkey) => ({
          pubkey,
          isSigner: false,
          isWritable: false,
        })),
      },
      {
        args: {
          root: Array.from(root.toBytes()),
          leafIdx: args.character.leafIdx,
          source: args.character.source,
          usedBy: args.character.usedBy,
        },
      },
      programId
    ),
  ]);

  // Return the "Create Currency" operation unwrapped in an object, along with the currency address.
  return {
    operation,
  };
}

type CreateUnwrapAssetOperationArgs = {
  characterModel: HplCharacterModel;
  character: HplCharacter;
  programId?: web3.PublicKey;
};

export async function createUnwrapAssetOperation(
  honeycomb: Honeycomb,
  args: CreateUnwrapAssetOperationArgs
) {
  const { operation: unwrapOperation } =
    await createUnwrapCharacterToAssetCustodyOperation(honeycomb, {
      characterModel: args.characterModel,
      character: args.character,
      programId: args.programId,
    });

  const { operation: withdrawOperation } = await createWithdrawAssetOperation(
    honeycomb,
    {
      asset: await args.character.asset(honeycomb.rpcEndpoint),
      characterModel: args.characterModel,
      programId: args.programId,
    }
  );

  return {
    operation: Operation.concat([unwrapOperation, withdrawOperation]),
  };
}
