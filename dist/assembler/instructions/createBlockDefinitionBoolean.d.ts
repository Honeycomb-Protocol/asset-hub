import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
import { CreateBlockDefinitionBooleanArgs } from '../types/CreateBlockDefinitionBooleanArgs';
export type CreateBlockDefinitionBooleanInstructionArgs = {
    args: CreateBlockDefinitionBooleanArgs;
};
export declare const createBlockDefinitionBooleanStruct: beet.BeetArgsStruct<CreateBlockDefinitionBooleanInstructionArgs & {
    instructionDiscriminator: number[];
}>;
export type CreateBlockDefinitionBooleanInstructionAccounts = {
    assembler: web3.PublicKey;
    block: web3.PublicKey;
    blockDefinition: web3.PublicKey;
    authority: web3.PublicKey;
    payer: web3.PublicKey;
    systemProgram?: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const createBlockDefinitionBooleanInstructionDiscriminator: number[];
export declare function createCreateBlockDefinitionBooleanInstruction(accounts: CreateBlockDefinitionBooleanInstructionAccounts, args: CreateBlockDefinitionBooleanInstructionArgs, programId?: web3.PublicKey): web3.TransactionInstruction;
