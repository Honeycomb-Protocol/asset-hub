import type { PublicKey } from "@solana/web3.js";

export type CompressedData<T = any> = {
  id: number;
  tree_id: string;
  leaf_idx: number;
  parsed_data: T;
};

export type Proof = {
  root: PublicKey;
  proof: PublicKey[];
  node_index: number;
  leaf: PublicKey;
  tree_id: PublicKey;
};
