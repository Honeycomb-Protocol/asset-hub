import { PublicKey } from "@solana/web3.js";

export interface HeluisAsset {
  interface: string;
  id: string;
  content: {
    $schema: string;
    json_uri: string;
    files: {
      uri: string;
      cdn_uri: string;
      mime: string;
    }[];
    metadata: {
      name: string;
      symbol: string;
      attributes?: {
        value: string;
        trait_type: string;
      }[];
      description?: string;
      token_standard?: string;
      [key: string]: unknown;
    };
    links: {
      image?: string;
      [key: string]: string | undefined;
    };
  };
  authorities: {
    address: string;
    scopes: string[];
  }[];
  compression: {
    eligible: boolean;
    compressed: boolean;
    data_hash: string;
    creator_hash: string;
    asset_hash: string;
    tree: string;
    seq: number;
    leaf_id: number;
  };
  grouping: {
    group_key: string;
    group_value: string;
  }[];
  royalty: {
    royalty_model: string;
    target: any;
    percent: number;
    basis_points: number;
    primary_sale_happened: boolean;
    locked: boolean;
  };
  creators: {
    address: string;
    share: number;
    verified: boolean;
  }[];
  ownership: {
    frozen: boolean;
    delegated: boolean;
    delegate?: string;
    ownership_model: string;
    owner: string;
  };
  supply?: {
    print_max_supply: number;
    print_current_supply: number;
    edition_nonce: any;
  };
  mutable: boolean;
  burnt: boolean;
}

/**
 * Represents the uri data of an NFT.
 * @category Types
 */
export type JsonMetadata = {
  name?: string;
  symbol?: string;
  description?: string;
  seller_fee_basis_points?: number;
  image?: string;
  external_url?: string;
  attributes?: Array<{
    trait_type?: string;
    value?: string;
    [key: string]: unknown;
  }>;
  properties?: {
    creators?: Array<{
      address?: string;
      share?: number;
      [key: string]: unknown;
    }>;
    files?: Array<{
      type?: string;
      uri?: string;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };
  collection?: {
    name?: string;
    family?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

/**
 * Represents the metadata of an NFT.
 * @category Types
 */
export type Metadata = {
  mint: PublicKey;
  json?: JsonMetadata | null;
  jsonLoaded: boolean;
  name: string;
  symbol: string;
  uri: string;
  creators: {
    address: PublicKey;
    share: number;
    verified: boolean;
  }[];
  collection?: {
    verified: boolean;
    address: PublicKey;
  } | null;
  frozen: boolean;

  isProgrammableNft?: boolean | null;
  programmableConfig?: { ruleSet: PublicKey } | null;

  compression?: {
    leafId: number;
    dataHash: PublicKey;
    creatorHash: PublicKey;
    assetHash: PublicKey;
    tree: PublicKey;
    proof?: AssetProof;
  } | null;
  isCompressed: boolean;

  links?: {
    [key: string]: string | undefined;
  } | null;
};

/**
 * Represents the proof data of cNFT for merkle tree.
 * @category Types
 */
export interface AssetProof {
  root: PublicKey;
  proof: PublicKey[];
  node_index: number;
  leaf: PublicKey;
  tree_id: PublicKey;
}

export const parseHeliusAsset = (asset: HeluisAsset): Metadata => {
  let collection: any = null;
  const foundCollection = asset.grouping.find(
    (g) => g.group_key === "collection"
  );
  if (foundCollection) {
    collection = {
      verified: true,
      address: new PublicKey(
        asset.grouping.find((g) => g.group_key === "collection")!.group_value
      ),
    };
  }
  return {
    mint: new PublicKey(asset.id),
    json: null,
    jsonLoaded: false,
    name: asset.content.metadata.name,
    symbol: asset.content.metadata.symbol,
    uri: asset.content.json_uri,
    creators: asset.creators.map((creator) => ({
      ...creator,
      address: new PublicKey(creator.address),
    })),
    collection,
    isProgrammableNft:
      asset.content?.metadata?.token_standard == "ProgrammableNonFungible" ||
      asset.interface === "ProgrammableNFT",
    programmableConfig: {
      ruleSet: new PublicKey("eBJLFYPxJmMGKuFwpDWkzxZeUrad92kZRC5BJLpzyT9"),
    },
    isCompressed: asset.compression.compressed,
    frozen: asset.ownership.delegated || !!asset.ownership.delegate,
    compression: !asset.compression.compressed
      ? null
      : {
          leafId: asset.compression.leaf_id,
          dataHash: new PublicKey(asset.compression.data_hash),
          creatorHash: new PublicKey(asset.compression.creator_hash),
          assetHash: new PublicKey(asset.compression.asset_hash),
          tree: new PublicKey(asset.compression.tree),
        },
    links: asset.content.links,
  };
};

/**
 * Fetches the merkle proof of the cNFT
 *
 * @param args Arguements containing mint of cNFT
 * @returns A promise that resolves to AssetProof object
 *
 * @example
 * const assetProof = await getAssetProof(new web3.PulicKey(...));
 */
export async function fetchAssetProof(
  heliusRpc: string,
  mint: PublicKey
): Promise<AssetProof> {
  const response = await fetch(heliusRpc as string, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "my-id",
      method: "getAssetProof",
      params: {
        id: mint.toString(),
      },
    }),
  });
  const { result } = await response.json();

  return {
    root: new PublicKey(result.root),
    proof: result.proof.map((x: string) => new PublicKey(x)),
    node_index: result.node_index,
    leaf: new PublicKey(result.root),
    tree_id: new PublicKey(result.root),
  };
}

