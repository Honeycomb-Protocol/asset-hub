import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { TxSigners } from "../../types";
export declare function createMintAssetTransaction(assetManager: web3.PublicKey, asset: web3.PublicKey, mint: web3.PublicKey, wallet: web3.PublicKey, amount: number, candyGuard?: web3.PublicKey, programId?: anchor.web3.PublicKey): TxSigners;
export declare function mintAsset(connection: web3.Connection, wallet: anchor.Wallet, asset: web3.PublicKey, amount: number): Promise<{
    txId: string;
}>;
