import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  CurrencyKind,
  PROGRAM_ID,
  PermissionedCurrencyKind,
} from "../generated";

/**
 * Represents the different types of metadata PDAs.
 * @category Types
 */
type MetadataPDaType =
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

  return PublicKey.findProgramAddressSync(seeds, programId);
};

/**
 * Generates a PDA for the currency program based on the given `mint`.
 * @category Helpers
 * @param mint The mint public key.
 * @param programId The program ID of the currency program (optional, default is PROGRAM_ID).
 * @returns The generated PDA address for the currency program.
 */
export const currencyPda = (mint: PublicKey, programId = PROGRAM_ID) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("currency"), mint.toBuffer()],
    programId
  );

/**
 * Generates a PDA for the holder account based on the given `owner` and `mint`.
 * @category Helpers
 * @param owner The owner public key of the holder account.
 * @param mint The mint public key.
 * @param programId The program ID of the holder account program (optional, default is PROGRAM_ID).
 * @returns The generated PDA address for the holder account.
 */
export const holderAccountPda = (
  owner: PublicKey,
  mint: PublicKey,
  programId = PROGRAM_ID
) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("holder_account"), owner.toBuffer(), mint.toBuffer()],
    programId
  );

/**
 * Generates a PDA for the token account based on the given `owner`, `mint`, `tokenProgram`, and `programId`.
 * @category Helpers
 * @param owner The owner public key of the token account.
 * @param mint The mint public key.
 * @param tokenProgram The program ID of the SPL Token program (optional, default is TOKEN_PROGRAM_ID).
 * @param programId The program ID of the token account program (optional, default is PROGRAM_ID).
 * @returns The generated PDA address for the token account.
 */
export const tokenAccountPda = (
  owner: PublicKey,
  mint: PublicKey,
  tokenProgram = TOKEN_PROGRAM_ID,
  programId = PROGRAM_ID
) =>
  PublicKey.findProgramAddressSync(
    [
      owner.toBuffer(),
      mint.toBuffer(),
      programId.toBuffer(),
      tokenProgram.toBuffer(),
    ],
    programId
  );

/**
 * Generates both the holder account PDA and the associated token account PDA for a given `owner`, `mint`,
 * `currencyKind`, `tokenProgram`, and `programId`.
 * @category Helpers
 * @param owner The owner public key of the holder account.
 * @param mint The mint public key.
 * @param currencyKind The type of currency (e.g., permissioned or non-permissioned).
 * @param tokenProgram The program ID of the SPL Token program (optional, default is TOKEN_PROGRAM_ID).
 * @param programId The program ID of the token account program (optional, default is PROGRAM_ID).
 * @returns An object containing the generated PDA addresses for both the holder account and the token account.
 */
export const holderAccountPdas = (
  owner: PublicKey,
  mint: PublicKey,
  currencyKind: CurrencyKind,
  tokenProgram = TOKEN_PROGRAM_ID,
  programId = PROGRAM_ID
): { holderAccount: PublicKey; tokenAccount: PublicKey } => {
  const [holderAccount] = holderAccountPda(owner, mint);
  const [tokenAccount] = tokenAccountPda(
    currencyKind.__kind === "Permissioned" &&
      currencyKind.kind === PermissionedCurrencyKind.Custodial
      ? holderAccount
      : owner,
    mint,
    tokenProgram,
    programId
  );

  return { holderAccount, tokenAccount };
};
