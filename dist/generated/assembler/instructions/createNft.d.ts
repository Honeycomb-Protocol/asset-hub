import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
export declare const createNftStruct: beet.BeetArgsStruct<{
    instructionDiscriminator: number[];
}>;
export type CreateNftInstructionAccounts = {
    assembler: web3.PublicKey;
    collectionMint: web3.PublicKey;
    collectionMetadataAccount: web3.PublicKey;
    collectionMasterEdition: web3.PublicKey;
    nftMint: web3.PublicKey;
    nftMetadata: web3.PublicKey;
    nftMasterEdition: web3.PublicKey;
    nft: web3.PublicKey;
    authority: web3.PublicKey;
    payer: web3.PublicKey;
    systemProgram?: web3.PublicKey;
    tokenProgram?: web3.PublicKey;
    tokenMetadataProgram: web3.PublicKey;
    rent?: web3.PublicKey;
    sysvarInstructions: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const createNftInstructionDiscriminator: number[];
export declare function createCreateNftInstruction(accounts: CreateNftInstructionAccounts, programId?: web3.PublicKey): web3.TransactionInstruction;
