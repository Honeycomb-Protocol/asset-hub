import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";
import { Asset } from "../../generated";
import { TxSignersAccounts } from "../../types";
export declare function createMintAssetTransaction(metaplex: Metaplex, asset: Asset, assetAddress: web3.PublicKey, mint: web3.PublicKey, wallet: web3.PublicKey, amount: number, candyGuardAddress?: web3.PublicKey, group?: string, programId?: anchor.web3.PublicKey): Promise<TxSignersAccounts>;
export declare function mintAsset(connection: web3.Connection, wallet: anchor.Wallet, asset: web3.PublicKey, amount: number): Promise<{
    txId: string;
}>;
