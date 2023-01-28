import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
export declare const burnNftStruct: beet.BeetArgsStruct<{
    instructionDiscriminator: number[];
}>;
export type BurnNftInstructionAccounts = {
    assembler: web3.PublicKey;
    nft: web3.PublicKey;
    nftMint: web3.PublicKey;
    tokenAccount: web3.PublicKey;
    uniqueConstraint: web3.PublicKey;
    authority: web3.PublicKey;
    tokenProgram?: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const burnNftInstructionDiscriminator: number[];
export declare function createBurnNftInstruction(accounts: BurnNftInstructionAccounts, programId?: web3.PublicKey): web3.TransactionInstruction;
