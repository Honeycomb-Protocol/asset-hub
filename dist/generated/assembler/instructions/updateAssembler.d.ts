import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
import { UpdateAssemblerArgs } from '../types/UpdateAssemblerArgs';
export type UpdateAssemblerInstructionArgs = {
    args: UpdateAssemblerArgs;
};
export declare const updateAssemblerStruct: beet.FixableBeetArgsStruct<UpdateAssemblerInstructionArgs & {
    instructionDiscriminator: number[];
}>;
export type UpdateAssemblerInstructionAccounts = {
    assembler: web3.PublicKey;
    authority: web3.PublicKey;
    delegate: web3.PublicKey;
    newAuthority: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const updateAssemblerInstructionDiscriminator: number[];
export declare function createUpdateAssemblerInstruction(accounts: UpdateAssemblerInstructionAccounts, args: UpdateAssemblerInstructionArgs, programId?: web3.PublicKey): web3.TransactionInstruction;
