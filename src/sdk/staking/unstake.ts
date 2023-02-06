import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import { createUnstakeInstruction, Project } from "../../generated";
import { PROGRAM_ID } from "../../generated/staking";
import { TxSignersAccounts } from "../../types";
import { Metaplex } from "@metaplex-foundation/js";
import {
  getMetadataAccount_,
  getStakedNftPda,
  getStakerPda,
  METADATA_PROGRAM_ID,
} from "../pdas";
import { createClaimRewardsTransaction } from "./claimRewards";
import { getOrFetchMultipliers } from "../../utils";

export function createUnstakeTransaction(
  project: web3.PublicKey,
  nftMint: web3.PublicKey,
  wallet: web3.PublicKey,
  programId: web3.PublicKey = PROGRAM_ID
): TxSignersAccounts {
  const [nft] = getStakedNftPda(project, nftMint);
  const nftAccount = splToken.getAssociatedTokenAddressSync(nftMint, wallet);
  const [nftMetadata] = getMetadataAccount_(nftMint);
  const [nftEdition] = getMetadataAccount_(nftMint, { __kind: "edition" });
  const [nftTokenRecord] = getMetadataAccount_(nftMint, {
    __kind: "token_record",
    tokenAccount: nftAccount,
  });
  const [staker] = getStakerPda(project, wallet);

  const instructions: web3.TransactionInstruction[] = [
    createUnstakeInstruction(
      {
        project,
        nft,
        nftMint,
        nftAccount,
        nftMetadata,
        nftEdition,
        nftTokenRecord,
        staker,
        wallet,
        tokenMetadataProgram: METADATA_PROGRAM_ID,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
        sysvarInstructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
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

export async function unstake(
  mx: Metaplex,
  project: web3.PublicKey,
  nftMint: web3.PublicKey
) {
  const projectAccount = await Project.fromAccountAddress(
    mx.connection,
    project
  );

  const multipliers = await getOrFetchMultipliers(mx.connection, project);

  const wallet = mx.identity();
  const claimCtx = createClaimRewardsTransaction(
    project,
    nftMint,
    projectAccount.rewardMint,
    wallet.publicKey,
    multipliers?.address
  );
  const unstakeCtx = createUnstakeTransaction(
    project,
    nftMint,
    wallet.publicKey
  );

  const blockhash = await mx.connection.getLatestBlockhash();

  const tx = new web3.Transaction().add(claimCtx.tx, unstakeCtx.tx);

  tx.recentBlockhash = blockhash.blockhash;

  const response = await mx
    .rpc()
    .sendAndConfirmTransaction(tx, { skipPreflight: true }, [
      ...claimCtx.signers,
      ...unstakeCtx.signers,
    ]);

  return {
    response,
  };
}
