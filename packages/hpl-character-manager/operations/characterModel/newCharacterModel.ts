import * as web3 from "@solana/web3.js";
import {
  HPL_HIVE_CONTROL_PROGRAM,
  Honeycomb,
  Operation,
  VAULT,
} from "@honeycomb-protocol/hive-control";
import {
  createNewCharacterModelInstruction,
  NewCharacterModelArgs,
  PROGRAM_ID,
} from "../../generated";

/**
 * Represents the arguments for creating a "Create Currency" operation.
 * @category Types
 */
type CreateNewCharacterModelOperationArgs = {
  args: NewCharacterModelArgs;
  project: web3.PublicKey;
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
 * const newCharacterModelArgs = {
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
 * const operationArgs: CreateNewCharacterModelOperationArgs = {
 *   args: mintPublicKey ? { mint: mintPublicKey } : newCharacterModelArgs,
 *   project,
 * };
 * const { operation } = await createNewCharacterModelOperation(honeycomb, operationArgs);
 * operation.send();
 */
export async function createNewCharacterModelOperation(
  honeycomb: Honeycomb,
  args: CreateNewCharacterModelOperationArgs
) {
  // If programId is not provided, use the default PROGRAM_ID.
  const programId = args.programId || PROGRAM_ID;

  const key = web3.Keypair.generate().publicKey;
  const [characterModel] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("character_model"), args.project.toBuffer(), key.toBuffer()],
    PROGRAM_ID
  );

  const operation = new Operation(honeycomb, [
    createNewCharacterModelInstruction(
      {
        project: args.project,
        key,
        characterModel,
        authority: honeycomb.identity().address,
        payer: honeycomb.identity().address,
        vault: VAULT,
        systemProgram: web3.SystemProgram.programId,
        hiveControl: HPL_HIVE_CONTROL_PROGRAM,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      },
      {
        args: args.args,
      },
      programId
    ),
  ]);

  // Return the "Create Currency" operation wrapped in an object, along with the currency address.
  return {
    operation,
    characterModel,
  };
}
