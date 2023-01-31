import * as web3 from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";
export declare function getAssociatedTokenAccountIntructions(mx: Metaplex, mints: web3.PublicKey[]): Promise<{
    preInstructions: web3.TransactionInstruction[];
    postTransactions: web3.TransactionInstruction[];
}>;
