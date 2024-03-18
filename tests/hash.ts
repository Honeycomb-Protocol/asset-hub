import base58 from "bs58";
import keccak from "keccak";
import BN from "bn.js";

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

export const emptyNodeHash = (level: number): Uint8Array => {
  const data = new Uint8Array(32).fill(0);
  if (level !== 0) {
    const lowerEmpty = emptyNodeHash(level - 1);
    const hash = keccak256Hash([
      Buffer.from(lowerEmpty),
      Buffer.from(lowerEmpty),
    ]);
    data.set(hash);
  }
  return data;
};

export const boolHash = (bool: boolean) =>
  keccak256Hash([Buffer.from(bool ? [1] : [0])]);

export const i64Hash = (num: number | BN) => {
  const buf = Buffer.alloc(8);
  if (typeof num === "number") {
    buf.writeBigInt64LE(BigInt(num));
  } else {
    buf.writeBigInt64LE(BigInt(num.toString()));
  }
  return keccak256Hash([buf]);
};

export const u64Hash = (num: number | BN) => {
  const buf = Buffer.alloc(8);
  if (typeof num === "number") {
    buf.writeBigUint64LE(BigInt(num));
  } else {
    buf.writeBigUint64LE(BigInt(num.toString()));
  }
  return keccak256Hash([buf]);
};

export const u32Hash = (num: number) => {
  const buf = Buffer.alloc(4);
  buf.writeUInt32LE(num);
  return keccak256Hash([buf]);
};

export const u8Hash = (num: number) => {
  if (num < 0 || num > 255) throw new Error("Number must be between 0 and 255");
  return keccak256Hash([Buffer.from([num])]);
};

export const stringHash = (str: string) => keccak256Hash([Buffer.from(str)]);

export const optionHash = <T>(
  opt: T | undefined | null,
  cb: (t: T) => Buffer
) => (opt ? cb(opt) : keccak256Hash([Buffer.from([0])]));

export const arrayHash = <T>(arr: T[], cb: (t: T) => Buffer) =>
  keccak256Hash(arr.map(cb));

export const discriminatorHash = (programId: string, accountName: string) => {
  return keccak256Hash([
    Buffer.from(base58.decode(programId)),
    Buffer.from(accountName),
  ]);
};
