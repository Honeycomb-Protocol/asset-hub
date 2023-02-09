import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import {
  CreateAssemblerArgs,
  createCreateAssemblerInstruction,
} from "../../generated";
import { PROGRAM_ID } from "../../generated/assembler";
import { TxSignersAccounts } from "../../types";
import { Metaplex } from "@metaplex-foundation/js";
import {
  getAssemblerPda,
  getMetadataAccount_,
  METADATA_PROGRAM_ID,
} from "../pdas";

export function createCreateAssemblerTransaction(
  authority: web3.PublicKey,
  payer: web3.PublicKey,
  args: CreateAssemblerArgs,
  programId: web3.PublicKey = PROGRAM_ID
): TxSignersAccounts & { assembler: web3.PublicKey } {
  const collectionMint = web3.Keypair.generate();

  const collectionTokenAccount = splToken.getAssociatedTokenAddressSync(
    collectionMint.publicKey,
    authority
  );

  const [collectionMetadata] = getMetadataAccount_(collectionMint.publicKey);
  const [collectionMasterEdition] = getMetadataAccount_(
    collectionMint.publicKey,
    { __kind: "edition" }
  );
  const [assembler] = getAssemblerPda(collectionMint.publicKey);

  const instructions: web3.TransactionInstruction[] = [
    createCreateAssemblerInstruction(
      {
        collectionMint: collectionMint.publicKey,
        collectionMetadata,
        collectionMasterEdition,
        assembler,
        authority,
        payer,
        sysvarInstructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        tokenMetadataProgram: METADATA_PROGRAM_ID,
      },
      { args },
      programId
    ),
  ];

  return {
    tx: new web3.Transaction().add(...instructions),
    signers: [collectionMint],
    accounts: instructions.flatMap((i) => i.keys.map((k) => k.pubkey)),
    assembler,
  };
}

export async function createAssembler(mx: Metaplex, args: CreateAssemblerArgs) {
  const wallet = mx.identity();
  const ctx = createCreateAssemblerTransaction(
    wallet.publicKey,
    wallet.publicKey,
    args
  );

  const blockhash = await mx.connection.getLatestBlockhash();

  ctx.tx.recentBlockhash = blockhash.blockhash;

  const response = await mx
    .rpc()
    .sendAndConfirmTransaction(ctx.tx, { skipPreflight: true }, ctx.signers);

  return {
    response,
    assembler: ctx.assembler,
  };
}
