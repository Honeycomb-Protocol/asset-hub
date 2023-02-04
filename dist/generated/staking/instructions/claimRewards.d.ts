import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
export declare const claimRewardsStruct: beet.BeetArgsStruct<{
    instructionDiscriminator: number[];
}>;
export type ClaimRewardsInstructionAccounts = {
    project: web3.PublicKey;
    nft: web3.PublicKey;
    rewardMint: web3.PublicKey;
    vault: web3.PublicKey;
    tokenAccount: web3.PublicKey;
    wallet: web3.PublicKey;
    tokenProgram?: web3.PublicKey;
    clock: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const claimRewardsInstructionDiscriminator: number[];
export declare function createClaimRewardsInstruction(accounts: ClaimRewardsInstructionAccounts, programId?: web3.PublicKey): web3.TransactionInstruction;
