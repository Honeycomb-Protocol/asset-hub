import * as web3 from "@solana/web3.js";
import {
  Metaplex,
  toBigNumber,
  keypairIdentity,
} from "@metaplex-foundation/js";
import { getDependencies } from "./utils";
import { Honeycomb, identityModule } from "@honeycomb-protocol/hive-control";
import {
  AssetHubManager,
  AssetManagerAsset,
} from "../packages/hpl-asset-manager";

export default async function (
  action: string,
  network: "mainnet" | "devnet" = "devnet",
  ...args: string[]
) {
  const { connection, signer, deployments, setDeployments } = getDependencies(
    network,
    "assetmanager"
  );

  const honeycomb = await Honeycomb.fromAddress(
    connection,
    new web3.PublicKey("HEHH65goNqxcWpxDpgPqKwernLawqbQJ7L9aocNkm2YT")
  );
  honeycomb.use(identityModule(signer));
  await honeycomb.identity().loadDelegateAuthority();

  if (action === "create-asset-manager") {
    const assetManager = await AssetHubManager.new(honeycomb);
    console.log("Asset Manager address: ", assetManager.assetManagerAddress);
    setDeployments({
      ...deployments,
      assetManager: assetManager.assetManagerAddress,
    });
  } else {
    honeycomb.use(
      await AssetHubManager.fromAddress(
        honeycomb.connection,
        new web3.PublicKey(deployments.assetManager)
      )
    );

    let asset: AssetManagerAsset;
    switch (action) {
      case "create-asset":
        const mx = new Metaplex(honeycomb.connection);
        mx.use(keypairIdentity(signer));
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
                destination: signer.publicKey,
              },
            },
          });

        asset = await honeycomb
          .assetManager()
          .create()
          .asset({
            args: {
              candyGuard: candyGuardBuilder.getContext().candyGuardAddress,
              name: "Test Asset",
              symbol: "TST",
              uri: "https://example.com",
              supply: 10,
            },
            candyGuardBuilder,
          });

        console.log("Asset: ", asset.assetAddress);
        break;
      case "mint-asset":
        await honeycomb.assetManager().loadAssets();
        [asset] = honeycomb.assetManager().assets();
        const ctx = await asset.mint(1);
        console.log("Tx:", ctx.signature);
        break;
      default:
        throw new Error("Invalid Asset manager program action");
    }
  }
}
