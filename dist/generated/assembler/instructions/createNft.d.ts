import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
import { CreateNFTArgs } from '../types/CreateNFTArgs';
export type CreateNftInstructionArgs = {
    args: CreateNFTArgs;
};
export declare const createNftStruct: beet.FixableBeetArgsStruct<CreateNftInstructionArgs & {
    instructionDiscriminator: number[];
}>;
export type CreateNftInstructionAccounts = {
    assembler: web3.PublicKey;
    collectionMint: web3.PublicKey;
    collectionMetadataAccount: web3.PublicKey;
    collectionMasterEdition: web3.PublicKey;
    nftMint: web3.PublicKey;
    nftMetadata: web3.PublicKey;
    nft: web3.PublicKey;
    authority: web3.PublicKey;
    payer: web3.PublicKey;
    systemProgram?: web3.PublicKey;
    tokenProgram?: web3.PublicKey;
    tokenMetadataProgram: web3.PublicKey;
    rent?: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const createNftInstructionDiscriminator: number[];
export declare function createCreateNftInstruction(accounts: CreateNftInstructionAccounts, args: CreateNftInstructionArgs, programId?: web3.PublicKey): web3.TransactionInstruction;
