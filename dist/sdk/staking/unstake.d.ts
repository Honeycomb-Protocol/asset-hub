import * as web3 from "@solana/web3.js";
import { TxSignersAccounts } from "../../types";
import { Metaplex } from "@metaplex-foundation/js";
export declare function createUnstakeTransaction(project: web3.PublicKey, nftMint: web3.PublicKey, wallet: web3.PublicKey, programId?: web3.PublicKey): TxSignersAccounts & {
    project: web3.PublicKey;
};
export declare function unstake(mx: Metaplex, project: web3.PublicKey, nftMint: web3.PublicKey): Promise<{
    response: import("@metaplex-foundation/js").SendAndConfirmTransactionResponse;
    project: web3.PublicKey;
}>;
