import * as web3 from "@solana/web3.js";
import { Honeycomb, Operation } from "@honeycomb-protocol/hive-control";
import {
  createClosePaymentSessionInstruction,
  PROGRAM_ID,
} from "../../generated";
import { HPL_EVENTS_PROGRAM } from "@honeycomb-protocol/events";

/**
 * Represents the arguments for creating a "Create Payment Session" operation.
 * @category Types
 */
type ClosePaymentSessionOperationArgs = {
  paymentStructure: web3.PublicKey;
  paymentSession: web3.PublicKey;
  payer?: web3.PublicKey;
  programId?: web3.PublicKey;
};

export async function createClosePaymentSessionOperation(
  honeycomb: Honeycomb,
  args: ClosePaymentSessionOperationArgs
) {
  // If programId is not provided, use the default PROGRAM_ID.
  const programId = args.programId || PROGRAM_ID;

  // Create the instruction for the "Create Payment Session" operation based on provided arguments.
  const instructions = [
    createClosePaymentSessionInstruction(
      {
        paymentStructure: args.paymentStructure,
        paymentSession: args.paymentSession,
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
  };
}
