import * as web3 from "@solana/web3.js";
import { DelegateAuthorityPermission } from "../../generated/assembler";
export declare const METADATA_PROGRAM_ID: web3.PublicKey;
export declare const getMetadataAccount_: (mint: web3.PublicKey, edition?: boolean, programId?: web3.PublicKey) => [web3.PublicKey, number];
export declare const getAssemblerPda: (collectionMint: web3.PublicKey, programId?: web3.PublicKey) => [web3.PublicKey, number];
export declare const getNftPda: (mint: web3.PublicKey, programId?: web3.PublicKey) => [web3.PublicKey, number];
export declare const getDepositPda: (tokenMint: web3.PublicKey, nftMint: web3.PublicKey, programId?: web3.PublicKey) => [web3.PublicKey, number];
export declare const getBlockPda: (assembler: web3.PublicKey, blockOrder: number, programId?: web3.PublicKey) => [web3.PublicKey, number];
export declare const getDelegateAuthorityPda: (assembler: web3.PublicKey, delegate: web3.PublicKey, permission: DelegateAuthorityPermission, programId?: web3.PublicKey) => [web3.PublicKey, number];
export declare const getBlockDefinitionPda: (block: web3.PublicKey, blockDefinitionMint: web3.PublicKey, programId?: web3.PublicKey) => [web3.PublicKey, number];
export declare function getUniqueConstraintPda(blocks: {
    order: number;
    blockDefinitionIndex: number;
}[], assembler: web3.PublicKey, programId?: web3.PublicKey): [web3.PublicKey, number];
export declare const getAssetPda: (mint: web3.PublicKey, programId?: web3.PublicKey) => [web3.PublicKey, number];