/**
 * Fetches the merkle proof of the cNFTs
 *
 * @param args Arguements containing mints of cNFTs
 * @returns A promise that resolves to AssetProof objects
 *
 * @example
 * const assetProofs = await fetchAssetProofBatch(new web3.PulicKey(...));
 */
export async function fetchAssetProofBatch(
  heliusRpc: string,
  mints: PublicKey[]
): Promise<{ [mint: string]: AssetProof }> {
  if (mints.length === 0) {
    return {};
  }

  const response = await fetch(heliusRpc, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "my-id",
      method: "getAssetProofBatch",
      params: {
        ids: mints.map((mint) => mint.toString()),
      },
    }),
  });

  const { result } = await response.json();

  const proofs: { [mint: string]: AssetProof } = {};

  for (const key in result) {
    if (result.hasOwnProperty(key)) {
      const entry = result[key];
      proofs[key] = {
        root: new PublicKey(entry.root),
        proof: entry.proof.map((x: string) => new PublicKey(x)),
        node_index: entry.node_index,
        leaf: new PublicKey(entry.leaf),
        tree_id: new PublicKey(entry.tree_id),
      };
    }
  }

  return proofs;
}

/**
 * Fetches compressed NFTs of the provided wallet & collection or asset list
 *
 * @param args Arguements containing wallet address and collection address
 * @returns A promise that resolves to metadata objects of cNFTs
 *
 * @example
 * const cnfts = await fetchCNfts({
 *   walletAddress: 'YOUR_WALLET_ADDRESS',
 *   collectionAddress: 'COLLECTION_ADDRESS',
 * });
 */
export async function fetchHeliusAssets(
  heliusRpc: string,
  args:
    | {
        walletAddress: PublicKey;
        collectionAddress: PublicKey;
      }
    | { mintList: PublicKey[] }
) {
  if ("mintList" in args) {
    try {
      return await fetch(heliusRpc, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "my-id",
          method: "getAssetBatch",
          params: {
            ids: args.mintList,
          },
        }),
      })
        .then((r) => r.json())
        .then(
          ({ result }) =>
            result.filter((x) => !!x).map(parseHeliusAsset) as Metadata[]
        );
    } catch (e) {
      console.error(e);
      console.error(e.response.data);
      return [];
    }
  }

  let page: number = 1;
  let assetList: any = [];
  while (page > 0) {
    try {
      const { result } = await fetch(heliusRpc, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Math.random().toString(36).substring(7),
          method: "searchAssets",
          params: {
            ownerAddress: args.walletAddress.toString(),
            grouping: ["collection", args.collectionAddress.toString()],
            page: page,
            limit: 1000,
          },
        }),
      }).then((r) => r.json());
      assetList.push(...result.items);
      if (result.total !== 1000) {
        page = 0;
      } else {
        page++;
      }
    } catch (e) {
      console.error(e);
      console.error(e.response.data);
      break;
    }
  }
  return assetList.map(parseHeliusAsset) as Metadata[];
}
