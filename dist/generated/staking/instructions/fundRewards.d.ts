import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
export type FundRewardsInstructionArgs = {
    amount: beet.bignum;
};
export declare const fundRewardsStruct: beet.BeetArgsStruct<FundRewardsInstructionArgs & {
    instructionDiscriminator: number[];
}>;
export type FundRewardsInstructionAccounts = {
    project: web3.PublicKey;
    rewardMint: web3.PublicKey;
    vault: web3.PublicKey;
    tokenAccount: web3.PublicKey;
    wallet: web3.PublicKey;
    tokenProgram?: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const fundRewardsInstructionDiscriminator: number[];
export declare function createFundRewardsInstruction(accounts: FundRewardsInstructionAccounts, args: FundRewardsInstructionArgs, programId?: web3.PublicKey): web3.TransactionInstruction;
