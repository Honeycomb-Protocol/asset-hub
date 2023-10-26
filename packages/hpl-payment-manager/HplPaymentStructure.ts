import * as web3 from "@solana/web3.js";
import {
  Honeycomb,
  HoneycombProject,
  Module,
  isPublicKey,
} from "@honeycomb-protocol/hive-control";
import { paymentManagerPdas } from "./utils";
import { ConditionalPayment, PROGRAM_ID, PaymentStructure } from "./generated";
import { HplPaymentSession } from "./HplPaymentSession";
import { HplConditionalPayments } from "./utils";
import {
  createCreatePaymentStructureOperation,
  createStartPaymentSessionOperation,
} from "./operations";

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
  readonly programId = PROGRAM_ID;
  private _payments: HplConditionalPayments;
  private _sessions: { [payer: string]: HplPaymentSession } = {};

  constructor(private solita: PaymentStructure) {
    super();
    this._payments = new HplConditionalPayments(solita.payments);
  }

  public static async fromAddress(
    honeycomb: Honeycomb,
    address: web3.PublicKey,
    commitmentOrConfig:
      | web3.Commitment
      | web3.GetAccountInfoConfig = "processed"
  ) {
    const solita = await PaymentStructure.fromAccountAddress(
      honeycomb.processedConnection,
      address,
      commitmentOrConfig
    );
    return new HplPaymentStructure(solita);
  }

  /**
   * Creates a new HplPaymentStructure instance.
   * @param honeycomb The Honeycomb instance.
   * @param args The arguments for creating the currency.
   * @param confirmOptions Optional confirm options for the transaction.
   */
  static async new(
    honeycomb: Honeycomb,
    payments: ConditionalPayment,
    confirmOptions?: web3.ConfirmOptions
  ) {
    honeycomb.pda().register(paymentManagerPdas());
    const { paymentStructure, operation } =
      await createCreatePaymentStructureOperation(honeycomb, {
        args: {
          payments,
        },
        programId: PROGRAM_ID,
      });

    await operation.send(confirmOptions);

    return await HplPaymentStructure.fromAddress(honeycomb, paymentStructure);
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
   * Start a new payment session
   */
  public async startSession(confirmOptions?: web3.ConfirmOptions) {
    const { operation, paymentSession } =
      await createStartPaymentSessionOperation(this.honeycomb(), {
        paymentStructure: this.address,
      });
    await operation.send(confirmOptions);
    return HplPaymentSession.fromAddress(this, paymentSession);
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

/**
 * Factory function to create or fetch an HplPaymentStructure instance from the Honeycomb.
 * @category Factory
 * @param honeycomb The Honeycomb instance.
 * @param args The arguments for creating the currency or the address of the existing currency.
 */
export const paymentStructure = (
  honeycomb: Honeycomb,
  args: web3.PublicKey | ConditionalPayment
) =>
  isPublicKey(args)
    ? HplPaymentStructure.fromAddress(honeycomb, args)
    : HplPaymentStructure.new(honeycomb, args);
