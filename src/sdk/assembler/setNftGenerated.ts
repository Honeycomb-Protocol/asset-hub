import { Metaplex } from "@metaplex-foundation/js";
import * as web3 from "@solana/web3.js";
import { METADATA_PROGRAM_ID } from "src/utils";
import { createSetNftGeneratedInstruction } from "../../generated";
import {
  NFT,
  PROGRAM_ID,
  SetNFTGeneratedArgs,
} from "../../generated/assembler";
import { TxSignersAccounts } from "../../types";

export function createSetNftGeneratedTransaction(
  assembler: web3.PublicKey,
  nft: web3.PublicKey,
  nftMint: web3.PublicKey,
  args: SetNFTGeneratedArgs,
  programId: web3.PublicKey = PROGRAM_ID
): TxSignersAccounts {
  const [nftMetadata] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      nftMint.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  );

  return {
    tx: new web3.Transaction().add(
      createSetNftGeneratedInstruction(
        {
          assembler,
          nft,
          nftMetadata,
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
  args: SetNFTGeneratedArgs
) {
  const nftAccount = await NFT.fromAccountAddress(mx.connection, nft);
  const ctx = await createSetNftGeneratedTransaction(
    nftAccount.assembler,
    nft,
    nftAccount.mint,
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
