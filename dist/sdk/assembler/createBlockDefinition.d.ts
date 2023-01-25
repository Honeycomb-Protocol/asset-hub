import { Metaplex } from "@metaplex-foundation/js";
import * as web3 from "@solana/web3.js";
import { BlockDefinitionValue } from "../../generated";
import { TxSignersAccounts } from "../../types";
export declare function createCreateBlockDefinitionTransaction(assembler: web3.PublicKey, block: web3.PublicKey, blockDefinitionMint: web3.PublicKey, authority: web3.PublicKey, payer: web3.PublicKey, args: BlockDefinitionValue): TxSignersAccounts & {
    blockDefinition: web3.PublicKey;
};
export declare function buildCreateBlockDefinition(mx: Metaplex, assembler: web3.PublicKey, block: web3.PublicKey, blockDefinitionMint: web3.PublicKey, args: BlockDefinitionValue): Promise<TxSignersAccounts & {
    blockDefinition: web3.PublicKey;
}>;
export declare function createBlockDefinition(mx: Metaplex, assembler: web3.PublicKey, block: web3.PublicKey, blockDefinitionMint: web3.PublicKey, args: BlockDefinitionValue): Promise<{
    response: import("@metaplex-foundation/js").SendAndConfirmTransactionResponse;
    blockDefinition: web3.PublicKey;
}>;
