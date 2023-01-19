import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import {
  PROGRAM_ID,
  createCreateBlockDefinitionEnumInstruction,
  CreateBlockDefinitionEnumArgs,
  createCreateBlockDefinitionNumberInstruction,
  CreateBlockDefinitionNumberArgs,
  createCreateBlockDefinitionBooleanInstruction,
  CreateBlockDefinitionBooleanArgs,
  BlockType,
  Block,
} from "../../src";
import { TxSigners } from "../types";
import { sendAndConfirmTransaction } from "../utils";

export function createCreateBlockDefinitionEnumTransaction(
  assembler: web3.PublicKey,
  block: web3.PublicKey,
  blockDefinitionMint: web3.PublicKey,
  authority: web3.PublicKey,
  payer: web3.PublicKey,
  args: CreateBlockDefinitionEnumArgs
): TxSigners & { blockDefinition: web3.PublicKey } {
  const [blockDefinition] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("block_definition"),
      Buffer.from(`${args.value}`),
      block.toBuffer(),
    ],
    PROGRAM_ID
  );

  return {
    tx: new web3.Transaction().add(
      createCreateBlockDefinitionEnumInstruction(
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

export function createCreateBlockDefinitionNumberTransaction(
  assembler: web3.PublicKey,
  block: web3.PublicKey,
  authority: web3.PublicKey,
  payer: web3.PublicKey,
  args: CreateBlockDefinitionNumberArgs
): TxSigners & { blockDefinition: web3.PublicKey } {
  const [blockDefinition] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("block_definition"), Buffer.from("number"), block.toBuffer()],
    PROGRAM_ID
  );

  return {
    tx: new web3.Transaction().add(
      createCreateBlockDefinitionNumberInstruction(
        {
          assembler,
          block,
          blockDefinition,
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

export function createCreateBlockDefinitionBooleanTransaction(
  assembler: web3.PublicKey,
  block: web3.PublicKey,
  authority: web3.PublicKey,
  payer: web3.PublicKey,
  args: CreateBlockDefinitionBooleanArgs
): TxSigners & { blockDefinition: web3.PublicKey } {
  const [blockDefinition] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("block_definition"), Buffer.from("boolean"), block.toBuffer()],
    PROGRAM_ID
  );

  return {
    tx: new web3.Transaction().add(
      createCreateBlockDefinitionBooleanInstruction(
        {
          assembler,
          block,
          blockDefinition,
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
  blockDefinitionMint?: web3.PublicKey
) {
  let tx: web3.Transaction,
    signers: web3.Keypair[],
    blockDefinition: web3.PublicKey;

  const blockAccount = await Block.fromAccountAddress(connection, block);

  if (blockAccount.blockType === BlockType.Enum) {
    if (!blockDefinitionMint)
      throw new Error("Block definition mint is required for enum block type");

    const enumTx = createCreateBlockDefinitionEnumTransaction(
      blockAccount.assembler,
      block,
      blockDefinitionMint,
      wallet.publicKey,
      wallet.publicKey,
      {
        value: "test",
        isCollection: false,
        image: null,
      }
    );
    tx = enumTx.tx;
    signers = enumTx.signers;
    blockDefinition = enumTx.blockDefinition;
  } else if (blockAccount.blockType === BlockType.Boolean) {
    const enumTx = createCreateBlockDefinitionBooleanTransaction(
      blockAccount.assembler,
      block,
      wallet.publicKey,
      wallet.publicKey,
      {
        value: true,
      }
    );
    tx = enumTx.tx;
    signers = enumTx.signers;
    blockDefinition = enumTx.blockDefinition;
  } else if (
    blockAccount.blockType === BlockType.Random ||
    blockAccount.blockType === BlockType.Computed
  ) {
    const enumTx = createCreateBlockDefinitionNumberTransaction(
      blockAccount.assembler,
      block,
      wallet.publicKey,
      wallet.publicKey,
      {
        min: 0,
        max: 100,
      }
    );
    tx = enumTx.tx;
    signers = enumTx.signers;
    blockDefinition = enumTx.blockDefinition;
  } else {
    throw new Error("Invalid block type");
  }

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
