import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { CreateBlockArgs } from "../../generated";
import { TxSignersAccounts } from "../../types";
export declare function createCreateBlockTransaction(assembler: web3.PublicKey, authority: web3.PublicKey, payer: web3.PublicKey, args: CreateBlockArgs): TxSignersAccounts & {
    block: web3.PublicKey;
};
export declare function createBlock(connection: web3.Connection, wallet: anchor.Wallet, assembler: web3.PublicKey, args: CreateBlockArgs): Promise<{
    txId: string;
    block: anchor.web3.PublicKey;
}>;
