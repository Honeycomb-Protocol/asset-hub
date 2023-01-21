import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import {
  createCreateBlockDefinitionInstruction,
  BlockDefinitionValue,
  BlockType,
  Block,
} from "../../src";
import { PROGRAM_ID } from "../../src/assembler";
import { TxSigners } from "../types";
import { sendAndConfirmTransaction } from "../utils";

export function createCreateBlockDefinitionTransaction(
  assembler: web3.PublicKey,
  block: web3.PublicKey,
  blockDefinitionMint: web3.PublicKey,
  authority: web3.PublicKey,
  payer: web3.PublicKey,
  args: BlockDefinitionValue
): TxSigners & { blockDefinition: web3.PublicKey } {
  const [blockDefinition] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("block_definition"),
      block.toBuffer(),
      blockDefinitionMint.toBuffer(),
    ],
    PROGRAM_ID
  );

  return {
    tx: new web3.Transaction().add(
      createCreateBlockDefinitionInstruction(
        {
          assembler,
          block,
          blockDefinition,
          blockDefinitionMint,
          authority,
          payer,
        },
        { args }
      )
    ),
    signers: [],
    blockDefinition,
  };
}

export default async function (
  connection: web3.Connection,
  wallet: anchor.Wallet,
  block: web3.PublicKey,
  blockDefinitionMint: web3.PublicKey
) {
  const blockAccount = await Block.fromAccountAddress(connection, block);

  let args: BlockDefinitionValue;
  if (blockAccount.blockType === BlockType.Enum) {
    args = {
      __kind: "Enum",
      value: "test",
      isCollection: true,
      image: null,
    };
  } else if (blockAccount.blockType === BlockType.Boolean) {
    args = {
      __kind: "Boolean",
      value: true,
    };
  } else if (
    blockAccount.blockType === BlockType.Random ||
    blockAccount.blockType === BlockType.Computed
  ) {
    args = {
      __kind: "Number",
      min: 0,
      max: 100,
    };
  } else {
    throw new Error("Invalid block type");
  }

  const { tx, signers, blockDefinition } =
    createCreateBlockDefinitionTransaction(
      blockAccount.assembler,
      block,
      blockDefinitionMint,
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
  console.log("Block Definition created:", txId);
  return blockDefinition;
}
