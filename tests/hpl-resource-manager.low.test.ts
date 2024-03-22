import createEdgeClient, {
  Holding,
  PlatformData,
  Profile,
  ProfileInfo,
  Proof,
  User,
  UserInfo,
  Wallets,
} from "@honeycomb-protocol/edge-client/client";
import {
  HPL_HIVE_CONTROL_PROGRAM,
  Honeycomb,
  HoneycombProject,
  KeypairLike,
  METADATA_PROGRAM_ID,
  Operation,
  VAULT,
  lutModule,
} from "@honeycomb-protocol/hive-control";
import { PublicKey } from "@metaplex-foundation/js";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
  ValidDepthSizePair,
  getConcurrentMerkleTreeAccountSize,
} from "@solana/spl-account-compression";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as web3 from "@solana/web3.js";
import { Client, cacheExchange, fetchExchange } from "@urql/core";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "fs";
import {
  InitializeRecipeInstructionAccounts,
  PROGRAM_ID,
  createBurnResourceInstruction,
  createCraftBurnRecipeInstruction,
  createCraftMintRecipeInstruction,
  createCraftProofInstruction,
  createCreateResourceInstruction,
  createInitializeRecipeInstruction,
  createInitializeResourceTreeInstruction,
  createMintResourceInstruction,
} from "../packages/hpl-resource-manager";
import getHoneycombs from "../scripts/prepare";
import {
  arrayHash,
  keccak256Hash,
  optionHash,
  stringHash,
  u32Hash,
  u64Hash,
  u8Hash,
} from "./hash";

jest.setTimeout(6000000);

const edgeClient = createEdgeClient(
  new Client({
    url: "https://edge.eboy.dev/",
    exchanges: [cacheExchange, fetchExchange],
  })
);

/**  ************************* PDA FUNCTIONS ************************* */
const resourcePda = (
  project: PublicKey,
  mint: PublicKey,
  programId = PROGRAM_ID
) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("resource"), project.toBuffer(), mint.toBuffer()],
    programId
  );
};

const recipePda = (
  project: PublicKey,
  key: PublicKey,
  programId = PROGRAM_ID
) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("recipe"), project.toBuffer(), key.toBuffer()],
    programId
  );
};

/**  ************************* HASH FUNCTIONS ************************* */

const profileInfoHash = (info: ProfileInfo): Buffer =>
  keccak256Hash([
    optionHash(info.name, stringHash),
    optionHash(info.bio, stringHash),
    optionHash(info.pfp, stringHash),
  ]);

const customDataHash = (customData: { [key: string]: string[] }): Buffer =>
  keccak256Hash(
    Array.from(Object.entries(customData)).flatMap(([key, value]) => [
      arrayHash(Array.from(stringHash(key)), u8Hash),
      arrayHash(Array.from(arrayHash(value, stringHash)), u8Hash),
    ])
  );

const walletsHash = (wallets: Wallets): Buffer =>
  keccak256Hash([
    new web3.PublicKey(wallets.shadow).toBuffer(),
    arrayHash(wallets.wallets, (wallet) =>
      new web3.PublicKey(wallet).toBuffer()
    ),
  ]);

const userHash = (user: User): Buffer =>
  keccak256Hash([
    u64Hash(user.id),
    userInfoHash(user.info),
    walletsHash(user.wallets),
  ]);

const userInfoHash = (info: UserInfo): Buffer =>
  keccak256Hash([
    stringHash(info.username),
    stringHash(info.name),
    stringHash(info.bio),
    stringHash(info.pfp),
  ]);

/************************ COMPRESSION  ************************* */
async function getCompressedAccountsByTree(tree: PublicKey) {
  const data = await edgeClient.findCompressedAccounts({
    leaves: [
      {
        tree: tree.toBase58(),
      },
    ],
  });

  return data.compressedAccount;
}

async function getAssetProof(leafIdx: number, tree: PublicKey) {
  const data = await edgeClient.fetchProofs({
    leaves: [
      {
        index: String(leafIdx),
        tree: tree.toBase58(),
      },
    ],
  });

  if (!data.proof.length) return;

  return data.proof[0];
}

/************************ TEST CACHE SCRIPT ************************* */
interface Resource {
  label: string;
  resource: PublicKey;
  mint: PublicKey;
  tree: PublicKey;
  flags: {
    isMinted: boolean;
    isBurned: boolean;
    isWrapped: boolean;
    isUnWrapped: boolean;
  };
}

interface TestData {
  project: PublicKey | null;
  user: User | null;
  fungible: {
    lookupTableAddress: PublicKey | null;
    recipe: {
      address: PublicKey | null;
      isCrafted: boolean;
    };
    resources: Resource[];
  };

  nonFungible: {
    lookupTableAddress: PublicKey | null;
    recipe: {
      address: PublicKey | null;
      isCrafted: boolean;
    };
    resources: Resource[];
  };
}

interface ResourcesDirectoryResource {
  xp_gain: number;
  level_req: number;
  sell_price: number;
  amount: number | null;
  metadata: {
    name: string;
    symbol: string;
    uri: string;
  };
  addresses: {
    resource: string;
    mint: string | null;
    tree: string | null;
    recipe: string | null;
  };
  material:
    | {
        symbol: string;
        resource: string;
        amount: number;
      }[]
    | undefined;
}

