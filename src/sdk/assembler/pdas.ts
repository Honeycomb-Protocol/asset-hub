import * as web3 from "@solana/web3.js";
import {
  DelegateAuthorityPermission,
  PROGRAM_ID as ASSEMBLER_PROGRAM_ID,
} from "../../generated/assembler";
import { PROGRAM_ID as ASSETMANAGER_PROGRAM_ID } from "../../generated/assetmanager";

export const METADATA_PROGRAM_ID = new web3.PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
// Metaplex
export const getMetadataAccount_ = (
  mint: web3.PublicKey,
  edition: boolean = false,
  programId = METADATA_PROGRAM_ID
) => {
  const seeds = [
    Buffer.from("metadata"),
    METADATA_PROGRAM_ID.toBuffer(),
    mint.toBuffer(),
  ];
  if (edition) seeds.push(Buffer.from("edition"));
  return web3.PublicKey.findProgramAddressSync(seeds, programId);
};

// Assembler
export const getAssemblerPda = (
  collectionMint: web3.PublicKey,
  programId = ASSEMBLER_PROGRAM_ID
) => {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("assembler"), collectionMint.toBuffer()],
    programId
  );
};

export const getNftPda = (
  mint: web3.PublicKey,
  programId = ASSEMBLER_PROGRAM_ID
) => {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("nft"), mint.toBuffer()],
    programId
  );
};

export const getDepositPda = (
  tokenMint: web3.PublicKey,
  nftMint: web3.PublicKey,
  programId = ASSEMBLER_PROGRAM_ID
) => {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("deposit"), tokenMint.toBuffer(), nftMint.toBuffer()],
    programId
  );
};

export const getBlockPda = (
  assembler: web3.PublicKey,
  blockOrder: number,
  programId = ASSEMBLER_PROGRAM_ID
) => {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("block"),
      // Buffer.from(`${args.blockName}`),
      Uint8Array.from([blockOrder]),
      assembler.toBuffer(),
    ],
    programId
  );
};

export const getDelegateAuthorityPda = (
  assembler: web3.PublicKey,
  delegate: web3.PublicKey,
  permission: DelegateAuthorityPermission,
  programId = ASSEMBLER_PROGRAM_ID
) => {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("delegate"),
      assembler.toBuffer(),
      delegate.toBuffer(),
      Buffer.from(DelegateAuthorityPermission[permission]),
    ],
    programId
  );
};

export const getBlockDefinitionPda = (
  block: web3.PublicKey,
  blockDefinitionMint: web3.PublicKey,
  programId = ASSEMBLER_PROGRAM_ID
) => {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("block_definition"),
      block.toBuffer(),
      blockDefinitionMint.toBuffer(),
    ],
    programId
  );
};

export function getUniqueConstraintPda(
  blocks: { order: number; blockDefinitionIndex: number }[],
  assembler: web3.PublicKey,
  programId = ASSEMBLER_PROGRAM_ID
) {
  const buffer = Buffer.alloc(blocks.length * 4); // 2 bytes for each block
  console.log(buffer.length);

  blocks
    .sort((a, b) => a.order - b.order)
    .forEach((x, i) => {
      console.log(x.order);
      buffer.writeUint16BE(x.blockDefinitionIndex, i * 4); // 2 bytes offset after each block
      buffer.writeUint16BE(x.order, i * 4 + 2); // 2 bytes offset after each block
    });

  return web3.PublicKey.findProgramAddressSync(
    [buffer, assembler.toBuffer()],
    programId
  );
}

// AssetManager

// Assembler
export const getAssetPda = (
  mint: web3.PublicKey,
  programId = ASSETMANAGER_PROGRAM_ID
) => {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("asset"), mint.toBuffer()],
    programId
  );
};