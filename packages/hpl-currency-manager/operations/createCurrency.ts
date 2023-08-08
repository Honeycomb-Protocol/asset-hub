import * as web3 from "@solana/web3.js";
import {
  HIVECONTROL_PROGRAM_ID,
  Honeycomb,
  HoneycombProject,
  Operation,
  VAULT,
} from "@honeycomb-protocol/hive-control";
import {
  createCreateCurrencyInstruction,
  CreateCurrencyArgs,
  createWrapCurrencyInstruction,
  PROGRAM_ID,
} from "../generated";
import { METADATA_PROGRAM_ID, currencyPda, metadataPda } from "../utils";
import { SPL_NOOP_PROGRAM_ID } from "@solana/spl-account-compression";

/**
 * Represents the arguments for creating a "Create Currency" operation.
 * @category Types
 */
type CreateCurrencyArgsPack = CreateCurrencyArgs | { mint: web3.PublicKey };

/**
 * Represents the arguments for creating a "Create Currency" operation.
 * @category Types
 */
type CreateCreateCurrencyOperationArgs = {
  args: CreateCurrencyArgsPack;
  project: HoneycombProject;
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
 * const createCurrencyArgs = {
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
 * const operationArgs: CreateCreateCurrencyOperationArgs = {
 *   args: mintPublicKey ? { mint: mintPublicKey } : createCurrencyArgs,
 *   project,
 * };
 * const { operation } = await createCreateCurrencyOperation(honeycomb, operationArgs);
 * operation.send();
 */
export async function createCreateCurrencyOperation(
  honeycomb: Honeycomb,
  args: CreateCreateCurrencyOperationArgs
) {
  // If programId is not provided, use the default PROGRAM_ID.
  const programId = args.programId || PROGRAM_ID;

  // Generate a new mint keypair if mint public key is not provided.
  const mint = web3.Keypair.generate();

  // Find the currency and metadata PDAs based on whether mint public key is provided or not.
  const [currency] = currencyPda(
    "mint" in args.args ? args.args.mint : mint.publicKey
  );
  const [metadata] = metadataPda(
    "mint" in args.args ? args.args.mint : mint.publicKey
  );

  // Create the instruction for the "Create Currency" operation based on provided arguments.
  const instructions = [
    "mint" in args.args
      ? createWrapCurrencyInstruction(
          {
            currency,
            mint: args.args.mint,
            project: args.project.address,
            delegateAuthority:
              honeycomb.identity().delegateAuthority()?.address || programId,
            authority: honeycomb.identity().address,
            payer: honeycomb.identity().address,
            vault: VAULT,
            instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
            logWrapper: SPL_NOOP_PROGRAM_ID,
            clockSysvar: web3.SYSVAR_CLOCK_PUBKEY,
          },
          programId
        )
      : createCreateCurrencyInstruction(
          {
            currency,
            mint: mint.publicKey,
            metadata,
            project: args.project.address,
            delegateAuthority:
              honeycomb.identity().delegateAuthority()?.address || programId,
            authority: honeycomb.identity().address,
            payer: honeycomb.identity().address,
            vault: VAULT,
            instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
            tokenMetadataProgram: METADATA_PROGRAM_ID,
            logWrapper: SPL_NOOP_PROGRAM_ID,
            clockSysvar: web3.SYSVAR_CLOCK_PUBKEY,
          },
          {
            args: args.args,
          },
          programId
        ),
  ];

  // Return the "Create Currency" operation wrapped in an object, along with the currency address.
  return {
    operation: new Operation(
      honeycomb,
      instructions,
      !("mint" in args.args) ? [mint] : undefined
    ),
    currency,
  };
}
