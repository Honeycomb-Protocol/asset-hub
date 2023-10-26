import * as web3 from "@solana/web3.js";
import * as beet from "@metaplex-foundation/beet";
import {
  Honeycomb,
  Module,
  isPublicKey,
} from "@honeycomb-protocol/hive-control";
import {
  Assembler,
  AssemblingAction,
  Block,
  BlockDefinition,
  BlockDefinitionValue,
  BlockType,
  CreateAssemblerArgs,
  Creator,
  NFT,
  NFTAttribute,
  PROGRAM_ID,
  TokenStandard,
  UpdateAssemblerArgs,
} from "./generated";
import {
  addBlock,
  burnNft,
  createAssembler,
  createBlock,
  createBlockDefinition,
  createNft,
  mintNft,
  removeBlock,
  updateAssembler,
} from "./operations";

declare module "@honeycomb-protocol/hive-control" {
  interface Honeycomb {
    assembler(): AssetAssembler;
  }
}

export type AssetAssemblerBlock = {
  bump: number;
  assembler: web3.PublicKey;
  blockOrder: number;
  isGraphical: boolean;
  blockType: BlockType;
  blockName: string;
  blockDefinationCounts: number;
  address: web3.PublicKey;
  blockDefinitions: AssetAssemblerBlockDefinition[];
};

export type AssetAssemblerBlockDefinition = {
  bump: number;
  block: web3.PublicKey;
  mint: web3.PublicKey;
  value: BlockDefinitionValue;
  definationIndex: number;
  address: web3.PublicKey;
};

type CreateBlockArgs = {
  isGraphical: boolean;
  blockType: BlockType;
  blockName: string;
};

type CreateBlockDefinitionArgs = {
  value: BlockDefinitionValue;
  block: web3.PublicKey;
  mint: web3.PublicKey;
};

export class AssetAssembler extends Module {
  readonly programId: web3.PublicKey = PROGRAM_ID;
  private _proofIndex: number;
  private _fetch: AssetAssemblerFetch;
  private _create: AssetAssemblerCreate;

  public readonly project: web3.PublicKey;
  public readonly collection: web3.PublicKey;
  public readonly collectionName: string;
  public readonly collectionSymbol: string;
  public readonly collectionDescription: string;
  public readonly nftBaseUri: string;
  public readonly assemblingAction: AssemblingAction;
  public readonly nftsCount: number;
  public readonly allowDuplicates: boolean;
  public readonly defaultRoyalty: number;
  public readonly tokenStandard: TokenStandard;
  public readonly ruleSet: beet.COption<web3.PublicKey>;
  public readonly defaultCreators: Creator[];

  private _blocks: AssetAssemblerBlock[] = [];
  private _nfts: AssetAssemblerNft[] = [];

  constructor(
    readonly assemblerAddress: web3.PublicKey,
    private _assembler: Assembler
  ) {
    super();

    this.project = _assembler.project;
    this.collection = _assembler.collection;
    this.collectionName = _assembler.collectionName;
    this.collectionSymbol = _assembler.collectionSymbol;
    this.collectionDescription = _assembler.collectionDescription;
    this.nftBaseUri = _assembler.nftBaseUri;
    this.assemblingAction = _assembler.assemblingAction;
    this.nftsCount = _assembler.nfts;
    this.allowDuplicates = _assembler.allowDuplicates;
    this.defaultRoyalty = _assembler.defaultRoyalty;
    this.tokenStandard = _assembler.tokenStandard;
    this.ruleSet = _assembler.ruleSet;
    this.defaultCreators = _assembler.defaultCreators;

    this._fetch = new AssetAssemblerFetch(this);
    this._create = new AssetAssemblerCreate(this);
  }

  static async fromAddress(
    connection: web3.Connection,
    assemblerAddress: web3.PublicKey
  ) {
    const assembler = await Assembler.fromAccountAddress(
      connection,
      assemblerAddress
    );
    return new AssetAssembler(assemblerAddress, assembler);
  }

  static async new(honeycomb: Honeycomb, args: CreateAssemblerArgs) {
    const { assemblerAddress } = await createAssembler(honeycomb, {
      args,
      programId: PROGRAM_ID,
    });
    return await AssetAssembler.fromAddress(
      new web3.Connection(honeycomb.connection.rpcEndpoint, "processed"),
      assemblerAddress
    );
  }

  public honeycomb() {
    return this._honeycomb;
  }

  public proofIndex() {
    return this._proofIndex;
  }

  public assembler() {
    return this._assembler;
  }

  public fetch() {
    return this._fetch;
  }

  public create() {
    return this._create;
  }

  public blocks() {
    return this._blocks;
  }

  public nfts() {
    return this._nfts;
  }

  public async reload() {
    return AssetAssembler.fromAddress(
      this._honeycomb.connection,
      this.assemblerAddress
    ).then((assembler) => {
      Object.assign(this, assembler);
      return this;
    });
  }

  public update(args: UpdateAssemblerArgs) {
    return updateAssembler(
      this._honeycomb,
      {
        args,
        programId: this.programId,
      },
      this._proofIndex
    ).then((res) => this.reload());
  }

