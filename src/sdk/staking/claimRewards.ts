import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import { createClaimRewardsInstruction, Project } from "../../generated";
import { PROGRAM_ID } from "../../generated/staking";
import { TxSignersAccounts } from "../../types";
import { Metaplex } from "@metaplex-foundation/js";

export function createClaimRewardsTransaction(
  project: web3.PublicKey,
  nftMint: web3.PublicKey,
  rewardMint: web3.PublicKey,
  wallet: web3.PublicKey,
  programId: web3.PublicKey = PROGRAM_ID
): TxSignersAccounts {
  const [nft] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("nft"), nftMint.toBuffer()],
    programId
  );

  const [vault] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), project.toBuffer(), rewardMint.toBuffer()],
    programId
  );

  const tokenAccount = splToken.getAssociatedTokenAddressSync(
    rewardMint,
    wallet
  );

  const instructions: web3.TransactionInstruction[] = [
    createClaimRewardsInstruction(
      {
        project,
        nft,
        rewardMint,
        vault,
        tokenAccount,
        wallet,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
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

export async function claimRewards(
  mx: Metaplex,
  project: web3.PublicKey,
  nftMint: web3.PublicKey
) {
  const projectAccount = await Project.fromAccountAddress(
    mx.connection,
    project
  );

  const wallet = mx.identity();
  const ctx = createClaimRewardsTransaction(
    project,
    nftMint,
    projectAccount.rewardMint,
    wallet.publicKey
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