const fetchData = (): TestData => {
  if (existsSync("./tests/resource-manager-test-data.json")) {
    const fileData = JSON.parse(
      readFileSync("./tests/resource-manager-test-data.json").toString()
    ) as TestData;

    const { fungible, nonFungible, project, user } = fileData;
    return {
      project: project && new PublicKey(project),
      user: user,
      fungible: {
        lookupTableAddress:
          fungible?.lookupTableAddress &&
          new PublicKey(fungible.lookupTableAddress),
        recipe: {
          address:
            fungible?.recipe.address && new PublicKey(fungible.recipe.address),
          isCrafted: fungible.recipe.isCrafted,
        },
        resources: fungible.resources.map((e: Resource) => ({
          ...e,
          resource: new PublicKey(e.resource),
          mint: new PublicKey(e.mint),
          tree: new PublicKey(e.tree),
        })),
      },

      nonFungible: {
        lookupTableAddress:
          nonFungible?.lookupTableAddress &&
          new PublicKey(nonFungible.lookupTableAddress),
        recipe: {
          address:
            nonFungible?.recipe.address &&
            new PublicKey(nonFungible.recipe.address),
          isCrafted: nonFungible.recipe.isCrafted,
        },
        resources: nonFungible.resources.map((e: Resource) => ({
          ...e,
          resource: new PublicKey(e.resource),
          mint: new PublicKey(e.mint),
          tree: new PublicKey(e.tree),
        })),
      },
    };
  }

  return {
    project: null,
    user: null,
    fungible: {
      lookupTableAddress: null,
      recipe: {
        address: null,
        isCrafted: false,
      },
      resources: [],
    },

    nonFungible: {
      lookupTableAddress: null,
      recipe: {
        address: null,
        isCrafted: false,
      },
      resources: [],
    },
  };
};

const saveData = (data: TestData) => {
  writeFileSync(
    "./tests/resource-manager-test-data.json",
    JSON.stringify(data)
  );
};

/************************ END ************************* */

/************************ POPULATION SCRIPT ************************* */
interface ResourcesDirectory {
  ores: {
    [key: string]: ResourcesDirectoryResource;
  };
  refine: {
    [key: string]: ResourcesDirectoryResource;
  };
  craft: {
    [key: string]: ResourcesDirectoryResource;
  };
}

let resourceDir: ResourcesDirectory =
  JSON.parse(readFileSync("./tests/resources.json").toString()) || {};

const tempDir = {
  ores: {},
  refine: {},
  craft: {},
};

const populateTempDir = (data: ResourcesDirectoryResource) => {
  const name = data.metadata.name.toLocaleLowerCase();
  if (name.includes("ore")) {
    tempDir.ores[data.addresses.resource] = data;
  } else if (name.includes("refine")) {
    tempDir.refine[data.addresses.resource] = {
      ...data,
      amount: Math.floor(Math.random() * 100),
    };
  } else {
    tempDir.craft[data.addresses.resource] = {
      ...data,
      amount: Math.floor(Math.random() * 100),
    };
  }
};

/************************ END ************************* */

