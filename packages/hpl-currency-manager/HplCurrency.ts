import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import {
  Honeycomb,
  HoneycombProject,
  Module,
  toBigNumber,
} from "@honeycomb-protocol/hive-control";
import {
  CreateCurrencyArgs,
  Currency,
  HolderAccount,
  HolderStatus,
  PROGRAM_ID,
  UpdateCurrencyArgs,
} from "./generated";
import { holderAccountPda, metadataPda } from "./utils";
import {
  createApproveDelegateOperation,
  createBurnCurrencyOperation,
  createCreateCurrencyOperation,
  createCreateHolderAccountOperation,
  createFundAccountOperation,
  createMintCurrencyOperation,
  createRevokeDelegateOperation,
  createSetHolderStatusOperation,
  createTransferCurrencyOperation,
  createUpdateCurrencyOperation,
} from "./operations";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";

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
export class HplCurrency extends Module {
  private _fetch: HplCurrencyFetch;
  private _create: HplCurrencyCreate;

  private _holders: { [key: string]: HplHolderAccount } = {};
  private _uriData: any = undefined;

  constructor(
    readonly address: web3.PublicKey,
    private _currency: Currency,
    private _mint: splToken.Mint,
    private _metadata: Metadata
  ) {
    super();
    this._fetch = new HplCurrencyFetch(this);
    this._create = new HplCurrencyCreate(this);
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
   * Gets the fetch module.
   */
  public fetch() {
    return this._fetch;
  }

  /**
   * Gets the create module.
   */
  public create() {
    return this._create;
  }

  /**
   * Gets the holder account for the given owner.
   * @param owner The owner of the holder account. If not provided, uses the identity address.
   * @param reFetch Set to true to force re-fetching of the holder account data.
   */
  public async holderAccount(owner?: web3.PublicKey, reFetch = false) {
    if (!owner) owner = this.honeycomb().identity().address;
    if (!this._holders[owner.toString()] || reFetch) {
      this._holders[owner.toString()] = await this.fetch().holderAccount(owner);
    }
    return this._holders[owner.toString()];
  }

  /**
   * Creates an HplCurrency instance from the given address.
   * @param connection The Solana web3 connection.
   * @param address The address of the currency.
   */
  static async fromAddress(
    connection: web3.Connection,
    address: web3.PublicKey
  ) {
    const currency = await Currency.fromAccountAddress(connection, address);
    const mint = await splToken.getMint(connection, currency.mint);
    const metadata = await Metadata.fromAccountAddress(
      connection,
      metadataPda(mint.address)[0]
    );
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
    const { currency, operation } = await createCreateCurrencyOperation(
      honeycomb,
      {
        args,
        project: honeycomb.project(),
        programId: PROGRAM_ID,
      }
    );

    await operation.send(confirmOptions);

    return await HplCurrency.fromAddress(
      new web3.Connection(honeycomb.connection.rpcEndpoint, "processed"),
      currency
    );
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
    }
    honeycomb._currencies[this.address.toString()] = this;

    honeycomb.currency = (key?: string | web3.PublicKey) => {
      if (key) {
        return honeycomb._currencies[
          key instanceof web3.PublicKey ? key.toString() : key
        ];
      } else {
        return this;
      }
    };

    this._honeycomb = honeycomb;
    return honeycomb;
  }
}

/**
 * HplCurrencyFetch class represents a helper module for fetching data related to HplCurrency.
 * @category Helpers
 */
export class HplCurrencyFetch {
  constructor(private currency: HplCurrency) {}

  /**
   * Fetches the holder account for the given owner.
   * @param owner The owner of the holder account.
   * @param commitmentOrConfig Optional commitment or configuration for the account info.
   */
  public async holderAccount(
    owner: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig
  ) {
    const [address] = holderAccountPda(owner, this.currency.mint.address);
    const holderAccount = await HolderAccount.fromAccountAddress(
      this.currency.honeycomb().connection,
      address,
      commitmentOrConfig
    );
    const tokenAccount = await splToken.getAccount(
      this.currency.honeycomb().connection,
      holderAccount.tokenAccount,
      typeof commitmentOrConfig === "string"
        ? commitmentOrConfig
        : commitmentOrConfig?.commitment
    );
    return new HplHolderAccount(
      this.currency,
      address,
      holderAccount,
      tokenAccount
    );
  }
}

/**
 * HplCurrencyCreate class represents a helper module for creating new HplHolderAccount instances.
 * @category Helpers
 */
export class HplCurrencyCreate {
  constructor(private _currency: HplCurrency) {}

  /**
   * Creates a new holder account for the given owner.
   * @param owner The owner of the holder account.
   * @param confirmOptions Optional confirm options for the transaction.
   */
  public async holderAccount(
    owner: web3.PublicKey,
    confirmOptions?: web3.ConfirmOptions
  ) {
    const { operation } = await createCreateHolderAccountOperation(
      this._currency.honeycomb(),
      {
        currency: this._currency,
        owner: owner,
        programId: PROGRAM_ID,
      }
    );
    await operation.send(confirmOptions);
    return this._currency.holderAccount(owner);
  }
}

/**
 * HplHolderAccount class represents the holder account of HplCurrency.
 * @category Modules
 */
export class HplHolderAccount {
  private _perceivedAmount: number = 0;

  constructor(
    private _currency: HplCurrency,
    readonly address: web3.PublicKey,
    private _holderAccount: HolderAccount,
    private _tokenAccount: splToken.Account
  ) {}

