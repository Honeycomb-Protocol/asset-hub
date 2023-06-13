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

declare module "@honeycomb-protocol/hive-control" {
  interface Honeycomb {
    _currencies: { [key: string]: HplCurrency };
    currency(key?: string | web3.PublicKey): HplCurrency;
  }
}
export class HplCurrency extends Module {
  private _fetch: HplCurrencyFetch;
  private _create: HplCurrencyCreate;

  private _holders: { [key: string]: HplHolderAccount } = {};

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

  public get name() {
    return this._metadata.data.name;
  }

  public get symbol() {
    return this._metadata.data.symbol;
  }

  public get uri() {
    return this._metadata.data.uri;
  }

  public get mint() {
    return this._mint;
  }

  public get kind() {
    return this._currency.kind;
  }

  public honeycomb() {
    return this._honeycomb;
  }

  public project() {
    return this.honeycomb().project(this._currency.project);
  }

  public fetch() {
    return this._fetch;
  }

  public create() {
    return this._create;
  }

  public async holderAccount(owner?: web3.PublicKey, reFetch = false) {
    if (!owner) owner = this.honeycomb().identity().address;
    if (!this._holders[owner.toString()] || reFetch) {
      this._holders[owner.toString()] = await this.fetch().holderAccount(owner);
    }
    return this._holders[owner.toString()];
  }

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

  static async new(
    honeycomb: Honeycomb,
    args: CreateCurrencyArgs | { mint: web3.PublicKey },
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

class HplCurrencyFetch {
  constructor(private currency: HplCurrency) {}

  public async holderAccount(
    owner: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig
  ) {
    const [address] = holderAccountPda(owner, this.currency.mint);
    const holderAccount = await HolderAccount.fromAccountAddress(
      this.currency.honeycomb().connection,
      address,
      commitmentOrConfig
    );
    const tokenAccounnt = await splToken.getAccount(
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
      tokenAccounnt
    );
  }
}

class HplCurrencyCreate {
  constructor(private _currency: HplCurrency) {}

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

export class HplHolderAccount {
  private _perceivedAmount: number = 0;

  constructor(
    private _currency: HplCurrency,
    readonly address: web3.PublicKey,
    private _holderAccount: HolderAccount,
    private _tokenAccount: splToken.Account
  ) {}

  public get amount() {
    return toBigNumber(this._tokenAccount.amount.toString()).add(
      toBigNumber(this._perceivedAmount)
    );
  }

  public get delegate() {
    return this._tokenAccount.delegate;
  }

  public get delegatedAmount() {
    return this._tokenAccount.delegatedAmount;
  }

  public get owner() {
    return this._holderAccount.owner;
  }

  public get tokenAccount() {
    return this._holderAccount.tokenAccount;
  }

  public get status() {
    return this._holderAccount.status;
  }

  public get isActive() {
    return this.status === HolderStatus.Active;
  }

  public currency() {
    return this._currency;
  }

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

export const currencyModule = (
  honeycomb: Honeycomb,
  args: web3.PublicKey | (CreateCurrencyArgs | { mint: web3.PublicKey })
) =>
  args instanceof web3.PublicKey
    ? HplCurrency.fromAddress(honeycomb.connection, args)
    : HplCurrency.new(honeycomb, args);

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
            );
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
