import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import {
  createCreateBlockDefinitionInstruction,
  BlockDefinitionValue,
} from "../../generated";
import { PROGRAM_ID } from "../../generated/assembler";
import { TxSignersAccounts } from "../../types";
import { sendAndConfirmTransaction } from "../../utils";

export function createCreateBlockDefinitionTransaction(
  assembler: web3.PublicKey,
  block: web3.PublicKey,
  blockDefinitionMint: web3.PublicKey,
  authority: web3.PublicKey,
  payer: web3.PublicKey,
  args: BlockDefinitionValue
): TxSignersAccounts & { blockDefinition: web3.PublicKey } {
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
    accounts: [
      assembler,
      block,
      blockDefinition,
      blockDefinitionMint,
      authority,
      payer,
    ],
    blockDefinition,
  };
}

export async function createBlockDefinition(
  connection: web3.Connection,
  wallet: anchor.Wallet,
  assembler: web3.PublicKey,
  block: web3.PublicKey,
  blockDefinitionMint: web3.PublicKey,
  args: BlockDefinitionValue
) {
  const { tx, signers, blockDefinition } =
    createCreateBlockDefinitionTransaction(
      assembler,
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

  return {
    txId,
    blockDefinition,
  };
}
