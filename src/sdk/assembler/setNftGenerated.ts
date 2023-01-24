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

export async function createAssembler(
  nft: web3.PublicKey,
  connection: web3.Connection,
  wallet: anchor.Wallet
) {
  const assemblerTx = createSetNftGeneratedTransaction(nft);

  const txId = await sendAndConfirmTransaction(
    assemblerTx.tx,
    connection,
    wallet,
    assemblerTx.signers,
    { skipPreflight: true }
  );

  return {
    txId,
  };
}
