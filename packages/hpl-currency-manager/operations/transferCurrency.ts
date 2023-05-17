import * as web3 from "@solana/web3.js";
import {
  ConfirmedContext,
  Honeycomb,
  OperationCtx,
  createCtx,
} from "@honeycomb-protocol/hive-control";
import { createTransferCurrencyInstruction, PROGRAM_ID } from "../generated";
import { HplHolderAccount } from "../HplCurrency";

type CreateTransferCurrencyCtxArgs = {
  amount: number;
  currency: web3.PublicKey;
  mint: web3.PublicKey;
  senderHolderAccount: web3.PublicKey;
  senderTokenAccount: web3.PublicKey;
  receiverHolderAccount: web3.PublicKey;
  receiverTokenAccount: web3.PublicKey;
  owner: web3.PublicKey;
  programId?: web3.PublicKey;
};
export function createTransferCurrencyCtx(
  args: CreateTransferCurrencyCtxArgs
): OperationCtx {
  const programId = args.programId || PROGRAM_ID;

  const instructions = [
    createTransferCurrencyInstruction(
      {
        currency: args.currency,
        mint: args.mint,
        senderHolderAccount: args.senderHolderAccount,
        senderTokenAccount: args.senderTokenAccount,
        receiverHolderAccount: args.receiverHolderAccount,
        receiverTokenAccount: args.receiverTokenAccount,
        owner: args.owner,
      },
      {
        amount: args.amount,
      },
      programId
    ),
  ];

  return createCtx(instructions);
}

type TransferCurrencyArgs = {
  amount: number;
  from: HplHolderAccount;
  to: HplHolderAccount;
  programId?: web3.PublicKey;
};
export async function transferCurrency(
  honeycomb: Honeycomb,
  args: TransferCurrencyArgs
): Promise<ConfirmedContext> {
  const ctx = createTransferCurrencyCtx({
    amount: args.amount,
    currency: args.from.currency().address,
    mint: args.from.currency().mint,
    senderHolderAccount: args.from.address,
    senderTokenAccount: args.from.tokenAccount,
    receiverHolderAccount: args.to.address,
    receiverTokenAccount: args.to.tokenAccount,
    owner: honeycomb.identity().publicKey,
    programId: args.programId,
  });

  return honeycomb.rpc().sendAndConfirmTransaction(ctx);
}
