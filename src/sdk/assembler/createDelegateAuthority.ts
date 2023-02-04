import * as web3 from "@solana/web3.js";
import {
  CreateDelegateAuthorityArgs,
  createCreateDelegateAuthorityInstruction,
} from "../../generated";
import { PROGRAM_ID } from "../../generated/assembler";
import { TxSignersAccounts } from "../../types";
import { Metaplex } from "@metaplex-foundation/js";
import { getDelegateAuthorityPda } from "../pdas";

export function createCreateDelegateAuthorityTransaction(
  assembler: web3.PublicKey,
  delegate: web3.PublicKey,
  authority: web3.PublicKey,
  payer: web3.PublicKey,
  args: CreateDelegateAuthorityArgs,
  programId: web3.PublicKey = PROGRAM_ID
): TxSignersAccounts & { delegateAuthority: web3.PublicKey } {
  const [delegateAuthority] = getDelegateAuthorityPda(
    assembler,
    delegate,
    args.permission
  );

  return {
    tx: new web3.Transaction().add(
      createCreateDelegateAuthorityInstruction(
        {
          assembler,
          delegateAuthority,
          delegate,
          authority,
          payer,
        },
        { args },
        programId
      )
    ),
    signers: [],
    accounts: [assembler, delegateAuthority, delegate, authority, payer],
    delegateAuthority,
  };
}

export async function createDelegateAuthority(
  mx: Metaplex,
  assembler: web3.PublicKey,
  delegate: web3.PublicKey,
  args: CreateDelegateAuthorityArgs
) {
  const wallet = mx.identity();
  const ctx = createCreateDelegateAuthorityTransaction(
    assembler,
    delegate,
    wallet.publicKey,
    wallet.publicKey,
    args
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
