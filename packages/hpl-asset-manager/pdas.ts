import * as web3 from "@solana/web3.js";
import { PROGRAM_ID } from "./generated";
import { PdaModule } from "@honeycomb-protocol/hive-control";
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

  return PdaModule.findProgramAddressSyncWithSeeds(seeds, programId);
};

export const getAssetManagerPda = (
  project: web3.PublicKey,
  service_index: number,
  programId = PROGRAM_ID
) => {
  return PdaModule.findProgramAddressSyncWithSeeds(
    [
      Buffer.from("asset_manager"),
      project.toBuffer(),
      Buffer.from([service_index]),
      // new Uint8Array([service_index]),
    ],
    programId
  );
};

export const getAssetPda = (mint: web3.PublicKey, programId = PROGRAM_ID) => {
  return PdaModule.findProgramAddressSyncWithSeeds(
    [Buffer.from("asset"), mint.toBuffer()],
    programId
  );
};
