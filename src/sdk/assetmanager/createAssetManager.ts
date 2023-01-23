import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { sendAndConfirmTransaction } from "../../utils";
import {
  CreateAssetManagerArgs,
  createCreateAssetManagerInstruction,
} from "../../generated";
import { PROGRAM_ID } from "../../generated/assetmanager";
import { TxSignersAccounts } from "../../types";

export function createCreateAssetManagerTransaction(
  treasury: web3.PublicKey,
  authority: web3.PublicKey,
  payer: web3.PublicKey,
  args: CreateAssetManagerArgs,
  programId = PROGRAM_ID
): TxSignersAccounts & { assetManager: web3.PublicKey } {
  const key = web3.Keypair.generate().publicKey;

  const [assetManager] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("asset_manager"), key.toBuffer()],
    programId
  );

  return {
    tx: new web3.Transaction().add(
      createCreateAssetManagerInstruction(
        {
          key,
          assetManager,
          treasury,
          authority,
          payer,
        },
        { args }
      )
    ),
    signers: [],
    accounts: [key, assetManager, treasury, authority, payer],
    assetManager,
  };
}

export async function createAssetManager(
  connection: web3.Connection,
  wallet: anchor.Wallet,
  args: CreateAssetManagerArgs
) {
  const ctx = createCreateAssetManagerTransaction(
    wallet.publicKey,
    wallet.publicKey,
    wallet.publicKey,
    args
  );

  const txId = await sendAndConfirmTransaction(
    ctx.tx,
    connection,
    wallet,
    ctx.signers,
    { skipPreflight: true }
  );

  return {
    txId,
    assetManager: ctx.assetManager,
  };
}
