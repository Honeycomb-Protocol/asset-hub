import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
import { CreateBlockDefinitionEnumArgs } from '../types/CreateBlockDefinitionEnumArgs';
export type CreateBlockDefinitionEnumInstructionArgs = {
    args: CreateBlockDefinitionEnumArgs;
};
export declare const createBlockDefinitionEnumStruct: beet.FixableBeetArgsStruct<CreateBlockDefinitionEnumInstructionArgs & {
    instructionDiscriminator: number[];
}>;
export type CreateBlockDefinitionEnumInstructionAccounts = {
    assembler: web3.PublicKey;
    block: web3.PublicKey;
    blockDefinition: web3.PublicKey;
    blockDefinitionMint: web3.PublicKey;
    authority: web3.PublicKey;
    payer: web3.PublicKey;
    systemProgram?: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const createBlockDefinitionEnumInstructionDiscriminator: number[];
export declare function createCreateBlockDefinitionEnumInstruction(accounts: CreateBlockDefinitionEnumInstructionAccounts, args: CreateBlockDefinitionEnumInstructionArgs, programId?: web3.PublicKey): web3.TransactionInstruction;
