import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
import { CreateBlockDefinitionNumberArgs } from '../types/CreateBlockDefinitionNumberArgs';
export type CreateBlockDefinitionNumberInstructionArgs = {
    args: CreateBlockDefinitionNumberArgs;
};
export declare const createBlockDefinitionNumberStruct: beet.BeetArgsStruct<CreateBlockDefinitionNumberInstructionArgs & {
    instructionDiscriminator: number[];
}>;
export type CreateBlockDefinitionNumberInstructionAccounts = {
    assembler: web3.PublicKey;
    block: web3.PublicKey;
    blockDefinition: web3.PublicKey;
    authority: web3.PublicKey;
    payer: web3.PublicKey;
    systemProgram?: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const createBlockDefinitionNumberInstructionDiscriminator: number[];
export declare function createCreateBlockDefinitionNumberInstruction(accounts: CreateBlockDefinitionNumberInstructionAccounts, args: CreateBlockDefinitionNumberInstructionArgs, programId?: web3.PublicKey): web3.TransactionInstruction;
