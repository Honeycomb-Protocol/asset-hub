import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import { createFundAccountInstruction, PROGRAM_ID } from "../generated";
import { holderAccountPdas } from "../utils";
import { Honeycomb, Operation, VAULT } from "@honeycomb-protocol/hive-control";
import { HplCurrency } from "../HplCurrency";
import { createCreateHolderAccountOperation } from "./createHolderAccount";

type CreateFundAccountOperationArgs = {
  amount: number;
  currency: HplCurrency;
  receiverWallet: web3.PublicKey;
  programId?: web3.PublicKey;
};
export async function createFundAccountOperation(
  honeycomb: Honeycomb,
  args: CreateFundAccountOperationArgs
) {
  const programId = args.programId || PROGRAM_ID;

  const sourceTokenAccount = splToken.getAssociatedTokenAddressSync(
    args.currency.mint,
    honeycomb.identity().address
  );
  const { holderAccount, tokenAccount } = holderAccountPdas(
    args.receiverWallet,
    args.currency.mint,
    args.currency.kind,
    splToken.TOKEN_PROGRAM_ID,
    programId
  );

  const instructions = [
    createFundAccountInstruction(
      {
        project: args.currency.project().address,
        currency: args.currency.address,
        mint: args.currency.mint,
        holderAccount,
        tokenAccount,
        sourceTokenAccount,
        authority: honeycomb.identity().address,
        wallet: honeycomb.identity().address,
        vault: VAULT,
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      },
      {
        amount: args.amount,
      },
      programId
    ),
  ];

  try {
    await args.currency.holderAccount(args.receiverWallet);
  } catch {
    instructions.unshift(
      ...(await createCreateHolderAccountOperation(honeycomb, {
        currency: args.currency,
        owner: args.receiverWallet,
        programId,
      }).then(({ operation }) => operation.instructions))
    );
  }

  return {
    operation: new Operation(honeycomb, instructions),
    holderAccount,
  };
}
