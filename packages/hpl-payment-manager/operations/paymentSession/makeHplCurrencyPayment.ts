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
import { HplPayment, HplPaymentStructure } from "../..";
import {
  HPL_CURRENCY_MANAGER_PROGRAM,
  createCreateHolderAccountOperation,
} from "@honeycomb-protocol/currency-manager";

/**
 * Represents the arguments for creating a "Create Payment Session" operation.
 * @category Types
 */
type MakeHplCurrencyPaymentOperationArgs = {
  paymentStructure: HplPaymentStructure;
  payment: HplPayment;
  payer?: web3.PublicKey;
  doNotCheckAccounts?: boolean;
  programId?: web3.PublicKey;
};

export async function createMakeHplCurrencyPaymentOperation(
  honeycomb: Honeycomb,
  args: MakeHplCurrencyPaymentOperationArgs
) {
  // If programId is not provided, use the default PROGRAM_ID.
  const programId = args.programId || PROGRAM_ID;

  const payer = args.payer || honeycomb.identity().address;
  const [paymentSession] = honeycomb
    .pda()
    .paymentManager()
    .paymentSession(args.paymentStructure.address, payer, programId);

  // Create the instruction for the "Create Payment Session" operation based on provided arguments.
  const instructions = [];

  if (args.payment.isHplCurrency()) {
    const currency = honeycomb.currency(args.payment.currency);
    const { holderAccount, tokenAccount } = honeycomb
      .pda()
      .currencyManager()
      .holderAccountWithTokenAccount(
        payer,
        currency.mint.address,
        currency.kind
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
          beneficiary,
          currency.mint.address,
          currency.kind
        );
      (beneficiaryHolderAccount = holderAccount),
        (beneficiaryTokenAccount = tokenAccount);

      if (args.doNotCheckAccounts !== false) {
        try {
          await currency.holderAccount(beneficiary);
        } catch {
          instructions.push(
            ...(await createCreateHolderAccountOperation(honeycomb, {
              currency,
              owner: beneficiary,
            }).then(({ operation }) => operation.instructions))
          );
        }
      }
    }

    instructions.push(
      createMakeHplCurrencyPaymentInstruction(
        {
          paymentStructure: args.paymentStructure.address,
          paymentSession,
          project: currency.project().address,
          currency: currency.address,
          mint: currency.mint.address,
          holderAccount,
          tokenAccount,
          beneficiary,
          beneficiaryHolderAccount,
          beneficiaryTokenAccount,
          vault: VAULT,
          payer,
          hiveControl: HPL_HIVE_CONTROL_PROGRAM,
          hplCurrencyManager: HPL_CURRENCY_MANAGER_PROGRAM,
          clockSysvar: web3.SYSVAR_CLOCK_PUBKEY,
          instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        },
        {
          args: {
            path: Uint8Array.from(args.payment.path),
          },
        },
        programId
      )
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
