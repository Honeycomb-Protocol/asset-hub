import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { CreateAssetArgs } from "../../generated";
import { TxSignersAccounts } from "../../types";
import { CreateCandyGuardBuilderContext, Metaplex, TransactionBuilder } from "@metaplex-foundation/js";
export declare function createCreateAssetTransaction(payer: web3.PublicKey, args: CreateAssetArgs, programId?: anchor.web3.PublicKey): TxSignersAccounts & {
    mint: web3.PublicKey;
    asset: web3.PublicKey;
};
export declare function buildCreateAssetCtx(mx: Metaplex, args: CreateAssetArgs, candyGuardBuilder?: TransactionBuilder<CreateCandyGuardBuilderContext>): Promise<TxSignersAccounts & {
    mint: anchor.web3.PublicKey;
    asset: anchor.web3.PublicKey;
}>;
export declare function createAsset(mx: Metaplex, args: CreateAssetArgs, candyGuardBuilder?: TransactionBuilder<CreateCandyGuardBuilderContext>): Promise<{
    response: import("@metaplex-foundation/js").SendAndConfirmTransactionResponse;
    mint: anchor.web3.PublicKey;
}>;
