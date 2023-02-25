import * as web3 from "@solana/web3.js";
import { PROGRAM_ID as ASSETMANAGER_PROGRAM_ID } from "../generated/assetmanager";
type MetadataPDaType =
  | { __kind: "edition" }
  | { __kind: "token_record"; tokenAccount: web3.PublicKey }
  | { __kind: "persistent_delegate"; tokenAccountOwner: web3.PublicKey };

export const METADATA_PROGRAM_ID = new web3.PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
// Metaplex
export const getMetadataAccount_ = (
  mint: web3.PublicKey,
  type?: MetadataPDaType,
  programId = METADATA_PROGRAM_ID
) => {
  const seeds = [
    Buffer.from("metadata"),
    programId.toBuffer(),
    mint.toBuffer(),
  ];

  if (type) {
    seeds.push(Buffer.from(type.__kind));
    switch (type.__kind) {
      case "token_record":
        seeds.push(type.tokenAccount.toBuffer());
        break;
      case "persistent_delegate":
        seeds.push(type.tokenAccountOwner.toBuffer());
        break;
      default:
        break;
    }
  }

  return web3.PublicKey.findProgramAddressSync(seeds, programId);
};

// AssetManager

export const getAssetPda = (
  mint: web3.PublicKey,
  programId = ASSETMANAGER_PROGRAM_ID
) => {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("asset"), mint.toBuffer()],
    programId
  );
};
