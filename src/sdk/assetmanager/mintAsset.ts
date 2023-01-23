import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import { createMintInstruction } from "@metaplex-foundation/mpl-candy-guard";
import { sendAndConfirmTransaction } from "../../utils";
import { createMintAssetInstruction, Asset } from "../../generated";
import { PROGRAM_ID } from "../../generated/assetmanager";
import { TxSignersAccounts } from "../../types";

export function createMintAssetTransaction(
  assetManager: web3.PublicKey,
  asset: web3.PublicKey,
  mint: web3.PublicKey,
  wallet: web3.PublicKey,
  amount: number,
  candyGuard: web3.PublicKey = PROGRAM_ID,
  programId = PROGRAM_ID
): TxSignersAccounts {
  const tokenAccount = splToken.getAssociatedTokenAddressSync(mint, wallet);

  const mintInstruction = createMintAssetInstruction(
    {
      assetManager,
      asset,
      mint,
      tokenAccount,
      candyGuard: candyGuard || programId,
      wallet,
    },
    { amount },
    programId
  );

  const mintArgs = Buffer.concat([
    new anchor.BN(mintInstruction.data.length).toBuffer(),
    Buffer.from(mintInstruction.data),
  ]);
  const candyGuardMintInstruction = createMintInstruction(
    {
      candyGuard,
      candyMachineProgram: programId,
      candyMachine: asset,
      payer: wallet,
      instructionSysvarAccount: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
    },
    {
      label: "Mint",
      mintArgs,
    }
  );
  candyGuardMintInstruction.keys.push(...mintInstruction.keys);

  return {
    tx: new web3.Transaction().add(
      // splToken.createAssociatedTokenAccountInstruction(
      //   wallet,
      //   tokenAccount,
      //   wallet,
      //   mint
      // ),

      candyGuard ? candyGuardMintInstruction : mintInstruction
    ),
    signers: [],
    accounts: [
      assetManager,
      asset,
      mint,
      tokenAccount,
      candyGuard,
      wallet,
      programId,
      web3.SYSVAR_INSTRUCTIONS_PUBKEY,
    ],
  };
}

export async function mintAsset(
  connection: web3.Connection,
  wallet: anchor.Wallet,
  asset: web3.PublicKey,
  amount: number
) {
  const assetAccount = await Asset.fromAccountAddress(connection, asset);

  const ctx = createMintAssetTransaction(
    assetAccount.manager,
    asset,
    assetAccount.mint,
    wallet.publicKey,
    amount,
    assetAccount.candyGuard
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
  };
}
