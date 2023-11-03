import { CreateClient, CreateModule } from "@honeycomb-protocol/hive-control";
import { ConfirmOptions, Keypair, PublicKey } from "@solana/web3.js";
import { CreateCurrencyArgs, PROGRAM_ID } from "../generated";
import {
  createCreateCurrencyOperation,
  createCreateHolderAccountOperation,
} from "../operations";
import { HplCurrency } from "..";

/**
 * Extends the CreateModule interface with the `currencyManager` method to access the CurrencyManagerCreateClient.
 */
declare module "@honeycomb-protocol/hive-control" {
  interface CreateModule {
    currencyManager(): CurrencyManagerCreateClient;
  }
}

/**
 * Represents the Fetch Module which contains boiler plates for creating HiveControl accounts.
 * @category Modules
 */
export class CurrencyManagerCreateClient extends CreateClient {
  /**
   * Creates a new instance of the CurrencyManagerCreateClient.
   */
  constructor() {
    super();
  }

  /**
   * Creates a new Currrency.
   * @param args The arguments for creating the currency.
   * @param confirmOptions Optional confirm options for the transaction.
   */
  async currency(
    args:
      | CreateCurrencyArgs
      | {
          mint: PublicKey;
          mintAuthority: PublicKey | Keypair;
          freezeAuthority: PublicKey | Keypair;
        },
    confirmOptions?: ConfirmOptions
  ) {
    const { currency, operation } = await createCreateCurrencyOperation(
      this.honeycomb(),
      {
        args,
        project: this.honeycomb().project(),
        programId: PROGRAM_ID,
      }
    );

    const [context] = await operation.send(confirmOptions);
    return {
      currency,
      context,
    };
  }

  /**
   * Creates a new holder account for the given owner.
   * @param currency The `HplCurrency` instance to create the holder account for.
   * @param owner The owner of the holder account.
   * @param confirmOptions Optional confirm options for the transaction.
   */
  public async holderAccount(
    currency: HplCurrency,
    owner: PublicKey,
    confirmOptions?: ConfirmOptions
  ) {
    const { operation, holderAccount, tokenAccount } =
      await createCreateHolderAccountOperation(this.honeycomb(), {
        currency,
        owner: owner,
        runAllways: true,
        programId: currency.programId,
      });
    const [context] = await operation.send(confirmOptions);
    return {
      holderAccount,
      tokenAccount,
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
    createModule.currencyManager = () => this;
    return createModule;
  }
}

/**
 * Factory function to create a new instance of the CurrencyManagerCreateClient.
 * @category Factory
 * @returns A new instance of the CurrencyManagerCreateClient.
 */
export const currencyManagerCreate = () => new CurrencyManagerCreateClient();
