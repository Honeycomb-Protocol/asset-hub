import * as web3 from "@solana/web3.js";
import {
  Metaplex,
  toBigNumber,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";
import { AssetManagerProgramAction } from "./types";
import { getDependencies } from "./utils";
import { createAsset, createAssetManager, mintAsset } from "../src";

export default async function (
  action: AssetManagerProgramAction,
  network: "mainnet" | "devnet" = "devnet",
  ...args: string[]
) {
  const { connection, wallet, deployments, setDeployments } = getDependencies(
    network,
    "assetmanager"
  );

  switch (action) {
    case "create-asset-manager":
      const createAssetManagerCtx = await createAssetManager(
        connection,
        wallet,
        {
          name: "Test Collection",
        }
      );
      console.log("Tx:", createAssetManagerCtx.txId);
      console.log(
        "Asset Manager address: ",
        createAssetManagerCtx.assetManager.toString()
      );
      setDeployments({
        ...deployments,
        assetManager: createAssetManagerCtx.assetManager,
      });
      break;

    case "create-asset":
      if (!deployments.assetManager)
        throw new Error(
          "Asset manager address not found in deployments, Please create asset manager first"
        );

      const mx = new Metaplex(connection);
      mx.use(walletAdapterIdentity(wallet));
      const candyGuardBuilder = mx
        .candyMachines()
        .builders()
        .createCandyGuard({
          guards: {
            solPayment: {
              amount: {
                basisPoints: toBigNumber(10000000),
                currency: {
                  symbol: "SOL",
                  decimals: 9,
                },
              },
              destination: wallet.publicKey,
            },
          },
        });

      const createAssetCtx = await createAsset(
        connection,
        wallet,
        new web3.PublicKey(deployments.assetManager),
        candyGuardBuilder,
        {
          candyGuard: candyGuardBuilder.getContext().candyGuardAddress,
          name: "Test Asset",
          symbol: "TST",
          uri: "https://example.com",
        }
      );
      console.log("Tx:", createAssetCtx.txId);
      console.log("Asset: ", createAssetCtx.asset.toString());
      setDeployments({
        ...deployments,
        asset: createAssetCtx.asset,
        candyGuard: candyGuardBuilder.getContext().candyGuardAddress,
      });
      break;

    case "mint-asset":
      if (!deployments.asset)
        throw new Error(
          "Asset not found in deployments, Please create asset first"
        );

      const mintAssetCtx = await mintAsset(
        connection,
        wallet,
        new web3.PublicKey(deployments.asset),
        1
      );
      console.log("Tx:", mintAssetCtx.txId);

      break;

    default:
      throw new Error("Invalid Asset manager program action");
  }
}
