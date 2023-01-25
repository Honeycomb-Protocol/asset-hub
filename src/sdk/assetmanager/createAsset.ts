import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { METADATA_PROGRAM_ID, sendAndConfirmTransaction } from "../../utils";
import { CreateAssetArgs, createCreateAssetInstruction } from "../../generated";
import { PROGRAM_ID } from "../../generated/assetmanager";
import { TxSignersAccounts } from "../../types";
import {
  CreateCandyGuardBuilderContext,
  Metaplex,
  TransactionBuilder,
} from "@metaplex-foundation/js";

export function createCreateAssetTransaction(
  payer: web3.PublicKey,
  args: CreateAssetArgs,
  programId = PROGRAM_ID
): TxSignersAccounts & { mint: web3.PublicKey; asset: web3.PublicKey } {
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
          mint: mintKeypair.publicKey,
          metadata,
          asset,
          owner: payer,
          tokenMetadataProgram: METADATA_PROGRAM_ID,
        },
        { args }
      )
    ),
    signers: [mintKeypair],
    accounts: [
      mintKeypair.publicKey,
      metadata,
      asset,
      payer,
      METADATA_PROGRAM_ID,
    ],
    mint: mintKeypair.publicKey,
    asset,
  };
}

export async function buildCreateAssetCtx(
  mx: Metaplex,
  args: CreateAssetArgs,
  candyGuardBuilder?: TransactionBuilder<CreateCandyGuardBuilderContext>
) {
  let wallet = mx.identity();

  const ctx = createCreateAssetTransaction(wallet.publicKey, args);
  const blockhash = await mx.connection.getLatestBlockhash();

  if (candyGuardBuilder) {
    ctx.tx = new web3.Transaction().add(
      candyGuardBuilder.toTransaction(blockhash),
      ctx.tx
    );
    ctx.signers = [...candyGuardBuilder.getSigners(), ...ctx.signers];
  }
  ctx.tx.recentBlockhash = blockhash.blockhash;
  return ctx;
}
export async function createAsset(
  mx: Metaplex,
  args: CreateAssetArgs,
  candyGuardBuilder?: TransactionBuilder<CreateCandyGuardBuilderContext>
) {
  const ctx = await buildCreateAssetCtx(mx, args, candyGuardBuilder);

  const response = await mx
    .rpc()
    .sendAndConfirmTransaction(ctx.tx, { skipPreflight: true }, ctx.signers);

  return {
    response,
    mint: ctx.mint,
  };
}
