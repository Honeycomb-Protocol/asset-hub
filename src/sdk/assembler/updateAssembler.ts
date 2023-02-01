import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import {
  UpdateAssemblerArgs,
  createUpdateAssemblerInstruction,
} from "../../generated";
import { PROGRAM_ID } from "../../generated/assembler";
import { TxSignersAccounts } from "../../types";
import { Metaplex } from "@metaplex-foundation/js";

export function createUpdateAssemblerTransaction(
  authority: web3.PublicKey,
  assembler: web3.PublicKey,
  args: UpdateAssemblerArgs,
  newAuthority: web3.PublicKey = PROGRAM_ID,
  programId: web3.PublicKey = PROGRAM_ID
): TxSignersAccounts & { assembler: web3.PublicKey } {
  return {
    tx: new web3.Transaction().add(
      createUpdateAssemblerInstruction(
        {
          assembler,
          authority,
          newAuthority: newAuthority || programId,
        },
        { args },
        programId
      )
    ),
    signers: [],
    accounts: [assembler, authority, newAuthority],
    assembler,
  };
}

export async function updateAssembler(
  mx: Metaplex,
  assembler: web3.PublicKey,
  args: UpdateAssemblerArgs,
  newAuthority?: web3.PublicKey
) {
  const wallet = mx.identity();
  const ctx = createUpdateAssemblerTransaction(
    wallet.publicKey,
    assembler,
    args,
    newAuthority
  );

  const blockhash = await mx.connection.getLatestBlockhash();

  ctx.tx.recentBlockhash = blockhash.blockhash;

  const response = await mx
    .rpc()
    .sendAndConfirmTransaction(ctx.tx, { skipPreflight: true }, ctx.signers)
    .catch((e) => {
      console.log(e.cause);
    });

  return {
    response,
  };
}
