import * as web3 from "@solana/web3.js";
import { PaymentSession } from "./generated";
import { HplPaymentStructure } from "./HplPaymentStructure";
import { HplConditionalPaymentStatuses } from "./HplPayment";

/**
 * HplPaymentSession class represents a Payment session managed by the Honeycomb protocol.
 * @category Modules
 */
export class HplPaymentSession {
  private _status: HplConditionalPaymentStatuses;

  constructor(
    readonly paymentStructure: HplPaymentStructure,
    private solita: PaymentSession
  ) {
    this._status = new HplConditionalPaymentStatuses(solita.paymentsStatus);
  }

  public static async fromAddress(
    paymentStructure: HplPaymentStructure,
    address: web3.PublicKey,
    commitmentOrConfig:
      | web3.Commitment
      | web3.GetAccountInfoConfig = "processed"
  ) {
    const solita = await PaymentSession.fromAccountAddress(
      paymentStructure.honeycomb().processedConnection,
      address,
      commitmentOrConfig
    );
    return new HplPaymentSession(paymentStructure, solita);
  }

  public static of(
    paymentStructure: HplPaymentStructure,
    payer: web3.PublicKey,
    commitmentOrConfig:
      | web3.Commitment
      | web3.GetAccountInfoConfig = "processed"
  ) {
    return HplPaymentSession.fromAddress(
      paymentStructure,
      paymentStructure
        .honeycomb()
        .pda()
        .paymentManager()
        .paymentSession(paymentStructure.address, payer)[0],
      commitmentOrConfig
    );
  }

  public static allOf(paymentStructure: HplPaymentStructure) {
    return PaymentSession.gpaBuilder()
      .addFilter("paymentStructure", paymentStructure.address)
      .run(paymentStructure.honeycomb().processedConnection)
      .then(
        (accounts) =>
          accounts
            .map(({ account }) => {
              try {
                return new HplPaymentSession(
                  paymentStructure,
                  PaymentSession.fromAccountInfo(account)[0]
                );
              } catch {
                return null;
              }
            })
            .filter((x) => !!x) as HplPaymentSession[]
      );
  }

  /**
   * Returns the address of the payment session.
   */
  public get address(): web3.PublicKey {
    return this.paymentStructure
      .honeycomb()
      .pda()
      .paymentManager()
      .paymentSession(this.paymentStructure.address, this.payer)[0];
  }

  /**
   * Returns the authority of the payment session.
   */
  public get payer(): web3.PublicKey {
    return this.solita.payer;
  }

  /**
   * Returns the payments statuses.
   */
  public get status() {
    return this._status;
  }
}
