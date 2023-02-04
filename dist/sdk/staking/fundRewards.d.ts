import * as web3 from "@solana/web3.js";
import { TxSignersAccounts } from "../../types";
import { Metaplex } from "@metaplex-foundation/js";
export declare function createFundRewardsTransaction(project: web3.PublicKey, rewardMint: web3.PublicKey, wallet: web3.PublicKey, amount: number, programId?: web3.PublicKey): TxSignersAccounts & {
    project: web3.PublicKey;
};
export declare function fundRewards(mx: Metaplex, project: web3.PublicKey, amount: number): Promise<{
    response: import("@metaplex-foundation/js").SendAndConfirmTransactionResponse;
    project: web3.PublicKey;
}>;
