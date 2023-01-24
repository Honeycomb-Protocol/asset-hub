import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { CreateAssetArgs } from "../../generated";
import { TxSignersAccounts } from "../../types";
import { CreateCandyGuardBuilderContext, TransactionBuilder } from "@metaplex-foundation/js";
export declare function createCreateAssetTransaction(payer: web3.PublicKey, args: CreateAssetArgs, programId?: anchor.web3.PublicKey): TxSignersAccounts & {
    asset: web3.PublicKey;
};
export declare function createAsset(connection: web3.Connection, wallet: anchor.Wallet, candyGuardBuilder: TransactionBuilder<CreateCandyGuardBuilderContext>, args: CreateAssetArgs): Promise<{
    txId: string;
    asset: anchor.web3.PublicKey;
}>;
