import * as web3 from "@solana/web3.js";

/**
 * Represents the metadata of an NFT.
 * @category Types
 */
export type Metadata = {
  mint: web3.PublicKey;
  json?: JsonMetadata | null;
  jsonLoaded: boolean;
  name: string;
  symbol: string;
  uri: string;
  creators: {
    address: web3.PublicKey;
    share: number;
    verified: boolean;
  }[];
  collection?: {
    verified: boolean;
    address: web3.PublicKey;
  } | null;
  frozen: boolean;

  isProgrammableNft?: boolean | null;
  programmableConfig?: { ruleSet: web3.PublicKey } | null;

  compression?: {
    leafId: number;
    dataHash: web3.PublicKey;
    creatorHash: web3.PublicKey;
    assetHash: web3.PublicKey;
    tree: web3.PublicKey;
  } | null;
  isCompressed: boolean;

  links?: {
    [key: string]: string;
  } | null;
};

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
 * Represents the proof data of cNFT for merkle tree.
 * @category Types
 */
export interface AssetProof {
  root: web3.PublicKey;
  proof: web3.PublicKey[];
  node_index: number;
  leaf: web3.PublicKey;
  tree_id: web3.PublicKey;
}

/**
 * Represents the available NFT.
 * @category Types
 */
export type AvailableNft = Metadata;
