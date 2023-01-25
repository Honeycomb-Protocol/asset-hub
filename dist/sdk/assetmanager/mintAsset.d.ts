import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";
import { TxSignersAccounts } from "../../types";
export declare function createMintAssetTransaction(metaplex: Metaplex, assetAddress: web3.PublicKey, mint: web3.PublicKey, wallet: web3.PublicKey, amount: number, candyGuardAddress?: web3.PublicKey, group?: string, programId?: anchor.web3.PublicKey): Promise<TxSignersAccounts>;
export declare function buildMintAssetCtx(mx: Metaplex, asset: web3.PublicKey, amount: number): Promise<TxSignersAccounts>;
export declare function mintAsset(mx: Metaplex, asset: web3.PublicKey, amount: number): Promise<{
    response: import("@metaplex-foundation/js").SendAndConfirmTransactionResponse;
}>;
