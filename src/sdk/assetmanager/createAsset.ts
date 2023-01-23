import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { METADATA_PROGRAM_ID, sendAndConfirmTransaction } from "../../utils";
import { CreateAssetArgs, createCreateAssetInstruction } from "../../generated";
import { PROGRAM_ID } from "../../generated/assetmanager";
import { TxSignersAccounts } from "../../types";
import {
  CreateCandyGuardBuilderContext,
  TransactionBuilder,
} from "@metaplex-foundation/js";

export function createCreateAssetTransaction(
  assetManager: web3.PublicKey,
  authority: web3.PublicKey,
  payer: web3.PublicKey,
  args: CreateAssetArgs,
  programId = PROGRAM_ID
): TxSignersAccounts & { asset: web3.PublicKey } {
  const mintKeypair = web3.Keypair.generate();

  const [metadata] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      mintKeypair.publicKey.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  );

  const [asset] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("asset"), mintKeypair.publicKey.toBuffer()],
    programId
  );

  return {
    tx: new web3.Transaction().add(
      createCreateAssetInstruction(
        {
          assetManager,
          mint: mintKeypair.publicKey,
          metadata,
          asset,
          authority,
          payer,
          tokenMetadataProgram: METADATA_PROGRAM_ID,
        },
        { args }
      )
    ),
    signers: [mintKeypair],
    accounts: [
      assetManager,
      mintKeypair.publicKey,
      metadata,
      asset,
      authority,
      payer,
      METADATA_PROGRAM_ID,
    ],
    asset,
  };
}

export async function createAsset(
  connection: web3.Connection,
  wallet: anchor.Wallet,
  assetManager: web3.PublicKey,
  candyGuardBuilder: TransactionBuilder<CreateCandyGuardBuilderContext>,
  args: CreateAssetArgs
) {
  const blockhashCtx = await connection.getLatestBlockhash();

  const ctx = createCreateAssetTransaction(
    assetManager,
    wallet.publicKey,
    wallet.publicKey,
    args
  );

  const tx = new web3.Transaction().add(
    candyGuardBuilder.toTransaction(blockhashCtx),
    ctx.tx
  );

  const txId = await sendAndConfirmTransaction(
    tx,
    connection,
    wallet,
    [...ctx.signers, ...candyGuardBuilder.getSigners()],
    { skipPreflight: true }
  );

  return {
    txId,
    asset: ctx.asset,
  };
}
