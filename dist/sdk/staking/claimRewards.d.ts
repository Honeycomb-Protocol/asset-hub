import * as web3 from "@solana/web3.js";
import { TxSignersAccounts } from "../../types";
import { Metaplex } from "@metaplex-foundation/js";
export declare function createClaimRewardsTransaction(project: web3.PublicKey, nftMint: web3.PublicKey, rewardMint: web3.PublicKey, wallet: web3.PublicKey, multipliers: web3.PublicKey | undefined, programId?: web3.PublicKey): TxSignersAccounts;
export declare function claimRewards(mx: Metaplex, project: web3.PublicKey, nftMint: web3.PublicKey): Promise<{
    response: import("@metaplex-foundation/js").SendAndConfirmTransactionResponse;
}>;
