import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  CurrencyKind,
  PROGRAM_ID,
  PermissionedCurrencyKind,
} from "../generated";

type MetadataPDaType =
  | { __kind: "edition" }
  | { __kind: "token_record"; tokenAccount: PublicKey }
  | { __kind: "persistent_delegate"; tokenAccountOwner: PublicKey };

export const METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

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

export const currencyPda = (mint: PublicKey, programId = PROGRAM_ID) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("currency"), mint.toBuffer()],
    programId
  );

export const holderAccountPda = (
  owner: PublicKey,
  mint,
  programId = PROGRAM_ID
) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("holder_account"), owner.toBuffer(), mint.toBuffer()],
    programId
  );

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

export const holderAccountPdas = (
  owner: PublicKey,
  mint: PublicKey,
  currencyKind: CurrencyKind,
  tokenProgram = TOKEN_PROGRAM_ID,
  programId = PROGRAM_ID
) => {
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
