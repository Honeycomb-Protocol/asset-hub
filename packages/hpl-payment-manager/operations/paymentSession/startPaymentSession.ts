import * as web3 from "@solana/web3.js";
import { Honeycomb, Operation } from "@honeycomb-protocol/hive-control";
import {
  createStartPaymentSessionInstruction,
  PROGRAM_ID,
} from "../../generated";
import { HPL_EVENTS_PROGRAM } from "@honeycomb-protocol/events";

/**
 * Represents the arguments for creating a "Create Payment Session" operation.
 * @category Types
 */
type StartPaymentSessionOperationArgs = {
  paymentStructure: web3.PublicKey;
  payer?: web3.PublicKey;
  programId?: web3.PublicKey;
};

export async function createStartPaymentSessionOperation(
  honeycomb: Honeycomb,
  args: StartPaymentSessionOperationArgs
) {
  // If programId is not provided, use the default PROGRAM_ID.
  const programId = args.programId || PROGRAM_ID;

  const [paymentSession] = honeycomb
    .pda()
    .paymentManager()
    .paymentSession(
      args.paymentStructure,
      args.payer || honeycomb.identity().address,
      programId
    );

  // Create the instruction for the "Create Payment Session" operation based on provided arguments.
  const instructions = [
    createStartPaymentSessionInstruction(
      {
        paymentStructure: args.paymentStructure,
        paymentSession,
        payer: args.payer || honeycomb.identity().address,
        hplEvents: HPL_EVENTS_PROGRAM,
        clockSysvar: web3.SYSVAR_CLOCK_PUBKEY,
      },
      programId
    ),
  ];

  // Return the "Create Payment Session" operation wrapped in an object, along with the currency address.
  return {
    operation: new Operation(honeycomb, instructions),
    paymentSession,
  };
}
