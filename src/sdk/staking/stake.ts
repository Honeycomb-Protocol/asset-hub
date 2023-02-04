import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import { createStakeInstruction } from "../../generated";
import { PROGRAM_ID } from "../../generated/staking";
import { TxSignersAccounts } from "../../types";
import { Metaplex } from "@metaplex-foundation/js";
import { METADATA_PROGRAM_ID } from "../pdas";
import { getOrFetchNft, getOrFetchStaker } from "../../utils";
import { createInitStakerTransaction } from "./initStaker";
import { createInitNFTTransaction } from "./initNFT";

export function createStakeTransaction(
  project: web3.PublicKey,
  nftMint: web3.PublicKey,
  wallet: web3.PublicKey,
  programId: web3.PublicKey = PROGRAM_ID
): TxSignersAccounts {
  const [nft] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("nft"), nftMint.toBuffer(), project.toBuffer()],
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

  const [staker] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("staker"), wallet.toBuffer(), project.toBuffer()],
    programId
  );

  const instructions: web3.TransactionInstruction[] = [
    createStakeInstruction(
      {
        project,
        nft,
        nftMint,
        nftAccount,
        nftMetadata,
        nftEdition,
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
