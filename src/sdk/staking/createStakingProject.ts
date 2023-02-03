import * as web3 from "@solana/web3.js";
import {
  createCreateProjectInstruction,
  CreateProjectArgs,
  createUpdatePojectInstruction,
} from "../../generated";
import { PROGRAM_ID } from "../../generated/staking";
import { TxSignersAccounts } from "../../types";
import { Metaplex } from "@metaplex-foundation/js";

export function createCreateStakingProjectTransaction(
  rewardMint: web3.PublicKey,
  authority: web3.PublicKey,
  payer: web3.PublicKey,
  args: CreateProjectArgs,
  collections: web3.PublicKey[] = [],
  creators: web3.PublicKey[] = [],
  programId: web3.PublicKey = PROGRAM_ID
): TxSignersAccounts & { project: web3.PublicKey } {
  const key = web3.Keypair.generate().publicKey;

  const [project] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("project"), key.toBuffer()],
    programId
  );

  const [vault] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), project.toBuffer(), rewardMint.toBuffer()],
    programId
  );

  const instructions: web3.TransactionInstruction[] = [
    createCreateProjectInstruction(
      {
        key,
        project,
        rewardMint,
        vault,
        authority,
        payer,
      },
      { args },
      programId
    ),

    ...collections.map((collection) =>
      createUpdatePojectInstruction(
        {
          project,
          collection,
          creator: programId,
          authority,
          newAuthority: programId,
        },
        {
          args: {
            name: null,
            rewardsPerSecond: null,
            startTime: null,
          },
        }
      )
    ),

    ...creators.map((creator) =>
      createUpdatePojectInstruction(
        {
          project,
          collection: programId,
          creator,
          authority,
          newAuthority: programId,
        },
        {
          args: {
            name: null,
            rewardsPerSecond: null,
            startTime: null,
          },
        }
      )
    ),
  ];

  return {
    tx: new web3.Transaction().add(...instructions),
    signers: [],
    accounts: instructions.flatMap((i) => i.keys.map((k) => k.pubkey)),
    project,
  };
}

export async function createStakingProject(
  mx: Metaplex,
  rewardMint: web3.PublicKey,
  args: CreateProjectArgs,
  collections: web3.PublicKey[] = [],
  creators: web3.PublicKey[] = []
) {
  const wallet = mx.identity();
  const ctx = createCreateStakingProjectTransaction(
    rewardMint,
    wallet.publicKey,
    wallet.publicKey,
    args,
    collections,
    creators
  );

  const blockhash = await mx.connection.getLatestBlockhash();

  ctx.tx.recentBlockhash = blockhash.blockhash;

  const response = await mx
    .rpc()
    .sendAndConfirmTransaction(ctx.tx, { skipPreflight: true }, ctx.signers);

  return {
    response,
    project: ctx.project,
  };
}
