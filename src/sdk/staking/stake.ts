import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import { createStakeInstruction } from "../../generated";
import { PROGRAM_ID } from "../../generated/staking";
import { TxSignersAccounts } from "../../types";
import { Metaplex } from "@metaplex-foundation/js";
import {
  getMetadataAccount_,
  getStakedNftPda,
  getStakerPda,
  METADATA_PROGRAM_ID,
} from "../pdas";
import { getOrFetchNft, getOrFetchStaker } from "../../utils";
import { createInitStakerTransaction } from "./initStaker";
import { createInitNFTTransaction } from "./initNFT";

export function createStakeTransaction(
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
    createStakeInstruction(
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

export async function stake(
  mx: Metaplex,
  project: web3.PublicKey,
  nftMint: web3.PublicKey
) {
  const wallet = mx.identity();

  const staker = await getOrFetchStaker(
    mx.connection,
    wallet.publicKey,
    project
  );
  const initStakerCtx =
    !staker && createInitStakerTransaction(project, wallet.publicKey);

  const nft = await getOrFetchNft(mx.connection, nftMint, project);
  const initNftCtx =
    !nft && createInitNFTTransaction(project, nftMint, wallet.publicKey);

  const stakeCtx = createStakeTransaction(project, nftMint, wallet.publicKey);

  const tx = new web3.Transaction();

  initNftCtx && tx.add(initNftCtx.tx);

  initStakerCtx && tx.add(initStakerCtx.tx);

  tx.add(stakeCtx.tx);

  const blockhash = await mx.connection.getLatestBlockhash();

  tx.recentBlockhash = blockhash.blockhash;

  const response = await mx
    .rpc()
    .sendAndConfirmTransaction(tx, { skipPreflight: true }, [
      ...(initNftCtx?.signers || []),
      ...(initStakerCtx?.signers || []),
      ...stakeCtx.signers,
    ]);

  return {
    response,
  };
}
