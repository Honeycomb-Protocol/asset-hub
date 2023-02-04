import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
import { CreateProjectArgs } from '../types/CreateProjectArgs';
export type CreateProjectInstructionArgs = {
    args: CreateProjectArgs;
};
export declare const createProjectStruct: beet.FixableBeetArgsStruct<CreateProjectInstructionArgs & {
    instructionDiscriminator: number[];
}>;
export type CreateProjectInstructionAccounts = {
    key: web3.PublicKey;
    project: web3.PublicKey;
    authority: web3.PublicKey;
    rewardMint: web3.PublicKey;
    vault: web3.PublicKey;
    payer: web3.PublicKey;
    systemProgram?: web3.PublicKey;
    tokenProgram?: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const createProjectInstructionDiscriminator: number[];
export declare function createCreateProjectInstruction(accounts: CreateProjectInstructionAccounts, args: CreateProjectInstructionArgs, programId?: web3.PublicKey): web3.TransactionInstruction;
