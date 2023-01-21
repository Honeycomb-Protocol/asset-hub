import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
export declare const removeBlockStruct: beet.BeetArgsStruct<{
    instructionDiscriminator: number[];
}>;
export type RemoveBlockInstructionAccounts = {
    assembler: web3.PublicKey;
    nft: web3.PublicKey;
    block: web3.PublicKey;
    blockDefinition: web3.PublicKey;
    tokenMint: web3.PublicKey;
    tokenAccount: web3.PublicKey;
    tokenMetadata: web3.PublicKey;
    tokenEdition: web3.PublicKey;
    depositAccount: web3.PublicKey;
    nftAttribute: web3.PublicKey;
    authority: web3.PublicKey;
    tokenProgram?: web3.PublicKey;
    tokenMetadataProgram: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const removeBlockInstructionDiscriminator: number[];
export declare function createRemoveBlockInstruction(accounts: RemoveBlockInstructionAccounts, programId?: web3.PublicKey): web3.TransactionInstruction;
