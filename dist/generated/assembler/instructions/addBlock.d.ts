import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
export declare const addBlockStruct: beet.BeetArgsStruct<{
    instructionDiscriminator: number[];
}>;
export type AddBlockInstructionAccounts = {
    assembler: web3.PublicKey;
    nft: web3.PublicKey;
    block: web3.PublicKey;
    blockDefinition: web3.PublicKey;
    tokenMint: web3.PublicKey;
    tokenAccount: web3.PublicKey;
    tokenMetadata: web3.PublicKey;
    tokenEdition: web3.PublicKey;
    tokenRecord: web3.PublicKey;
    depositAccount: web3.PublicKey;
    depositTokenRecord: web3.PublicKey;
    authority: web3.PublicKey;
    payer: web3.PublicKey;
    systemProgram?: web3.PublicKey;
    tokenProgram?: web3.PublicKey;
    associatedTokenProgram: web3.PublicKey;
    tokenMetadataProgram: web3.PublicKey;
    sysvarInstructions: web3.PublicKey;
    rent?: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const addBlockInstructionDiscriminator: number[];
export declare function createAddBlockInstruction(accounts: AddBlockInstructionAccounts, programId?: web3.PublicKey): web3.TransactionInstruction;
