import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
import { UpdateProjectArgs } from '../types/UpdateProjectArgs';
export type UpdateProjectInstructionArgs = {
    args: UpdateProjectArgs;
};
export declare const updateProjectStruct: beet.FixableBeetArgsStruct<UpdateProjectInstructionArgs & {
    instructionDiscriminator: number[];
}>;
export type UpdateProjectInstructionAccounts = {
    project: web3.PublicKey;
    newAuthority: web3.PublicKey;
    collection: web3.PublicKey;
    creator: web3.PublicKey;
    authority: web3.PublicKey;
    systemProgram?: web3.PublicKey;
    rent?: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const updateProjectInstructionDiscriminator: number[];
export declare function createUpdateProjectInstruction(accounts: UpdateProjectInstructionAccounts, args: UpdateProjectInstructionArgs, programId?: web3.PublicKey): web3.TransactionInstruction;
