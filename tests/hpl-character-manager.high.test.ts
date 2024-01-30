import base58 from "bs58";
import * as web3 from "@solana/web3.js";
import { Honeycomb, HoneycombProject } from "@honeycomb-protocol/hive-control";
import getHoneycombs from "../scripts/prepare";
import { createNewTree, mintOneCNFT } from "./helpers";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata";

import { gql, Client, cacheExchange, fetchExchange } from "@urql/core";

import {
  HplCharacter,
  HplCharacterModel,
  createNewCharacterModelOperation,
  createWrapAssetOperation,
  fetchHeliusAssets,
  createUnwrapAssetOperation,
  createCreateNewCharactersTreeOperation,
} from "../packages/hpl-character-manager";

jest.setTimeout(200000);

describe("Character Manager", () => {
  const totalNfts = 1;
  const totalcNfts = 1;

  const client = new Client({
    url: "http://localhost:4001",
    exchanges: [cacheExchange, fetchExchange],
  });

  let adminHC: Honeycomb;
  let userHC: Honeycomb;
  let metaplex: Metaplex;
  let collection: web3.PublicKey;
  let merkleTree: web3.PublicKey;
  let characterModelAddress: web3.PublicKey;
  let characterModel: HplCharacterModel;
  let character: HplCharacter;

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

    await new Promise((resolve) => setTimeout(resolve, 10000));

    adminHC.use(
      await HoneycombProject.new(adminHC, {
        name: "Project",
        expectedMintAddresses: 0,
        profileDataConfigs: [],
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

      console.log(
        "New Character model created @",
        characterModelAddress.toString()
      );
    }

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

  it("Wrap NFT to Character", async () => {
    const wallet = userHC.identity().address;

    const nfts = await fetchHeliusAssets(userHC.rpcEndpoint, {
      walletAddress: wallet,
      collectionAddress: collection,
    }).then((nfts) => nfts.filter((n) => !n.frozen && !n.isCompressed));

    if (!nfts.length) throw new Error("No Nfts to wrap");

    console.log("NFT", nfts[0].mint.toString());

    const response = await client.query(
      gql`
        query CreateWrapAssetsToCharacterTransactions(
          $project: Bytes!
          $characterModel: Bytes!
          $activeCharactersMerkleTree: Bytes!
          $wallet: Bytes!
          $mintList: [Bytes]!
        ) {
          createWrapAssetsToCharacterTransactions(
            project: $project
            characterModel: $characterModel
            activeCharactersMerkleTree: $activeCharactersMerkleTree
            wallet: $wallet
            mintList: $mintList
          ) {
            transactions
            blockhash
            lastValidBlockHeight
          }
        }
      `,
      {
        project: adminHC.project().address.toString(),
        characterModel: characterModelAddress.toString(),
        activeCharactersMerkleTree:
          characterModel.activeCharactersMerkleTree.toString(),
        wallet: wallet.toString(),
        mintList: [nfts[0].mint.toString()],
      }
    );

    const txGroup = response.data.createWrapAssetsToCharacterTransactions as {
      transactions: string[];
      blockhash: string;
      lastValidBlockHeight: number;
    };

    const [txStr] = txGroup.transactions;
    const tx = web3.Transaction.from(base58.decode(txStr));

    const signedTx = await userHC.identity().signTransaction(tx);

    const response2 = await client.query(
      gql`
        query SendBulkTransactions(
          $txs: [Bytes]!
          $blockhash: String!
          $lastValidBlockHeight: Int!
        ) {
          sendBulkTransactions(
            txs: $txs
            blockhash: $blockhash
            lastValidBlockHeight: $lastValidBlockHeight
          ) {
            signature
            error
            status
          }
        }
      `,
      {
        txs: [base58.encode(signedTx.serialize())],
        blockhash: txGroup.blockhash,
        lastValidBlockHeight: txGroup.lastValidBlockHeight,
      }
    );

    console.log("Response", response2);
    console.log("Response", response2.data);
  });

  it.skip("Wrap NFT to Character", async () => {
    const wallet = userHC.identity().address;

    const nfts = await fetchHeliusAssets(userHC.rpcEndpoint, {
      walletAddress: wallet,
      collectionAddress: collection,
    }).then((nfts) => nfts.filter((n) => !n.frozen && !n.isCompressed));

    if (!nfts.length) throw new Error("No Nfts to wrap");

    (
      await createWrapAssetOperation(userHC, {
        asset: nfts[0],
        characterModel,
      })
    ).operation.send();

    await new Promise((resolve) => setTimeout(resolve, 2000));

    character = (
      await HplCharacter.fetchWithWallet(
        userHC.rpcEndpoint,
        userHC.identity().address
      )
    )[0];

    console.log("Character", character);
  });

  it.skip("Wrap cNFT to Character", async () => {
    const wallet = userHC.identity().address;

    const nfts = await fetchHeliusAssets(userHC.rpcEndpoint, {
      walletAddress: wallet,
      collectionAddress: collection,
    }).then((nfts) => nfts.filter((n) => !n.frozen && n.isCompressed));

    if (!nfts.length) throw new Error("No Nfts to wrap");

    (
      await createWrapAssetOperation(userHC, {
        asset: nfts[0],
        characterModel,
      })
    ).operation.send();

    await new Promise((resolve) => setTimeout(resolve, 2000));

    character = (
      await HplCharacter.fetchWithWallet(
        userHC.rpcEndpoint,
        userHC.identity().address
      )
    )[0];

    console.log("Character", character);
  });

  it.skip("Unwrap NFT from Character", async () => {
    if (!character) throw new Error("Character not found");

    (
      await createUnwrapAssetOperation(userHC, {
        characterModel,
        character,
      })
    ).operation.send();
  });
});
