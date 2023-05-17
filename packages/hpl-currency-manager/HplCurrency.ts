import * as web3 from "@solana/web3.js";
import { Honeycomb, Module } from "@honeycomb-protocol/hive-control";
import {
  CreateCurrencyArgs,
  Currency,
  HolderAccount,
  HolderStatus,
  PROGRAM_ID,
} from "./generated";
import { holderAccountPda } from "./utils";
import {
  approveDelegate,
  burnCurrency,
  createCurrency,
  createHolderAccount,
  mintCurrency,
  revokeDelegate,
  setHolderStatus,
  transferCurrency,
} from "./operations";

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

  constructor(readonly address: web3.PublicKey, private _currency: Currency) {
    super();
    this._fetch = new HplCurrencyFetch(this);
    this._create = new HplCurrencyCreate(this);
  }

  public get mint() {
    return this._currency.mint;
  }

  public get currencyType() {
    return this._currency.currencyType;
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

  public holderAccount(owner?: web3.PublicKey) {
    if (!owner) owner = this.honeycomb().identity().publicKey;

    if (this._holders[owner.toString()]) {
      return Promise.resolve(this._holders[owner.toString()]);
    }

    return this.fetch()
      .holderAccount(owner)
      .then((x) => {
        this._holders[owner.toString()] = x;
        return x;
      });
  }

  static async fromAddress(
    connection: web3.Connection,
    address: web3.PublicKey
  ) {
    const currency = await Currency.fromAccountAddress(connection, address);
    return new HplCurrency(address, currency);
  }

  static async new(honeycomb: Honeycomb, args: CreateCurrencyArgs) {
    const { currency } = await createCurrency(honeycomb, {
      programId: PROGRAM_ID,
      project: honeycomb.project().address,
      args,
    });
    return await HplCurrency.fromAddress(
      new web3.Connection(honeycomb.connection.rpcEndpoint, "processed"),
      currency
    );
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
  constructor(private _currency: HplCurrency) {}

  public async holderAccount(owner?: web3.PublicKey) {
    const [address] = holderAccountPda(
      owner || this._currency.honeycomb().identity().publicKey,
      this._currency.mint
    );
    return new HplHolderAccount(
      this._currency,
      address,
      await HolderAccount.fromAccountAddress(
        this._currency.honeycomb().connection,
        address
      )
    );
  }
}

class HplCurrencyCreate {
  constructor(private _currency: HplCurrency) {}

  public async holderAccount(owner?: web3.PublicKey) {
    return createHolderAccount(this._currency.honeycomb(), {
      currency: this._currency,
      owner: owner || this._currency.honeycomb().identity().publicKey,
      programId: PROGRAM_ID,
    }).then((_) =>
      this._currency.holderAccount(
        owner || this._currency.honeycomb().identity().publicKey
      )
    );
  }
}

export class HplHolderAccount {
  constructor(
    private _currency: HplCurrency,
    readonly address: web3.PublicKey,
    private _holderAccount: HolderAccount
  ) {}

  public get owner() {
    return this._holderAccount.owner;
  }

  public get tokenAccount() {
    return this._holderAccount.tokenAccount;
  }

  public get status() {
    return this._holderAccount.status;
  }

  public currency() {
    return this._currency;
  }

  public mint(amount: number) {
    return mintCurrency(this.currency().honeycomb(), {
      amount,
      holderAccount: this,
      programId: PROGRAM_ID,
    });
  }

  public burn(amount: number) {
    return burnCurrency(this.currency().honeycomb(), {
      amount,
      holderAccount: this,
      programId: PROGRAM_ID,
    });
  }

  public async transfer(amount: number, to: HplHolderAccount | web3.PublicKey) {
    return transferCurrency(this.currency().honeycomb(), {
      amount,
      from: this,
      to:
        to instanceof HplHolderAccount
          ? to
          : await this.currency().holderAccount(to),
      programId: PROGRAM_ID,
    });
  }

  public approveDelegate(amount: number, delegate: web3.PublicKey) {
    return approveDelegate(this.currency().honeycomb(), {
      amount,
      delegate,
      holderAccount: this,
      programId: PROGRAM_ID,
    });
  }

  public revokeDelegate() {
    return revokeDelegate(this.currency().honeycomb(), {
      holderAccount: this,
      programId: PROGRAM_ID,
    });
  }

  public setHolderStatus(status: HolderStatus) {
    return setHolderStatus(this.currency().honeycomb(), {
      status,
      holderAccount: this,
      programId: PROGRAM_ID,
    });
  }
}
