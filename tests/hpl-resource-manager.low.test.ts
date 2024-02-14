import {
  Honeycomb,
  HoneycombProject,
  KeypairLike,
  Operation,
} from "@honeycomb-protocol/hive-control";
import { PublicKey } from "@metaplex-foundation/js";
import {
  MerkleTree,
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
  ValidDepthSizePair,
  createVerifyLeafIx,
  getConcurrentMerkleTreeAccountSize,
} from "@solana/spl-account-compression";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
} from "@solana/web3.js";
import {
  CharacterOffchainData,
  CompressedData,
  HplCharacter,
} from "../packages/hpl-character-manager";
import {
  PROGRAM_ID,
  createBurnResourceInstruction,
  createCreateResourceInstruction,
  createInitilizeResourceTreeInstruction,
  createMintResourceInstruction,
  createUnwrapResourceInstruction,
  resourceManagerPdas,
} from "../packages/hpl-resource-manager";
import getHoneycombs from "../scripts/prepare";
import edgeClient from "@honeycomb-protocol/edge-client";
import createEdgeClient from "@honeycomb-protocol/edge-client/client";
import { Client, cacheExchange, fetchExchange } from "@urql/core";
import { createSparseMerkleTree, holdingInfoHash } from "./parser";

jest.setTimeout(6000000);

const getClient = (rpcUrl = "http://localhost:4000") =>
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

describe("Resource Manager", () => {
  let adminHC: Honeycomb;
  let project: PublicKey | undefined = new PublicKey(
    "FkEpfioxFBcy9Wwn5RxJZibByhhEpfvfbo68ezJtdume"
  );
  let mint: PublicKey | undefined = new PublicKey(
    "6ujFRoiDivvjnRYbJSg2TWMJuEZf3QBDFtcNdHG5qiY8"
  );
  let merkleTree: PublicKey | undefined = new PublicKey(
    "CTfap39YohAMXQTrwZunLKLNXFJQoyGhdsuqBX8vHhFb"
  );
  const tree = createSparseMerkleTree([], 14);

  beforeAll(async () => {
    const honeycombs = await getHoneycombs();
    adminHC = honeycombs.adminHC;

    if (project) {
      adminHC.use(await HoneycombProject.fromAddress(adminHC, project));
    } else {
      adminHC.use(
        await HoneycombProject.new(adminHC, {
          name: "Resource Manager",
          expectedMintAddresses: 0,
          profileDataConfigs: [],
        })
      );

      project = adminHC.project().address;
      console.log(adminHC.project().address.toBase58(), "Project Address");
    }
  });

  it.skip("Create Resource", async () => {
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
            name: "WEN",
            symbol: "$FR",
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
    mint = mintKeypair.publicKey;
  });

  it.skip("Initialize Resource Tree", async () => {
    if (!mint) throw new Error("Mint not found");

    const merkleTreeKeyPair = new Keypair();
    const [resourceAddress] = resourceManagerPdas().resource(
      adminHC.project().address,
      mint,
      PROGRAM_ID
    );

    const depthSizePair: ValidDepthSizePair = {
      maxDepth: 14,
      maxBufferSize: 64,
    };

    const space = getConcurrentMerkleTreeAccountSize(
      depthSizePair.maxDepth,
      depthSizePair.maxBufferSize,
      10
    );

    const lamports = await adminHC.connection.getMinimumBalanceForRentExemption(
      space
    );

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
        resource: resourceAddress,
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
    merkleTree = merkleTreeKeyPair.publicKey;
  });

  it.skip("Mint Resource", async () => {
    if (!mint || !merkleTree) throw new Error("Mint or Merkle Tree not found");

    const [resourceAddress] = resourceManagerPdas().resource(
      adminHC.project().address,
      mint
    );

    const ix = createMintResourceInstruction(
      {
        mint: mint,
        resource: resourceAddress,
        merkleTree: merkleTree,
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

    const data = holdingInfoHash({
      balance: 1000,
      holder: adminHC.identity().address,
    });
    tree.updateLeaf(0, Buffer.from(data));

    console.log(signature, "Mint Resource");
  });

  it.skip("FETCH HOLDER ACCOUNTS BY HOLDER", async () => {
    const resource = await getCompressedAccountsByHolder(
      adminHC.identity().address
    );
    console.log(resource, "PROFF");
  });

  it.skip("Burn Resource", async () => {
    if (!merkleTree || !mint) return Error("Merkel tree OR Mint not provided");

    const [resourceAddress] = resourceManagerPdas().resource(
      adminHC.project().address,
      mint
    );

    const resource = (await getCompressedAccountsByTree(merkleTree)).at(-1)!;
    console.log(resource, "PROFF");
    const proff = (await getAssetProof(Number(resource.leaf_idx), merkleTree))!;

    console.log(proff?.proof, "PROFF");
    // console.log(resource, "PROFF");
    // if (!proff || !proff.leaf_index || !proff.root)
    //   return Error("Proff Data not found");

    // const proff = tree.getProof(0);
    const ix = createBurnResourceInstruction(
      {
        mint,
        merkleTree,
        resource: resourceAddress,
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
          amount: 100,
          holdingState: {
            leafIdx: Number(proff.leaf_index),
            root: Array.from(new PublicKey(proff.root).toBytes()),
            holding: {
              holder: new PublicKey(
                resource.parsed_data.holder.split(":").at(-1)
              ),
              balance: resource.parsed_data.balance,
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

    const data = holdingInfoHash({
      balance: 900,
      holder: adminHC.identity().address,
    });
    tree.updateLeaf(0, Buffer.from(data));

    console.log(signature, "Burn Resource");
  });

  it("UnWrap Resource", async () => {
    if (!merkleTree || !mint) return Error("Merkel tree OR Mint not provided");

    const [resourceAddress] = resourceManagerPdas().resource(
      adminHC.project().address,
      mint
    );

    const recipientAccount = getAssociatedTokenAddressSync(
      mint,
      adminHC.identity().address,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const resource = (await getCompressedAccountsByTree(merkleTree)).at(-1)!;
    console.log(resource.parsed_data, "PROFF");
    const proff = (await getAssetProof(Number(resource.leaf_idx), merkleTree))!;

    const ix = createUnwrapResourceInstruction(
      {
        mint,
        merkleTree,
        recipientAccount,
        resource: resourceAddress,
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
                resource.parsed_data.holder.split(":").at(-1)
              ),
              balance: resource.parsed_data.balance,
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
  });
});
