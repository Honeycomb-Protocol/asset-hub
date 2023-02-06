import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import {
  CreateAssemblerArgs,
  createCreateAssemblerInstruction,
  createCreateAssemblerCollectionMasterEditionInstruction,
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

  const [collectionMetadataAccount] = getMetadataAccount_(
    collectionMint.publicKey
  );
  const [collectionMasterEdition] = getMetadataAccount_(
    collectionMint.publicKey,
    { __kind: "edition" }
  );
  const [assembler] = getAssemblerPda(collectionMint.publicKey);

  return {
    tx: new web3.Transaction().add(
      createCreateAssemblerInstruction(
        {
          collectionMint: collectionMint.publicKey,
          collectionMetadataAccount,
          assembler,
          authority,
          payer,
          tokenMetadataProgram: METADATA_PROGRAM_ID,
        },
        { args },
        programId
      ),

      splToken.createAssociatedTokenAccountInstruction(
        payer,
        collectionTokenAccount,
        authority,
        collectionMint.publicKey
      ),

      createCreateAssemblerCollectionMasterEditionInstruction(
        {
          collectionMint: collectionMint.publicKey,
          collectionMetadataAccount,
          collectionMasterEdition,
          collectionTokenAccount,
          assembler,
          authority,
          payer,
          tokenMetadataProgram: METADATA_PROGRAM_ID,
        },
        programId
      )
    ),
    signers: [collectionMint],
    accounts: [
      collectionMint.publicKey,
      collectionMetadataAccount,
      collectionMasterEdition,
      collectionTokenAccount,
      assembler,
      authority,
      payer,
      METADATA_PROGRAM_ID,
    ],
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
