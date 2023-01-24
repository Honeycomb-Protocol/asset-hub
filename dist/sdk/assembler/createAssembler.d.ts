import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { CreateAssemblerArgs } from "../../generated";
import { TxSignersAccounts } from "../../types";
export declare function createCreateAssemblerTransaction(authority: web3.PublicKey, payer: web3.PublicKey, args: CreateAssemblerArgs, programId?: web3.PublicKey): TxSignersAccounts & {
    assembler: web3.PublicKey;
};
export declare function createAssembler(connection: web3.Connection, wallet: anchor.Wallet, args: CreateAssemblerArgs): Promise<{
    txId: string;
    assembler: anchor.web3.PublicKey;
}>;