describe("Resource Manager", () => {
  let adminHC: Honeycomb;
  let lookupTable: web3.AddressLookupTableAccount | null;
  const data: TestData = fetchData();

  beforeAll(async () => {
    const honeycombs = await getHoneycombs();
    adminHC = honeycombs.adminHC;

    if (!data.project) {
      adminHC.use(
        await HoneycombProject.new(adminHC, {
          name: "Resource Manager",
        })
      );

      data.project = adminHC.project().address;

      // saving the data to the file
      saveData(data);
    } else {
      adminHC.use(await HoneycombProject.fromAddress(adminHC, data.project));
    }

    // lut module
    adminHC.use(
      lutModule((e) => {
        throw new Error("User Should not be able to call this");
      })
    );
  });

  /** *************************** POPULATION SCRIPTS **************************** */

  describe.skip("Population Scripts", () => {
    it.skip("RESHAPE DATA", async () => {
      const data = readdirSync("./tests/resources").flatMap((e) =>
        readdirSync("./tests/resources/" + e).map((f) =>
          JSON.parse(
            readFileSync("./tests/resources/" + e + "/" + f).toString()
          )
        )
      );

      const dir = {
        ores: {},
        refine: {},
        craft: {},
      };
      for (const resource of data) {
        const name = resource.name.toLocaleLowerCase();
        const reshape: ResourcesDirectoryResource = {
          addresses: {
            resource: resource.resource,
            mint: null,
            tree: null,
            recipe: null,
          },
          amount: null,
          material: resource.material,
          level_req: resource.MinXpReq,
          xp_gain: resource.XpGain,
          sell_price: resource.SellPrice,
          metadata: {
            name: resource.name,
            symbol: resource.symbol,
            uri: resource.uri,
          },
        };

        // saving the data to the respective directory
        if (name.includes("ore")) {
          dir.ores[resource.resource] = {
            ...reshape,
            material: undefined,
          };
        } else if (name.includes("refine")) {
          dir.refine[resource.resource] = {
            ...reshape,
            amount: Math.floor(Math.random() * 100),
            material: reshape.material?.map((e, i) => {
              if (i > 1) return;
              return {
                ...e,
                resource: data.find((r) => r.symbol === e.symbol)?.resource,
              };
            }),
          };
        } else {
          dir.craft[resource.resource] = {
            ...reshape,
            amount: Math.floor(Math.random() * 100),
            material: reshape.material?.map((e, i) => {
              if (i > 1) return;
              return {
                ...e,
                resource: data.find((r) => r.symbol === e.symbol)?.resource,
              };
            }),
          };
        }
      }

      // saving the data to the file
      writeFileSync("./tests/resources.json", JSON.stringify(dir));
    });

    it.skip("Populate Resources", async () => {
      const populateJson = Object.keys(resourceDir).flatMap((key) =>
        Object.values(resourceDir[key]).concat()
      ) as ResourcesDirectoryResource[];

      const batchSize = 15;
      const batches = Math.ceil(populateJson.length / batchSize);
      const signatures: string[] = [];

      for (let i = 0; i < batches; i++) {
        const batch = populateJson.slice(i * batchSize, (i + 1) * batchSize);

        console.log("Populating Resources", i, "Batch");
        const sigs: string[] = await Promise.all(
          batch.map(async (dt) => {
            const mintKeypair = new web3.Keypair();
            const [resourceAddress] = resourcePda(
              adminHC.project().address,
              mintKeypair.publicKey,
              PROGRAM_ID
            );

            const ix = createCreateResourceInstruction(
              {
                mint: mintKeypair.publicKey,
                resource: resourceAddress,
                project: adminHC.project().address,
                authority: adminHC.identity().address,
                payer: adminHC.identity().address,
                rentSysvar: web3.SYSVAR_RENT_PUBKEY,
                tokenProgram: TOKEN_2022_PROGRAM_ID,
              },
              {
                args: {
                  kind: {
                    __kind: "Fungible",
                    decimals: 6,
                  },
                  metadata: {
                    name: dt.metadata.name,
                    symbol: dt.metadata.symbol,
                    uri: dt.metadata.uri,
                  },
                },
              }
            );

            const op = new Operation(
              adminHC,
              [ix],
              [adminHC.identity().signer as KeypairLike, mintKeypair]
            );

            const [{ signature }] = await op.send({
              skipPreflight: true,
              commitment: "processed",
            });

            // saving the data to the file
            populateTempDir({
              ...dt,
              addresses: {
                ...dt.addresses,
                mint: mintKeypair.publicKey.toBase58(),
                resource: resourceAddress.toBase58(),
              },
            });

            return signature;
          })
        );

        signatures.push(...sigs);
      }

      // fixing the material resource addresses
      const tempData = Object.keys(tempDir).flatMap((key) =>
        Object.values(tempDir[key]).concat()
      ) as ResourcesDirectoryResource[];

      for (const resource of tempData) {
        if (!resource.material) continue;

        for (const material of resource.material) {
          if (!material || !material.symbol) continue;

          const resourceData = tempData.find(
            (e) => e.metadata.symbol === material.symbol
          );

          material.resource = resourceData?.addresses.resource || "";
        }
      }

      // saving the data to the file
      writeFileSync("./tests/resources.json", JSON.stringify(tempDir));

      const length =
        Object.keys(resourceDir.ores).length +
        Object.keys(resourceDir.refine).length +
        Object.keys(resourceDir.craft).length;
      expect(length).toBe(signatures.length);
    });

    it.skip("Populate Recipe", async () => {
      resourceDir = JSON.parse(
        readFileSync("./tests/resources.json").toString()
      ) as ResourcesDirectory;

      const populateJson = Object.keys(resourceDir).flatMap((key) =>
        Object.values(resourceDir[key]).concat()
      ) as ResourcesDirectoryResource[];

      const batchSize = 15;
      const batches = Math.ceil(populateJson.length / batchSize);
      const signatures: string[] = [];

      for (let i = 0; i < batches; i++) {
        const batch = populateJson.slice(i * batchSize, (i + 1) * batchSize);

        console.log("Populating Recipe", i, "Batch");
        const sigs = await Promise.all(
          batch.map(async (dt) => {
            if (!dt.addresses.resource || !dt.material) return;

            const key = web3.Keypair.generate();
            const [recipeAddress] = recipePda(
              adminHC.project().address,
              key.publicKey
            );

            /// preparing the accounts for recipe
            const accounts: InitializeRecipeInstructionAccounts = {
              key: key.publicKey,
              recipe: recipeAddress,
              outputResource: new PublicKey(dt.addresses.resource),
              inputResourceOne: PublicKey.default,
              inputResourceTwo: undefined,
              inputResourceFour: undefined,
              inputResourceThree: undefined,
              payer: adminHC.identity().address,
              project: adminHC.project().address,
              authority: adminHC.identity().address,
              rentSysvar: web3.SYSVAR_RENT_PUBKEY,
              tokenProgram: TOKEN_2022_PROGRAM_ID,
            };

            const amounts: number[] = [100];
            const materials = dt.material;
            for (let i = 0; i < materials.length; i++) {
              const resource = new PublicKey(materials[i].resource);

              if (i === 0) {
                accounts.inputResourceOne = resource;
                amounts.push(materials[i].amount);
                continue;
              }

              if (i === 1) {
                accounts.inputResourceTwo = resource;
                amounts.push(materials[i].amount);
                break;
              }
            }

            // instructions
            const ix = createInitializeRecipeInstruction(accounts, {
              args: {
                outputCharacteristics: new Map(),
                amounts: amounts,
                xp: {
                  label: "XP",
                  increment: dt.xp_gain,
                },
              },
            });

            const op = new Operation(
              adminHC,
              [ix],
              [adminHC.identity().signer as KeypairLike]
            );

            const [{ signature }] = await op.send({
              skipPreflight: true,
              commitment: "processed",
            });

            // saving the data to the file
            dt.addresses.recipe = recipeAddress.toBase58();
            return signature;
          })
        );

        signatures.push(...(sigs.filter((e) => e) as string[]));
      }

      // saving the data to the file
      writeFileSync("./tests/resources.json", JSON.stringify(resourceDir));
    });

    it.skip("Populate Resource Tree", async () => {
      const populateJson = Object.keys(resourceDir).flatMap((key) =>
        Object.values(resourceDir[key]).concat()
      ) as ResourcesDirectoryResource[];

      const batchSize = 15;
      const batches = Math.ceil(populateJson.length / batchSize);
      const signatures: string[] = [];

      for (let i = 0; i < batches; i++) {
        const batch = populateJson.slice(i * batchSize, (i + 1) * batchSize);
        const sigs: string[] = await Promise.all(
          batch.map(async (resource) => {
            if (!resource.addresses.resource) throw new Error("No Resources");

            const merkleTreeKeyPair = new web3.Keypair();
            const depthSizePair: ValidDepthSizePair = {
              maxDepth: 14,
              maxBufferSize: 64,
            };

            const space = getConcurrentMerkleTreeAccountSize(
              depthSizePair.maxDepth,
              depthSizePair.maxBufferSize,
              12
            );

            const lamports =
              await adminHC.connection.getMinimumBalanceForRentExemption(space);

            const accountIx = web3.SystemProgram.createAccount({
              newAccountPubkey: merkleTreeKeyPair.publicKey,
              fromPubkey: adminHC.identity().address,
              space: space,
              lamports,
              programId: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
            });

            const ix = createInitializeResourceTreeInstruction(
              {
                merkleTree: merkleTreeKeyPair.publicKey,
                resource: new PublicKey(resource.addresses.resource),
                project: adminHC.project().address,
                payer: adminHC.identity().address,
                authority: adminHC.identity().address,
                rentSysvar: web3.SYSVAR_RENT_PUBKEY,
                tokenProgram: TOKEN_2022_PROGRAM_ID,
                compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
                logWrapper: SPL_NOOP_PROGRAM_ID,
                clock: web3.SYSVAR_CLOCK_PUBKEY,
              },
              {
                args: {
                  maxBufferSize: depthSizePair.maxBufferSize,
                  maxDepth: depthSizePair.maxDepth,
                },
              }
            );

            const op = new Operation(
              adminHC,
              [accountIx, ix],
              [adminHC.identity().signer as KeypairLike, merkleTreeKeyPair]
            );

            const [{ signature }] = await op.send({
              skipPreflight: true,
              commitment: "processed",
            });

            // saving the data to the file
            resource.addresses.tree = merkleTreeKeyPair.publicKey.toBase58();

            return signature;
          })
        );

        signatures.push(...(sigs.filter((e) => e) as string[]));
      }

      // saving the data to the file
      writeFileSync("./tests/resources.json", JSON.stringify(resourceDir));

      expect(signatures.length).toBe(populateJson.length);
    });

    it.skip("Create Lut Address", async () => {
      const addresses = Object.keys(resourceDir)
        .flatMap((key) =>
          Object.values(resourceDir[key]).map((e: any) => [
            e.addresses.resource,
            e.addresses.mint,
            e.addresses.tree,
            e.addresses.recipe,
          ])
        )
        .flat()
        .filter((e) => e && e !== "")
        .map((e) => new PublicKey(e));

      const slot = await adminHC.processedConnection.getSlot();
      const [lookupTableInstruction, lookupTableAddressPub] =
        web3.AddressLookupTableProgram.createLookupTable({
          authority: adminHC.identity().address,
          payer: adminHC.identity().address,
          recentSlot: slot,
        });

      const extendLutInstruction =
        web3.AddressLookupTableProgram.extendLookupTable({
          addresses: [
            adminHC.project().address,
            TOKEN_PROGRAM_ID,
            METADATA_PROGRAM_ID,
            SPL_NOOP_PROGRAM_ID,
            web3.SYSVAR_INSTRUCTIONS_PUBKEY,
            SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID,
            web3.SYSVAR_CLOCK_PUBKEY,
            TOKEN_2022_PROGRAM_ID,
            web3.SystemProgram.programId,
          ],
          lookupTable: lookupTableAddressPub,
          payer: adminHC.identity().address,
          authority: adminHC.identity().address,
        });

      // OPERATIONS FOR LOOK UP TABLE CREATION AND EXTENSION
      const lutOperations = new Operation(adminHC, [
        lookupTableInstruction,
        extendLutInstruction,
      ]);

      console.log("LOOKUP TABLE", lookupTableAddressPub.toBase58());

      // SEND THE LOOK UP TABLE CREATION AND EXTENSION OPERATIONS
      const [{ signature }] = await lutOperations.send({
        skipPreflight: true,
        commitment: "processed",
      });

      console.log(signature, "LOOKUP TABLE CREATION & EXTENSION");

      // EXTENDING THE LOOK UP TABLE WITH REPEATATIVE ADDRESSES
      const batch = 20;
      const batches = Math.ceil(addresses.length / batch);
      for (let i = 0; i < batches; i++) {
        const batchAddresses = addresses.slice(i * batch, (i + 1) * batch);

        const extendLutInstruction =
          web3.AddressLookupTableProgram.extendLookupTable({
            addresses: batchAddresses,
            lookupTable: lookupTableAddressPub,
            payer: adminHC.identity().address,
            authority: adminHC.identity().address,
          });

        // OPERATIONS FOR LOOK UP TABLE CREATION AND EXTENSION
        const lutOperations = new Operation(adminHC, [
          lookupTableInstruction,
          extendLutInstruction,
        ]);

        // SEND THE LOOK UP TABLE CREATION AND EXTENSION OPERATIONS
        const [{ signature }] = await lutOperations.send({
          skipPreflight: true,
          commitment: "processed",
        });

        console.log(signature, "Batch Lookup Table", i);
      }
    });
  });

  /** *************************** ACTUAL TEST CASES **************************** */

  describe("Fungible Resources ", () => {
    it("Create Resources", async () => {
      if (data.fungible.resources.length > 0) return;

      for (let i = 0; i < 5; i++) {
        const mintKeypair = new web3.Keypair();
        const [resourceAddress] = resourcePda(
          adminHC.project().address,
          mintKeypair.publicKey,
          PROGRAM_ID
        );

        const ix = createCreateResourceInstruction(
          {
            mint: mintKeypair.publicKey,
            resource: resourceAddress,
            project: adminHC.project().address,
            authority: adminHC.identity().address,
            payer: adminHC.identity().address,
            rentSysvar: web3.SYSVAR_RENT_PUBKEY,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
          },
          {
            args: {
              kind: {
                __kind: "Fungible",
                decimals: 9,
              },
              metadata: {
                name: "WEN-" + i,
                symbol: "$FR-" + i,
                uri: "https://qgp7lco5ylyitscysc2c7clhpxipw6sexpc2eij7g5rq3pnkcx2q.arweave.net/gZ_1id3C8InIWJC0L4lnfdD7ekS7xaIhPzdjDb2qFfU",
              },
            },
          }
        );

        const op = new Operation(
          adminHC,
          [ix],
          [adminHC.identity().signer as KeypairLike, mintKeypair]
        );

        const [{ signature }] = await op.send({
          skipPreflight: true,
          commitment: "processed",
        });

        console.log(signature, "Create Resource");

        const labels = [
          "outputResource",
          "inputResourceOne",
          "inputResourceTwo",
          "inputResourceThree",
          "inputResourceFour",
        ];

        // pushing the resource to the resources array
        data.fungible.resources.push({
          label: labels[i],
          resource: resourceAddress,
          mint: mintKeypair.publicKey,
          tree: PublicKey.default,
          flags: {
            isMinted: false,
            isBurned: false,
            isWrapped: false,
            isUnWrapped: false,
          },
        });

        // saving the data to the file
        saveData(data);
      }
    });

    it("Initialize Resource Tree", async () => {
      const resources = data.fungible.resources
        .map((e) => (e.tree.equals(PublicKey.default) ? e : null))
        .filter((e) => e) as Resource[];

      for (const resource of resources) {
        const merkleTreeKeyPair = new web3.Keypair();
        const depthSizePair: ValidDepthSizePair = {
          maxDepth: 14,
          maxBufferSize: 64,
        };

        const space = getConcurrentMerkleTreeAccountSize(
          depthSizePair.maxDepth,
          depthSizePair.maxBufferSize,
          12
        );

        const lamports =
          await adminHC.connection.getMinimumBalanceForRentExemption(space);

        console.log(
          space,
          " SPACE",
          lamports / web3.LAMPORTS_PER_SOL,
          " PRICE"
        );
        const accountIx = web3.SystemProgram.createAccount({
          newAccountPubkey: merkleTreeKeyPair.publicKey,
          fromPubkey: adminHC.identity().address,
          space: space,
          lamports,
          programId: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        });

        const ix = createInitializeResourceTreeInstruction(
          {
            merkleTree: merkleTreeKeyPair.publicKey,
            resource: resource.resource,
            project: adminHC.project().address,
            payer: adminHC.identity().address,
            authority: adminHC.identity().address,
            rentSysvar: web3.SYSVAR_RENT_PUBKEY,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
            compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
            logWrapper: SPL_NOOP_PROGRAM_ID,
            clock: web3.SYSVAR_CLOCK_PUBKEY,
          },
          {
            args: {
              maxBufferSize: depthSizePair.maxBufferSize,
              maxDepth: depthSizePair.maxDepth,
            },
          }
        );

        const op = new Operation(
          adminHC,
          [accountIx, ix],
          [adminHC.identity().signer as KeypairLike, merkleTreeKeyPair]
        );

        const [{ signature }] = await op.send({
          skipPreflight: true,
          commitment: "processed",
        });

        console.log(signature, "Initialize Resource Tree");
        data.fungible.resources.find((e) =>
          e.resource.equals(resource.resource)
        )!.tree = merkleTreeKeyPair.publicKey;

        // saving the data to the file
        saveData(data);
      }
    });

    it("Mint Resource", async () => {
      const resources = data.fungible.resources.filter(
        (e) => e.flags.isMinted === false
      );

      for (const resource of resources) {
        const ix = createMintResourceInstruction(
          {
            mint: resource.mint,
            merkleTree: resource.tree,
            resource: resource.resource,
            authority: adminHC.identity().address,
            payer: adminHC.identity().address,
            owner: adminHC.identity().address,
            project: adminHC.project().address,
            clock: web3.SYSVAR_CLOCK_PUBKEY,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
            logWrapper: SPL_NOOP_PROGRAM_ID,
            compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
          },
          {
            args: {
              __kind: "Fungible",
              amount: 1000,
              holdingState: null,
            },
          }
        );

        const op = new Operation(
          adminHC,
          [ix],
          [adminHC.identity().signer as KeypairLike]
        );

        const [{ signature }] = await op.send({
          skipPreflight: true,
          commitment: "processed",
        });

        console.log(signature, "Mint Resource");

        data.fungible.resources.find((e) =>
          e.resource.equals(resource.resource)
        )!.flags.isMinted = true;

        // saving the data to the file
        saveData(data);
      }
    });

    it.skip("Burn Resource", async () => {
      const resources = data.fungible.resources.filter(
        (e) => e.flags.isBurned === false
      );
      for (const resource of resources) {
        const _resource = (await getCompressedAccountsByTree(resource.tree)).at(
          -1
        )!;

        console.log(_resource, "_resource");

        const proof = (await getAssetProof(
          Number(_resource.leaf_idx),
          resource.tree
        ))!;

        const ix = createBurnResourceInstruction(
          {
            mint: resource.mint,
            merkleTree: resource.tree,
            resource: resource.resource,
            payer: adminHC.identity().address,
            owner: adminHC.identity().address,
            authority: adminHC.identity().address,
            project: adminHC.project().address,
            clock: web3.SYSVAR_CLOCK_PUBKEY,
            rentSysvar: web3.SYSVAR_RENT_PUBKEY,
            logWrapper: SPL_NOOP_PROGRAM_ID,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
            compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
            anchorRemainingAccounts: proof.proof.map((e) => ({
              isSigner: false,
              isWritable: false,
              pubkey: new PublicKey(e),
            })),
          },
          {
            args: {
              __kind: "Fungible",
              amount: 100,
              holdingState: {
                leafIdx: Number(proof.leaf_index),
                root: Array.from(new PublicKey(proof.root).toBytes()),

                holding: {
                  __kind: _resource.parsed_data.__kind,
                  holder: new PublicKey(
                    _resource.parsed_data.params.holder.split.skip(":").at(-1)
                  ),
                  balance: _resource.parsed_data.params.balance,
                },
              },
            },
          }
        );

        const op = new Operation(
          adminHC,
          [ix],
          [adminHC.identity().signer as KeypairLike]
        );

        const [{ signature }] = await op.send({
          skipPreflight: true,
          commitment: "processed",
        });

        console.log(signature, "Burn Resource");

        data.fungible.resources.find((e) =>
          e.resource.equals(resource.resource)
        )!.flags.isBurned = true;

        // saving the data to the file
        saveData(data);
      }
    });

    it("Create Lookup Table", async () => {
      if (data.fungible.resources.length === 0)
        throw new Error("No Resources Found");

      // setting up the lookup table if it exists
      if (data.fungible.lookupTableAddress) {
        lookupTable = (
          await adminHC.processedConnection.getAddressLookupTable(
            data.fungible.lookupTableAddress
          )
        ).value;
        return;
      }

      const slot = await adminHC.processedConnection.getSlot();
      const [lookupTableInstruction, lookupTableAddressPub] =
        web3.AddressLookupTableProgram.createLookupTable({
          authority: adminHC.identity().address,
          payer: adminHC.identity().address,
          recentSlot: slot,
        });

      // EXTENDING THE LOOK UP TABLE WITH REPETITIVE ADDRESSES
      const extendLutInstruction =
        web3.AddressLookupTableProgram.extendLookupTable({
          addresses: [
            ...data.fungible.resources.map((e) => e.resource),
            ...data.fungible.resources.map((e) => e.tree),
            adminHC.project().address,
            TOKEN_PROGRAM_ID,
            TOKEN_2022_PROGRAM_ID,
            METADATA_PROGRAM_ID,
            SPL_NOOP_PROGRAM_ID,
            SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID,
            web3.SYSVAR_CLOCK_PUBKEY,
            web3.SYSVAR_INSTRUCTIONS_PUBKEY,
            web3.SystemProgram.programId,
            HPL_HIVE_CONTROL_PROGRAM,
            VAULT,
            PROGRAM_ID,
          ],
          lookupTable: lookupTableAddressPub,
          payer: adminHC.identity().address,
          authority: adminHC.identity().address,
        });

      // OPERATIONS FOR LOOK UP TABLE CREATION AND EXTENSION
      const lutOperations = new Operation(adminHC, [
        lookupTableInstruction,
        extendLutInstruction,
      ]);

      // SEND THE LOOK UP TABLE CREATION AND EXTENSION OPERATIONS
      const [{ signature }] = await lutOperations.send({
        skipPreflight: true,
        commitment: "processed",
      });

      console.log(signature, "LOOKUP TABLE");

      data.fungible.lookupTableAddress = lookupTableAddressPub;
      lookupTable = (
        await adminHC.processedConnection.getAddressLookupTable(
          data.fungible.lookupTableAddress
        )
      ).value;

      // saving the data to the file
      saveData(data);
    });

    it("Initialize Recipe", async () => {
      if (data.fungible.recipe.address) return;
      if (data.fungible.resources.length === 0)
        throw new Error("No Resources Found");

      const key = web3.Keypair.generate();
      const [recipeAddress] = recipePda(
        adminHC.project().address,
        key.publicKey
      );

      /// preparing the accounts for recipe
      const accounts: InitializeRecipeInstructionAccounts = {
        key: key.publicKey,
        recipe: recipeAddress,
        outputResource: PublicKey.default,
        inputResourceOne: PublicKey.default,
        inputResourceTwo: PublicKey.default,
        inputResourceFour: undefined,
        inputResourceThree: undefined,
        payer: adminHC.identity().address,
        project: adminHC.project().address,
        authority: adminHC.identity().address,
        rentSysvar: web3.SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      };

      for (const resource of data.fungible.resources) {
        if (resource.label === "inputResourceThree") break;

        accounts[resource.label] = resource.resource;
      }

      // instructions
      const ix = createInitializeRecipeInstruction(accounts, {
        args: {
          outputCharacteristics: new Map(),
          amounts: data.fungible.resources.map((e) => 100),
          xp: {
            label: "XP",
            increment: 100,
          },
        },
      });

      const op = new Operation(
        adminHC,
        [ix],
        [adminHC.identity().signer as KeypairLike]
      );

      const [{ signature }] = await op.send({
        skipPreflight: true,
        commitment: "processed",
      });

      console.log(signature, "Initialize Recipe");
      data.fungible.recipe.address = recipeAddress;

      // saving the data to the file
      saveData(data);
    });

    it("Craft Recipe", async () => {
      if (!lookupTable) throw new Error("Lookup Table not found");
      if (!data.fungible.recipe.address) throw new Error("No Recipe Found");
      if (data.fungible.resources.length === 0)
        throw new Error("No Resources Found");

      if (data.fungible.recipe.isCrafted) return;

      // load the user & profile
      const user = await edgeClient
        .findUsers({
          wallets: [String(adminHC.identity().address)],
          includeProof: true,
        })
        .then((user) => user.user.at(-1));
      if (!user) throw new Error("User not found");

      const profile = await edgeClient
        .findProfiles({
          userIds: [user.id],
          projects: [adminHC.project().address.toBase58()],
          includeProof: true,
        })
        .then(({ profile: [profileT] }) => profileT);

      if (!profile) throw new Error("Profile not found");
      console.log(profile!.proof!.proof, "PROFILE");
      profile!.proof!.proof = profile!.proof!.proof.slice(0, 2);
      console.log(profile!.proof!.proof, "PROFILE 2");

      // recipe proof
      const [recipeProofAddress] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("recipe_proof"),
          data.fungible.recipe.address.toBuffer(),
          userHash(user),
        ],
        PROGRAM_ID
      );

      // prepare resources into an resource object
      const resources: Record<
        string,
        Resource & { state?: Holding; proof?: Proof }
      > = {};

      for (const resource of data.fungible.resources) {
        resources[resource.label] = {
          ...resource,
          state: (
            await edgeClient.findHoldings({
              holder: adminHC.identity().address.toBase58(),
              trees: [resource.tree.toBase58()],
              includeProof: true,
            })
          ).holdings.at(-1),

          proof: (
            await edgeClient.fetchProofs({
              leaves: {
                tree: resource.tree.toBase58(),
                index: "0",
              },
            })
          ).proof.at(-1),
        };

        resources[resource.label].proof!.proof = resources[
          resource.label
        ].proof!.proof.slice(0, 2);
      }

      // prepare the remaining accounts for proof instruction
      const proofIxRemainingAccounts: web3.AccountMeta[] =
        user.proof!.proof!.map((e) => ({
          isSigner: false,
          isWritable: false,
          pubkey: new PublicKey(e),
        }));

      // prepare the proof instruction of craft
      const proofIx = createCraftProofInstruction(
        {
          recipeProof: recipeProofAddress,
          payer: adminHC.identity().address,
          project: adminHC.project().address,
          recipe: data.fungible.recipe.address,
          authority: adminHC.identity().address,
          merkleTree: new PublicKey(user.tree_id),
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
          anchorRemainingAccounts: proofIxRemainingAccounts,
        },
        {
          args: {
            id: user.id,
            infoHash: Array.from(userInfoHash(user.info)),
            leafIdx: Number(user.leaf_idx),
            root: Array.from(new PublicKey(user.proof!.root).toBytes()),
            wallets: {
              wallets: user.wallets.wallets.map((e) => new PublicKey(e)),
              shadow: new PublicKey(user.wallets.shadow),
            },
          },
        }
      );

      // prepare the remaining accounts for mint instruction
      const mintIxRemainingAccounts: web3.AccountMeta[][] = [
        // output resource
        [
          {
            isSigner: false,
            isWritable: true,
            pubkey: resources["outputResource"].tree,
          },
          ...resources["outputResource"].proof!.proof!.map((e) => ({
            isSigner: false,
            isWritable: false,
            pubkey: new PublicKey(e),
          })),
        ],

        // profile's proofs
        [
          {
            isSigner: false,
            isWritable: true,
            pubkey: new PublicKey(profile.proof!.tree_id),
          },
          ...profile.proof!.proof!.map((e) => ({
            isSigner: false,
            isWritable: false,
            pubkey: new PublicKey(e),
          })),
        ],
      ];

      // prepare the first mint instruction of craft
      const mintIx = createCraftMintRecipeInstruction(
        {
          outputResource: resources["outputResource"].resource,
          recipeProof: recipeProofAddress,
          wallet: adminHC.identity().address,
          recipe: data.fungible.recipe.address,
          project: adminHC.project().address,
          payer: adminHC.identity().address,
          authority: adminHC.identity().address,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          clock: web3.SYSVAR_CLOCK_PUBKEY,
          compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
          hiveControl: HPL_HIVE_CONTROL_PROGRAM,
          instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
          logWrapper: SPL_NOOP_PROGRAM_ID,
          rentSysvar: web3.SYSVAR_RENT_PUBKEY,
          anchorRemainingAccounts: mintIxRemainingAccounts.flat(),
          vault: VAULT,
        },
        {
          args: {
            holding: null,
            proofSize: mintIxRemainingAccounts.map((e) => e.length),
            profile: {
              root: Array.from(new PublicKey(profile.proof!.root).toBytes()),
              identity: profile.identity,
              leafIdx: Number(profile.leaf_idx),
              platformData: {
                achievements: profile.platformData.achievements,
                xp: profile.platformData.xp,
                custom: new Map(Object.entries(profile.platformData.custom)),
              },
              customData: Array.from(
                keccak256Hash([customDataHash(profile.customData)])
              ),
              info: Array.from(profileInfoHash(profile.info)),
            },
            user: {
              id: user.id,
              infoHash: Array.from(userInfoHash(user.info)),
              leafIdx: Number(user.leaf_idx),
              root: Array.from(new PublicKey(user.proof!.root).toBytes()),
              wallets: {
                wallets: user.wallets.wallets.map((e) => new PublicKey(e)),
                shadow: new PublicKey(user.wallets.shadow),
              },
            },
          },
        }
      );

      // prepare the remaining accounts for burn instruction
      const burnIxRemainingAccounts: web3.AccountMeta[][] = [
        [
          {
            isSigner: false,
            isWritable: true,
            pubkey: resources["inputResourceOne"].tree,
          },
          ...resources["inputResourceOne"].proof!.proof!.map((e) => ({
            isSigner: false,
            isWritable: false,
            pubkey: new PublicKey(e),
          })),
        ],

        [
          {
            isSigner: false,
            isWritable: true,
            pubkey: resources["inputResourceTwo"].tree,
          },
          ...resources["inputResourceTwo"].proof!.proof!.map((e) => ({
            isSigner: false,
            isWritable: false,
            pubkey: new PublicKey(e),
          })),
        ],
      ];

      // prepare the burn instruction of craft
      const burnIx = createCraftBurnRecipeInstruction(
        {
          inputResourceOne: resources["inputResourceOne"].resource,
          inputResourceTwo: resources["inputResourceTwo"].resource,
          wallet: adminHC.identity().address,
          recipe: data.fungible.recipe.address,
          payer: adminHC.identity().address,
          project: adminHC.project().address,
          recipeProof: recipeProofAddress,
          authority: adminHC.identity().address,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          clock: web3.SYSVAR_CLOCK_PUBKEY,
          compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
          logWrapper: SPL_NOOP_PROGRAM_ID,
          rentSysvar: web3.SYSVAR_RENT_PUBKEY,
          anchorRemainingAccounts: burnIxRemainingAccounts.flat(),
        },
        {
          args: {
            user: {
              id: user.id,
              infoHash: Array.from(userInfoHash(user.info)),
              leafIdx: Number(user.leaf_idx),
              root: Array.from(new PublicKey(user.proof!.root).toBytes()),
              wallets: {
                wallets: user.wallets.wallets.map((e) => new PublicKey(e)),
                shadow: new PublicKey(user.wallets.shadow),
              },
            },

            holdings: [
              // first input
              {
                holdingState: {
                  holding: {
                    __kind: "Fungible",
                    balance:
                      "balance" in resources["inputResourceOne"].state!.params
                        ? Number(
                            resources["inputResourceOne"].state!.params.balance
                          )
                        : 0,
                    holder:
                      "balance" in resources["inputResourceOne"].state!.params
                        ? new web3.PublicKey(
                            resources[
                              "inputResourceOne"
                            ].state!.params.holder_address
                          )
                        : PublicKey.default,
                  },
                  leafIdx: Number(
                    resources["inputResourceOne"].proof!.leaf_index
                  ),
                  root: Array.from(
                    new PublicKey(
                      resources["inputResourceOne"].proof!.root
                    ).toBytes()
                  ),
                },
                proofSize: burnIxRemainingAccounts[0].length,
              },

              // second input
              {
                holdingState: {
                  holding: {
                    __kind: "Fungible",
                    balance:
                      "balance" in resources["inputResourceTwo"].state!.params
                        ? Number(
                            resources["inputResourceTwo"].state!.params.balance
                          )
                        : 0,
                    holder:
                      "balance" in resources["inputResourceTwo"].state!.params
                        ? new web3.PublicKey(
                            resources[
                              "inputResourceTwo"
                            ].state!.params.holder_address
                          )
                        : PublicKey.default,
                  },
                  leafIdx: Number(
                    resources["inputResourceTwo"].proof!.leaf_index
                  ),
                  root: Array.from(
                    new PublicKey(
                      resources["inputResourceTwo"].proof!.root
                    ).toBytes()
                  ),
                },
                proofSize: burnIxRemainingAccounts[1].length,
              },
            ],
          },
        }
      );

      const proofOp = new Operation(
        adminHC,
        [proofIx],
        [adminHC.identity().signer as KeypairLike]
      );

      const burnOp = new Operation(
        adminHC,
        [
          web3.ComputeBudgetProgram.setComputeUnitLimit({
            units: 1200000,
          }),
          burnIx,
        ],
        [adminHC.identity().signer as KeypairLike]
      );

      const mintOp = new Operation(
        adminHC,
        [
          web3.ComputeBudgetProgram.setComputeUnitLimit({
            units: 1200000,
          }),
          mintIx,
        ],
        [adminHC.identity().signer as KeypairLike]
      );

      proofOp.add_lut(lookupTable);
      burnOp.add_lut(lookupTable);
      mintOp.add_lut(lookupTable);

      // const proofRes = await proofOp.send({
      //   skipPreflight: true,
      //   commitment: "confirmed",
      // });

      // console.log(proofRes[0].signature, "Craft Proof");

      // const burnRes = await burnOp.send({
      //   skipPreflight: true,
      //   commitment: "processed",
      // });

      // console.log(burnRes[0].signature, "Craft Burn");

      const mintRes = await mintOp.send({
        skipPreflight: true,
        commitment: "confirmed",
      });

      console.log(mintRes[0].signature, "Craft Mint");

      data.fungible.recipe.isCrafted = true;

      // save data file
      // saveData(data);
    });
  });
});
