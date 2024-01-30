import { Honeycomb, Module } from "@honeycomb-protocol/hive-control";
import { PROGRAM_ID } from "./generated";

// Extend the Honeycomb interface to include HplResourceManager related functions
declare module "@honeycomb-protocol/hive-control" {
  interface Honeycomb {
    resource: HplResourceManager;
  }
}

/**
 * HplResourceManager class represents a Payment structure managed by the Honeycomb protocol.
 * @category Modules
 */
export class HplResourceManager extends Module {
  readonly programId = PROGRAM_ID;

  constructor() {
    super();
  }

  /**
   * Installs the HplResourceManager in the given Honeycomb instance.
   * @param honeycomb The Honeycomb instance to install the HplResourceManager.
   */
  public install(honeycomb: Honeycomb): Honeycomb {
    return honeycomb;
  }
}

export class CreateHplResourceManager {
  constructor() {}

  public install(honeycomb: Honeycomb): Honeycomb {
    return honeycomb;
  }
}