  /**
   * Gets the total amount (including perceived amount) of the holder account.
   */
  public get amount() {
    return toBigNumber(this._tokenAccount.amount.toString()).add(
      toBigNumber(this._perceivedAmount)
    );
  }

  /**
   * Gets the delegate of the holder account.
   */
  public get delegate() {
    return this._tokenAccount.delegate;
  }

  /**
   * Gets the delegated amount of the holder account.
   */
  public get delegatedAmount() {
    return this._tokenAccount.delegatedAmount;
  }

  /**
   * Gets the owner of the holder account.
   */
  public get owner() {
    return this._holderAccount.owner;
  }

  /**
   * Gets the associated token account of the holder account.
   */
  public get tokenAccount() {
    return this._holderAccount.tokenAccount;
  }

  /**
   * Gets the status of the holder account.
   */
  public get status() {
    return this._holderAccount.status;
  }

  /**
   * Checks if the holder account is active.
   */
  public get isActive() {
    return this.status === HolderStatus.Active;
  }

  /**
   * Gets the associated HplCurrency instance.
   */
  public currency() {
    return this._currency;
  }

  /**
   * Mints new tokens for the holder account.
   * @param amount The amount to mint.
   * @param confirmOptions Optional confirm options for the transaction.
   */
  public async mint(amount: number, confirmOptions?: web3.ConfirmOptions) {
    const { operation } = await createMintCurrencyOperation(
      this.currency().honeycomb(),
      {
        amount,
        holderAccount: this,
        programId: PROGRAM_ID,
      }
    );
    const context = await operation.send(confirmOptions);
    this._perceivedAmount += amount;
    return context;
  }

  /**
   * Funds tokens to the holder account.
   * @param amount The amount to fund.
   * @param confirmOptions Optional confirm options for the transaction.
   */
  public async fund(amount: number, confirmOptions?: web3.ConfirmOptions) {
    const { operation } = await createFundAccountOperation(
      this.currency().honeycomb(),
      {
        amount,
        currency: this._currency,
        receiverWallet: this.owner,
        programId: PROGRAM_ID,
      }
    );
    const context = await operation.send(confirmOptions);
    this._perceivedAmount -= amount;
    return context;
  }

  /**
   * Burns tokens from the holder account.
   * @param amount The amount to burn.
   * @param confirmOptions Optional confirm options for the transaction.
   */
  public async burn(amount: number, confirmOptions?: web3.ConfirmOptions) {
    const { operation } = await createBurnCurrencyOperation(
      this.currency().honeycomb(),
      {
        amount,
        holderAccount: this,
        programId: PROGRAM_ID,
      }
    );
    const context = await operation.send(confirmOptions);
    this._perceivedAmount -= amount;
    return context;
  }

  /**
   * Transfers tokens to another holder account.
   * @param amount The amount to transfer.
   * @param to The destination holder account or its public key.
   * @param confirmOptions Optional confirm options for the transaction.
   */
  public async transfer(
    amount: number,
    to: HplHolderAccount | web3.PublicKey,
    confirmOptions?: web3.ConfirmOptions
  ) {
    const { operation } = await createTransferCurrencyOperation(
      this.currency().honeycomb(),
      {
        amount,
        holderAccount: this,
        receiver: to,
        programId: PROGRAM_ID,
      }
    );
    const context = await operation.send(confirmOptions);
    if (!this.owner.equals(to instanceof web3.PublicKey ? to : to.owner))
      this._perceivedAmount -= amount;
    return context;
  }

  /**
   * Approves a delegate for the holder account.
   * @param amount The amount to approve for delegation.
   * @param delegate The delegate to approve.
   * @param confirmOptions Optional confirm options for the transaction.
   */
  public async approveDelegate(
    amount: number,
    delegate: web3.PublicKey,
    confirmOptions?: web3.ConfirmOptions
  ) {
    const { operation } = await createApproveDelegateOperation(
      this.currency().honeycomb(),
      {
        amount,
        delegate,
        holderAccount: this,
        programId: PROGRAM_ID,
      }
    );
    return operation.send(confirmOptions);
  }

  /**
   * Revokes the delegate approval for the holder account.
   * @param confirmOptions Optional confirm options for the transaction.
   */
  public async revokeDelegate(confirmOptions?: web3.ConfirmOptions) {
    const { operation } = await createRevokeDelegateOperation(
      this.currency().honeycomb(),
      {
        holderAccount: this,
        programId: PROGRAM_ID,
      }
    );
    return operation.send(confirmOptions);
  }

  /**
   * Sets the status of the holder account.
   * @param status The new status to set.
   * @param confirmOptions Optional confirm options for the transaction.
   */
  public async setHolderStatus(
    status: HolderStatus,
    confirmOptions?: web3.ConfirmOptions
  ) {
    const { operation } = await createSetHolderStatusOperation(
      this.currency().honeycomb(),
      {
        status,
        holderAccount: this,
        programId: PROGRAM_ID,
      }
    );
    return operation.send(confirmOptions);
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
  args instanceof web3.PublicKey
    ? HplCurrency.fromAddress(honeycomb.connection, args)
    : HplCurrency.new(honeycomb, args);

/**
 * Finds the currencies associated with the given HoneycombProject.
 * @category Factory
 * @param project The HoneycombProject to search for currencies.
 */
export const findProjectCurrencies = (project: HoneycombProject) =>
  Currency.gpaBuilder()
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
