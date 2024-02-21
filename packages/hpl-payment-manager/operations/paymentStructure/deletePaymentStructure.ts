import * as web3 from "@solana/web3.js";
import { Honeycomb, Operation } from "@honeycomb-protocol/hive-control";
import {
  createDeletePaymentStructureInstruction,
  PROGRAM_ID,
} from "../../generated";

/**
 * Represents the arguments for creating a "Delete Payment Structure" operation.
 * @category Types
 */
type DeletePaymentStructureOperationArgs = {
  paymentStructure: web3.PublicKey;
  programId?: web3.PublicKey;
};

export async function createDeletePaymentStructureOperation(
  honeycomb: Honeycomb,
  args: DeletePaymentStructureOperationArgs
) {
  // If programId is not provided, use the default PROGRAM_ID.
  const programId = args.programId || PROGRAM_ID;

  // Create the instruction for the "Delete Payment Structure" operation based on provided arguments.
  const instructions = [
    createDeletePaymentStructureInstruction(
      {
        paymentStructure: args.paymentStructure,
        authority: honeycomb.identity().address,
        benificiary: honeycomb.identity().address,
        clockSysvar: web3.SYSVAR_CLOCK_PUBKEY,
      },
      programId
    ),
  ];

  // Return the "Delete Payment Structure" operation wrapped in an object, along with the currency address.
  return {
    operation: new Operation(honeycomb, instructions),
  };
}
