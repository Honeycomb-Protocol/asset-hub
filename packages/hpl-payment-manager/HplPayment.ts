import { HplPaymentStructure } from "./HplPaymentStructure";
import { ConditionalPayment, Conditionalbool, Payment } from "./generated";
import { Conditional } from "./utils";

export class HplConditionalPaymentStatuses extends Conditional<boolean> {
  constructor(readonly solita: Conditionalbool) {
    super();
    if (solita.__kind === "None")
      throw new Error("Invalid conditional payment");

    this._kind = solita.__kind;
    switch (solita.__kind) {
      case "Item":
        this._value = solita.fields[0];
        break;
      case "Or":
        this._value = solita.fields[0].map(
          (item) => new HplConditionalPaymentStatuses(item)
        );
        break;
      case "And":
        this._value = solita.fields[0].map(
          (item) => new HplConditionalPaymentStatuses(item)
        );
        break;
      default:
        throw new Error("Invalid conditional payment");
    }
  }
}

export class HplConditionalPayments extends Conditional<HplPayment> {
  constructor(
    readonly paymentStructure: HplPaymentStructure,
    readonly solita: ConditionalPayment,
    readonly path: number[] = []
  ) {
    super();
    if (solita.__kind === "None")
      throw new Error("Invalid conditional payment");

    this._kind = solita.__kind;
    switch (solita.__kind) {
      case "Item":
        const item = solita.fields[0];
        this._value =
          item.kind.__kind === "Nft"
            ? new HplNftPayment(this, item, [...path, 1])
            : new HplCurrencyPayment(this, item, [...path, 1]);
        break;
      case "Or":
        this._value = solita.fields[0].map(
          (item, i) =>
            new HplConditionalPayments(paymentStructure, item, [...path, 2, i])
        );
        break;
      case "And":
        this._value = solita.fields[0].map(
          (item, i) =>
            new HplConditionalPayments(paymentStructure, item, [...path, 3, i])
        );
        break;
      default:
        throw new Error("Invalid conditional payment");
    }
  }
}

export class HplPayment {
  constructor(
    readonly conditional: HplConditionalPayments,
    readonly solita: Payment,
    readonly path: number[]
  ) {}

  public get method() {
    return this.solita.paymentMethod;
  }

  public get beneficiary() {
    if (this.method.__kind === "Burn") return null;
    return this.method.fields[0];
  }

  public isNft(): this is HplNftPayment {
    return this.solita.kind.__kind === "Nft";
  }

  public isHplCurrency(): this is HplCurrencyPayment {
    return this.solita.kind.__kind === "HplCurrency";
  }
}

export class HplNftPayment extends HplPayment {
  constructor(
    conditional: HplConditionalPayments,
    solita: Payment,
    path: number[]
  ) {
    super(conditional, solita, path);
  }

  public get mint() {
    if (this.solita.kind.__kind !== "Nft")
      throw new Error("Invalid payment kind");
    if (this.solita.kind.fields[0].__kind !== "Mint") return null;
    return this.solita.kind.fields[0].fields[0];
  }

  public get creator() {
    if (this.solita.kind.__kind !== "Nft")
      throw new Error("Invalid payment kind");
    if (this.solita.kind.fields[0].__kind !== "Creator") return null;
    return this.solita.kind.fields[0].fields[0];
  }

  public get collection() {
    if (this.solita.kind.__kind !== "Nft")
      throw new Error("Invalid payment kind");
    if (this.solita.kind.fields[0].__kind !== "Collection") return null;
    return this.solita.kind.fields[0].fields[0];
  }

  public get tree() {
    if (this.solita.kind.__kind !== "Nft")
      throw new Error("Invalid payment kind");
    if (this.solita.kind.fields[0].__kind !== "Tree") return null;
    return this.solita.kind.fields[0].fields[0];
  }
}

export class HplCurrencyPayment extends HplPayment {
  constructor(
    conditional: HplConditionalPayments,
    solita: Payment,
    path: number[]
  ) {
    super(conditional, solita, path);
  }

  public get amount() {
    if (this.solita.kind.__kind !== "HplCurrency")
      throw new Error("Invalid payment kind");
    return this.solita.kind.amount;
  }

  public get currency() {
    if (this.solita.kind.__kind !== "HplCurrency")
      throw new Error("Invalid payment kind");
    return this.conditional.paymentStructure
      .honeycomb()
      .currency(this.solita.kind.address);
  }
}
