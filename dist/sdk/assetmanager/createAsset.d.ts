import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { CreateAssetArgs } from "../../generated";
import { TxSigners } from "../../types";
import { CreateCandyGuardBuilderContext, TransactionBuilder } from "@metaplex-foundation/js";
export declare function createCreateAssetTransaction(assetManager: web3.PublicKey, authority: web3.PublicKey, payer: web3.PublicKey, args: CreateAssetArgs, programId?: anchor.web3.PublicKey): TxSigners & {
    asset: web3.PublicKey;
};
export declare function createAsset(connection: web3.Connection, wallet: anchor.Wallet, assetManager: web3.PublicKey, candyGuardBuilder: TransactionBuilder<CreateCandyGuardBuilderContext>, args: CreateAssetArgs): Promise<{
    txId: string;
    asset: anchor.web3.PublicKey;
}>;
