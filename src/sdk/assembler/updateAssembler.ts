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
  assembler: web3.PublicKey,
  authority: web3.PublicKey,
  args: UpdateAssemblerArgs,
  delegate?: web3.PublicKey,
  newAuthority?: web3.PublicKey,
  programId: web3.PublicKey = PROGRAM_ID
): TxSignersAccounts & { assembler: web3.PublicKey } {
  return {
    tx: new web3.Transaction().add(
      createUpdateAssemblerInstruction(
        {
          assembler,
          authority,
          delegate: delegate || programId,
          newAuthority: newAuthority || programId,
        },
        { args },
        programId
      )
    ),
    signers: [],
    accounts: [assembler, authority, delegate, newAuthority],
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
    assembler,
    wallet.publicKey,
    args,
    undefined,
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
