import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import { createUnstakeInstruction, Project } from "../../generated";
import { PROGRAM_ID } from "../../generated/staking";
import { TxSignersAccounts } from "../../types";
import { Metaplex } from "@metaplex-foundation/js";
import { METADATA_PROGRAM_ID } from "../../utils";
import { createClaimRewardsTransaction } from "./claimRewards";

export function createUnstakeTransaction(
  project: web3.PublicKey,
  nftMint: web3.PublicKey,
  wallet: web3.PublicKey,
  programId: web3.PublicKey = PROGRAM_ID
): TxSignersAccounts {
  const [nft] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("nft"), nftMint.toBuffer()],
    programId
  );

  const nftAccount = splToken.getAssociatedTokenAddressSync(nftMint, wallet);

  const [nftMetadata] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      nftMint.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  );

  const [nftEdition] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      nftMint.toBuffer(),
      Buffer.from("edition"),
    ],
    METADATA_PROGRAM_ID
  );

  const instructions: web3.TransactionInstruction[] = [
    createUnstakeInstruction(
      {
        nft,
        nftMint,
        nftAccount,
        nftMetadata,
        nftEdition,
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

  const wallet = mx.identity();
  const claimCtx = createClaimRewardsTransaction(
    project,
    nftMint,
    projectAccount.rewardMint,
    wallet.publicKey
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