  public loadBlocks() {
    return this.fetch()
      .blocks()
      .then((blocks) => {
        this._blocks = blocks;
        return blocks;
      });
  }

  public loadNfts() {
    return this.fetch()
      .nfts()
      .then((nfts) => {
        this._nfts = nfts;
        return nfts;
      });
  }

  public load() {
    return Promise.all([this.loadBlocks(), this.loadNfts()]);
  }

  public addBlock(block: AssetAssemblerBlock) {
    this._blocks.push(block);
  }

  public addBlockDefinition(blockDefinition: AssetAssemblerBlockDefinition) {
    const block = this._blocks.find(
      (x) => x.address.toBase58() === blockDefinition.block.toBase58()
    );
    if (!block) throw new Error("Block not found");
    block.blockDefinitions.push(blockDefinition);
  }

  public addNft(nft: AssetAssemblerNft) {
    this._nfts.push(nft);
  }

  install(honeycomb: Honeycomb): Honeycomb {
    honeycomb.assembler = () => this;
    this._honeycomb = honeycomb;
    this._proofIndex = honeycomb
      .project()
      .services.findIndex(
        (service) =>
          service.__kind === "Assembler" &&
          service.assemblerId.toBase58() === this.assemblerAddress.toBase58()
      );
    if (this._proofIndex === -1)
      throw new Error("Assembler not found in honeycomb services");
    return honeycomb;
  }
}

export class AssetAssemblerFetch {
  private _assembler: AssetAssembler;

  constructor(assembler: AssetAssembler) {
    this._assembler = assembler;
  }

  public block(blockAddress: web3.PublicKey) {
    return Block.fromAccountAddress(
      this._assembler.honeycomb().connection,
      blockAddress
    )
      .then((x) => ({ address: blockAddress, ...x }))
      .then((block) =>
        this.blockDefinitions(block.address).then(
          (blockDefinitions) =>
            ({
              ...block,
              blockDefinitions,
            } as AssetAssemblerBlock)
        )
      );
  }

  public blockDefinition(blockDefinitionAddress: web3.PublicKey) {
    return BlockDefinition.fromAccountAddress(
      this._assembler.honeycomb().connection,
      blockDefinitionAddress
    ).then(
      (x) =>
        ({
          address: blockDefinitionAddress,
          ...x,
        } as AssetAssemblerBlockDefinition)
    );
  }

  public nft(nftAddress: web3.PublicKey) {
    return NFT.fromAccountAddress(
      this._assembler.honeycomb().connection,
      nftAddress
    ).then((x) => ({ address: nftAddress, ...x }));
  }

  public blocks() {
    return Block.gpaBuilder()
      .addFilter("assembler", this._assembler.assemblerAddress)
      .run(this._assembler.honeycomb().connection)
      .then(
        (x) =>
          x
            .map((y) => {
              try {
                return {
                  address: y.pubkey,
                  ...Block.fromAccountInfo(y.account)[0],
                };
              } catch {}
            })
            .filter((x) => x) as AssetAssemblerBlock[]
      )
      .then((blocks) =>
        Promise.all(
          blocks.map((block) =>
            this.blockDefinitions(block.address).then(
              (blockDefinitions) =>
                ({
                  ...block,
                  blockDefinitions,
                } as AssetAssemblerBlock)
            )
          )
        )
      );
  }

  public blockDefinitions(block: web3.PublicKey) {
    return BlockDefinition.gpaBuilder()
      .addFilter("block", block)
      .run(this._assembler.honeycomb().connection)
      .then(
        (x) =>
          x
            .map((y) => {
              try {
                return {
                  address: y.pubkey,
                  ...BlockDefinition.fromAccountInfo(y.account)[0],
                };
              } catch {}
            })
            .filter((x) => x) as AssetAssemblerBlockDefinition[]
      );
  }

  public nfts() {
    return NFT.gpaBuilder()
      .addFilter("assembler", this._assembler.assemblerAddress)
      .run(this._assembler.honeycomb().connection)
      .then(
        (x) =>
          x
            .map((y) => {
              try {
                return new AssetAssemblerNft(
                  this._assembler,
                  y.pubkey,
                  NFT.fromAccountInfo(y.account)[0]
                );
              } catch {}
            })
            .filter((x) => x) as AssetAssemblerNft[]
      );
  }

  public nftsByWallet(wallet: web3.PublicKey) {
    return NFT.gpaBuilder()
      .addFilter("assembler", this._assembler.assemblerAddress)
      .addFilter("authority", wallet)
      .run(this._assembler.honeycomb().connection)
      .then(
        (x) =>
          x
            .map((y) => {
              try {
                return new AssetAssemblerNft(
                  this._assembler,
                  y.pubkey,
                  NFT.fromAccountInfo(y.account)[0]
                );
              } catch {}
            })
            .filter((x) => x) as AssetAssemblerNft[]
      );
  }
}

export class AssetAssemblerCreate {
  private _assembler: AssetAssembler;

