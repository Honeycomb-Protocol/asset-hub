export class Conditional<T> {
  protected _kind: "Item" | "Or" | "And";
  protected _value: T | Conditional<T>[];

  constructor() {}

  public find(path: number[]): T {
    switch (path[0]) {
      case 1:
        if (this._kind === "Item") {
          return this._value as T;
        }
        throw new Error("Invalid path");
      case 2:
        if (this._kind === "Or") {
          return (this._value[path[1]] as Conditional<T>).find(path.slice(2));
        }
        throw new Error("Invalid path");
      case 3:
        if (this._kind === "And") {
          return (this._value[path[1]] as Conditional<T>).find(path.slice(2));
        }
        throw new Error("Invalid path");

      default:
        throw new Error("Invalid path");
    }
  }
}
