import { Metaplex } from "@metaplex-foundation/js";
import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { createSetNftGeneratedInstruction } from "../../generated";
import { PROGRAM_ID } from "../../generated/assembler";
import { TxSignersAccounts } from "../../types";
import { sendAndConfirmTransaction } from "../../utils";

export function createSetNftGeneratedTransaction(
  nft: web3.PublicKey,
  programId: web3.PublicKey = PROGRAM_ID
): TxSignersAccounts {
  return {
    tx: new web3.Transaction().add(
      createSetNftGeneratedInstruction(
        {
          nft,
        },
        programId
      )
    ),
    signers: [],
    accounts: [nft],
  };
}

export async function setNftGenerated(nft: web3.PublicKey, mx: Metaplex) {
  const ctx = await createSetNftGeneratedTransaction(nft);

  const blockhash = await mx.connection.getLatestBlockhash();

  ctx.tx.recentBlockhash = blockhash.blockhash;

  const response = await mx
    .rpc()
    .sendAndConfirmTransaction(ctx.tx, { skipPreflight: true }, ctx.signers);

  return {
    response,
  };
}
