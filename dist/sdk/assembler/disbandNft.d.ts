import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { AssemblingAction } from "../../generated";
import { TxSigners } from "../../types";
export declare function createBurnNFTTransaction(assembler: web3.PublicKey, nft: web3.PublicKey, nftMint: web3.PublicKey, authority: web3.PublicKey, programId?: web3.PublicKey): TxSigners & {
    accounts: web3.PublicKey[];
};
export declare function createRemoveBlockTransaction(assembler: web3.PublicKey, nft: web3.PublicKey, nftMint: web3.PublicKey, block: web3.PublicKey, blockDefinition: web3.PublicKey, tokenMint: web3.PublicKey, authority: web3.PublicKey, assemblingAction?: AssemblingAction, programId?: web3.PublicKey): TxSigners & {
    accounts: web3.PublicKey[];
};
export declare function disbandNft(connection: web3.Connection, wallet: anchor.Wallet, nftMint: web3.PublicKey): Promise<{
    txId: string;
}>;
