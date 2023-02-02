import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
import { SetNFTGeneratedArgs } from '../types/SetNFTGeneratedArgs';
export type SetNftGeneratedInstructionArgs = {
    args: SetNFTGeneratedArgs;
};
export declare const setNftGeneratedStruct: beet.FixableBeetArgsStruct<SetNftGeneratedInstructionArgs & {
    instructionDiscriminator: number[];
}>;
export type SetNftGeneratedInstructionAccounts = {
    assembler: web3.PublicKey;
    nft: web3.PublicKey;
    nftMetadata: web3.PublicKey;
    authority: web3.PublicKey;
    delegate: web3.PublicKey;
    tokenMetadataProgram: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const setNftGeneratedInstructionDiscriminator: number[];
export declare function createSetNftGeneratedInstruction(accounts: SetNftGeneratedInstructionAccounts, args: SetNftGeneratedInstructionArgs, programId?: web3.PublicKey): web3.TransactionInstruction;
