import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
import { AddMultiplierArgs } from '../types/AddMultiplierArgs';
export type AddMultiplierInstructionArgs = {
    args: AddMultiplierArgs;
};
export declare const addMultiplierStruct: beet.FixableBeetArgsStruct<AddMultiplierInstructionArgs & {
    instructionDiscriminator: number[];
}>;
export type AddMultiplierInstructionAccounts = {
    project: web3.PublicKey;
    multipliers: web3.PublicKey;
    authority: web3.PublicKey;
    payer: web3.PublicKey;
    systemProgram?: web3.PublicKey;
    rentSysvar: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const addMultiplierInstructionDiscriminator: number[];
export declare function createAddMultiplierInstruction(accounts: AddMultiplierInstructionAccounts, args: AddMultiplierInstructionArgs, programId?: web3.PublicKey): web3.TransactionInstruction;
