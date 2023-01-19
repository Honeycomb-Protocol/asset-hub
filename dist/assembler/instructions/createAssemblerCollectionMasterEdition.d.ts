import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
export declare const createAssemblerCollectionMasterEditionStruct: beet.BeetArgsStruct<{
    instructionDiscriminator: number[];
}>;
export type CreateAssemblerCollectionMasterEditionInstructionAccounts = {
    collectionMint: web3.PublicKey;
    collectionMetadataAccount: web3.PublicKey;
    collectionMasterEdition: web3.PublicKey;
    collectionTokenAccount: web3.PublicKey;
    assembler: web3.PublicKey;
    authority: web3.PublicKey;
    payer: web3.PublicKey;
    systemProgram?: web3.PublicKey;
    tokenProgram?: web3.PublicKey;
    tokenMetadataProgram: web3.PublicKey;
    rent?: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const createAssemblerCollectionMasterEditionInstructionDiscriminator: number[];
export declare function createCreateAssemblerCollectionMasterEditionInstruction(accounts: CreateAssemblerCollectionMasterEditionInstructionAccounts, programId?: web3.PublicKey): web3.TransactionInstruction;
