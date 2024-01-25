import keccak from "keccak";
import { PublicKey } from "@solana/web3.js";
import type { CompressedData, Proof } from "../types";

export function keccak256Hash(buffers: Buffer[]): Buffer {
  // Create a Keccak-256 hash object
  const hash = keccak("keccak256");

  // Concatenate the buffers
  buffers.forEach((buffer) => {
    hash.update(buffer);
  });

  // Get the final hash as a Buffer
  const resultBuffer = hash.digest();

  // Convert the Buffer to an array of numbers
  const resultArray: number[] = [];
  for (let i = 0; i < resultBuffer.length; i++) {
    resultArray.push(resultBuffer.readUInt8(i));
  }

  return Buffer.from(resultArray);
}

export const boolHash = (bool: boolean) => {
  return keccak256Hash([Buffer.from(bool ? [1] : [0])]);
};

export async function getCompressedData<T = any>(
  rpcUrl: string,
  leafIdx: number,
  tree: PublicKey
): Promise<CompressedData<T> | null> {
  const { result, error } = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "my-id",
      method: "getCompressedData",
      params: {
        tree: tree.toString(),
        leafIdx,
      },
    }),
  }).then((res) => res.json());
  if (!result) {
    console.log(error);
    return null;
  }
  return result;
}

export async function getProof(
  rpcUrl: string,
  leafIdx: number,
  tree: PublicKey
): Promise<Proof | null> {
  const { result, error } = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "my-id",
      method: "getProof",
      params: {
        tree: tree.toString(),
        leafIdx,
      },
    }),
  }).then((res) => res.json());
  if (!result) {
    console.log(error);
    return null;
  }
  return {
    leaf: new PublicKey(result.leaf),
    root: new PublicKey(result.root),
    tree_id: new PublicKey(result.tree_id),
    node_index: result.node_index,
    proof: result.proof.map((p) => new PublicKey(p)),
  };
}
