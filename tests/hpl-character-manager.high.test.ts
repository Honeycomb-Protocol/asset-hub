import { Honeycomb, HoneycombProject } from "@honeycomb-protocol/hive-control";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata";
import * as web3 from "@solana/web3.js";
import base58 from "bs58";
import getHoneycombs from "../scripts/prepare";
import { createNewTree, mintOneCNFT } from "./helpers";

import { Client, cacheExchange, fetchExchange } from "@urql/core";

import createEdgeClient from "@honeycomb-protocol/edge-client/client";
import {
  HplCharacterModel,
  createCreateNewCharactersTreeOperation,
  createNewCharacterModelOperation,
  fetchHeliusAssets,
} from "../packages/hpl-character-manager";

jest.setTimeout(200000);

describe("Character Manager", () => {
  const totalNfts = 10;
  const totalcNfts = 1;

  const client = createEdgeClient(
    new Client({
      url: "http://localhost:4000",
      exchanges: [cacheExchange, fetchExchange],
    })
  );

  let adminHC: Honeycomb;
  let userHC: Honeycomb;
  let metaplex: Metaplex;
  let collection: web3.PublicKey;
  let merkleTree: web3.PublicKey;
  let characterModelAddress: web3.PublicKey;
  let characterModel: HplCharacterModel;

  it("Prepare", async () => {
    const honeycombs = await getHoneycombs();
    adminHC = honeycombs.adminHC;
    userHC = honeycombs.userHC;

    // Set up Metaplex to mint some NFTs for testing
    metaplex = new Metaplex(adminHC.connection);
    metaplex.use(keypairIdentity(honeycombs.admin));

    console.log("Admin", adminHC.identity().address.toString());
    console.log("User", userHC.identity().address.toString());
  });

  it("Setup", async () => {
    // Mint Collection
    if (!collection) {
      collection = await metaplex
        .nfts()
        .create({
          name: "Collection",
          symbol: "COL",
          sellerFeeBasisPoints: 0,
          uri: "https://api.eboy.dev/",
          isCollection: true,
          collectionIsSized: true,
        })
        .then((x) => x.nft.mint.address);
    }
    console.log("Collection", collection.toString());

    // Mint Nfts
    for (let i = 1; i <= totalNfts; i++) {
      await metaplex
        .nfts()
        .create({
          name: `NFT #${i}`,
          symbol: `NFT`,
          sellerFeeBasisPoints: 100,
          uri: "https://arweave.net/WhyRt90kgI7f0EG9GPfB8TIBTIBgX3X12QaF9ObFerE",
          collection,
          collectionAuthority: metaplex.identity(),
          tokenStandard: TokenStandard.NonFungible,
          tokenOwner: userHC.identity().address,
        })
        .then((x) => x.nft);
    }

    let treeKeypair: web3.Keypair = web3.Keypair.generate();
    // Mint cNFTs
    for (let i = 1; i <= totalcNfts; i++) {
      if (i === 1) {
        treeKeypair = (await createNewTree(adminHC))[0];
        merkleTree = treeKeypair.publicKey;
      }

      await mintOneCNFT(adminHC, {
        dropWalletKey: userHC.identity().address.toString(),
        name: `cNFT #${i}`,
        symbol: "cNFT",
        uri: "https://arweave.net/WhyRt90kgI7f0EG9GPfB8TIBTIBgX3X12QaF9ObFerE",
        tree: treeKeypair,
        collection,
      });
    }
    console.log("Merkle Tree", merkleTree.toString());

    await new Promise((resolve) => setTimeout(resolve, 10000));

    adminHC.use(
      await HoneycombProject.new(adminHC, {
        name: "Project",
        expectedMintAddresses: 0,
        profileDataConfigs: [],
        collections: [collection],
        merkleTrees: merkleTree ? [merkleTree] : [],
      })
    );
    console.log("Project", adminHC.project().address.toString());
    expect(adminHC.project().name).toBe("Project");
  });

  it("Create/Load Character Model", async () => {
    if (!characterModelAddress) {
      const { operation, characterModel: temp } =
        await createNewCharacterModelOperation(adminHC, {
          args: {
            config: {
              __kind: "Wrapped",
              fields: [
                [
                  {
                    __kind: "Collection",
                    fields: [collection],
                  },
                  ...(merkleTree
                    ? [
                        {
                          __kind: "MerkleTree" as "MerkleTree",
                          fields: [merkleTree] as [web3.PublicKey],
                        },
                      ]
                    : []),
                ],
              ],
            },
            attributes: {
              __kind: "Null",
            },
          },
          project: adminHC.project().address,
        });

      await operation.send();
      characterModelAddress = temp;
    }

    console.log("Character Model", characterModelAddress.toString());

    characterModel = await HplCharacterModel.fromAddress(
      adminHC.connection,
      characterModelAddress,
      "processed"
    );
  });

  it("Create/Load Characters Merkle Tree", async () => {
    try {
      if (!characterModel.activeCharactersMerkleTree)
        throw new Error("Couldn't find active tree");
    } catch {
      const [{ signature }] = await (
        await createCreateNewCharactersTreeOperation(adminHC, {
          project: adminHC.project().address,
          characterModel: characterModelAddress,
          depthSizePair: {
            maxDepth: 3,
            maxBufferSize: 8,
          },
        })
      ).operation.send();

      console.log("Created Characters Tree:", signature);

      characterModel = await HplCharacterModel.fromAddress(
        adminHC.connection,
        characterModelAddress,
        "processed"
      );
    }

    console.log(
      `Characters MerkleTree ${characterModel.activeCharactersMerkleTree.toString()}`
    );
  });

  it("Wrap Assets to Character", async () => {
    const wallet = userHC.identity().address;

    const assets = await fetchHeliusAssets(userHC.rpcEndpoint, {
      walletAddress: wallet,
      collectionAddress: collection,
    }).then((assets) => assets.filter((n) => !n.frozen));

    if (!assets.length) throw new Error("No Assets to wrap");

    const { createWrapAssetsToCharacterTransactions: txResponse } =
      await client.createWrapAssetsToCharacterTransactions({
        project: adminHC.project().address.toString(),
        characterModel: characterModelAddress.toString(),
        activeCharactersMerkleTree:
          characterModel.activeCharactersMerkleTree.toString(),
        wallet: wallet.toString(),
        mintList: assets.map((n) => n.mint.toString()),
      });

    const signedTxs = await userHC
      .identity()
      .signAllTransactions(
        txResponse!.transactions.map((tx) =>
          web3.Transaction.from(base58.decode(tx))
        )
      );

    const { sendBulkTransactions } = await client.sendBulkTransactions({
      txs: signedTxs.map((tx) => base58.encode(tx.serialize())),
      blockhash: txResponse!.blockhash,
      lastValidBlockHeight: txResponse!.lastValidBlockHeight,
    });

    expect(sendBulkTransactions.length).toBe(assets.length);
  });

  it.skip("Unwrap Assets from Character", async () => {
    const { character } = await client.findCharacters({
      filters: {
        owner: userHC.identity().address.toString(),
      },
      trees: characterModel.merkleTrees.map((x) => x.toString()),
    });

    if (!character?.length) throw new Error("No characters to unwrap");

    const { createUnwrapAssetsFromCharacterTransactions: txResponse } =
      await client.createUnwrapAssetsFromCharacterTransactions({
        characterIds: character.map((x) => x!.id),
        project: adminHC.project().address.toString(),
        characterModel: characterModelAddress.toString(),
        wallet: userHC.identity().address.toString(),
      });

    const signedTxs = await userHC
      .identity()
      .signAllTransactions(
        txResponse!.transactions.map((tx) =>
          web3.Transaction.from(base58.decode(tx))
        )
      );

    const { sendBulkTransactions } = await client.sendBulkTransactions({
      txs: signedTxs.map((tx) => base58.encode(tx.serialize())),
      blockhash: txResponse!.blockhash,
      lastValidBlockHeight: txResponse!.lastValidBlockHeight,
    });

    expect(sendBulkTransactions.length).toBe(character.length);
  });
});
