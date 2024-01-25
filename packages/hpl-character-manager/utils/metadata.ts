import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

/**
 * Represents the different types of metadata PDAs.
 * @category Types
 */
type MetadataPdaType =
  | { __kind: "edition" }
  | { __kind: "token_record"; tokenAccount: PublicKey }
  | { __kind: "persistent_delegate"; tokenAccountOwner: PublicKey };

/**
 * The public key of the metadata program on Solana.
 */
export const METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

/**
 * Generates a PDA (Program Derived Address) for the metadata program based on the given `mint` and `type`.
 * @category Helpers
 * @param mint The mint public key.
 * @param type The type of metadata PDA (optional).
 * @param programId The program ID of the metadata program (optional, default is METADATA_PROGRAM_ID).
 * @returns The generated PDA address for the metadata program.
 */
export const metadataPda = (
  mint: PublicKey,
  type?: MetadataPdaType,
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

  return PublicKey.findProgramAddressSync(seeds, programId);
};

export const nftPdas = (mint: PublicKey, owner: PublicKey) => {
  const nftAccount = getAssociatedTokenAddressSync(mint, owner);
  const [nftMetadata] = metadataPda(mint);
  const [nftEdition] = metadataPda(mint, { __kind: "edition" });
  const [nftTokenRecord] = metadataPda(mint, {
    __kind: "token_record",
    tokenAccount: nftAccount,
  });

  return {
    nftMint: mint,
    nftAccount,
    nftMetadata,
    nftEdition,
    nftTokenRecord,
  };
};
