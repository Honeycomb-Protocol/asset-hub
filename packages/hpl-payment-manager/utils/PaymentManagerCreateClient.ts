import { CreateClient, CreateModule } from "@honeycomb-protocol/hive-control";
import { ConditionalPayment, PROGRAM_ID } from "../generated";
import { ConfirmOptions, PublicKey } from "@solana/web3.js";
import { createCreatePaymentStructureOperation } from "../operations";
import { createStartPaymentSessionOperation } from "..";

/**
 * Extends the CreateModule interface with the `paymentManager` method to access the PaymentManagerCreateClient.
 */
declare module "@honeycomb-protocol/hive-control" {
  interface CreateModule {
    paymentManager(): PaymentManagerCreateClient;
  }
}

/**
 * Represents the Fetch Module which contains boiler plates for creating HiveControl accounts.
 * @category Modules
 */
export class PaymentManagerCreateClient extends CreateClient {
  /**
   * Creates a new instance of the PaymentManagerCreateClient.
   */
  constructor() {
    super();
  }

  /**
   * Creates a new HplPaymentStructure account.
   * @param args The arguments for creating the currency.
   * @param confirmOptions Optional confirm options for the transaction.
   */
  async structure(
    payments: ConditionalPayment,
    confirmOptions?: ConfirmOptions
  ) {
    const { paymentStructure, operation } =
      await createCreatePaymentStructureOperation(this.honeycomb(), {
        args: {
          payments,
        },
        programId: PROGRAM_ID,
      });
    const [context] = await operation.send(confirmOptions);
    return {
      paymentStructure,
      context,
    };
  }

  /**
   * Creates a new HplPaymentStructure account.
   * @param args The arguments for creating the currency.
   * @param confirmOptions Optional confirm options for the transaction.
   */
  async session(structure: PublicKey, confirmOptions?: ConfirmOptions) {
    const { operation, paymentSession } =
      await createStartPaymentSessionOperation(this.honeycomb(), {
        paymentStructure: structure,
      });
    const [context] = await operation.send(confirmOptions);
    return {
      paymentSession,
      context,
    };
  }

  /**
   * Installs the CreateClient into the Create Module instance.
   *
   * @param createModule - The Create Module instance to install the module into.
   * @returns The modified Create Module instance with the CreateClient installed.
   */
  public install(createModule: CreateModule) {
    this._createModule = createModule;
    createModule.paymentManager = () => this;
    return createModule;
  }
}

/**
 * Factory function to create a new instance of the PaymentManagerCreateClient.
 * @category Factory
 * @returns A new instance of the PaymentManagerCreateClient.
 */
export const paymentManagerCreate = () => new PaymentManagerCreateClient();
