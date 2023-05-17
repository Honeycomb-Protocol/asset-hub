import * as web3 from "@solana/web3.js";
import {
  ConfirmedContext,
  HIVECONTROL_PROGRAM_ID,
  Honeycomb,
  OperationCtx,
  VAULT,
  createCtx,
} from "@honeycomb-protocol/hive-control";
import { createMintCurrencyInstruction, PROGRAM_ID } from "../generated";
import { HplHolderAccount } from "../HplCurrency";

type CreateMintCurrencyCtxArgs = {
  amount: number;
  project: web3.PublicKey;
  currency: web3.PublicKey;
  mint: web3.PublicKey;
  holderAccount: web3.PublicKey;
  tokenAccount: web3.PublicKey;
  delegateAuthority?: web3.PublicKey;
  authority: web3.PublicKey;
  payer: web3.PublicKey;
  programId?: web3.PublicKey;
};
export function createMintCurrencyCtx(
  args: CreateMintCurrencyCtxArgs
): OperationCtx {
  const programId = args.programId || PROGRAM_ID;

  const instructions = [
    createMintCurrencyInstruction(
      {
        currency: args.currency,
        holderAccount: args.holderAccount,
        mint: args.mint,
        tokenAccount: args.tokenAccount,
        project: args.project,
        delegateAuthority: args.delegateAuthority || programId,
        authority: args.authority,
        payer: args.payer,
        vault: VAULT,
        hiveControlProgram: HIVECONTROL_PROGRAM_ID,
      },
      {
        amount: args.amount,
      },
      programId
    ),
  ];

  return createCtx(instructions);
}

type MintCurrencyArgs = {
  amount: number;
  holderAccount: HplHolderAccount;
  programId?: web3.PublicKey;
};
export async function mintCurrency(
  honeycomb: Honeycomb,
  args: MintCurrencyArgs
): Promise<ConfirmedContext> {
  const ctx = createMintCurrencyCtx({
    amount: args.amount,
    project: args.holderAccount.currency().project().address,
    currency: args.holderAccount.currency().address,
    mint: args.holderAccount.currency().mint,
    holderAccount: args.holderAccount.address,
    tokenAccount: args.holderAccount.tokenAccount,
    delegateAuthority: honeycomb.identity().delegateAuthority().address,
    authority: honeycomb.identity().publicKey,
    payer: honeycomb.identity().publicKey,
    programId: args.programId,
  });

  return honeycomb.rpc().sendAndConfirmTransaction(ctx);
}
