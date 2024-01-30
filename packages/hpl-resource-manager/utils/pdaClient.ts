import { PublicKey } from "@solana/web3.js";
import { PdaClient, PdaModule } from "@honeycomb-protocol/hive-control";
import { PROGRAM_ID } from "../generated";

/**
 * Extends the Honeycomb interface with the `pda` method to access the ResourceManagerPdaClient.
 */
declare module "@honeycomb-protocol/hive-control" {
  interface PdaModule {
    resourceManager: () => ResourceManagerPdaClient;
  }
}

/**
 * Represents the Fetch Module which contains boiler plates for pda generations.
 * @category Modules
 */
export class ResourceManagerPdaClient extends PdaClient {
  readonly defaultProgramId = PROGRAM_ID;

  /**
   * Creates a new instance of the ResourceManagerPdaClient.
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
    pdaModule.resourceManager = () => this;
    return pdaModule;
  }

  /**
   * Generates a PDA for the currency program based on the given `mint`.
   * @category Helpers
   * @param mint The mint public key.
   * @param programId The program ID of the currency program (optional, default is PROGRAM_ID).
   * @returns The generated PDA address for the currency program.
   */
  resource(
    project: PublicKey,
    mint: PublicKey,
    programId = this.defaultProgramId
  ) {
    return PdaModule.findProgramAddressSyncWithSeeds(
      [Buffer.from("resource"), project.toBuffer(), mint.toBuffer()],
      programId
    );
  }
}
/**
 * Factory function to create a new instance of the ResourceManagerPdaClient.
 * @category Factory
 * @returns A new instance of the ResourceManagerPdaClient.
 */
export const resourceManagerPdas = () => new ResourceManagerPdaClient();
