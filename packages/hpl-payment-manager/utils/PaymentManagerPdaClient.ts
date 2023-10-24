import { PublicKey } from "@solana/web3.js";
import { PdaClient, PdaModule } from "@honeycomb-protocol/hive-control";
import { PROGRAM_ID } from "../generated";

/**
 * Extends the Honeycomb interface with the `pda` method to access the PaymentManagerPdaClient.
 */
declare module "@honeycomb-protocol/hive-control" {
  interface PdaModule {
    paymentManager: () => PaymentManagerPdaClient;
  }
}

/**
 * Represents the Pda Client which contains boiler plates for pda generations.
 * @category Modules
 */
export class PaymentManagerPdaClient extends PdaClient {
  readonly defaultProgramId = PROGRAM_ID;

  /**
   * Creates a new instance of the PaymentManagerPdaClient.
   */
  constructor() {
    super();
  }

  /**
   * Install this client in the PdaModule.
   * Every derived module class must implement this method.
   * @param pdaModule The PdaModule instance to install the client in.
   * @returns The updated PdaModule instance with the installed client.
   */
  public install(pdaModule: PdaModule): PdaModule {
    pdaModule.paymentManager = () => this;
    return pdaModule;
  }

  /**
   * Generates a PDA for the paymentStructure based on the given `mint`.
   * @category Helpers
   * @param uniqueKey The unique key.
   * @param programId The program ID of the payment manager program (optional, default is PROGRAM_ID).
   * @returns The generated PDA address for the paymentStructure.
   */
  paymentStructure(uniqueKey: PublicKey, programId = this.defaultProgramId) {
    return PdaModule.findProgramAddressSyncWithSeeds(
      [Buffer.from("payment_structure"), uniqueKey.toBuffer()],
      programId
    );
  }

  /**
   * Generates a PDA for the paymentSession based on the given `mint`.
   * @category Helpers
   * @param paymentStructure The payment structure public key.
   * @param payer The payer public key.
   * @param programId The program ID of the payment manager program (optional, default is PROGRAM_ID).
   * @returns The generated PDA address for the paymentSession.
   */
  paymentSession(
    paymentStructure: PublicKey,
    payer: PublicKey,
    programId = this.defaultProgramId
  ) {
    return PdaModule.findProgramAddressSyncWithSeeds(
      [
        Buffer.from("payment_session"),
        paymentStructure.toBuffer(),
        payer.toBuffer(),
      ],
      programId
    );
  }
}

/**
 * Factory function to create a new instance of the PaymentManagerPdaClient.
 * @category Factory
 * @returns A new instance of the PaymentManagerPdaClient.
 */
export const paymentManagerPdas = () => new PaymentManagerPdaClient();
