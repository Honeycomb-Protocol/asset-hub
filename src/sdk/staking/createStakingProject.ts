import * as web3 from "@solana/web3.js";
import {
  createCreateProjectInstruction,
  CreateProjectArgs,
  AddMultiplierArgs,
} from "../../generated";
import { PROGRAM_ID } from "../../generated/staking";
import { TxSignersAccounts } from "../../types";
import { Metaplex } from "@metaplex-foundation/js";
import { createUpdateStakingProjectTransaction } from "./updateStakingProject";
import { createInitMultiplierTransaction } from "./initMultipliers";
import { createAddMultiplierTransaction } from "./addMultiplier";

export function createCreateStakingProjectTransaction(
  rewardMint: web3.PublicKey,
  authority: web3.PublicKey,
  payer: web3.PublicKey,
  args: CreateProjectArgs,
  collections: web3.PublicKey[] = [],
  creators: web3.PublicKey[] = [],
  multipliers: AddMultiplierArgs[] = [],
  multipliersDecimals: number = 9,
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

    ...collections.map(
      (collection) =>
        createUpdateStakingProjectTransaction(
          project,
          authority,
          {
            name: null,
            rewardsPerDuration: null,
            rewardsDuration: null,
            maxRewardsDuration: null,
            minStakeDuration: null,
            cooldownDuration: null,
            resetStakeDuration: null,
            startTime: null,
            endTime: null,
          },
          collection
        ).tx.instructions[0]
    ),

    ...creators.map(
      (creator) =>
        createUpdateStakingProjectTransaction(
          project,
          authority,
          {
            name: null,
            rewardsPerDuration: null,
            rewardsDuration: null,
            maxRewardsDuration: null,
            minStakeDuration: null,
            cooldownDuration: null,
            resetStakeDuration: null,
            startTime: null,
            endTime: null,
          },
          undefined,
          creator
        ).tx.instructions[0]
    ),

    ...(multipliers.length
      ? [
          createInitMultiplierTransaction(project, authority, {
            decimals: multipliersDecimals,
          }).tx.instructions[0],

          ...multipliers.map(
            (multiplier) =>
              createAddMultiplierTransaction(
                project,
                authority,
                payer,
                multiplier
              ).tx.instructions[0]
          ),
        ]
      : []),
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
  creators: web3.PublicKey[] = [],
  multipliers: AddMultiplierArgs[] = [],
  multipliersDecimals: number = 9
) {
  const wallet = mx.identity();
  const ctx = createCreateStakingProjectTransaction(
    rewardMint,
    wallet.publicKey,
    wallet.publicKey,
    args,
    collections,
    creators,
    multipliers,
    multipliersDecimals
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
