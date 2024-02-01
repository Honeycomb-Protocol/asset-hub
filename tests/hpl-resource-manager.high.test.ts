import getHoneycombs from "../scripts/prepare";
import {
  PROGRAM_ID,
  createBurnResourceInstruction,
  createCreateResourceInstruction,
  createInitilizeResourceTreeInstruction,
  createMintResourceInstruction,
  resourceManagerPdas,
} from "../packages/hpl-resource-manager";
import {
  Honeycomb,
  HoneycombProject,
  KeypairLike,
  Operation,
} from "@honeycomb-protocol/hive-control";
import {
  Keypair,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey } from "@metaplex-foundation/js";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
} from "@solana/spl-account-compression";

jest.setTimeout(6000000);

describe("Resource Manager", () => {
  let adminHC: Honeycomb;

  it("Prepare Honeycomb", async () => {
    const honeycombs = await getHoneycombs();
    adminHC = honeycombs.adminHC;

    adminHC.use(
      await HoneycombProject.fromAddress(
        adminHC,
        new PublicKey("68BN7aftXJnHybM1b98HXB1pfUpsGtXZsc5n2dvgshUv")
      )
    );

    console.log(adminHC.project().address.toBase58());
  });

  it.skip("Setup", async () => {
    adminHC.use(
      await HoneycombProject.new(adminHC, {
        name: "Resource Manager",
        expectedMintAddresses: 0,
        profileDataConfigs: [],
      })
    );

    console.log(adminHC.project().address.toBase58(), "Project Address");
    expect(adminHC.project().name).toBe("Resource Manager");
  });

  it.skip("Create Resource", async () => {
    const mint = new Keypair();

    const [resourceAddress] = resourceManagerPdas().resource(
      adminHC.project().address,
      mint.publicKey,
      PROGRAM_ID
    );

    const ix = createCreateResourceInstruction(
      {
        mint: mint.publicKey,
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
      [adminHC.identity().signer as KeypairLike, mint]
    );

    const status = await op.send({
      skipPreflight: true,
      commitment: "processed",
    });

    console.log(status);
  });

  it.skip("Initialize Resource Tree", async () => {
    const mint = PublicKey.default;
    const merkleTree = new Keypair();
    const [resourceAddress] = adminHC
      .pda()
      .resourceManager()
      .resource(adminHC.project().address, mint);

    const ix = createInitilizeResourceTreeInstruction(
      {
        mint: mint,
        merkleTree: merkleTree.publicKey,
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
          maxBufferSize: 100,
          maxDepth: 10,
        },
      }
    );

    const op = new Operation(
      adminHC,
      [ix],
      [adminHC.identity().signer as KeypairLike, merkleTree]
    );

    const status = await op.send({
      skipPreflight: true,
      commitment: "processed",
    });

    console.log(status);
  });

  it.skip("Mint Resource", async () => {
    const mint = PublicKey.default;
    const merkleTree = new Keypair();
    const [resourceAddress] = adminHC
      .pda()
      .resourceManager()
      .resource(adminHC.project().address, mint);

    const ix = createMintResourceInstruction(
      {
        mint: mint,
        resource: resourceAddress,
        merkleTree: merkleTree.publicKey,
        payer: adminHC.identity().address,
        owner: adminHC.identity().address,
        project: adminHC.project().address,
        clock: SYSVAR_CLOCK_PUBKEY,
        rentSysvar: SYSVAR_RENT_PUBKEY,
        token22Program: TOKEN_2022_PROGRAM_ID,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      },
      {
        args: {
          amount: 100,
          holdingState: null,
        },
      }
    );

    const op = new Operation(
      adminHC,
      [ix],
      [adminHC.identity().signer as KeypairLike]
    );

    const status = await op.send({
      skipPreflight: true,
      commitment: "processed",
    });

    console.log(status);
  });

  it.skip("Burn Resource", async () => {
    const mint = PublicKey.default;
    const merkleTree = PublicKey.default;
    const [resourceAddress] = adminHC
      .pda()
      .resourceManager()
      .resource(adminHC.project().address, mint);

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
      },
      {
        args: {
          amount: 100,
          holdingState: {
            holding: {
              holder: adminHC.identity().address,
              balance: 100,
            },
            leafIdx: 0,
            root: [0],
            sourceHash: [],
          },
        },
      }
    );

    const op = new Operation(
      adminHC,
      [ix],
      [adminHC.identity().signer as KeypairLike]
    );

    const status = await op.send({
      skipPreflight: true,
      commitment: "processed",
    });

    console.log(status);
  });
});
