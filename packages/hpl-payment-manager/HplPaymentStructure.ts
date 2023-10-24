import * as web3 from "@solana/web3.js";
import { Honeycomb, Module } from "@honeycomb-protocol/hive-control";
import { paymentManagerPdas } from "./utils";
import { PaymentStructure } from "./generated";
import { HplPaymentSession } from "./HplPaymentSession";
import { HplConditionalPayments } from "./HplPayment";

// Extend the Honeycomb interface to include HplPaymentStructure related functions
declare module "@honeycomb-protocol/hive-control" {
  interface Honeycomb {
    _paymentStructures: { [key: string]: HplPaymentStructure };
    paymentStructure(key?: string | web3.PublicKey): HplPaymentStructure;
  }
}

/**
 * HplPaymentStructure class represents a Payment structure managed by the Honeycomb protocol.
 * @category Modules
 */
export class HplPaymentStructure extends Module {
  private _payments: HplConditionalPayments;
  private _sessions: { [payer: string]: HplPaymentSession };

  constructor(private solita: PaymentStructure) {
    super();
    this._payments = new HplConditionalPayments(this, solita.payments);
  }

  public static async fromAddress(
    honeycomb: Honeycomb,
    address: web3.PublicKey
  ) {
    const solita = await PaymentStructure.fromAccountAddress(
      honeycomb.connection,
      address
    );
    return new HplPaymentStructure(solita);
  }

  /**
   * Returns the address of the payment structure.
   */
  public get address(): web3.PublicKey {
    return this.honeycomb()
      .pda()
      .paymentManager()
      .paymentStructure(this.solita.uniqueKey)[0];
  }

  /**
   * Returns the authority of the payment structure.
   */
  public get authority(): web3.PublicKey {
    return this.solita.authority;
  }

  /**
   * Returns the payments.
   */
  public get payments(): HplConditionalPayments {
    return this._payments;
  }

  /**
   * Return possible payment paths of this payment structure.
   */
  public possiblePaymentPaths() {}

  /**
   * Fetch all payment sessions of this payment structure.
   */
  public async sessions(reFetch = false) {
    if (!Object.values(this._sessions).length || reFetch) {
      await HplPaymentSession.allOf(this).then((sessions) => {
        this._sessions = sessions.reduce(
          (acc, session) => ({
            ...acc,
            [session.payer.toString()]: session,
          }),
          {}
        );
      });
    }
    return Object.values(this._sessions);
  }

  /**
   * Fetch the payment session of a particular payer
   * @param payer The payer of the payment session.
   * @param reFetch Whether to re-fetch the payment session.
   */
  public async session(payer: web3.PublicKey, reFetch = false) {
    if (this._sessions[payer.toString()] == undefined || reFetch) {
      this._sessions[payer.toString()] = await HplPaymentSession.of(
        this,
        payer
      );
    }
    return this._sessions[payer.toString()];
  }

  /**
   * Installs the HplPaymentStructure in the given Honeycomb instance.
   * @param honeycomb The Honeycomb instance to install the paymentStructure.
   */
  public install(honeycomb: Honeycomb): Honeycomb {
    if (!honeycomb._paymentStructures) {
      honeycomb._paymentStructures = {};
      honeycomb.pda().register(paymentManagerPdas());
    }
    this._honeycomb = honeycomb;
    honeycomb._paymentStructures[this.address.toString()] = this;

    honeycomb.paymentStructure = (key?: string | web3.PublicKey) => {
      if (key) {
        return honeycomb._paymentStructures[key.toString()];
      } else {
        return this;
      }
    };

    return honeycomb;
  }
}
