import * as web3 from "@solana/web3.js";
import { AssemblingAction } from "../../generated";
import { CreateAndMintNftArgs, TxSignersAccounts } from "../../types";
export declare function createCreateNftTransaction(assembler: web3.PublicKey, collectionMint: web3.PublicKey, authority: web3.PublicKey, payer: web3.PublicKey, programId?: web3.PublicKey): TxSignersAccounts & {
    nft: web3.PublicKey;
    nftMint: web3.PublicKey;
};
export declare function createAddBlockTransaction(assembler: web3.PublicKey, nft: web3.PublicKey, nftMint: web3.PublicKey, block: web3.PublicKey, blockDefinition: web3.PublicKey, tokenMint: web3.PublicKey, authority: web3.PublicKey, payer: web3.PublicKey, assemblingAction?: AssemblingAction, programId?: web3.PublicKey): TxSignersAccounts;
export declare function createMintNftTransaction(assembler: web3.PublicKey, nftMint: web3.PublicKey, authority: web3.PublicKey, payer: web3.PublicKey, programId?: web3.PublicKey): TxSignersAccounts;
export declare function buildCreateAndMintNftCtx({ mx, assembler, blocks, }: CreateAndMintNftArgs): Promise<{
    txns: TxSignersAccounts[];
    nft: web3.PublicKey;
    nftMint: web3.PublicKey;
}>;
export declare function createAndMintNft({ mx, assembler, blocks, }: CreateAndMintNftArgs): Promise<{
    responses: web3.RpcResponseAndContext<web3.SignatureResult>[];
    nftMint: web3.PublicKey;
    nft: web3.PublicKey;
}>;
