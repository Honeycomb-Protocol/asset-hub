import * as web3 from "@solana/web3.js";
import {
  HPL_HIVE_CONTROL_PROGRAM,
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
import { METADATA_PROGRAM_ID, metadataPda } from "../utils";
import { HPL_EVENTS_PROGRAM } from "@honeycomb-protocol/events";

/**
 * Represents the arguments for creating a "Create Currency" operation.
 * @category Types
 */
type CreateCurrencyArgsPack =
  | (CreateCurrencyArgs & { useMint?: web3.Keypair })
  | {
      mint: web3.PublicKey;
      mintAuthority: web3.Keypair | web3.PublicKey;
      freezeAuthority: web3.Keypair | web3.PublicKey;
    };

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
  const mint =
    "useMint" in args.args && args.args.useMint
      ? args.args.useMint
      : web3.Keypair.generate();

  // Find the currency and metadata PDAs based on whether mint public key is provided or not.
  const [currency] = honeycomb
    .pda()
    .currencyManager()
    .currency("mint" in args.args ? args.args.mint : mint.publicKey);
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
            mintAuthority:
              args.args.mintAuthority instanceof web3.Keypair
                ? args.args.mintAuthority.publicKey
                : args.args.mintAuthority,
            freezeAuthority:
              args.args.freezeAuthority instanceof web3.Keypair
                ? args.args.freezeAuthority.publicKey
                : args.args.freezeAuthority,
            payer: honeycomb.identity().address,
            vault: VAULT,
            hiveControl: HPL_HIVE_CONTROL_PROGRAM,
            instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
            hplEvents: HPL_EVENTS_PROGRAM,
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
            hiveControl: HPL_HIVE_CONTROL_PROGRAM,
            instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
            tokenMetadataProgram: METADATA_PROGRAM_ID,
            hplEvents: HPL_EVENTS_PROGRAM,
            clockSysvar: web3.SYSVAR_CLOCK_PUBKEY,
          },
          {
            args: args.args,
          },
          programId
        ),
  ];

  let signers = [];

  if ("mint" in args.args) {
    if (args.args.mintAuthority instanceof web3.Keypair) {
      signers.push(args.args.mintAuthority);
    }
    if (args.args.freezeAuthority instanceof web3.Keypair) {
      signers.push(args.args.freezeAuthority);
    }
  } else {
    signers.push(mint);
  }

  // Return the "Create Currency" operation wrapped in an object, along with the currency address.
  return {
    operation: new Operation(honeycomb, instructions, signers),
    currency,
  };
}
