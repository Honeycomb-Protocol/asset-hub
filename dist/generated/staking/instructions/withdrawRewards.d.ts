import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
export type WithdrawRewardsInstructionArgs = {
    amount: beet.bignum;
};
export declare const withdrawRewardsStruct: beet.BeetArgsStruct<WithdrawRewardsInstructionArgs & {
    instructionDiscriminator: number[];
}>;
export type WithdrawRewardsInstructionAccounts = {
    project: web3.PublicKey;
    rewardMint: web3.PublicKey;
    vault: web3.PublicKey;
    tokenAccount: web3.PublicKey;
    authority: web3.PublicKey;
    tokenProgram?: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const withdrawRewardsInstructionDiscriminator: number[];
export declare function createWithdrawRewardsInstruction(accounts: WithdrawRewardsInstructionAccounts, args: WithdrawRewardsInstructionArgs, programId?: web3.PublicKey): web3.TransactionInstruction;
