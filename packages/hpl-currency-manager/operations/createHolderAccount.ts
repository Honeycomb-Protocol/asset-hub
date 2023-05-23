import * as web3 from "@solana/web3.js";
import {
  ConfirmedContext,
  Honeycomb,
  OperationCtx,
  createCtx,
} from "@honeycomb-protocol/hive-control";
import {
  createCreateHolderAccountInstruction,
  CurrencyKind,
  PROGRAM_ID,
} from "../generated";
import { holderAccountPdas, metadataPda } from "../utils";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { HplCurrency } from "../HplCurrency";

type CreateCreateHolderAccountCtxArgs = {
  currencyKind: CurrencyKind;
  currency: web3.PublicKey;
  mint: web3.PublicKey;
  owner: web3.PublicKey;
  payer: web3.PublicKey;
  programId?: web3.PublicKey;
};
export function createCreateHolderAccountCtx(
  args: CreateCreateHolderAccountCtxArgs
): OperationCtx & { holderAccount: web3.PublicKey } {
  const programId = args.programId || PROGRAM_ID;

  const { holderAccount, tokenAccount } = holderAccountPdas(
    args.owner,
    args.mint,
    args.currencyKind,
    TOKEN_PROGRAM_ID,
    programId
  );
  const [metadata] = metadataPda(args.mint);

  const instructions = [
    createCreateHolderAccountInstruction(
      {
        currency: args.currency,
        holderAccount,
        tokenAccount,
        mint: args.mint,
        metadata,
        owner: args.owner,
        payer: args.payer,
        sysvarInstructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      },
      programId
    ),
  ];

  return {
    ...createCtx(instructions),
    holderAccount,
  };
}

type CreateHolderAccountArgs = {
  currency: HplCurrency;
  owner?: web3.PublicKey;
  programId?: web3.PublicKey;
};
export async function createHolderAccount(
  honeycomb: Honeycomb,
  args: CreateHolderAccountArgs
): Promise<ConfirmedContext & { holderAccount: web3.PublicKey }> {
  const ctx = createCreateHolderAccountCtx({
    currencyKind: args.currency.kind,
    currency: args.currency.address,
    mint: args.currency.mint,
    owner: args.owner || honeycomb.identity().publicKey,
    payer: honeycomb.identity().publicKey,
    programId: args.programId,
  });

  return {
    ...(await honeycomb.rpc().sendAndConfirmTransaction(ctx)),
    holderAccount: ctx.holderAccount,
  };
}
