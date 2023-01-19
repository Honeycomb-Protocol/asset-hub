import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
import { CreateBlockArgs } from '../types/CreateBlockArgs';
export type CreateBlockInstructionArgs = {
    args: CreateBlockArgs;
};
export declare const createBlockStruct: beet.FixableBeetArgsStruct<CreateBlockInstructionArgs & {
    instructionDiscriminator: number[];
}>;
export type CreateBlockInstructionAccounts = {
    assembler: web3.PublicKey;
    block: web3.PublicKey;
    authority: web3.PublicKey;
    payer: web3.PublicKey;
    systemProgram?: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const createBlockInstructionDiscriminator: number[];
export declare function createCreateBlockInstruction(accounts: CreateBlockInstructionAccounts, args: CreateBlockInstructionArgs, programId?: web3.PublicKey): web3.TransactionInstruction;
