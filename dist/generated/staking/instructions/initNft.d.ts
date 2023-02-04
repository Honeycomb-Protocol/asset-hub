import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
export declare const initNftStruct: beet.BeetArgsStruct<{
    instructionDiscriminator: number[];
}>;
export type InitNftInstructionAccounts = {
    project: web3.PublicKey;
    nft: web3.PublicKey;
    nftMint: web3.PublicKey;
    nftMetadata: web3.PublicKey;
    wallet: web3.PublicKey;
    systemProgram?: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const initNftInstructionDiscriminator: number[];
export declare function createInitNftInstruction(accounts: InitNftInstructionAccounts, programId?: web3.PublicKey): web3.TransactionInstruction;
