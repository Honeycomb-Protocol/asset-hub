import * as web3 from "@solana/web3.js";
import { Honeycomb, Operation, VAULT } from "@honeycomb-protocol/hive-control";
import {
  createCreateNewCharactersTreeInstruction,
  PROGRAM_ID,
} from "../../generated";
import { HPL_EVENTS_PROGRAM } from "@honeycomb-protocol/events";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
  ValidDepthSizePair,
  getConcurrentMerkleTreeAccountSize,
} from "@solana/spl-account-compression";

/**
 * Represents the arguments for creating a "Create Currency" operation.
 * @category Types
 */
type CreateCreateNewCharactersTreeOperationArgs = {
  depthSizePair: ValidDepthSizePair & { canopyDepth?: number };
  project: web3.PublicKey;
  characterModel: web3.PublicKey;
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
 * const createNewCharactersTreeArgs = {
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
 * const operationArgs: CreateCreateNewCharactersTreeOperationArgs = {
 *   args: mintPublicKey ? { mint: mintPublicKey } : createNewCharactersTreeArgs,
 *   project,
 * };
 * const { operation } = await createCreateNewCharactersTreeOperation(honeycomb, operationArgs);
 * operation.send();
 */
export async function createCreateNewCharactersTreeOperation(
  honeycomb: Honeycomb,
  args: CreateCreateNewCharactersTreeOperationArgs
) {
  // If programId is not provided, use the default PROGRAM_ID.
  const programId = args.programId || PROGRAM_ID;

  const merkleTreeKeypair = web3.Keypair.generate();

  const space = getConcurrentMerkleTreeAccountSize(
    args.depthSizePair.maxDepth,
    args.depthSizePair.maxBufferSize,
    args.depthSizePair.canopyDepth
  );
  const lamports = await honeycomb.connection.getMinimumBalanceForRentExemption(
    space
  );

  const operation = new Operation(
    honeycomb,
    [
      web3.SystemProgram.createAccount({
        newAccountPubkey: merkleTreeKeypair.publicKey,
        fromPubkey: honeycomb.identity().address,
        space,
        lamports,
        programId: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      }),
      createCreateNewCharactersTreeInstruction(
        {
          project: args.project,
          characterModel: args.characterModel,
          merkleTree: merkleTreeKeypair.publicKey,
          authority: honeycomb.identity().address,
          payer: honeycomb.identity().address,
          vault: VAULT,
          systemProgram: web3.SystemProgram.programId,
          compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
          logWrapper: SPL_NOOP_PROGRAM_ID,
          clock: web3.SYSVAR_CLOCK_PUBKEY,
          rentSysvar: web3.SYSVAR_RENT_PUBKEY,
          instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        },
        {
          args: args.depthSizePair,
        },
        programId
      ),
    ],
    [merkleTreeKeypair]
  );

  // Return the "Create Currency" operation wrapped in an object, along with the currency address.
  return {
    operation,
    merkleTree: merkleTreeKeypair.publicKey,
  };
}
