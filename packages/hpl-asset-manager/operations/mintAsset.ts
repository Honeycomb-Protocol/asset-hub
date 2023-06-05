import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import { createMintInstruction } from "@metaplex-foundation/mpl-candy-guard";
import { createMintAssetInstruction, PROGRAM_ID } from "../generated";
import { Honeycomb, VAULT } from "@honeycomb-protocol/hive-control";
import { Metaplex, Signer } from "@metaplex-foundation/js";
import { AssetManagerAsset } from "../AssetManager";

type CreateMintAssetCtxArgs = {
  amount: number;
  project: web3.PublicKey;
  assetManager: web3.PublicKey;
  asset: web3.PublicKey;
  mint: web3.PublicKey;
  wallet: web3.PublicKey;
  walletSigner: Signer;
  delegateAuthority?: web3.PublicKey;
  candyGuard?: web3.PublicKey;
  checkAssociatedTokenAccount?: boolean;
  group?: string;
  programId?: web3.PublicKey;
};
export async function createMintAssetCtx(
  mx: Metaplex,
  args: CreateMintAssetCtxArgs
) {
  const programId = args.programId || PROGRAM_ID;

  const tokenAccount = splToken.getAssociatedTokenAddressSync(
    args.mint,
    args.wallet
  );

  let mintInstruction = createMintAssetInstruction(
    {
      project: args.project,
      assetManager: args.assetManager,
      asset: args.asset,
      mint: args.mint,
      tokenAccount,
      candyGuard: args.candyGuard || programId,
      wallet: args.wallet,
      delegateAuthority: args.delegateAuthority || programId,
      vault: VAULT,
    },
    { amount: args.amount },
    programId
  );
  let signers = [];
  let accounts = mintInstruction.keys;
  if (args.candyGuard) {
    mx.programs().getCandyGuard().address = new web3.PublicKey(
      "FhCHXHuD6r2iCGwHgqcgnDbwXprLf22pZcArSp4Si4n7"
    );

    const cmClient = mx.candyMachines();
    const candyGuard = await cmClient.findCandyGuardByAddress({
      address: args.candyGuard,
    });
    if (candyGuard) {
      const parsedMintSettings = cmClient
        .guards()
        .parseMintSettings(
          args.asset,
          candyGuard,
          args.wallet,
          args.walletSigner,
          { publicKey: args.mint } as Signer,
          args.group
            ? candyGuard.groups.find(({ label }) => label == args.group)?.guards
            : candyGuard.guards,
          args.group
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
          candyGuard: args.candyGuard,
          candyMachineProgram: programId,
          candyMachine: args.asset,
          payer: args.wallet,
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

  if (args.checkAssociatedTokenAccount) {
    if (!(await mx.rpc().accountExists(tokenAccount)))
      tx.add(
        splToken.createAssociatedTokenAccountInstruction(
          args.wallet,
          tokenAccount,
          args.wallet,
          args.mint
        )
      );
  }

  tx.add(mintInstruction);
  return {
    tx: tx,
    signers,
    accounts: accounts.map(({ pubkey }) => pubkey),
  };
}

type MintAssetArgs = {
  asset: AssetManagerAsset;
  amount: number;
  group?: string;
  programId?: web3.PublicKey;
};
export async function mintAsset(honeycomb: Honeycomb, args: MintAssetArgs) {
  const ctx = await createMintAssetCtx(new Metaplex(honeycomb.connection), {
    amount: args.amount,
    project: honeycomb.project().address,
    assetManager: honeycomb.assetManager().assetManagerAddress,
    asset: args.asset.assetAddress,
    mint: args.asset.mintAddress,
    wallet: honeycomb.identity().address,
    walletSigner: honeycomb.identity().signer,
    delegateAuthority: honeycomb.identity().delegateAuthority()?.address,
    candyGuard: args.asset.candyGuard,
    checkAssociatedTokenAccount: true,
    group: args.group,
    programId: args.programId,
  });

  return honeycomb
    .rpc()
    .sendAndConfirmTransaction(ctx, { skipPreflight: true });
}
