import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import { createStakeInstruction } from "../../generated";
import { LockType, PROGRAM_ID, Project } from "../../generated/staking";
import { TxSignersAccounts } from "../../types";
import { Metaplex } from "@metaplex-foundation/js";
import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata";
import {
  getMetadataAccount_,
  getStakedNftDepositPda,
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
  lockType: LockType = LockType.Freeze,
  tokenStandard: TokenStandard = TokenStandard.NonFungible,
  programId: web3.PublicKey = PROGRAM_ID
): TxSignersAccounts {
  const [nft] = getStakedNftPda(project, nftMint);
  const nftAccount = splToken.getAssociatedTokenAddressSync(nftMint, wallet);
  const [nftMetadata] = getMetadataAccount_(nftMint);
  const [nftEdition] = getMetadataAccount_(nftMint, { __kind: "edition" });
  const [staker] = getStakerPda(project, wallet);

  let nftTokenRecord: web3.PublicKey,
    depositAccount: web3.PublicKey,
    depositTokenRecord: web3.PublicKey;

  if (lockType == LockType.Custoday) {
    [depositAccount] = getStakedNftDepositPda(nftMint);
  }

  if (tokenStandard === TokenStandard.ProgrammableNonFungible) {
    [nftTokenRecord] = getMetadataAccount_(nftMint, {
      __kind: "token_record",
      tokenAccount: nftAccount,
    });
    if (lockType == LockType.Custoday) {
      [depositTokenRecord] = getMetadataAccount_(nftMint, {
        __kind: "token_record",
        tokenAccount: depositAccount,
      });
    }
  }

  const instructions: web3.TransactionInstruction[] = [
    createStakeInstruction(
      {
        project,
        nft,
        nftMint,
        nftAccount,
        nftMetadata,
        nftEdition,
        nftTokenRecord: nftTokenRecord || programId,
        depositAccount: depositAccount || programId,
        depositTokenRecord: depositTokenRecord || programId,
        staker,
        wallet,
        associatedTokenProgram: splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
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

  const projectAccount = await Project.fromAccountAddress(
    mx.connection,
    project
  );
  const metadata = await mx.nfts().findByMint({ mintAddress: nftMint });

  const stakeCtx = createStakeTransaction(
    project,
    nftMint,
    wallet.publicKey,
    projectAccount.lockType,
    metadata.tokenStandard
  );

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
