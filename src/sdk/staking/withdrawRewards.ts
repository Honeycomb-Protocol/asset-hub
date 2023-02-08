import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import { createWithdrawRewardsInstruction, Project } from "../../generated";
import { PROGRAM_ID } from "../../generated/staking";
import { TxSignersAccounts } from "../../types";
import { Metaplex } from "@metaplex-foundation/js";

export function createWithdrawRewardsTransaction(
  project: web3.PublicKey,
  rewardMint: web3.PublicKey,
  authority: web3.PublicKey,
  amount: number,
  programId: web3.PublicKey = PROGRAM_ID
): TxSignersAccounts {
  const [vault] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), project.toBuffer(), rewardMint.toBuffer()],
    programId
  );

  const tokenAccount = splToken.getAssociatedTokenAddressSync(
    rewardMint,
    authority
  );

  const instructions: web3.TransactionInstruction[] = [
    createWithdrawRewardsInstruction(
      {
        project,
        rewardMint,
        vault,
        tokenAccount,
        authority,
      },
      {
        amount,
      },
      programId
    ),
  ];

  return {
    tx: new web3.Transaction().add(...instructions),
    signers: [],
    accounts: instructions.flatMap((i) => i.keys.map((k) => k.pubkey)),
  };
}

export async function withdrawRewards(
  mx: Metaplex,
  project: web3.PublicKey,
  amount: number
) {
  const projectAccount = await Project.fromAccountAddress(
    mx.connection,
    project
  );

  const wallet = mx.identity();
  const ctx = createWithdrawRewardsTransaction(
    project,
    projectAccount.rewardMint,
    wallet.publicKey,
    amount
  );

  const blockhash = await mx.connection.getLatestBlockhash();

  ctx.tx.recentBlockhash = blockhash.blockhash;

  const response = await mx
    .rpc()
    .sendAndConfirmTransaction(ctx.tx, { skipPreflight: true }, ctx.signers);

  return {
    response,
  };
}
