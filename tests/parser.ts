import { MerkleTree } from "@solana/spl-account-compression";
import keccak from "keccak";
import { Holding } from "../packages/hpl-resource-manager";

export function keccak256Hash(buffers: Buffer[]): number[] {
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

  return resultArray;
}

export const holdingInfoHash = (info: Holding) => {
  let buff = Buffer.alloc(8);
  if (typeof info.balance === "number") {
    buff.writeBigInt64BE(BigInt(info.balance));
  } else {
    buff = info.balance.toBuffer();
  }

  return keccak256Hash([info.holder.toBuffer(), buff]);
};

export const createSparseMerkleTree = (leaves: Buffer[], depth: number) =>
  MerkleTree.sparseMerkleTreeFromLeaves(leaves, depth);
