import * as web3 from "@solana/web3.js";
import {
  HPL_HIVE_CONTROL_PROGRAM,
  Honeycomb,
  Operation,
  VAULT,
} from "@honeycomb-protocol/hive-control";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PROGRAM_ID as AUTHORIZATION_PROGRAM_ID } from "@metaplex-foundation/mpl-token-auth-rules";
import { PROGRAM_ID as BUBBLEGUM_PROGRAM_ID } from "@metaplex-foundation/mpl-bubblegum";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
} from "@solana/spl-account-compression";
import {
  createWithdrawCnftInstruction,
  createWithdrawNftInstruction,
  PROGRAM_ID,
} from "../../generated";
import type { Asset } from "../../types";
import { METADATA_PROGRAM_ID, fetchAssetProof, nftPdas } from "../../utils";
import type { HplCharacterModel } from "../../CharacterModel";

/**
 * Represents the arguments for creating a "Create Currency" operation.
 * @category Types
 */
type CreateWithdrawAssetOperationArgs = {
  asset: Asset;
  characterModel: HplCharacterModel;
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
 * const withdrawNftArgs = {
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
 * const operationArgs: CreateWithdrawNftOperationArgs = {
 *   args: mintPublicKey ? { mint: mintPublicKey } : withdrawNftArgs,
 *   project,
 * };
 * const { operation } = await createWithdrawNftOperation(honeycomb, operationArgs);
 * operation.send();
 */
export async function createWithdrawAssetOperation(
  honeycomb: Honeycomb,
  args: CreateWithdrawAssetOperationArgs
) {
  // If programId is not provided, use the default PROGRAM_ID.
  const programId = args.programId || PROGRAM_ID;

  const [assetCustody] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("asset_custody"), args.asset.mint.toBuffer()],
    PROGRAM_ID
  );

  let operation: Operation;

  if (args.asset.isCompressed) {
    const [treeAuthority, _bump] = web3.PublicKey.findProgramAddressSync(
      [args.asset.compression.tree.toBuffer()],
      BUBBLEGUM_PROGRAM_ID
    );

    const proof =
      args.asset.compression.proof ||
      (await fetchAssetProof(honeycomb.rpcEndpoint, args.asset.mint));

    if (!proof) throw new Error("Could not find asset proof");

    operation = new Operation(honeycomb, [
      createWithdrawCnftInstruction(
        {
          project: args.characterModel.project,
          characterModel: args.characterModel.address,
          treeAuthority,
          merkleTree: args.asset.compression.tree,
          assetCustody,
          wallet: honeycomb.identity().address,
          vault: VAULT,
          systemProgram: web3.SystemProgram.programId,
          hiveControl: HPL_HIVE_CONTROL_PROGRAM,
          bubblegum: BUBBLEGUM_PROGRAM_ID,
          compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
          logWrapper: SPL_NOOP_PROGRAM_ID,
          clock: web3.SYSVAR_CLOCK_PUBKEY,
          instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
          anchorRemainingAccounts: proof.proof.map((p) => ({
            pubkey: p,
            isSigner: false,
            isWritable: false,
          })),
        },
        {
          args: {
            root: Array.from(proof.root.toBytes()),
            dataHash: Array.from(args.asset.compression.dataHash.toBytes()),
            creatorHash: Array.from(
              args.asset.compression.creatorHash.toBytes()
            ),
            nonce: args.asset.compression.leafId,
            index: args.asset.compression.leafId,
          },
        },
        programId
      ),
    ]);
  } else {
    const { nftMint, nftAccount, nftMetadata, nftEdition, nftTokenRecord } =
      nftPdas(args.asset.mint, honeycomb.identity().address);

    operation = new Operation(honeycomb, [
      createWithdrawNftInstruction(
        {
          project: args.characterModel.project,
          characterModel: args.characterModel.address,
          assetCustody,
          nftMint,
          nftAccount,
          nftMetadata,
          nftEdition,
          nftTokenRecord,
          wallet: honeycomb.identity().address,
          vault: VAULT,
          systemProgram: web3.SystemProgram.programId,
          hiveControl: HPL_HIVE_CONTROL_PROGRAM,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenMetadataProgram: METADATA_PROGRAM_ID,
          authorizationRules:
            args.asset.programmableConfig?.ruleSet || PROGRAM_ID,
          authorizationRulesProgram: AUTHORIZATION_PROGRAM_ID,
          clock: web3.SYSVAR_CLOCK_PUBKEY,
          instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        },
        programId
      ),
    ]);
  }

  // Return the "Create Currency" operation wrapped in an object, along with the currency address.
  return {
    operation,
  };
}
