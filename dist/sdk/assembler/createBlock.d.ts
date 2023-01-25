import { Metaplex } from "@metaplex-foundation/js";
import * as web3 from "@solana/web3.js";
import { CreateBlockArgs } from "../../generated";
import { TxSignersAccounts } from "../../types";
export declare function createCreateBlockTransaction(assembler: web3.PublicKey, authority: web3.PublicKey, payer: web3.PublicKey, args: CreateBlockArgs): TxSignersAccounts & {
    block: web3.PublicKey;
};
export declare function buildCreateBlockCtx(mx: Metaplex, assembler: web3.PublicKey, args: CreateBlockArgs): Promise<TxSignersAccounts & {
    block: web3.PublicKey;
}>;
export declare function createBlock(mx: Metaplex, assembler: web3.PublicKey, args: CreateBlockArgs): Promise<{
    response: import("@metaplex-foundation/js").SendAndConfirmTransactionResponse;
    block: web3.PublicKey;
}>;