  constructor(assembler: AssetAssembler) {
    this._assembler = assembler;
  }

  public assembler() {
    return this._assembler;
  }

  public nft() {
    return createNft(this._assembler.honeycomb(), {
      programId: this._assembler.programId,
    })
      .then((res) => AssetAssemblerNft.fromAddress(this._assembler, res.nft))
      .then((nft) => {
        this._assembler.addNft(nft);
        return nft;
      });
  }

  public block(args: CreateBlockArgs) {
    console.log("index", this._assembler.proofIndex());
    return createBlock(
      this._assembler.honeycomb(),
      {
        args: {
          ...args,
          blockOrder: this._assembler.blocks().length,
        },
        programId: this._assembler.programId,
      },
      this._assembler.proofIndex()
    )
      .then((res) =>
        Block.fromAccountAddress(
          this._assembler.honeycomb().connection,
          res.block
        ).then(
          (x) =>
            ({
              address: res.block,
              blockDefinitions: [],
              ...x,
            } as AssetAssemblerBlock)
        )
      )
      .then((block) => {
        this._assembler.addBlock(block);
        return block;
      });
  }

  public blockDefinition(args: CreateBlockDefinitionArgs) {
    return createBlockDefinition(
      this._assembler.honeycomb(),
      {
        args: args.value,
        block: args.block,
        blockDefinitionMint: args.mint,
        programId: this._assembler.programId,
      },
      this._assembler.proofIndex()
    )
      .then((res) =>
        BlockDefinition.fromAccountAddress(
          this._assembler.honeycomb().connection,
          res.blockDefinition
        ).then((x) => ({ address: res.blockDefinition, ...x }))
      )
      .then((blockDefinition) => {
        this._assembler.addBlockDefinition(blockDefinition);
        return blockDefinition;
      });
  }
}

export class AssetAssemblerNft {
  private _assembler: AssetAssembler;

  public readonly authority: web3.PublicKey;
  public readonly collectionAddress: web3.PublicKey;
  public readonly mintAddress: web3.PublicKey;
  public readonly name: string;
  public readonly symbol: string;
  public readonly description: string;
  public readonly minted: boolean;
  public readonly id: number;
  public readonly uri: string;
  public readonly isGenerated: boolean;
  public readonly attributes: NFTAttribute[];

  constructor(
    assembler: AssetAssembler,
    public readonly nftAddress: web3.PublicKey,
    private readonly _nft: NFT
  ) {
    if (!assembler.assemblerAddress.equals(_nft.assembler))
      throw new Error("NFT does not belong to this assembler");

    this._assembler = assembler;
    this.authority = _nft.authority;
    this.collectionAddress = _nft.collectionAddress;
    this.mintAddress = _nft.mint;
    this.name = _nft.name;
    this.symbol = _nft.symbol;
    this.description = _nft.description;
    this.minted = _nft.minted;
    this.id = _nft.id;
    this.uri = _nft.uri;
    this.isGenerated = _nft.isGenerated;
    this.attributes = _nft.attributes;

    console.log("nft", _nft);
  }

  static async fromAddress(
    assembler: AssetAssembler,
    nftAddress: web3.PublicKey
  ) {
    const nft = await NFT.fromAccountAddress(
      new web3.Connection(
        assembler.honeycomb().connection.rpcEndpoint,
        "processed"
      ),
      nftAddress
    );
    return new AssetAssemblerNft(assembler, nftAddress, nft);
  }

  public assembler() {
    return this._assembler;
  }

  public nft() {
    return this._nft;
  }

  public async reload() {
    return NFT.fromAccountAddress(
      this._assembler.honeycomb().connection,
      this.nftAddress
    ).then((nft) => {
      Object.assign(
        this,
        new AssetAssemblerNft(this._assembler, this.nftAddress, nft)
      );
      return this;
    });
  }

  public addBlock(blockDefinition: AssetAssemblerBlockDefinition) {
    return addBlock(this._assembler.honeycomb(), {
      nft: this,
      blockDefinition,
      programId: this._assembler.programId,
    }).then(() => this.reload());
  }

  public removeBlock(blockDefinition: AssetAssemblerBlockDefinition) {
    return removeBlock(this._assembler.honeycomb(), {
      nft: this,
      blockDefinition,
      programId: this._assembler.programId,
    }).then(() => this.reload());
  }

  public mint() {
    return mintNft(this._assembler.honeycomb(), {
      nftMint: this.mintAddress,
      blocks: this.attributes,
      programId: this._assembler.programId,
    }).then(() => this.reload());
  }

  public burn() {
    return burnNft(this._assembler.honeycomb(), {
      nft: this,
      programId: this._assembler.programId,
    }).then(() => this.reload());
  }
}

export const assetAssemblerModule = (
  honeycomb: Honeycomb,
  args: web3.PublicKey | CreateAssemblerArgs
) =>
  isPublicKey(args)
    ? AssetAssembler.fromAddress(honeycomb.connection, args)
    : AssetAssembler.new(honeycomb, args);
