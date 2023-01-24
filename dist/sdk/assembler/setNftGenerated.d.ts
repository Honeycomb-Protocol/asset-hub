import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { TxSignersAccounts } from "../../types";
export declare function createSetNftGeneratedTransaction(nft: web3.PublicKey, programId?: web3.PublicKey): TxSignersAccounts;
export declare function createAssembler(nft: web3.PublicKey, connection: web3.Connection, wallet: anchor.Wallet): Promise<{
    txId: string;
}>;
