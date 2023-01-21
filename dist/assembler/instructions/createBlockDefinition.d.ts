import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
import { BlockDefinitionValue } from '../types/BlockDefinitionValue';
export type CreateBlockDefinitionInstructionArgs = {
    args: BlockDefinitionValue;
};
export declare const createBlockDefinitionStruct: beet.FixableBeetArgsStruct<CreateBlockDefinitionInstructionArgs & {
    instructionDiscriminator: number[];
}>;
export type CreateBlockDefinitionInstructionAccounts = {
    assembler: web3.PublicKey;
    block: web3.PublicKey;
    blockDefinition: web3.PublicKey;
    blockDefinitionMint: web3.PublicKey;
    authority: web3.PublicKey;
    payer: web3.PublicKey;
    systemProgram?: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const createBlockDefinitionInstructionDiscriminator: number[];
export declare function createCreateBlockDefinitionInstruction(accounts: CreateBlockDefinitionInstructionAccounts, args: CreateBlockDefinitionInstructionArgs, programId?: web3.PublicKey): web3.TransactionInstruction;
