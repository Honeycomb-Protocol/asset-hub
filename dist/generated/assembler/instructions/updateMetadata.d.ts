import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
import { UpdateMetadataArgs } from '../types/UpdateMetadataArgs';
export type UpdateMetadataInstructionArgs = {
    args: UpdateMetadataArgs;
};
export declare const updateMetadataStruct: beet.FixableBeetArgsStruct<UpdateMetadataInstructionArgs & {
    instructionDiscriminator: number[];
}>;
export type UpdateMetadataInstructionAccounts = {
    assembler: web3.PublicKey;
    nft: web3.PublicKey;
    metadata: web3.PublicKey;
    authority: web3.PublicKey;
    tokenMetadataProgram: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const updateMetadataInstructionDiscriminator: number[];
export declare function createUpdateMetadataInstruction(accounts: UpdateMetadataInstructionAccounts, args: UpdateMetadataInstructionArgs, programId?: web3.PublicKey): web3.TransactionInstruction;
