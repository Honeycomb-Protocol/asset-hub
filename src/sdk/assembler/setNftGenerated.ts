import { Metaplex } from "@metaplex-foundation/js";
import * as web3 from "@solana/web3.js";
import { createSetNftGeneratedInstruction } from "../../generated";
import {
  NFT,
  NFTArgs,
  PROGRAM_ID,
  SetNFTGeneratedArgs,
} from "../../generated/assembler";
import { TxSignersAccounts } from "../../types";
import { getMetadataAccount_, METADATA_PROGRAM_ID } from "./pdas";

export function createSetNftGeneratedTransaction(
  assembler: web3.PublicKey,
  nft: web3.PublicKey,
  nftMint: web3.PublicKey,
  authority: web3.PublicKey,
  args: SetNFTGeneratedArgs,
  delegate?: web3.PublicKey,
  programId: web3.PublicKey = PROGRAM_ID
): TxSignersAccounts {
  const [nftMetadata] = getMetadataAccount_(nftMint);

  return {
    tx: new web3.Transaction().add(
      createSetNftGeneratedInstruction(
        {
          assembler,
          nft,
          nftMetadata,
          authority,
          delegate: delegate || programId,
          tokenMetadataProgram: METADATA_PROGRAM_ID,
        },
        {
          args,
        },
        programId
      )
    ),
    signers: [],
    accounts: [nft],
  };
}

export async function setNftGenerated(
  mx: Metaplex,
  nft: web3.PublicKey,
  args: SetNFTGeneratedArgs,
  nftArgs?: NFTArgs
) {
  const nftAccount = nftArgs
    ? null
    : await NFT.fromAccountAddress(mx.connection, nft);
  const ctx = await createSetNftGeneratedTransaction(
    nftAccount?.assembler || nftArgs.assembler,
    nft,
    nftAccount?.mint || nftArgs.mint,
    mx.identity().publicKey,
    args
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
