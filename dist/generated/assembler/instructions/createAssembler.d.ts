import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
import { CreateAssemblerArgs } from '../types/CreateAssemblerArgs';
export type CreateAssemblerInstructionArgs = {
    args: CreateAssemblerArgs;
};
export declare const createAssemblerStruct: beet.FixableBeetArgsStruct<CreateAssemblerInstructionArgs & {
    instructionDiscriminator: number[];
}>;
export type CreateAssemblerInstructionAccounts = {
    collectionMint: web3.PublicKey;
    collectionMetadata: web3.PublicKey;
    collectionMasterEdition: web3.PublicKey;
    assembler: web3.PublicKey;
    authority: web3.PublicKey;
    payer: web3.PublicKey;
    systemProgram?: web3.PublicKey;
    tokenProgram?: web3.PublicKey;
    tokenMetadataProgram: web3.PublicKey;
    rent?: web3.PublicKey;
    sysvarInstructions: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const createAssemblerInstructionDiscriminator: number[];
export declare function createCreateAssemblerInstruction(accounts: CreateAssemblerInstructionAccounts, args: CreateAssemblerInstructionArgs, programId?: web3.PublicKey): web3.TransactionInstruction;
