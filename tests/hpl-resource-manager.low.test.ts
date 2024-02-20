import createEdgeClient from "@honeycomb-protocol/edge-client/client";
import {
  Honeycomb,
  HoneycombProject,
  KeypairLike,
  METADATA_PROGRAM_ID,
  Operation,
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
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  AddressLookupTableAccount,
  AddressLookupTableProgram,
  ComputeBudgetInstruction,
  ComputeBudgetProgram,
  Keypair,
  LAMPORTS_PER_SOL,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
} from "@solana/web3.js";
import { Client, cacheExchange, fetchExchange } from "@urql/core";
import {
  CraftRecipeInstructionAccounts,
  CraftRecipieArg,
  InitilizeRecipeInstructionAccounts,
  PROGRAM_ID,
  createBurnResourceInstruction,
  createCraftRecipeInstruction,
  createCreateResourceInstruction,
  createInitilizeRecipeInstruction,
  createInitilizeResourceTreeInstruction,
  createMintResourceInstruction,
  createUnwrapResourceInstruction,
  createWrapResourceInstruction,
  resourceManagerPdas,
} from "../packages/hpl-resource-manager";
import getHoneycombs from "../scripts/prepare";
import { existsSync, readFileSync, writeFileSync } from "fs";

jest.setTimeout(6000000);

const getClient = (rpcUrl = "https://edge.eboy.dev") =>
  createEdgeClient(
    new Client({
      url: rpcUrl,
      exchanges: [cacheExchange, fetchExchange],
    })
  );

async function getCompressedData(leafIdx: number, tree: PublicKey) {
  const client = getClient();

  const {
    compressedAccount: [data],
  } = await client.findCompressedAccounts({
    leaf: {
      index: String(leafIdx),
      tree: tree.toBase58(),
    },
  });

  if (!data) return;

  return data;
}

async function getCompressedAccountsByTree(tree: PublicKey) {
  const client = getClient();

  const data = await client.findCompressedAccounts({
    leaf: {
      tree: tree.toBase58(),
    },
  });

  return data.compressedAccount;
}

async function getCompressedAccountsByHolder(holder: PublicKey) {
  const client = getClient();

  const data = await client.findCompressedAccounts({
    parsedData: {
      holder: "pubkey:" + holder.toBase58(),
    },
    identity: {
      accountName: "Holding",
      programId: PROGRAM_ID.toBase58(),
    },
  });

  return data.compressedAccount;
}

