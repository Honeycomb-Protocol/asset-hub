import { Conditional } from "./Conditional";
import { ConditionalPayment, ConditionalBool, Payment } from "..";

export class HplConditionalPaymentStatuses extends Conditional<Boolean> {
  constructor(readonly solita: ConditionalBool, path: number[] = []) {
    super("None", null, path);
    if (solita.__kind === "None")
      throw new Error("Invalid conditional payment");

    this._kind = solita.__kind;
    switch (solita.__kind) {
      case "Item":
        this._path.push(1);
        this._value = solita.fields[0];
        break;
      case "Or":
        this._path.push(2);
        this._value = solita.fields[0].map(
          (item) => new HplConditionalPaymentStatuses(item, [...path])
        );
        break;
      case "And":
        this._path.push(3);
        this._value = solita.fields[0].map(
          (item) => new HplConditionalPaymentStatuses(item, [...path])
        );
        break;
      default:
        throw new Error("Invalid conditional payment");
    }
  }
}

export class HplConditionalPayments extends Conditional<HplPayment> {
  constructor(readonly solita: ConditionalPayment, path: number[] = []) {
    super("None", null, path);
    if (solita.__kind === "None")
      throw new Error("Invalid conditional payment");

    this._kind = solita.__kind;
    switch (solita.__kind) {
      case "Item":
        this._path.push(1);
        this._value =
          solita.fields[0].kind.__kind === "Nft"
            ? new HplNftPayment(this, solita.fields[0], [...path, 1])
            : new HplCurrencyPayment(this, solita.fields[0], [...path, 1]);
        break;
      case "Or":
        this._path.push(2);
        this._value = solita.fields[0].map(
          (item, i) => new HplConditionalPayments(item, [...path, 2, i])
        );
        break;
      case "And":
        this._path.push(3);
        this._value = solita.fields[0].map(
          (item, i) => new HplConditionalPayments(item, [...path, 3, i])
        );
        break;
      default:
        throw new Error("Invalid conditional payment");
    }
  }

  public static createSolita() {
    const or = (items: ConditionalPayment[]): ConditionalPayment => ({
      __kind: "Or",
      fields: [items],
    });

    const and = (items: ConditionalPayment[]): ConditionalPayment => ({
      __kind: "And",
      fields: [items],
    });

    const item = (item: Payment): ConditionalPayment => ({
      __kind: "Item",
      fields: [item],
    });

    return {
      or,
      and,
      item,
    };
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
    return this.solita.kind.address;
  }
}
