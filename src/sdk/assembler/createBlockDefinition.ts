import { Metaplex } from "@metaplex-foundation/js";
import * as web3 from "@solana/web3.js";
import {
  createCreateBlockDefinitionInstruction,
  BlockDefinitionValue,
} from "../../generated";
import { TxSignersAccounts } from "../../types";
import { getBlockDefinitionPda } from "./pdas";

export function createCreateBlockDefinitionTransaction(
  assembler: web3.PublicKey,
  block: web3.PublicKey,
  blockDefinitionMint: web3.PublicKey,
  authority: web3.PublicKey,
  payer: web3.PublicKey,
  args: BlockDefinitionValue
): TxSignersAccounts & { blockDefinition: web3.PublicKey } {
  const [blockDefinition] = getBlockDefinitionPda(block, blockDefinitionMint);

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
  mx: Metaplex,
  assembler: web3.PublicKey,
  block: web3.PublicKey,
  blockDefinitionMint: web3.PublicKey,
  args: BlockDefinitionValue
) {
  const wallet = mx.identity();
  const ctx = createCreateBlockDefinitionTransaction(
    assembler,
    block,
    blockDefinitionMint,
    wallet.publicKey,
    wallet.publicKey,
    args
  );

  const blockhash = await mx.connection.getLatestBlockhash();

  ctx.tx.recentBlockhash = blockhash.blockhash;

  const response = await mx
    .rpc()
    .sendAndConfirmTransaction(ctx.tx, { skipPreflight: true }, ctx.signers);

  return {
    response,
    blockDefinition: ctx.blockDefinition,
  };
}
