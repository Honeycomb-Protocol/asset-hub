import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
export declare const mintNftStruct: beet.BeetArgsStruct<{
    instructionDiscriminator: number[];
}>;
export type MintNftInstructionAccounts = {
    assembler: web3.PublicKey;
    nft: web3.PublicKey;
    nftMint: web3.PublicKey;
    tokenAccount: web3.PublicKey;
    authority: web3.PublicKey;
    payer: web3.PublicKey;
    tokenProgram?: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const mintNftInstructionDiscriminator: number[];
export declare function createMintNftInstruction(accounts: MintNftInstructionAccounts, programId?: web3.PublicKey): web3.TransactionInstruction;
