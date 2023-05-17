import * as web3 from "@solana/web3.js";
import * as beet from "@metaplex-foundation/beet";
import { Honeycomb, Module } from "@honeycomb-protocol/hive-control";
import {
  Asset,
  AssetManager,
  PROGRAM_ID,
  CreateAssetArgs as CreateAssetArgsChain,
} from "./generated";
import { createAsset, createAssetManager, mintAsset } from "./operations";
import {
  CreateCandyGuardBuilderContext,
  TransactionBuilder,
} from "@metaplex-foundation/js";

declare module "@honeycomb-protocol/hive-control" {
  interface Honeycomb {
    assetManager(): AssetHubManager;
  }
}

type CreateAssetArgs = {
  args: CreateAssetArgsChain;
  candyGuardBuilder?: TransactionBuilder<CreateCandyGuardBuilderContext>;
};

export class AssetHubManager extends Module {
  readonly programId: web3.PublicKey = PROGRAM_ID;
  private _proofIndex: number;
  private _fetch: AssetManagerFetch;
  private _create: AssetManagerCreate;

  private _assets: AssetManagerAsset[] = [];

  constructor(
    readonly assetManagerAddress: web3.PublicKey,
    private _assetManager: AssetManager
  ) {
    super();
    this._fetch = new AssetManagerFetch(this);
    this._create = new AssetManagerCreate(this);
  }

  static async fromAddress(
    connection: web3.Connection,
    assetManager: web3.PublicKey
  ) {
    const assetMAnager = await AssetManager.fromAccountAddress(
      connection,
      assetManager
    );
    return new AssetHubManager(assetManager, assetMAnager);
  }

  static async new(honeycomb: Honeycomb) {
    const { assetManagerAddress } = await createAssetManager(honeycomb, {
      programId: PROGRAM_ID,
    });
    return await AssetHubManager.fromAddress(
      new web3.Connection(honeycomb.connection.rpcEndpoint, "processed"),
      assetManagerAddress
    );
  }

  public honeycomb() {
    return this._honeycomb;
  }

  public assetManager() {
    return this._assetManager;
  }

  public proofIndex() {
    return this._proofIndex;
  }

  public fetch() {
    return this._fetch;
  }

  public create() {
    return this._create;
  }

  public loadAssets() {
    return this._fetch.assets().then((assets) => {
      this._assets = assets;
      return this;
    });
  }

  public assets() {
    return this._assets;
  }

  public addAsset(asset: AssetManagerAsset) {
    this._assets.push(asset);
    return this;
  }

  install(honeycomb: Honeycomb): Honeycomb {
    honeycomb.assetManager = () => this;
    this._honeycomb = honeycomb;
    this._proofIndex = honeycomb
      .project()
      .services.findIndex(
        (service) =>
          service.__kind === "AssetManager" &&
          service.assetManagerId.toBase58() ===
            this.assetManagerAddress.toBase58()
      );
    if (this._proofIndex === -1)
      throw new Error("AssetHubManager not found in honeycomb services");
    return honeycomb;
  }
}

export class AssetManagerFetch {
  private _assetManager: AssetHubManager;

  constructor(assetManager: AssetHubManager) {
    this._assetManager = assetManager;
  }

  public asset(assetAddress: web3.PublicKey) {
    return AssetManagerAsset.fromAddress(this._assetManager, assetAddress);
  }

  public assets() {
    return Asset.gpaBuilder()
      .addFilter("assetManager", this._assetManager.assetManagerAddress)
      .run(this._assetManager.honeycomb().connection)
      .then(
        (x) =>
          x
            .map((y) => {
              try {
                return new AssetManagerAsset(
                  this._assetManager,
                  y.pubkey,
                  Asset.fromAccountInfo(y.account)[0]
                );
              } catch {}
            })
            .filter((x) => x) as AssetManagerAsset[]
      );
  }
}

export class AssetManagerCreate {
  private _assetManager: AssetHubManager;

  constructor(assetManager: AssetHubManager) {
    this._assetManager = assetManager;
  }

  public assetManager() {
    return this._assetManager;
  }

  public asset(args: CreateAssetArgs) {
    return createAsset(this._assetManager.honeycomb(), {
      args: args.args,
      candyGuardBuilder: args.candyGuardBuilder,
      programId: this._assetManager.programId,
    })
      .then((res) =>
        AssetManagerAsset.fromAddress(this._assetManager, res.assetAddress)
      )
      .then((asset) => {
        this._assetManager.addAsset(asset);
        return asset;
      });
  }
}

export class AssetManagerAsset {
  public readonly bump: number;
  public readonly candyGuard: beet.COption<web3.PublicKey>;
  public readonly mintAddress: web3.PublicKey;
  public readonly supply: beet.bignum;
  public readonly itemsRedeemed: beet.bignum;
  public readonly uri: string;

  constructor(
    private _assetManager: AssetHubManager,
    readonly assetAddress: web3.PublicKey,
    private _asset: Asset
  ) {
    if (!_assetManager.assetManagerAddress.equals(_asset.assetManager))
      throw new Error("Asset does not belong to this assetManager");

    this.bump = _asset.bump;
    this.candyGuard = _asset.candyGuard;
    this.mintAddress = _asset.mint;
    this.supply = _asset.supply;
    this.itemsRedeemed = _asset.itemsRedeemed;
    this.uri = _asset.uri;
  }

  static async fromAddress(
    assetManager: AssetHubManager,
    assetAddress: web3.PublicKey
  ) {
    const asset = await Asset.fromAccountAddress(
      new web3.Connection(
        assetManager.honeycomb().connection.rpcEndpoint,
        "processed"
      ),
      assetAddress
    );
    return new AssetManagerAsset(assetManager, assetAddress, asset);
  }

  public assetManager() {
    return this._assetManager;
  }

  public asset() {
    return this._asset;
  }

  public async reload() {
    return Asset.fromAccountAddress(
      this._assetManager.honeycomb().connection,
      this.assetAddress
    ).then((asset) => {
      Object.assign(
        this,
        new AssetManagerAsset(this._assetManager, this.assetAddress, asset)
      );
      return this;
    });
  }

  public async mint(amount: number) {
    return mintAsset(this._assetManager.honeycomb(), {
      asset: this,
      amount,
      group: undefined,
      programId: this._assetManager.programId,
    });
  }
}

export const assetAssemblerModule = (
  honeycomb: Honeycomb,
  args?: web3.PublicKey
) =>
  args
    ? AssetHubManager.fromAddress(honeycomb.connection, args)
    : AssetHubManager.new(honeycomb);
