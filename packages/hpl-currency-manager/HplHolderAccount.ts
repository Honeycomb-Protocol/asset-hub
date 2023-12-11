import { Commitment, ConfirmOptions, PublicKey } from "@solana/web3.js";
import type { Account as TokenAccount } from "@solana/spl-token";
import {
  HolderAccount,
  HolderStatus,
  HplCurrency,
  createApproveDelegateOperation,
  createBurnCurrencyOperation,
  createFundAccountOperation,
  createMintCurrencyOperation,
  createRevokeDelegateOperation,
  createSetHolderStatusOperation,
  createTransferCurrencyOperation,
} from ".";
import {
  ForceScenario,
  isPublicKey,
  toBigNumber,
} from "@honeycomb-protocol/hive-control";

/**
 * HplHolderAccount class represents the holder account of HplCurrency.
 * @category Modules
 */
export class HplHolderAccount {
  private _perceivedAmount: number = 0;

  constructor(
    private _currency: HplCurrency,
    readonly address: PublicKey,
    private _holderAccount: HolderAccount,
    private _tokenAccount: TokenAccount
  ) {}

  /**
   * Creates an HplHolderAccount instance from the given address.
   * @param currency The `HplCurrency` instance.
   * @param address The address of the holderAccount.
   */
  static async fromAddress(
    currency: HplCurrency,
    address: PublicKey,
    commitment: Commitment = "processed",
    forceFetch = ForceScenario.NoForce
  ) {
    const { holderAccount, tokenAccount } = await currency
      .honeycomb()
      .fetch()
      .currencyManager()
      .holderAccountWithDeps(address, commitment, forceFetch);
    return new HplHolderAccount(currency, address, holderAccount, tokenAccount);
  }

  /**
   * Creates an HplHolderAccount instance from the given address.
   * @param currency The `HplCurrency` instance.
   * @param wallet The wallet of the owner.
   */
  static async of(
    currency: HplCurrency,
    wallet: PublicKey,
    commitment: Commitment = "processed",
    forceFetch = ForceScenario.NoForce
  ) {
    const [address] = currency
      .honeycomb()
      .pda()
      .currencyManager()
      .holderAccount(wallet, currency.mint.address);
    return HplHolderAccount.fromAddress(
      currency,
      address,
      commitment,
      forceFetch
    );
  }

  /**
   * Gets the total amount (including perceived amount) of the holder account.
   */
  public get amount() {
    return Number(this._tokenAccount.amount) + this._perceivedAmount;
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
   * Modify the perceived amount of the holder account.
   */
  public modifyPerceivedAmount(amount: number) {
    this._perceivedAmount += amount;
  }

  /**
   * Mints new tokens for the holder account.
   * @param amount The amount to mint.
   * @param confirmOptions Optional confirm options for the transaction.
   */
  public async mint(amount: number, confirmOptions?: ConfirmOptions) {
    const { operation } = await createMintCurrencyOperation(
      this.currency().honeycomb(),
      {
        amount,
        holderAccount: this,
        programId: this.currency().programId,
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
  public async fund(amount: number, confirmOptions?: ConfirmOptions) {
    const { operation } = await createFundAccountOperation(
      this.currency().honeycomb(),
      {
        amount,
        currency: this._currency,
        receiverWallet: this.owner,
        programId: this.currency().programId,
      }
    );
    const context = await operation.send(confirmOptions);
    this._perceivedAmount += amount;
    return context;
  }

  /**
   * Burns tokens from the holder account.
   * @param amount The amount to burn.
   * @param confirmOptions Optional confirm options for the transaction.
   */
  public async burn(amount: number, confirmOptions?: ConfirmOptions) {
    const { operation } = await createBurnCurrencyOperation(
      this.currency().honeycomb(),
      {
        amount,
        holderAccount: this,
        programId: this.currency().programId,
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
    to: HplHolderAccount | PublicKey,
    confirmOptions?: ConfirmOptions
  ) {
    const { operation } = await createTransferCurrencyOperation(
      this.currency().honeycomb(),
      {
        amount,
        holderAccount: this,
        receiver: to,
        programId: this.currency().programId,
      }
    );
    const context = await operation.send(confirmOptions);
    if (!this.owner.equals(isPublicKey(to) ? to : to.owner))
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
    delegate: PublicKey,
    confirmOptions?: ConfirmOptions
  ) {
    const { operation } = await createApproveDelegateOperation(
      this.currency().honeycomb(),
      {
        amount,
        delegate,
        holderAccount: this,
        programId: this.currency().programId,
      }
    );
    return operation.send(confirmOptions);
  }

  /**
   * Revokes the delegate approval for the holder account.
   * @param confirmOptions Optional confirm options for the transaction.
   */
  public async revokeDelegate(confirmOptions?: ConfirmOptions) {
    const { operation } = await createRevokeDelegateOperation(
      this.currency().honeycomb(),
      {
        holderAccount: this,
        programId: this.currency().programId,
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
    confirmOptions?: ConfirmOptions
  ) {
    const { operation } = await createSetHolderStatusOperation(
      this.currency().honeycomb(),
      {
        status,
        holderAccount: this,
        programId: this.currency().programId,
      }
    );
    return operation.send(confirmOptions);
  }
}
