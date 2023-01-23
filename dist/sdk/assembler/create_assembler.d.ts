import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { CreateAssemblerArgs } from "../../generated";
import { TxSigners } from "../../types";
export declare function createCreateAssemblerTransaction(authority: web3.PublicKey, payer: web3.PublicKey, args: CreateAssemblerArgs, programId?: web3.PublicKey): TxSigners & {
    assembler: web3.PublicKey;
};
export declare function createAssembler(connection: web3.Connection, wallet: anchor.Wallet, args: CreateAssemblerArgs): Promise<anchor.web3.PublicKey>;
