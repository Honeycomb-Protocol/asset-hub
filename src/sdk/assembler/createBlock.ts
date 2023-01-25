import { Metaplex } from "@metaplex-foundation/js";
import * as web3 from "@solana/web3.js";
import { createCreateBlockInstruction, CreateBlockArgs } from "../../generated";
import { PROGRAM_ID } from "../../generated/assembler";
import { TxSignersAccounts } from "../../types";

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

export async function buildCreateBlockCtx(
  mx: Metaplex,
  assembler: web3.PublicKey,
  args: CreateBlockArgs
) {
  const wallet = mx.identity();
  const ctx = createCreateBlockTransaction(
    assembler,
    wallet.publicKey,
    wallet.publicKey,
    args
  );

  const blockhash = await mx.connection.getLatestBlockhash();

  ctx.tx.recentBlockhash = blockhash.blockhash;

  return ctx;
}

export async function createBlock(
  mx: Metaplex,
  assembler: web3.PublicKey,
  args: CreateBlockArgs
) {
  const ctx = await buildCreateBlockCtx(mx, assembler, args);

  // console.log(errorFromCode(0))
  const response = await mx
    .rpc()
    .sendAndConfirmTransaction(ctx.tx, { skipPreflight: true }, ctx.signers);

  return {
    response,
    block: ctx.block,
  };
}
