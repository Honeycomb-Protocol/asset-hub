import * as web3 from "@solana/web3.js";
import {
  createInitMultipliersInstruction,
  InitMultipliersArgs,
} from "../../generated";
import { PROGRAM_ID } from "../../generated/staking";
import { TxSignersAccounts } from "../../types";
import { Metaplex } from "@metaplex-foundation/js";

export function createInitMultiplierTransaction(
  project: web3.PublicKey,
  authority: web3.PublicKey,
  args: InitMultipliersArgs,
  programId: web3.PublicKey = PROGRAM_ID
): TxSignersAccounts {
  const [multipliers] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("multipliers"), project.toBuffer()],
    programId
  );

  const instructions: web3.TransactionInstruction[] = [
    createInitMultipliersInstruction(
      {
        project,
        multipliers,
        authority,
      },
      { args },
      programId
    ),
  ];

  return {
    tx: new web3.Transaction().add(...instructions),
    signers: [],
    accounts: instructions.flatMap((i) => i.keys.map((k) => k.pubkey)),
  };
}

export async function initMultipliers(
  mx: Metaplex,
  project: web3.PublicKey,
  args: InitMultipliersArgs
) {
  const wallet = mx.identity();
  const ctx = createInitMultiplierTransaction(project, wallet.publicKey, args);

  const blockhash = await mx.connection.getLatestBlockhash();

  ctx.tx.recentBlockhash = blockhash.blockhash;

  const response = await mx
    .rpc()
    .sendAndConfirmTransaction(ctx.tx, { skipPreflight: true }, ctx.signers);

  return {
    response,
  };
}
