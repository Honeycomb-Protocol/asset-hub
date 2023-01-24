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
  metaplex: Metaplex,
  assetAddress: web3.PublicKey,
  mint: web3.PublicKey,
  wallet: web3.PublicKey,
  amount: number,
  candyGuardAddress: web3.PublicKey = null,
  group: string = null,
  programId = PROGRAM_ID
): Promise<TxSignersAccounts> {
  const tokenAccount = splToken.getAssociatedTokenAddressSync(mint, wallet);
  const mintInstruction = createMintAssetInstruction(
    {
      asset: assetAddress,
      mint,
      tokenAccount,
      candyGuard: candyGuardAddress || programId,
      wallet,
    },
    { amount },
    programId
  );
  if (candyGuardAddress) {
    console.log(
      candyGuardAddress.toString(),
      (metaplex.programs().getCandyGuard().address = new web3.PublicKey(
        "FhCHXHuD6r2iCGwHgqcgnDbwXprLf22pZcArSp4Si4n7"
      ))
    );

    const cmClient = metaplex.candyMachines();
    const candyGuard = await cmClient.findCandyGuardByAddress({
      address: candyGuardAddress,
    });

    const parsedMintSettings = cmClient.guards().parseMintSettings(
      assetAddress,
      candyGuard,
      metaplex.identity().publicKey,
      metaplex.identity(),
      { publicKey: mint } as Signer,
      group
        ? candyGuard.groups.find(({ label }) => label == group)?.guards
        : candyGuard.guards,
      group
      // [
      //   {
      //     name: "",
      //     address: wallet,
      //   }
      // ]
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
        payer: wallet,
        instructionSysvarAccount: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      },
      {
        label: null,
        mintArgs,
      }
    );

    candyGuardMintInstruction.keys.push(...parsedMintSettings.accountMetas);
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
      signers: [...parsedMintSettings.signers],
      accounts: [],
      // accounts: [
      //   asset,
      //   mint,
      //   tokenAccount,
      //   candyGuard,
      //   wallet,
      //   programId,
      //   web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      // ],
    };
  } else {
    return {
      tx: new web3.Transaction().add(
        // splToken.createAssociatedTokenAccountInstruction(
        //   wallet,
        //   tokenAccount,
        //   wallet,
        //   mint
        // ),
        mintInstruction
      ),
      signers: [],
      accounts: [],
      // accounts: [
      //   asset,
      //   mint,
      //   tokenAccount,
      //   candyGuard,
      //   wallet,
      //   programId,
      //   web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      // ],
    };
  }
}



export async function buildMintAssetCtx(
  mx: Metaplex,
  asset: web3.PublicKey,
  amount: number
) {
  let wallet = mx.identity()
  const assetAccount = await Asset.fromAccountAddress(mx.connection, asset);
  const ctx = await createMintAssetTransaction(
    mx,
    asset,
    assetAccount.mint,
    wallet.publicKey,
    amount,
    assetAccount.candyGuard
  );
  return ctx;
}


export async function mintAsset(
  mx: Metaplex,
  asset: web3.PublicKey,
  amount: number
) {

  const ctx = await buildMintAssetCtx(
    mx,
    asset,
    amount
  );
    
  const response = await mx.rpc().sendAndConfirmTransaction(ctx.tx, {skipPreflight: true}, ctx.signers)

  return {
    response,
  };
}
