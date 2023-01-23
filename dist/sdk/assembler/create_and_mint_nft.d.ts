import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { AssemblingAction } from "../../generated";
import { TxSigners } from "../../types";
export declare function createCreateNftTransaction(assembler: web3.PublicKey, collectionMint: web3.PublicKey, authority: web3.PublicKey, payer: web3.PublicKey, programId?: web3.PublicKey): TxSigners & {
    accounts: web3.PublicKey[];
    nft: web3.PublicKey;
    nftMint: web3.PublicKey;
};
export declare function createAddBlockTransaction(assembler: web3.PublicKey, nft: web3.PublicKey, nftMint: web3.PublicKey, block: web3.PublicKey, blockDefinition: web3.PublicKey, tokenMint: web3.PublicKey, authority: web3.PublicKey, payer: web3.PublicKey, assemblingAction?: AssemblingAction, programId?: web3.PublicKey): TxSigners & {
    accounts: web3.PublicKey[];
};
export declare function createMintNftTransaction(assembler: web3.PublicKey, nftMint: web3.PublicKey, authority: web3.PublicKey, payer: web3.PublicKey, programId?: web3.PublicKey): TxSigners & {
    accounts: web3.PublicKey[];
};
export declare function createAndMintNft(connection: web3.Connection, wallet: anchor.Wallet, assembler: web3.PublicKey, blocks: {
    block: web3.PublicKey;
    blockDefinition: web3.PublicKey;
    tokenMint: web3.PublicKey;
}[]): Promise<anchor.web3.PublicKey>;
