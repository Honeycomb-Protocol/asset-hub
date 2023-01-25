import { Metaplex } from "@metaplex-foundation/js";
import * as web3 from "@solana/web3.js";
import { TxSignersAccounts } from "../../types";
export declare function createSetNftGeneratedTransaction(nft: web3.PublicKey, programId?: web3.PublicKey): TxSignersAccounts;
export declare function setNftGenerated(nft: web3.PublicKey, mx: Metaplex): Promise<{
    response: import("@metaplex-foundation/js").SendAndConfirmTransactionResponse;
}>;
