import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";
import { TxSignersAccounts } from "../../types";
export declare function createMintAssetTransaction(mx: Metaplex, assetAddress: web3.PublicKey, amount: number, group?: string, programId?: anchor.web3.PublicKey): Promise<TxSignersAccounts>;
export declare function mintAsset(mx: Metaplex, assetAddress: web3.PublicKey, amount: number): Promise<{
    response: import("@metaplex-foundation/js").SendAndConfirmTransactionResponse;
}>;
