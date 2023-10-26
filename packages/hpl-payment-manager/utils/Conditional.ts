export class Conditional<T extends object> {
  constructor(
    protected _kind: "None" | "Item" | "Or" | "And" = "None",
    protected _value: T | Conditional<T>[] = null,
    protected _path: number[] = []
  ) {}

  public get path() {
    return this._path;
  }

  public get kind() {
    return this._kind;
  }

  public get value() {
    return this._value;
  }

  public pretty() {
    return {
      __kind: this.kind,
      fields: [
        Array.isArray(this.value)
          ? this.value.map((item) => item.pretty())
          : "pretty" in this.value && typeof this.value.pretty === "function"
          ? this.value.pretty()
          : this.value,
      ],
      path: this.path,
    };
  }

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
