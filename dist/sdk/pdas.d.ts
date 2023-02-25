import * as web3 from "@solana/web3.js";
type MetadataPDaType = {
    __kind: "edition";
} | {
    __kind: "token_record";
    tokenAccount: web3.PublicKey;
} | {
    __kind: "persistent_delegate";
    tokenAccountOwner: web3.PublicKey;
};
export declare const METADATA_PROGRAM_ID: web3.PublicKey;
export declare const getMetadataAccount_: (mint: web3.PublicKey, type?: MetadataPDaType, programId?: web3.PublicKey) => [web3.PublicKey, number];
export declare const getAssetPda: (mint: web3.PublicKey, programId?: web3.PublicKey) => [web3.PublicKey, number];
export {};
