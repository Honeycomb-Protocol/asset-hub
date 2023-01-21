import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import {
  PROGRAM_ID,
  CreateAssemblerArgs,
  createCreateAssemblerInstruction,
  AssemblingAction,
  createCreateAssemblerCollectionMasterEditionInstruction,
} from "../../src";
import { TxSigners } from "../types";
import { METADATA_PROGRAM_ID, sendAndConfirmTransaction } from "../utils";

export function createCreateAssemblerTransaction(
  authority: web3.PublicKey,
  payer: web3.PublicKey,
  args: CreateAssemblerArgs,
  programId: web3.PublicKey = PROGRAM_ID
): TxSigners & { assembler: web3.PublicKey } {
  const collectionMint = web3.Keypair.generate();

  const [collectionMetadataAccount] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      collectionMint.publicKey.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  );

  const [collectionMasterEdition] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      collectionMint.publicKey.toBuffer(),
      Buffer.from("edition"),
    ],
    METADATA_PROGRAM_ID
  );

  const collectionTokenAccount = splToken.getAssociatedTokenAddressSync(
    collectionMint.publicKey,
    authority
  );

  const [assembler] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("assembler"), collectionMint.publicKey.toBuffer()],
    programId
  );

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
    assembler,
  };
}

export default async function (
  connection: web3.Connection,
  wallet: anchor.Wallet
) {
  const assemblerTx = createCreateAssemblerTransaction(
    wallet.publicKey,
    wallet.publicKey,
    {
      assemblingAction: AssemblingAction.TakeCustody,
      collectionName: "Assembler Test Collection",
      collectionSymbol: "ATC",
      collectionDescription: "This is a test collection to test assembler",
      collectionUri: "https://assembler.test",
    }
  );

  console.log("Wallet", wallet.publicKey.toString());
  const txId = await sendAndConfirmTransaction(
    assemblerTx.tx,
    connection,
    wallet,
    assemblerTx.signers,
    { skipPreflight: true }
  );
  console.log("Assembler created:", txId);
  return assemblerTx.assembler;
}
