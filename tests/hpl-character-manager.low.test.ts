import * as web3 from "@solana/web3.js";
import {
  HPL_HIVE_CONTROL_PROGRAM,
  Honeycomb,
  HoneycombProject,
  Operation,
  VAULT,
} from "@honeycomb-protocol/hive-control";
import {
  CharacterModel,
  PROGRAM_ID,
  createNewCharacterModelInstruction,
  createCreateNewCharactersTreeInstruction,
  createDepositNftInstruction,
  createWrapCharacterInstruction,
  createUnwrapCharacterInstruction,
  createWithdrawNftInstruction,
  createUseCharacterInstruction,
  createDepositCnftInstruction,
  GuildRole,
} from "../packages/hpl-character-manager";
import getHoneycombs from "../scripts/prepare";
import { HPL_EVENTS_PROGRAM } from "@honeycomb-protocol/events";
import { createNewTree, mintOneCNFT } from "./helpers";
import { Metaplex, Nft, keypairIdentity } from "@metaplex-foundation/js";
import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
  ValidDepthSizePair,
  getConcurrentMerkleTreeAccountSize,
} from "@solana/spl-account-compression";
import { METADATA_PROGRAM_ID, nftPdas } from "./metadata";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PROGRAM_ID as AUTHORIZATION_PROGRAM_ID } from "@metaplex-foundation/mpl-token-auth-rules";
import { PROGRAM_ID as BUBBLEGUM_PROGRAM_ID } from "@metaplex-foundation/mpl-bubblegum";
import {
  Asset,
  fetchAssetProof,
  fetchHeliusAssets,
  HplCharacter,
} from "../packages/hpl-character-manager";

jest.setTimeout(200000);

