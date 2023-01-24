import * as web3 from "@solana/web3.js";
import {
  Metaplex,
  toBigNumber,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";
import { AssetManagerProgramAction } from "./types";
import { getDependencies } from "./utils";
import { createAsset, mintAsset } from "../src";

export default async function (
  action: AssetManagerProgramAction,
  network: "mainnet" | "devnet" = "devnet",
  ...args: string[]
) {
  const { connection, wallet, deployments, mx, setDeployments } = getDependencies(
    network,
    "assetmanager"
  );
  console.log(deployments)
  switch (action) {
    case "create-asset":
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
        mx,
        {
          candyGuard: candyGuardBuilder.getContext().candyGuardAddress,
          name: "Test Asset",
          symbol: "TST",
          uri: "https://example.com",
        },
        candyGuardBuilder,

      );
      console.log("Tx:", createAssetCtx.response);
      console.log("Asset: ", createAssetCtx.mint.toString());
      setDeployments({
        ...deployments,
        mint: createAssetCtx.mint,
        candyGuard: candyGuardBuilder.getContext().candyGuardAddress,
      });
      break;

    case "mint-asset":
      if (!deployments.asset)
        throw new Error(
          "Asset not found in deployments, Please create asset first"
        );

      const mintAssetCtx = await mintAsset(
        mx,
        new web3.PublicKey(deployments.asset),
        1
      );
      console.log("Tx:", mintAssetCtx.response);

      break;

    default:
      throw new Error("Invalid Asset manager program action");
  }
}
