import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { CreateAssetManagerArgs } from "../../generated";
import { TxSignersAccounts } from "../../types";
export declare function createCreateAssetManagerTransaction(treasury: web3.PublicKey, authority: web3.PublicKey, payer: web3.PublicKey, args: CreateAssetManagerArgs, programId?: anchor.web3.PublicKey): TxSignersAccounts & {
    assetManager: web3.PublicKey;
};
export declare function createAssetManager(connection: web3.Connection, wallet: anchor.Wallet, args: CreateAssetManagerArgs): Promise<{
    txId: string;
    assetManager: anchor.web3.PublicKey;
}>;
