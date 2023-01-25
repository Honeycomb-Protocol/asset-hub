import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import {
  Metaplex,
  Signer,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";
import { createMintInstruction } from "@metaplex-foundation/mpl-candy-guard";
import { sendAndConfirmTransaction } from "../../utils";
import { createMintAssetInstruction, Asset } from "../../generated";
import { PROGRAM_ID } from "../../generated/assetmanager";
import { TxSignersAccounts } from "../../types";

export async function createMintAssetTransaction(
  mx: Metaplex,
  assetAddress: web3.PublicKey,
  amount: number,
  group: string = null,
  programId = PROGRAM_ID
): Promise<TxSignersAccounts> {
  let wallet = mx.identity();

  const assetAccount = await Asset.fromAccountAddress(
    mx.connection,
    assetAddress
  );
  if (!assetAccount) throw new Error("Asset account not found!");
  const mint = assetAccount.mint;
  const candyGuardAddress = assetAccount.candyGuard;
  const tokenAccount = splToken.getAssociatedTokenAddressSync(
    mint,
    wallet.publicKey
  );

  let mintInstruction = createMintAssetInstruction(
    {
      asset: assetAddress,
      mint,
      tokenAccount,
      candyGuard: candyGuardAddress || programId,
      wallet: wallet.publicKey,
    },
    { amount },
    programId
  );
  let signers = [];
  let accounts = mintInstruction.keys;
  if (candyGuardAddress) {
    mx.programs().getCandyGuard().address = new web3.PublicKey(
      "FhCHXHuD6r2iCGwHgqcgnDbwXprLf22pZcArSp4Si4n7"
    );
    console.log(candyGuardAddress.toString());

    const cmClient = mx.candyMachines();
    const candyGuard = await cmClient.findCandyGuardByAddress({
      address: candyGuardAddress,
    });
    if (candyGuard) {
      const parsedMintSettings = cmClient
        .guards()
        .parseMintSettings(
          assetAddress,
          candyGuard,
          wallet.publicKey,
          wallet,
          { publicKey: mint } as Signer,
          group
            ? candyGuard.groups.find(({ label }) => label == group)?.guards
            : candyGuard.guards,
          group
        );

      const customArgsLen = Buffer.alloc(2);
      customArgsLen.writeInt16LE(mintInstruction.data.length);

      const mintArgs = Buffer.concat([
        customArgsLen,
        Buffer.from(mintInstruction.data),
        parsedMintSettings.arguments,
      ]);

      const candyGuardMintInstruction = createMintInstruction(
        {
          candyGuard: candyGuardAddress,
          candyMachineProgram: programId,
          candyMachine: assetAddress,
          payer: wallet.publicKey,
          instructionSysvarAccount: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        },
        {
          label: null,
          mintArgs,
        }
      );

      candyGuardMintInstruction.keys.push(...parsedMintSettings.accountMetas);
      candyGuardMintInstruction.keys.push(...mintInstruction.keys);
      mintInstruction = candyGuardMintInstruction;
      accounts = candyGuardMintInstruction.keys.slice();
      signers.push(...parsedMintSettings.signers);
    }
  }
  const tx = new web3.Transaction();
  if (!(await mx.rpc().accountExists(tokenAccount)))
    tx.add(
      splToken.createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        tokenAccount,
        wallet.publicKey,
        mint
      )
    );

  tx.add(mintInstruction);
  return {
    tx: tx,
    signers,
    accounts: accounts.map(({ pubkey }) => pubkey),
  };
}

export async function mintAsset(
  mx: Metaplex,
  assetAddress: web3.PublicKey,
  amount: number
) {
  const ctx = await createMintAssetTransaction(mx, assetAddress, amount);

  const response = await mx
    .rpc()
    .sendAndConfirmTransaction(ctx.tx, { skipPreflight: true }, ctx.signers);

  return {
    response,
  };
}
