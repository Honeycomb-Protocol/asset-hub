import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import {
  PROGRAM_ID,
  createCreateBlockInstruction,
  CreateBlockArgs,
  BlockType,
} from "../../src";
import { TxSigners } from "../types";
import { sendAndConfirmTransaction } from "../utils";

export function createCreateBlockTransaction(
  assembler: web3.PublicKey,
  authority: web3.PublicKey,
  payer: web3.PublicKey,
  args: CreateBlockArgs
): TxSigners & { block: web3.PublicKey } {
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
    block,
  };
}

export default async function (
  connection: web3.Connection,
  wallet: anchor.Wallet,
  assembler: web3.PublicKey
) {
  const { tx, signers, block } = createCreateBlockTransaction(
    assembler,
    wallet.publicKey,
    wallet.publicKey,
    {
      blockName: "Block 1",
      blockOrder: 1,
      blockType: BlockType.Enum,
      isGraphical: false,
    }
  );

  const txId = await sendAndConfirmTransaction(
    tx,
    connection,
    wallet,
    signers,
    { skipPreflight: true }
  );
  console.log("Block created:", txId);
  return block;
}
