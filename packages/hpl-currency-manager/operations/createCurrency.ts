import * as web3 from "@solana/web3.js";
import {
  ConfirmedContext,
  HIVECONTROL_PROGRAM_ID,
  Honeycomb,
  OperationCtx,
  VAULT,
  createCtx,
} from "@honeycomb-protocol/hive-control";
import {
  createCreateCurrencyInstruction,
  CreateCurrencyArgs as CreateCurrencyArgsChain,
  PROGRAM_ID,
} from "../generated";
import { currencyPda, metadataPda } from "../utils";

type CreateCreateCurrencyCtxArgs = {
  args: CreateCurrencyArgsChain;
  project: web3.PublicKey;
  delegteAuthority?: web3.PublicKey;
  authority: web3.PublicKey;
  payer: web3.PublicKey;
  programId?: web3.PublicKey;
};
export function createCreateCurrencyCtx(
  args: CreateCreateCurrencyCtxArgs
): OperationCtx & { currency: web3.PublicKey } {
  const programId = args.programId || PROGRAM_ID;

  const mint = web3.Keypair.generate();
  const [currency] = currencyPda(mint.publicKey);
  const [metadata] = metadataPda(mint.publicKey);

  const instructions = [
    createCreateCurrencyInstruction(
      {
        currency,
        mint: mint.publicKey,
        metadata,
        project: args.project,
        delegateAuthority: args.delegteAuthority || programId,
        authority: args.authority,
        payer: args.payer,
        vault: VAULT,
        sysvarInstructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        hiveControlProgram: HIVECONTROL_PROGRAM_ID,
      },
      {
        args: args.args,
      },
      programId
    ),
  ];

  return {
    ...createCtx(instructions, [mint]),
    currency,
  };
}

type CreateCurrencyArgs = {
  args: CreateCurrencyArgsChain;
  project: web3.PublicKey;
  programId?: web3.PublicKey;
};
export async function createCurrency(
  honeycomb: Honeycomb,
  args: CreateCurrencyArgs
): Promise<ConfirmedContext & { currency: web3.PublicKey }> {
  const ctx = createCreateCurrencyCtx({
    args: args.args,
    project: args.project,
    delegteAuthority: honeycomb.identity().delegateAuthority().address,
    authority: honeycomb.identity().publicKey,
    payer: honeycomb.identity().publicKey,
    programId: args.programId,
  });

  return {
    ...(await honeycomb.rpc().sendAndConfirmTransaction(ctx)),
    currency: ctx.currency,
  };
}
