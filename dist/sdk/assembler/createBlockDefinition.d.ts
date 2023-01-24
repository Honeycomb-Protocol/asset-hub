import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { BlockDefinitionValue } from "../../generated";
import { TxSignersAccounts } from "../../types";
export declare function createCreateBlockDefinitionTransaction(assembler: web3.PublicKey, block: web3.PublicKey, blockDefinitionMint: web3.PublicKey, authority: web3.PublicKey, payer: web3.PublicKey, args: BlockDefinitionValue): TxSignersAccounts & {
    blockDefinition: web3.PublicKey;
};
export declare function createBlockDefinition(connection: web3.Connection, wallet: anchor.Wallet, assembler: web3.PublicKey, block: web3.PublicKey, blockDefinitionMint: web3.PublicKey, args: BlockDefinitionValue): Promise<{
    txId: string;
    blockDefinition: anchor.web3.PublicKey;
}>;
