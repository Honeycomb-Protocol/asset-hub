import {
  Honeycomb,
  HoneycombProject,
  KeypairLike,
  Operation,
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

jest.setTimeout(6000000);

async function getCompressedData<T = any>(
  leafIdx: number,
  tree: PublicKey,
  rpcUrl: string = process.env.SOLANA_RPC as string
): Promise<CompressedData<T> | null> {
  const { result, error } = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "my-id",
      method: "getCompressedData",
      params: {
        tree: tree.toString(),
        leafIdx,
      },
    }),
  }).then((res) => res.json());

  if (!result) {
    console.error(error, "Error fetching compressed data");
    return null;
  }

  return result;
}

describe("Resource Manager", () => {
  let adminHC: Honeycomb;
  let mint: PublicKey | undefined;
  // new PublicKey(
  //   "HpHaXsWoANTo5wrDDEszdWTg6Cru3fMTfhJSimxvxBkG"
  // );
  let merkleTree: PublicKey | undefined;
  // new PublicKey(
  //   "GWMfiwJh2CjJ25XyYUPS2WAhHPBYmEEHvqYBqqaAH3rw"
  // );
  let project: PublicKey | undefined;
  // new PublicKey(
  //   "9ZsfHL5X2uXmkLnasH5ucuaWGKtaruHHCxsxREMRMeJj"
  // );

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

  it("Create Resource", async () => {
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

  it("Initialize Resource Tree", async () => {
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
      11
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

  it("Mint Resource", async () => {
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

    console.log(signature, "Mint Resource");
  });

  // it("fetch compressed data", async () => {
  //   if (!merkleTree) throw new Error("Mint or Merkle Tree not found");

  //   const data = await getCompressedData(0, merkleTree);
  //   console.log(data);
  // });

  // it.skip("Burn Resource", async () => {
  //   const mint = PublicKey.default;
  //   const merkleTree = PublicKey.default;
  //   const [resourceAddress] = resourceManagerPdas().resource(
  //     adminHC.project().address,
  //     mint
  //   );

  //   const holding_state = await getCompressedData(0, merkleTree);
  //   if (holding_state) return Error("Holding State not found");

  //   // const { root, leaf } = (await holding_state.proof(adminHC.rpcEndpoint))!;
  //   const ix = createBurnResourceInstruction(
  //     {
  //       mint,
  //       merkleTree,
  //       resource: resourceAddress,
  //       payer: adminHC.identity().address,
  //       owner: adminHC.identity().address,
  //       project: adminHC.project().address,
  //       clock: SYSVAR_CLOCK_PUBKEY,
  //       rentSysvar: SYSVAR_RENT_PUBKEY,
  //       logWrapper: SPL_NOOP_PROGRAM_ID,
  //       token22Program: TOKEN_2022_PROGRAM_ID,
  //       compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  //     },
  //     {
  //       args: {
  //         amount: 100,
  //         holdingState: {
  //           leafIdx: holding_state.leafIdx,
  //           root: Array.from(root.toBytes()),
  //           sourceHash: Array.from(holding_state.sourceHash),
  //           holding: {
  //             holder: holding_state.owner,
  //             balance: 100,
  //           },
  //         },
  //       },
  //     }
  //   );

  //   const op = new Operation(
  //     adminHC,
  //     [ix],
  //     [adminHC.identity().signer as KeypairLike]
  //   );

  //   const [{ signature }] = await op.send({
  //     skipPreflight: true,
  //     commitment: "processed",
  //   });

  //   console.log(signature);
  // });

  // it.skip("Burn Resource", async () => {
  //   const mint = PublicKey.default;
  //   const merkleTree = PublicKey.default;
  //   const [resourceAddress] = resourceManagerPdas().resource(
  //     adminHC.project().address,
  //     mint
  //   );

  //   const data = await getCompressedData(0, merkleTree);
  //   if (holding_state) return Error("Holding State not found");

  //   const { root, leaf } = holding_state.proof(adminHC.rpcEndpoint);

  //   const ix = createUnwrapResourceInstruction(
  //     {
  //       mint,
  //       merkleTree,
  //       resource: resourceAddress,
  //       payer: adminHC.identity().address,
  //       owner: adminHC.identity().address,
  //       project: adminHC.project().address,
  //       recipientAccount: adminHC.identity().address,
  //       clock: SYSVAR_CLOCK_PUBKEY,
  //       rentSysvar: SYSVAR_RENT_PUBKEY,
  //       logWrapper: SPL_NOOP_PROGRAM_ID,
  //       token22Program: TOKEN_2022_PROGRAM_ID,
  //       compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  //       associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //     },
  //     {
  //       args: {
  //         amount: 100,
  //         holdingState: {
  //           leafIdx: holding_state.leafIdx,
  //           root: Array.from(root.toBytes()),
  //           sourceHash: Array.from(holding_state.sourceHash),
  //           holding: {
  //             holder: holding_state.owner,
  //             balance: 100,
  //           },
  //         },
  //       },
  //     }
  //   );

  //   const op = new Operation(
  //     adminHC,
  //     [ix],
  //     [adminHC.identity().signer as KeypairLike]
  //   );

  //   const [{ signature }] = await op.send({
  //     skipPreflight: true,
  //     commitment: "processed",
  //   });

  //   console.log(signature);
  // });
});
