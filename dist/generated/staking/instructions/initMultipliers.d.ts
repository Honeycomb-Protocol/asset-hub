import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
import { InitMultipliersArgs } from '../types/InitMultipliersArgs';
export type InitMultipliersInstructionArgs = {
    args: InitMultipliersArgs;
};
export declare const initMultipliersStruct: beet.BeetArgsStruct<InitMultipliersInstructionArgs & {
    instructionDiscriminator: number[];
}>;
export type InitMultipliersInstructionAccounts = {
    project: web3.PublicKey;
    multipliers: web3.PublicKey;
    authority: web3.PublicKey;
    systemProgram?: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const initMultipliersInstructionDiscriminator: number[];
export declare function createInitMultipliersInstruction(accounts: InitMultipliersInstructionAccounts, args: InitMultipliersInstructionArgs, programId?: web3.PublicKey): web3.TransactionInstruction;
