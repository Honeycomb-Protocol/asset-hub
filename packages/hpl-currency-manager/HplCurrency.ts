import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import {
  Honeycomb,
  HoneycombProject,
  Module,
  isPublicKey,
} from "@honeycomb-protocol/hive-control";
import {
  CreateCurrencyArgs,
  Currency,
  PROGRAM_ID,
  UpdateCurrencyArgs,
} from "./generated";
import {
  currencyManagerFetch,
  currencyManagerPdas,
  currencyManagerCreate,
  metadataPda,
} from "./utils";
import { createUpdateCurrencyOperation } from "./operations";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { HplHolderAccount } from ".";

// Extend the Honeycomb interface to include HplCurrency related functions
declare module "@honeycomb-protocol/hive-control" {
  interface Honeycomb {
    _currencies: { [key: string]: HplCurrency };
    currency(key?: string | web3.PublicKey): HplCurrency;
  }
}

/**
 * HplCurrency class represents a in-game currency managed by the Honeycomb protocol.
 * @category Modules
 */
export class HplCurrency extends Module<
  string,
  { holderAccount: HplHolderAccount }
> {
  readonly programId = PROGRAM_ID;

  private _uriData: any = undefined;

  constructor(
    readonly address: web3.PublicKey,
    private _currency: Currency,
    private _mint: splToken.Mint,
    private _metadata: Metadata
  ) {
    super();
  }

  /**
   * Creates an HplCurrency instance from the given address.
   * @param honeycomb The `Honeycomb` instance.
   * @param address The address of the currency.
   */
  static async fromAddress(
    honeycomb: Honeycomb,
    address: web3.PublicKey,
    commitment: web3.Commitment = "processed"
  ) {
    honeycomb.fetch().register(currencyManagerFetch());
    const { currency, mint, metadata } = await honeycomb
      .fetch()
      .currencyManager()
      .currencyWithDeps(address, commitment);
    return new HplCurrency(address, currency, mint, metadata);
  }

  /**
   * Creates a new HplCurrency instance.
   * @param honeycomb The Honeycomb instance.
   * @param args The arguments for creating the currency.
   * @param confirmOptions Optional confirm options for the transaction.
   */
  static async new(
    honeycomb: Honeycomb,
    args:
      | CreateCurrencyArgs
      | {
          mint: web3.PublicKey;
          mintAuthority: web3.PublicKey | web3.Keypair;
          freezeAuthority: web3.PublicKey | web3.Keypair;
        },
    confirmOptions?: web3.ConfirmOptions
  ) {
    honeycomb.pda().register(currencyManagerPdas());
    honeycomb.create().register(currencyManagerCreate());
    const { currency } = await honeycomb
      .create()
      .currencyManager()
      .currency(args, confirmOptions);
    return await HplCurrency.fromAddress(honeycomb, currency);
  }

  /**
   * Gets the name of the currency.
   */
  public get name() {
    return this._metadata.data.name.slice(
      0,
      this._metadata.data.name.lastIndexOf(
        (
          [
            ...this._metadata.data.name.matchAll(/[a-zA-Z0-9]/g),
          ] as unknown as string[]
        ).slice(-1)[0]
      ) + 1
    );
  }

  /**
   * Gets the symbol of the currency.
   */
  public get symbol() {
    return this._metadata.data.symbol;
  }

  /**
   * Gets the URI of the currency.
   */
  public get uri() {
    return this._metadata.data.uri;
  }

  /**
   * Gets the underlying mint of the currency.
   */
  public get mint() {
    return this._mint;
  }

  /**
   * Gets the kind of the currency.
   */
  public get kind() {
    return this._currency.kind;
  }

  /**
   * Fetches URI data for the currency.
   * @param reFetch Set to true to force re-fetching of the data.
   */
  public async uriData(reFetch = false) {
    if (!this._uriData || reFetch) {
      this._uriData = await fetch(this.uri, {
        method: "GET",
        redirect: "follow",
      }).then((e) => e.json());
    }
    return this._uriData;
  }

  /**
   * Gets the Honeycomb instance.
   */
  public honeycomb() {
    return this._honeycomb;
  }

  /**
   * Gets the associated HoneycombProject.
   */
  public project() {
    return this.honeycomb().project(this._currency.project);
  }

  /**
   * Gets the holder account for the given owner.
   * @param owner The owner of the holder account. If not provided, uses the identity address.
   * @param commitment The Solana block commitment.
   * @param reFetch Set to true to force re-fetching of the holder account data.
   */
  public async holderAccount(
    owner?: web3.PublicKey,
    commitment: web3.Commitment = "processed",
    reFetch = false
  ) {
    if (!owner) owner = this.honeycomb().identity().address;
    return this.cache.getOrFetch(
      "holderAccount",
      owner.toString(),
      () => HplHolderAccount.of(this, owner, commitment, reFetch),
      reFetch
    );
  }

  /**
   * Creates a new holder account for the given wallet.
   * @param wallet The owner of the holder account. If not provided, uses the identity address.
   * @param confirmOptions Optional confirm options for the transaction.
   */
  public async newHolderAccount(
    wallet?: web3.PublicKey,
    confirmOptions?: web3.ConfirmOptions
  ) {
    if (!wallet) wallet = this.honeycomb().identity().address;
    await this.honeycomb()
      .create()
      .currencyManager()
      .holderAccount(this, wallet, confirmOptions);
    return this.holderAccount(wallet);
  }

  /**
   * Updates the currency with the given arguments.
   * @param args The arguments for updating the currency.
   * @param confirmOptions Optional confirm options for the transaction.
   */
  public async update(
    args: UpdateCurrencyArgs,
    confirmOptions?: web3.ConfirmOptions
  ) {
    const { operation } = await createUpdateCurrencyOperation(
      this.honeycomb(),
      {
        args,
        currency: this,
        programId: PROGRAM_ID,
      }
    );
    return operation.send(confirmOptions);
  }

  /**
   * Installs the HplCurrency in the given Honeycomb instance.
   * @param honeycomb The Honeycomb instance to install the currency.
   */
  public install(honeycomb: Honeycomb): Honeycomb {
    if (!honeycomb._currencies) {
      honeycomb._currencies = {};
      honeycomb.pda().register(currencyManagerPdas());
      honeycomb.fetch().register(currencyManagerFetch());
      honeycomb.create().register(currencyManagerCreate());
    }
    honeycomb._currencies[this.address.toString()] = this;

    honeycomb.currency = (nameOrKey?: string | web3.PublicKey) => {
      if (nameOrKey) {
        if (typeof nameOrKey === "string") {
          return Object.values(honeycomb._currencies).find(
            (c) => c.name === nameOrKey
          );
        } else {
          return honeycomb._currencies[nameOrKey.toString()];
        }
      } else {
        return this;
      }
    };

    this._honeycomb = honeycomb;
    return honeycomb;
  }
}

