import * as web3 from "@solana/web3.js";
import { Honeycomb, Operation } from "@honeycomb-protocol/hive-control";
import {
  createCreatePaymentStructureInstruction,
  CreatePaymentStructureArgs,
  PROGRAM_ID,
} from "../../generated";
import { HPL_EVENTS_PROGRAM } from "@honeycomb-protocol/events";

/**
 * Represents the arguments for creating a "Create Payment Structure" operation.
 * @category Types
 */
type CreatePaymentStructureOperationArgs = {
  args: CreatePaymentStructureArgs;
  uniqueKey?: web3.PublicKey;
  programId?: web3.PublicKey;
};

export async function createCreatePaymentStructureOperation(
  honeycomb: Honeycomb,
  args: CreatePaymentStructureOperationArgs
) {
  // If programId is not provided, use the default PROGRAM_ID.
  const programId = args.programId || PROGRAM_ID;

  const uniqueKey = args.uniqueKey || web3.Keypair.generate().publicKey;

  const [paymentStructure] = honeycomb
    .pda()
    .paymentManager()
    .paymentStructure(uniqueKey, programId);

  // Create the instruction for the "Create Payment Structure" operation based on provided arguments.
  const instructions = [
    createCreatePaymentStructureInstruction(
      {
        unique: uniqueKey,
        paymentStructure,
        authority: honeycomb.identity().address,
        payer: honeycomb.identity().address,
        hplEvents: HPL_EVENTS_PROGRAM,
        clockSysvar: web3.SYSVAR_CLOCK_PUBKEY,
      },
      {
        args: args.args,
      },
      programId
    ),
  ];

  // Return the "Create Payment Structure" operation wrapped in an object, along with the currency address.
  return {
    operation: new Operation(honeycomb, instructions),
    paymentStructure,
  };
}
