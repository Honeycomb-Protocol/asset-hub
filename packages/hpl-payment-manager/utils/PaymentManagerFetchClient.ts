import { Commitment, PublicKey } from "@solana/web3.js";
import { FetchModule, FetchClient } from "@honeycomb-protocol/hive-control";
import { PaymentSession, PaymentStructure } from "../generated";

/**
 * Extends the Honeycomb interface with the `fetch` method to access the PaymentManagerFetchClient.
 */
declare module "@honeycomb-protocol/hive-control" {
  interface FetchModule {
    paymentManager(): PaymentManagerFetchClient;
  }
}

/**
 * Represents the Fetch Module which contains boiler plates for fetching HiveControl accounts.
 * @category Modules
 */
export class PaymentManagerFetchClient extends FetchClient {
  /**
   * Creates a new instance of the PaymentManagerFetchClient.
   */
  constructor() {
    super();
  }

  /**
   * Fetches payment structure given address.
   * @param honeycomb The Honeycomb instance.
   * @param args The arguments for creating the currency.
   * @param confirmOptions Optional confirm options for the transaction.
   */
  public async structure(
    address: PublicKey,
    commitment: Commitment = "processed",
    forceFetch: boolean = false
  ): Promise<PaymentStructure | null> {
    try {
      return PaymentStructure.fromAccountInfo(
        await this.getAccount(address, {
          forceFetch,
          commitment,
        })
      )[0];
    } catch {
      return null;
    }
  }

  /**
   * Fetches payment sessioon given address.
   * @param honeycomb The Honeycomb instance.
   * @param args The arguments for creating the currency.
   * @param confirmOptions Optional confirm options for the transaction.
   */
  public async session(
    address: PublicKey,
    commitment: Commitment = "processed",
    forceFetch: boolean = false
  ): Promise<PaymentSession | null> {
    try {
      return PaymentSession.fromAccountInfo(
        await this.getAccount(address, {
          forceFetch,
          commitment,
        })
      )[0];
    } catch {
      return null;
    }
  }

  /**
   * Installs the PaymentManagerFetchClient into the FetchModule instance.
   *
   * @param fetchModule - The FetchModule instance to install the module into.
   * @returns The modified FetchModule instance with the PaymentManagerFetchClient installed.
   */
  public install(fetchModule: FetchModule): FetchModule {
    this._fetchModule = fetchModule;
    fetchModule.paymentManager = () => this;
    return fetchModule;
  }
}

/**
 * Factory function to create a new instance of the PaymentManagerFetchClient.
 * @category Factory
 * @returns A new instance of the PaymentManagerFetchClient.
 */
export const paymentManagerFetch = () => new PaymentManagerFetchClient();
