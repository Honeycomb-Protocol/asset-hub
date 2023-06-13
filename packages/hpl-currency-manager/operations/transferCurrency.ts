import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import { Honeycomb, Operation, VAULT } from "@honeycomb-protocol/hive-control";
import { createTransferCurrencyInstruction, PROGRAM_ID } from "../generated";
import { HplHolderAccount } from "../HplCurrency";
import { holderAccountPdas } from "../utils";
import { createCreateHolderAccountOperation } from "./createHolderAccount";

type CreateTransferCurrencyOperationArgs = {
  amount: number;
  holderAccount: HplHolderAccount;
  receiver: web3.PublicKey | HplHolderAccount;
  programId?: web3.PublicKey;
};
export async function createTransferCurrencyOperation(
  honeycomb: Honeycomb,
  args: CreateTransferCurrencyOperationArgs
) {
  const programId = args.programId || PROGRAM_ID;

  const instructions: web3.TransactionInstruction[] = [];

  let receiverHolderAccount: web3.PublicKey,
    receiverTokenAccount: web3.PublicKey;

  if (args.receiver instanceof web3.PublicKey) {
    const accounts = holderAccountPdas(
      args.receiver,
      args.holderAccount.currency().mint.address,
      args.holderAccount.currency().kind,
      splToken.TOKEN_PROGRAM_ID,
      programId
    );
    receiverHolderAccount = accounts.holderAccount;
    receiverTokenAccount = accounts.tokenAccount;

    try {
      await args.holderAccount.currency().holderAccount(args.receiver);
    } catch {
      instructions.unshift(
        ...(await createCreateHolderAccountOperation(honeycomb, {
          currency: args.holderAccount.currency(),
          owner: args.receiver,
          programId,
        }).then(({ operation }) => operation.instructions))
      );
    }
  } else {
    receiverHolderAccount = args.receiver.address;
    receiverTokenAccount = args.receiver.tokenAccount;
  }

  instructions.push(
    createTransferCurrencyInstruction(
      {
        project: args.holderAccount.currency().project().address,
        currency: args.holderAccount.currency().address,
        mint: args.holderAccount.currency().mint.address,
        senderHolderAccount: args.holderAccount.address,
        senderTokenAccount: args.holderAccount.tokenAccount,
        receiverHolderAccount,
        receiverTokenAccount,
        authority: honeycomb.identity().address,
        owner: honeycomb.identity().address,
        vault: VAULT,
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      },
      {
        amount: args.amount,
      },
      programId
    )
  );

  return {
    operation: new Operation(honeycomb, instructions),
  };
}