describe("Character Manager", () => {
  const totalNfts = 0;
  const totalcNfts = 1;

  let adminHC: Honeycomb;
  let userHC: Honeycomb;
  let metaplex: Metaplex;
  let collection: web3.PublicKey;
  let merkleTree: web3.PublicKey;
  let characterModelAddress: web3.PublicKey;
  let characterModel: CharacterModel;
  let activeCharactersTree: web3.PublicKey;
  let wrappedCharacterNft: Asset;
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

    // await new Promise((resolve) => setTimeout(resolve, 30000));

    adminHC.use(
      await HoneycombProject.new(adminHC, {
        name: "Project",
        expectedMintAddresses: 0,
        profileDataConfigs: [],
      })
    );
    expect(adminHC.project().name).toBe("Project");
  });

  it("Create/Load Character Model", async () => {
    if (!characterModelAddress) {
      const key = web3.Keypair.generate().publicKey;
      [characterModelAddress] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("character_model"),
          adminHC.project().address.toBuffer(),
          key.toBuffer(),
        ],
        PROGRAM_ID
      );

      new Operation(adminHC, [
        createNewCharacterModelInstruction(
          {
            project: adminHC.project().address,
            key,
            characterModel: characterModelAddress,
            authority: adminHC.identity().address,
            payer: adminHC.identity().address,
            vault: VAULT,
            systemProgram: web3.SystemProgram.programId,
            hiveControl: HPL_HIVE_CONTROL_PROGRAM,
            hplEvents: HPL_EVENTS_PROGRAM,
            clock: web3.SYSVAR_CLOCK_PUBKEY,
            instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
          },
          {
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
          }
        ),
      ]).send({ commitment: "confirmed" });

      console.log(
        "New Character model created @",
        characterModelAddress.toString()
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    characterModel = await CharacterModel.fromAccountAddress(
      adminHC.connection,
      characterModelAddress,
      "processed"
    );
  });

  it("Create/Load Characters Merkle Tree", async () => {
    const trees = characterModel.merkleTrees.merkleTrees;

    if (Array.isArray(trees)) {
      const activeTreeIndex = characterModel.merkleTrees.active;
      activeCharactersTree = trees[activeTreeIndex];
    }

    if (!activeCharactersTree) {
      const merkleTreeKeypair = web3.Keypair.generate();

      const depthSizePair: ValidDepthSizePair = {
        maxDepth: 3,
        maxBufferSize: 8,
      };
      const space = getConcurrentMerkleTreeAccountSize(
        depthSizePair.maxDepth,
        depthSizePair.maxBufferSize,
        3
      );
      const lamports =
        await adminHC.connection.getMinimumBalanceForRentExemption(space);
      console.log("SOL", lamports / 1e9);

      const operation = new Operation(
        adminHC,
        [
          web3.SystemProgram.createAccount({
            newAccountPubkey: merkleTreeKeypair.publicKey,
            fromPubkey: adminHC.identity().address,
            space: space,
            lamports,
            programId: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
          }),
          createCreateNewCharactersTreeInstruction(
            {
              project: characterModel.project,
              characterModel: characterModelAddress,
              merkleTree: merkleTreeKeypair.publicKey,
              authority: adminHC.identity().address,
              payer: adminHC.identity().address,
              vault: VAULT,
              systemProgram: web3.SystemProgram.programId,
              hplEvents: HPL_EVENTS_PROGRAM,
              compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
              logWrapper: SPL_NOOP_PROGRAM_ID,
              clock: web3.SYSVAR_CLOCK_PUBKEY,
              rentSysvar: web3.SYSVAR_RENT_PUBKEY,
              instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
            },
            {
              args: {
                maxDepth: depthSizePair.maxDepth,
                maxBufferSize: depthSizePair.maxBufferSize,
              },
            }
          ),
        ],
        [merkleTreeKeypair]
      );

      const [{ signature }] = await operation.send();

      console.log("Created Characters Tree:", signature);

      activeCharactersTree = merkleTreeKeypair.publicKey;
    }

    console.log(`Characters MerkleTree ${activeCharactersTree.toString()}`);
  });

  it.skip("Wrap NFT to Character", async () => {
    const project = characterModel.project;
    const wallet = userHC.identity().address;

    const nfts = await fetchHeliusAssets(userHC.rpcEndpoint, {
      walletAddress: wallet,
      collectionAddress: collection,
    }).then((nfts) => nfts.filter((n) => !n.frozen));

    if (!nfts.length) throw new Error("No Nfts to wrap");

    const nftToWrap = nfts[0];

    console.log("NFT", nftToWrap);

    const { nftMint, nftAccount, nftMetadata, nftEdition, nftTokenRecord } =
      nftPdas(nftToWrap.mint, wallet);

    const [assetCustody] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("asset_custody"), nftMint.toBuffer()],
      PROGRAM_ID
    );

    await new Operation(userHC, [
      createDepositNftInstruction({
        project,
        characterModel: characterModelAddress,
        assetCustody,
        nftMint,
        nftAccount,
        nftMetadata,
        nftEdition,
        nftTokenRecord,
        wallet,
        vault: VAULT,
        systemProgram: web3.SystemProgram.programId,
        hiveControl: HPL_HIVE_CONTROL_PROGRAM,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenMetadataProgram: METADATA_PROGRAM_ID,
        authorizationRules: nftToWrap.programmableConfig?.ruleSet || PROGRAM_ID,
        authorizationRulesProgram: AUTHORIZATION_PROGRAM_ID,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      }),
      createWrapCharacterInstruction({
        project,
        characterModel: characterModelAddress,
        assetCustody,
        merkleTree: activeCharactersTree,
        wallet,
        vault: VAULT,
        systemProgram: web3.SystemProgram.programId,
        hiveControl: HPL_HIVE_CONTROL_PROGRAM,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      }),
    ]).send();

    await new Promise((resolve) => setTimeout(resolve, 2000));

    wrappedCharacterNft = nftToWrap;
    character = await HplCharacter.fetchWithTreeAndLeaf(
      userHC.rpcEndpoint,
      activeCharactersTree,
      0
    );

    console.log("Character", character);
  });

  it.skip("Wrap cNFT to Character", async () => {
    const project = characterModel.project;
    const wallet = userHC.identity().address;

    const nfts = await fetchHeliusAssets(userHC.rpcEndpoint, {
      walletAddress: wallet,
      collectionAddress: collection,
    }).then((nfts) => nfts.filter((n) => !n.frozen && n.isCompressed));

    if (!nfts.length) throw new Error("No Nfts to wrap");

    const nftToWrap = nfts[0];

    if (!nftToWrap.compression) throw new Error("Not compressed");

    const [assetCustody] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("asset_custody"), nftToWrap.mint.toBuffer()],
      PROGRAM_ID
    );

    const [treeAuthority, _bump] = web3.PublicKey.findProgramAddressSync(
      [nftToWrap.compression.tree.toBuffer()],
      BUBBLEGUM_PROGRAM_ID
    );

    const proof =
      nftToWrap.compression.proof ||
      (await fetchAssetProof(userHC.rpcEndpoint, nftToWrap.mint));

    await new Operation(userHC, [
      createDepositCnftInstruction(
        {
          project,
          characterModel: characterModelAddress,
          assetCustody,
          assetId: nftToWrap.mint,
          treeAuthority,
          merkleTree: nftToWrap.compression.tree,
          wallet,
          vault: VAULT,
          systemProgram: web3.SystemProgram.programId,
          hiveControl: HPL_HIVE_CONTROL_PROGRAM,
          bubblegum: BUBBLEGUM_PROGRAM_ID,
          compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
          logWrapper: SPL_NOOP_PROGRAM_ID,
          clock: web3.SYSVAR_CLOCK_PUBKEY,
          instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
          anchorRemainingAccounts: proof.proof.map((p) => ({
            pubkey: p,
            isSigner: false,
            isWritable: false,
          })),
        },
        {
          args: {
            root: Array.from(proof.root.toBytes()),
            dataHash: Array.from(nftToWrap.compression.dataHash.toBytes()),
            creatorHash: Array.from(
              nftToWrap.compression.creatorHash.toBytes()
            ),
            nonce: nftToWrap.compression.leafId,
            index: nftToWrap.compression.leafId,
          },
        }
      ),
      createWrapCharacterInstruction({
        project,
        characterModel: characterModelAddress,
        assetCustody,
        merkleTree: activeCharactersTree,
        wallet,
        vault: VAULT,
        systemProgram: web3.SystemProgram.programId,
        hiveControl: HPL_HIVE_CONTROL_PROGRAM,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      }),
    ]).send();

    await new Promise((resolve) => setTimeout(resolve, 2000));

    wrappedCharacterNft = nftToWrap;
    character = await HplCharacter.fetchWithTreeAndLeaf(
      userHC.rpcEndpoint,
      activeCharactersTree,
      0
    );

    console.log("Character", character);
  });

  it.skip("Use Character", async () => {
    if (!character) throw new Error("Character not found");

    const project = characterModel.project;
    const wallet = userHC.identity().address;

    const { root, proof } = (await character.proof(userHC.rpcEndpoint))!;

    await new Operation(userHC, [
      createUseCharacterInstruction(
        {
          project,
          characterModel: characterModelAddress,
          merkleTree: character.merkleTree,
          owner: wallet,
          user: web3.PublicKey.default,
          vault: VAULT,
          hiveControl: HPL_HIVE_CONTROL_PROGRAM,
          compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
          logWrapper: SPL_NOOP_PROGRAM_ID,
          clock: web3.SYSVAR_CLOCK_PUBKEY,
          instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
          anchorRemainingAccounts: proof.map((pubkey) => ({
            pubkey,
            isSigner: false,
            isWritable: false,
          })),
        },
        {
          args: {
            root: Array.from(root.toBytes()),
            leafIdx: character.leafIdx,
            sourceHash: Array.from(character.sourceHash),
            currentUsedBy: character.usedBy,
            newUsedBy: {
              __kind: "Guild",
              id: web3.PublicKey.default,
              order: 0,
              role: GuildRole.Chief,
            },
          },
        }
      ),
    ]).send();
  });

  it.skip("Unwrap NFT from Character", async () => {
    if (!wrappedCharacterNft) throw new Error("Wrapped Nft not found");
    if (!character) throw new Error("Character not found");

    const project = characterModel.project;
    const wallet = userHC.identity().address;

    const { nftMint, nftAccount, nftMetadata, nftEdition, nftTokenRecord } =
      nftPdas(wrappedCharacterNft.mint, wallet);

    const [assetCustody] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("asset_custody"), nftMint.toBuffer()],
      PROGRAM_ID
    );

    const { root, proof } = (await character.proof(userHC.rpcEndpoint))!;

    await new Operation(userHC, [
      createUnwrapCharacterInstruction(
        {
          project,
          characterModel: characterModelAddress,
          assetCustody,
          merkleTree: character.merkleTree,
          wallet,
          vault: VAULT,
          systemProgram: web3.SystemProgram.programId,
          hiveControl: HPL_HIVE_CONTROL_PROGRAM,
          compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
          logWrapper: SPL_NOOP_PROGRAM_ID,
          clock: web3.SYSVAR_CLOCK_PUBKEY,
          instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
          anchorRemainingAccounts: proof.map((pubkey) => ({
            pubkey,
            isSigner: false,
            isWritable: false,
          })),
        },
        {
          args: {
            root: Array.from(root.toBytes()),
            leafIdx: character.leafIdx,
            source: character.source,
            usedBy: character.usedBy,
          },
        }
      ),
      createWithdrawNftInstruction({
        project,
        characterModel: characterModelAddress,
        assetCustody,
        nftMint,
        nftAccount,
        nftMetadata,
        nftEdition,
        nftTokenRecord,
        wallet,
        vault: VAULT,
        systemProgram: web3.SystemProgram.programId,
        hiveControl: HPL_HIVE_CONTROL_PROGRAM,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenMetadataProgram: METADATA_PROGRAM_ID,
        authorizationRules:
          wrappedCharacterNft.programmableConfig?.ruleSet || PROGRAM_ID,
        authorizationRulesProgram: AUTHORIZATION_PROGRAM_ID,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      }),
    ]).send();
  });
});
