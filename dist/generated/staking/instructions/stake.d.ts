import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
export declare const stakeStruct: beet.BeetArgsStruct<{
    instructionDiscriminator: number[];
}>;
export type StakeInstructionAccounts = {
    project: web3.PublicKey;
    nft: web3.PublicKey;
    nftMint: web3.PublicKey;
    nftAccount: web3.PublicKey;
    nftMetadata: web3.PublicKey;
    nftEdition: web3.PublicKey;
    staker: web3.PublicKey;
    wallet: web3.PublicKey;
    systemProgram?: web3.PublicKey;
    tokenProgram?: web3.PublicKey;
    tokenMetadataProgram: web3.PublicKey;
    clock: web3.PublicKey;
    sysvarInstructions: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const stakeInstructionDiscriminator: number[];
export declare function createStakeInstruction(accounts: StakeInstructionAccounts, programId?: web3.PublicKey): web3.TransactionInstruction;
