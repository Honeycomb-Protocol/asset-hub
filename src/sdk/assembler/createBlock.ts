import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { createCreateBlockInstruction, CreateBlockArgs } from "../../generated";
import { PROGRAM_ID } from "../../generated/assembler";
import { TxSignersAccounts } from "../../types";
import { sendAndConfirmTransaction } from "../../utils";

export function createCreateBlockTransaction(
  assembler: web3.PublicKey,
  authority: web3.PublicKey,
  payer: web3.PublicKey,
  args: CreateBlockArgs
): TxSignersAccounts & { block: web3.PublicKey } {
  const [block] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("block"),
      Buffer.from(`${args.blockName}`),
      Uint8Array.from([args.blockOrder]),
      assembler.toBuffer(),
    ],
    PROGRAM_ID
  );

  return {
    tx: new web3.Transaction().add(
      createCreateBlockInstruction(
        {
          assembler,
          block,
          authority,
          payer,
        },
        { args }
      )
    ),
    signers: [],
    accounts: [assembler, block, authority, payer],
    block,
  };
}

export async function createBlock(
  connection: web3.Connection,
  wallet: anchor.Wallet,
  assembler: web3.PublicKey,
  args: CreateBlockArgs
) {
  const { tx, signers, block } = createCreateBlockTransaction(
    assembler,
    wallet.publicKey,
    wallet.publicKey,
    args
  );

  const txId = await sendAndConfirmTransaction(
    tx,
    connection,
    wallet,
    signers,
    { skipPreflight: true }
  );

  return {
    txId,
    block,
  };
}
