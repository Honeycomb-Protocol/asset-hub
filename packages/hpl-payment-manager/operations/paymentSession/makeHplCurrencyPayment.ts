import * as web3 from "@solana/web3.js";
import {
  HPL_HIVE_CONTROL_PROGRAM,
  Honeycomb,
  Operation,
  VAULT,
} from "@honeycomb-protocol/hive-control";
import {
  createMakeHplCurrencyPaymentInstruction,
  PROGRAM_ID,
} from "../../generated";
import { HPL_EVENTS_PROGRAM } from "@honeycomb-protocol/events";
import { HplPayment } from "../..";
import {
  HPL_CURRENCY_MANAGER_PROGRAM,
  createCreateHolderAccountOperation,
} from "@honeycomb-protocol/currency-manager";

/**
 * Represents the arguments for creating a "Create Payment Session" operation.
 * @category Types
 */
type MakeHplCurrencyPaymentOperationArgs = {
  payment: HplPayment;
  doNotCheckAccounts?: boolean;
  programId?: web3.PublicKey;
};

export async function createMakeHplCurrencyPaymentOperation(
  honeycomb: Honeycomb,
  args: MakeHplCurrencyPaymentOperationArgs
) {
  // If programId is not provided, use the default PROGRAM_ID.
  const programId = args.programId || PROGRAM_ID;

  const [paymentSession] = honeycomb
    .pda()
    .paymentManager()
    .paymentSession(
      args.payment.conditional.paymentStructure.address,
      honeycomb.identity().address,
      programId
    );

  // Create the instruction for the "Create Payment Session" operation based on provided arguments.
  const instructions = [];

  if (args.payment.isHplCurrency()) {
    const { holderAccount, tokenAccount } = honeycomb
      .pda()
      .currencyManager()
      .holderAccountWithTokenAccount(
        honeycomb.identity().address,
        args.payment.currency.mint.address,
        args.payment.currency.kind
      );

    let beneficiary = programId,
      beneficiaryHolderAccount = programId,
      beneficiaryTokenAccount = programId;

    if (args.payment.beneficiary) {
      beneficiary = args.payment.beneficiary;
      const { holderAccount, tokenAccount } = honeycomb
        .pda()
        .currencyManager()
        .holderAccountWithTokenAccount(
          honeycomb.identity().address,
          args.payment.currency.mint.address,
          args.payment.currency.kind
        );
      (beneficiaryHolderAccount = holderAccount),
        (beneficiaryTokenAccount = tokenAccount);

      if (args.doNotCheckAccounts !== false) {
        try {
          await args.payment.currency.holderAccount(
            honeycomb.identity().address
          );
        } catch {
          instructions.push(
            ...(await createCreateHolderAccountOperation(honeycomb, {
              currency: args.payment.currency,
              owner: honeycomb.identity().address,
            }).then(({ operation }) => operation.instructions))
          );
        }
      }
    }

    createMakeHplCurrencyPaymentInstruction(
      {
        paymentStructure: args.payment.conditional.paymentStructure.address,
        paymentSession,
        project: args.payment.currency.project().address,
        currency: args.payment.currency.address,
        mint: args.payment.currency.mint.address,
        holderAccount,
        tokenAccount,
        beneficiary,
        beneficiaryHolderAccount,
        beneficiaryTokenAccount,
        vault: VAULT,
        payer: honeycomb.identity().address,
        hiveControl: HPL_HIVE_CONTROL_PROGRAM,
        hplCurrencyManager: HPL_CURRENCY_MANAGER_PROGRAM,
        hplEvents: HPL_EVENTS_PROGRAM,
        clockSysvar: web3.SYSVAR_CLOCK_PUBKEY,
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      },
      {
        args: {
          path: Uint8Array.from(args.payment.path),
        },
      },
      programId
    );
  } else {
    throw new Error("Not implemented");
  }

  // Return the "Create Payment Session" operation wrapped in an object, along with the currency address.
  return {
    operation: new Operation(honeycomb, instructions),
    paymentSession,
  };
}