/**
 * Factory function to create or fetch an HplCurrency instance from the Honeycomb.
 * @category Factory
 * @param honeycomb The Honeycomb instance.
 * @param args The arguments for creating the currency or the address of the existing currency.
 */
export const currencyModule = (
  honeycomb: Honeycomb,
  args:
    | web3.PublicKey
    | (
        | CreateCurrencyArgs
        | {
            mint: web3.PublicKey;
            mintAuthority: web3.PublicKey | web3.Keypair;
            freezeAuthority: web3.PublicKey | web3.Keypair;
          }
      )
) =>
  isPublicKey(args)
    ? HplCurrency.fromAddress(honeycomb, args)
    : HplCurrency.new(honeycomb, args);

/**
 * Finds the currencies associated with the given HoneycombProject.
 * @category Factory
 * @param project The HoneycombProject to search for currencies.
 */
export const findProjectCurrencies = (project: HoneycombProject) =>
  Currency.gpaBuilder()
    .addFilter("project", project.address)
    .run(project.honeycomb().connection)
    .then((currencies) =>
      Promise.all(
        currencies.map(async (c) => {
          try {
            const currency = Currency.fromAccountInfo(c.account)[0];
            const mint = await splToken.getMint(
              project.honeycomb().connection,
              currency.mint
            );
            const metadata = await Metadata.fromAccountAddress(
              project.honeycomb().connection,
              metadataPda(mint.address)[0]
            ).catch((x) => ({} as Metadata));
            project
              .honeycomb()
              .use(new HplCurrency(c.pubkey, currency, mint, metadata));
          } catch {
            return null;
          }
        })
      )
    )
    .then((_) => project.honeycomb());
