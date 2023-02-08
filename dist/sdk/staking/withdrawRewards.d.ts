import * as web3 from "@solana/web3.js";
import { TxSignersAccounts } from "../../types";
import { Metaplex } from "@metaplex-foundation/js";
export declare function createWithdrawRewardsTransaction(project: web3.PublicKey, rewardMint: web3.PublicKey, authority: web3.PublicKey, amount: number, programId?: web3.PublicKey): TxSignersAccounts;
export declare function withdrawRewards(mx: Metaplex, project: web3.PublicKey, amount: number): Promise<{
    response: import("@metaplex-foundation/js").SendAndConfirmTransactionResponse;
}>;