async function getAssetProof(leafIdx: number, tree: PublicKey) {
  const client = getClient();

  const data = await client.fetchProofs({
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
  lookupTableAddress: PublicKey | undefined;
  project: PublicKey | undefined;
  recipe: {
    address: PublicKey | undefined;
    isCrafted: boolean;
  };
  resources: Resource[];
}

const fetchData = (): TestData => {
  if (existsSync("./tests/resource-manager-test-data.json")) {
    const fileData = JSON.parse(
      readFileSync("./tests/resource-manager-test-data.json").toString()
    ) as TestData;

    return {
      lookupTableAddress:
        fileData?.lookupTableAddress &&
        new PublicKey(fileData.lookupTableAddress),
      project: fileData?.project && new PublicKey(fileData.project),
      recipe: {
        address:
          fileData?.recipe.address && new PublicKey(fileData.recipe.address),
        isCrafted: fileData.recipe.isCrafted,
      },
      resources: fileData.resources.map((e: Resource) => ({
        ...e,
        resource: new PublicKey(e.resource),
        mint: new PublicKey(e.mint),
        tree: new PublicKey(e.tree),
      })),
    };
  }

  return {
    lookupTableAddress: undefined,
    recipe: {
      address: undefined,
      isCrafted: false,
    },
    project: undefined,
    resources: [],
    flags: {
      isMinted: false,
      isBurned: false,
      isWrapped: false,
      isUnWrapped: false,
    },
  } as TestData;
};

const saveData = (data: TestData) => {
  writeFileSync(
    "./tests/resource-manager-test-data.json",
    JSON.stringify(data)
  );
};

describe("Resource Manager", () => {
  const data: TestData = fetchData();
  let adminHC: Honeycomb;
  let lookupTable: AddressLookupTableAccount | null;

  beforeAll(async () => {
    const honeycombs = await getHoneycombs();
    adminHC = honeycombs.adminHC;

    if (!data.project) {
      adminHC.use(
        await HoneycombProject.new(adminHC, {
          name: "Resource Manager",
          expectedMintAddresses: 0,
          profileDataConfigs: [],
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

  it("Create Resources", async () => {
    if (data.resources.length > 0) return;

    for (let i = 0; i < 5; i++) {
      const mintKeypair = new Keypair();
      const [resourceAddress] = resourceManagerPdas().resource(
        adminHC.project().address,
        mintKeypair.publicKey,
        PROGRAM_ID
      );

      const ix = createCreateResourceInstruction(
        {
          mint: mintKeypair.publicKey,
          resource: resourceAddress,
          rentSysvar: SYSVAR_RENT_PUBKEY,
          owner: adminHC.identity().address,
          payer: adminHC.identity().address,
          project: adminHC.project().address,
          token22Program: TOKEN_2022_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        },
        {
          args: {
            decimals: 9,
            kind: {
              __kind: "Fungible",
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

      console.log(mintKeypair.publicKey.toBase58(), " MINT");
      console.log(signature, "Create Resource");

      const labels = [
        "outputResource",
        "inputResourceOne",
        "inputResourceTwo",
        "inputResourceThree",
        "inputResourceFour",
      ];

      // pushing the resource to the resources array
      data.resources.push({
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
    const resources = data.resources
      .map((e) => (e.tree.equals(PublicKey.default) ? e : null))
      .filter((e) => e) as Resource[];

    for (const resource of resources) {
      const merkleTreeKeyPair = new Keypair();
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

      console.log(space, " SPACE", lamports / LAMPORTS_PER_SOL, " PRICE");
      const accountIx = SystemProgram.createAccount({
        newAccountPubkey: merkleTreeKeyPair.publicKey,
        fromPubkey: adminHC.identity().address,
        space: space,
        lamports,
        programId: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      });

      const ix = createInitilizeResourceTreeInstruction(
        {
          merkleTree: merkleTreeKeyPair.publicKey,
          resource: resource.resource,
          project: adminHC.project().address,
          payer: adminHC.identity().address,
          owner: adminHC.identity().address,
          rentSysvar: SYSVAR_RENT_PUBKEY,
          compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
          logWrapper: SPL_NOOP_PROGRAM_ID,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
        {
          args: {
            maxBufferSize: depthSizePair.maxBufferSize,
            maxDepth: depthSizePair.maxDepth,
          },
        }
      );

      console.log(merkleTreeKeyPair.publicKey.toBase58(), " MERKLE TREE");
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
      data.resources.find((e) => e.resource.equals(resource.resource))!.tree =
        merkleTreeKeyPair.publicKey;

      // saving the data to the file
      saveData(data);
    }
  });

  it("Mint Resource", async () => {
    const resources = data.resources.filter((e) => e.flags.isMinted === false);

    for (const resource of resources) {
      if (resource.label === "outputResource") continue;

      const ix = createMintResourceInstruction(
        {
          mint: resource.mint,
          merkleTree: resource.tree,
          resource: resource.resource,
          payer: adminHC.identity().address,
          owner: adminHC.identity().address,
          project: adminHC.project().address,
          clock: SYSVAR_CLOCK_PUBKEY,
          token22Program: TOKEN_2022_PROGRAM_ID,
          logWrapper: SPL_NOOP_PROGRAM_ID,
          compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        },
        {
          args: {
            amount: 100000,
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

      data.resources.find((e) =>
        e.resource.equals(resource.resource)
      )!.flags.isMinted = true;

      // saving the data to the file
      saveData(data);
    }
  });

  it.skip("Burn Resource", async () => {
    const resources = data.resources.filter((e) => e.flags.isBurned === false);
    for (const resource of resources) {
      if (resource.label === "outputResource") continue;
      const _resource = (await getCompressedAccountsByTree(resource.tree)).at(
        -1
      )!;
      const proff = (await getAssetProof(
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
          project: adminHC.project().address,
          clock: SYSVAR_CLOCK_PUBKEY,
          rentSysvar: SYSVAR_RENT_PUBKEY,
          logWrapper: SPL_NOOP_PROGRAM_ID,
          token22Program: TOKEN_2022_PROGRAM_ID,
          compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
          anchorRemainingAccounts: proff.proof.map((e) => ({
            isSigner: false,
            isWritable: false,
            pubkey: new PublicKey(e),
          })),
        },
        {
          args: {
            amount: 500,
            holdingState: {
              leafIdx: Number(proff.leaf_index),
              root: Array.from(new PublicKey(proff.root).toBytes()),

              holding: {
                holder: new PublicKey(
                  _resource.parsed_data.holder.split(":").at(-1)
                ),
                balance: _resource.parsed_data.balance,
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

      data.resources.find((e) =>
        e.resource.equals(resource.resource)
      )!.flags.isBurned = true;

      // saving the data to the file
      saveData(data);
    }
  });

  it.skip("UnWrap Resource", async () => {
    const resources = data.resources.filter(
      (e) => e.flags.isUnWrapped === false
    );

    for (const resource of resources) {
      const recipientAccount = getAssociatedTokenAddressSync(
        resource.mint,
        adminHC.identity().address,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const resourceAccount = (
        await getCompressedAccountsByTree(resource.tree)
      ).at(-1)!;

      console.log(resourceAccount.parsed_data, "PROFF");
      const proff = (await getAssetProof(
        Number(resourceAccount.leaf_idx),
        resource.tree
      ))!;

      const ix = createUnwrapResourceInstruction(
        {
          mint: resource.mint,
          merkleTree: resource.tree,
          recipientAccount,
          resource: resource.resource,
          project: adminHC.project().address,
          payer: adminHC.identity().address,
          owner: adminHC.identity().address,
          clock: SYSVAR_CLOCK_PUBKEY,
          rentSysvar: SYSVAR_RENT_PUBKEY,
          logWrapper: SPL_NOOP_PROGRAM_ID,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          anchorRemainingAccounts: proff.proof.map((e) => ({
            isSigner: false,
            isWritable: false,
            pubkey: new PublicKey(e),
          })),
        },
        {
          args: {
            amount: 100,
            holdingState: {
              leafIdx: Number(proff.leaf_index),
              root: Array.from(new PublicKey(proff.root).toBytes()),
              holding: {
                holder: new PublicKey(
                  resourceAccount.parsed_data.holder.split(":").at(-1)
                ),
                balance: resourceAccount.parsed_data.balance,
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

      console.log(signature, "Unwrap Signature");

      // setting the flag to true
      data.resources.find((e) =>
        e.resource.equals(resource.resource)
      )!.flags.isUnWrapped = true;

      // saving the data to the file
      saveData(data);
    }
  });

  it.skip("Wrap Resource", async () => {
    const resources = data.resources.filter((e) => e.flags.isWrapped === false);

    for (const resource of resources) {
      const recipientAccount = getAssociatedTokenAddressSync(
        resource.mint,
        adminHC.identity().address,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const resourceAccount = (
        await getCompressedAccountsByTree(resource.tree)
      ).at(-1)!;
      const proff = (await getAssetProof(
        Number(resourceAccount.leaf_idx),
        resource.tree
      ))!;

      const ix = createWrapResourceInstruction(
        {
          mint: resource.mint,
          merkleTree: resource.tree,
          tokenAccount: recipientAccount,
          resource: resource.resource,
          project: adminHC.project().address,
          payer: adminHC.identity().address,
          owner: adminHC.identity().address,
          clock: SYSVAR_CLOCK_PUBKEY,
          rentSysvar: SYSVAR_RENT_PUBKEY,
          logWrapper: SPL_NOOP_PROGRAM_ID,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          anchorRemainingAccounts: proff.proof.map((e) => ({
            isSigner: false,
            isWritable: false,
            pubkey: new PublicKey(e),
          })),
        },
        {
          args: {
            amount: 100,
            holdingState: {
              leafIdx: Number(proff.leaf_index),
              root: Array.from(new PublicKey(proff.root).toBytes()),
              holding: {
                holder: new PublicKey(
                  resourceAccount.parsed_data.holder.split(":").at(-1)
                ),
                balance: resourceAccount.parsed_data.balance,
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

      console.log(signature, "Unwrap Signature");

      // setting the flag to true
      data.resources.find((e) =>
        e.resource.equals(resource.resource)
      )!.flags.isWrapped = true;

      // saving the data to the file
      saveData(data);
    }
  });

  it.skip("Create Lookup Table", async () => {
    if (data.resources.length === 0) throw new Error("No Resources Found");

    // setting up the lookup table if it exists
    if (data.lookupTableAddress) {
      lookupTable = (
        await adminHC.processedConnection.getAddressLookupTable(
          data.lookupTableAddress
        )
      ).value;
      return;
    }

    const slot = await adminHC.processedConnection.getSlot();
    const [lookupTableInstruction, lookupTableAddressPub] =
      AddressLookupTableProgram.createLookupTable({
        authority: adminHC.identity().address,
        payer: adminHC.identity().address,
        recentSlot: slot,
      });

    // EXTENDING THE LOOK UP TABLE WITH REPEATATIVE ADDRESSES
    const extendLutInstruction = AddressLookupTableProgram.extendLookupTable({
      addresses: [
        ...data.resources.map((e) => e.resource),
        ...data.resources.map((e) => e.tree),
        adminHC.project().address,
        TOKEN_PROGRAM_ID,
        METADATA_PROGRAM_ID,
        SPL_NOOP_PROGRAM_ID,
        SYSVAR_INSTRUCTIONS_PUBKEY,
        SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
        SYSVAR_CLOCK_PUBKEY,
        TOKEN_2022_PROGRAM_ID,
        SystemProgram.programId,
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

    console.log(lookupTableAddressPub.toBase58(), "LOOKUP TABLE");
    console.log(signature, "LOOKUP TABLE");

    data.lookupTableAddress = lookupTableAddressPub;
    lookupTable = (
      await adminHC.processedConnection.getAddressLookupTable(
        data.lookupTableAddress
      )
    ).value;

    // saving the data to the file
    saveData(data);
  });

  it.skip("Initilize Recipe", async () => {
    if (data.recipe.address) return;
    if (data.resources.length === 0) throw new Error("No Resources Found");

    const key = Keypair.generate();
    const [recipeAddress] = resourceManagerPdas().recipe(
      adminHC.project().address,
      key.publicKey
    );

    /// preparing the accounts for recipe
    const accounts: InitilizeRecipeInstructionAccounts = {
      key: key.publicKey,
      recipe: recipeAddress,
      outputResource: PublicKey.default,
      inputResourceOne: PublicKey.default,
      inputResourceTwo: undefined,
      inputResourceFour: undefined,
      inputResourceThree: undefined,
      payer: adminHC.identity().address,
      project: adminHC.project().address,
      authority: adminHC.identity().address,
      rentSysvar: SYSVAR_RENT_PUBKEY,
    };

    for (const resource of data.resources) {
      if (resource.label === "inputResourceFour") break;

      accounts[resource.label] = resource.resource;
    }

    // instructions
    const ix = createInitilizeRecipeInstruction(accounts, {
      args: {
        amounts: data.resources.map((e) => 100),
        xp: {
          label: "XP",
          increament: 100,
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

    console.log(signature, "Initilize Recipe");
    data.recipe.address = recipeAddress;

    // saving the data to the file
    saveData(data);
  });

  it.skip("Craft Recipie", async () => {
    if (!lookupTable) throw new Error("Lookup Table not found");
    if (!data.recipe.address) throw new Error("No Recipe Found");
    if (data.resources.length === 0) throw new Error("No Resources Found");
    if (data.recipe.isCrafted) return;

    /// preparing the accounts for recipe
    const ixAccounts: CraftRecipeInstructionAccounts = {
      recipe: data.recipe.address,
      outputResource: PublicKey.default,
      inputResourceOne: PublicKey.default,
      inputResourceTwo: undefined,
      inputResourceFour: undefined,
      inputResourceThree: undefined,
      payer: adminHC.identity().address,
      project: adminHC.project().address,
      authority: adminHC.identity().address,
      clock: SYSVAR_CLOCK_PUBKEY,
      rentSysvar: SYSVAR_RENT_PUBKEY,
      logWrapper: SPL_NOOP_PROGRAM_ID,
      compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      anchorRemainingAccounts: [],
    };

    const args: CraftRecipieArg[] = [];
    for (const resource of data.resources) {
      if (resource.label === "inputResourceFour") break;

      // pushing the resource to the resources array
      ixAccounts[resource.label] = resource.resource;

      // fetching the proffs of the resources account
      const compressedAccount = (
        await getCompressedAccountsByTree(resource.tree)
      ).at(-1)!;

      const accountProff = (await getAssetProof(
        Number(compressedAccount.leaf_idx),
        resource.tree
      ))!;
      const proffs = accountProff.proof.slice(0, 2);

      // console.log(compressedAccount.parsed_data, resource.label, "PROFFS");
      // appending proffs & tree into the remaining accounts
      ixAccounts.anchorRemainingAccounts?.push(
        ...[
          { pubkey: resource.tree, isSigner: false, isWritable: true },
          ...proffs.map((e) => ({
            pubkey: new PublicKey(e),
            isSigner: false,
            isWritable: false,
          })),
        ]
      );

      // appending args
      args.push({
        proofSize: proffs.length + 1,
        holdingState: {
          leafIdx: Number(accountProff!.leaf_index),
          root: Array.from(new PublicKey(accountProff!.root).toBytes()),
          holding: {
            holder: new PublicKey(
              compressedAccount.parsed_data.holder.split(":").at(-1)
            ),
            balance: compressedAccount.parsed_data.balance,
          },
        },
      });
    }
    const ix = createCraftRecipeInstruction(ixAccounts, {
      args: args,
    });

    const operation = new Operation(
      adminHC,
      [
        ComputeBudgetProgram.setComputeUnitLimit({
          units: 1200000,
        }),
        ix,
      ],
      [adminHC.identity().signer as KeypairLike]
    );

    operation.add_lut(lookupTable);

    const [{ signature, confirmResponse }] = await operation
      .send({
        skipPreflight: true,
        commitment: "processed",
        preflightCommitment: "processed",
      })
      .catch((e) => {
        console.log(e, "Craft Recipe Error");
        return e;
      });

    console.log(signature, "Craft Recipe");

    // setting the flag to true
    data.recipe.isCrafted = true;

    // saving the data to the file
    saveData(data);
  });
});
