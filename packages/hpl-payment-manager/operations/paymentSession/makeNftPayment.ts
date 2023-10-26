import * as web3 from "@solana/web3.js";
import { Honeycomb, Operation } from "@honeycomb-protocol/hive-control";
import {
  createMakeCnftPaymentInstruction,
  createMakeNftPaymentInstruction,
  PROGRAM_ID,
} from "../../generated";
import { HPL_EVENTS_PROGRAM } from "@honeycomb-protocol/events";
import { AssetProof, AvailableNft, HplPayment, fetchAssetProof } from "../..";
import { metadataPda } from "@honeycomb-protocol/currency-manager";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { PROGRAM_ID as BUBBLEGUM_PROGRAM_ID } from "@metaplex-foundation/mpl-bubblegum";
import { PROGRAM_ID as AUTHORIZATION_PROGRAM_ID } from "@metaplex-foundation/mpl-token-auth-rules";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
} from "@solana/spl-account-compression";

/**
 * Represents the arguments for creating a "Create Payment Session" operation.
 * @category Types
 */
type MakeNftPaymentOperationArgs = {
  payment: HplPayment;
  nft: AvailableNft;
  proof?: AssetProof;
  helius_rpc?: string;
  payer?: web3.PublicKey;
  doNotCheckAccounts?: boolean;
  programId?: web3.PublicKey;
};

export async function createMakeNftPaymentOperation(
  honeycomb: Honeycomb,
  args: MakeNftPaymentOperationArgs
) {
  // If programId is not provided, use the default PROGRAM_ID.
  const programId = args.programId || PROGRAM_ID;

  const payer = args.payer || honeycomb.identity().address;
  const [paymentSession] = honeycomb
    .pda()
    .paymentManager()
    .paymentSession(
      args.payment.conditional.paymentStructure.address,
      payer,
      programId
    );

  // Create the instruction for the "Create Payment Session" operation based on provided arguments.
  const instructions = [];

  if (args.payment.isNft()) {
    if (args.nft.isCompressed) {
      const [treeAuthority] = web3.PublicKey.findProgramAddressSync(
        [args.nft.compression.tree.toBuffer()],
        BUBBLEGUM_PROGRAM_ID
      );

      if (!args.proof && !args.helius_rpc)
        throw new Error("Please pass either proof or helius rpc for cNFT");

      const proof =
        args.proof || (await fetchAssetProof(args.helius_rpc, args.nft.mint));

      instructions.push(
        createMakeCnftPaymentInstruction(
          {
            paymentStructure: args.payment.conditional.paymentStructure.address,
            paymentSession,
            merkleTree: args.nft.compression.tree,
            treeAuthority,
            creatorHash: args.nft.compression.creatorHash,
            dataHash: args.nft.compression.dataHash,
            root: proof.root,
            beneficiary: args.payment.beneficiary || programId,
            payer,
            bubblegumProgram: BUBBLEGUM_PROGRAM_ID,
            compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
            hplEvents: HPL_EVENTS_PROGRAM,
            logWrapper: SPL_NOOP_PROGRAM_ID,
            clockSysvar: web3.SYSVAR_CLOCK_PUBKEY,
            anchorRemainingAccounts: proof.proof.map((p) => ({
              pubkey: p,
              isSigner: false,
              isWritable: false,
            })),
          },
          {
            args: {
              path: Uint8Array.from(args.payment.path),
              nonce: args.nft.compression.leafId,
              index: args.nft.compression.leafId,
            },
          },
          programId
        )
      );
    } else {
      const nftMint = args.nft.mint;

      const nftAccount = getAssociatedTokenAddressSync(payer, nftMint);
      const [nftMetadata] = metadataPda(nftMint);
      const [nftEdition] = metadataPda(nftMint, { __kind: "edition" });

      let nftTokenRecord = programId,
        beneficiary = programId,
        depositAccount = programId,
        depositTokenRecord = programId,
        authorizationRules = programId,
        authorizationRulesProgram = programId;

      if (args.nft.isProgrammableNft) {
        nftTokenRecord = metadataPda(nftMint, {
          __kind: "token_record",
          tokenAccount: nftAccount,
        })[0];
        authorizationRulesProgram = AUTHORIZATION_PROGRAM_ID;
        authorizationRules = args.nft.programmableConfig.ruleSet;
      }

      if (args.payment.beneficiary) {
        beneficiary = args.payment.beneficiary;
        depositAccount = getAssociatedTokenAddressSync(beneficiary, nftMint);
        if (args.nft.isProgrammableNft) {
          depositTokenRecord = metadataPda(nftMint, {
            __kind: "token_record",
            tokenAccount: depositAccount,
          })[0];
        }
      }

      instructions.push(
        createMakeNftPaymentInstruction(
          {
            paymentStructure: args.payment.conditional.paymentStructure.address,
            paymentSession,
            nftMint,
            nftAccount,
            nftMetadata,
            nftEdition,
            nftTokenRecord,
            beneficiary,
            depositAccount,
            depositTokenRecord,
            payer,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            authorizationRules,
            authorizationRulesProgram,
            hplEvents: HPL_EVENTS_PROGRAM,
            clockSysvar: web3.SYSVAR_CLOCK_PUBKEY,
            instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
          },
          {
            args: {
              path: Uint8Array.from(args.payment.path),
            },
          },
          programId
        )
      );
    }
  } else {
    throw new Error("Not implemented");
  }

  // Return the "Create Payment Session" operation wrapped in an object, along with the currency address.
  return {
    operation: new Operation(honeycomb, instructions),
    paymentSession,
  };
}
