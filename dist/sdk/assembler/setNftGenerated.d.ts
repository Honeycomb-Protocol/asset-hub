import { Metaplex } from "@metaplex-foundation/js";
import * as web3 from "@solana/web3.js";
import { SetNFTGeneratedArgs } from "../../generated/assembler";
import { TxSignersAccounts } from "../../types";
export declare function createSetNftGeneratedTransaction(assembler: web3.PublicKey, nft: web3.PublicKey, nftMint: web3.PublicKey, args: SetNFTGeneratedArgs, programId?: web3.PublicKey): TxSignersAccounts;
export declare function setNftGenerated(mx: Metaplex, nft: web3.PublicKey, args: SetNFTGeneratedArgs): Promise<{
    response: import("@metaplex-foundation/js").SendAndConfirmTransactionResponse;
}>;
