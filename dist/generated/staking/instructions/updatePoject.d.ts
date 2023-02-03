import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
import { UpdateProjectArgs } from '../types/UpdateProjectArgs';
export type UpdatePojectInstructionArgs = {
    args: UpdateProjectArgs;
};
export declare const updatePojectStruct: beet.FixableBeetArgsStruct<UpdatePojectInstructionArgs & {
    instructionDiscriminator: number[];
}>;
export type UpdatePojectInstructionAccounts = {
    project: web3.PublicKey;
    newAuthority: web3.PublicKey;
    collection: web3.PublicKey;
    creator: web3.PublicKey;
    authority: web3.PublicKey;
    systemProgram?: web3.PublicKey;
    rent?: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const updatePojectInstructionDiscriminator: number[];
export declare function createUpdatePojectInstruction(accounts: UpdatePojectInstructionAccounts, args: UpdatePojectInstructionArgs, programId?: web3.PublicKey): web3.TransactionInstruction;
