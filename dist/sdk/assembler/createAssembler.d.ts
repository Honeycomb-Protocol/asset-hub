import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { CreateAssemblerArgs } from "../../generated";
import { TxSignersAccounts } from "../../types";
import { Metaplex } from "@metaplex-foundation/js";
export declare function createCreateAssemblerTransaction(authority: web3.PublicKey, payer: web3.PublicKey, args: CreateAssemblerArgs, programId?: web3.PublicKey): TxSignersAccounts & {
    assembler: web3.PublicKey;
};
export declare function createAssembler(mx: Metaplex, args: CreateAssemblerArgs): Promise<{
    response: import("@metaplex-foundation/js").SendAndConfirmTransactionResponse;
    assembler: anchor.web3.PublicKey;
}>;
