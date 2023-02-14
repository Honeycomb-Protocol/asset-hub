import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
import { MigrateArgs } from '../types/MigrateArgs';
export type MigrateCustodialInstructionArgs = {
    args: MigrateArgs;
};
export declare const migrateCustodialStruct: beet.BeetArgsStruct<MigrateCustodialInstructionArgs & {
    instructionDiscriminator: number[];
}>;
export type MigrateCustodialInstructionAccounts = {
    escrow: web3.PublicKey;
    nftAccount: web3.PublicKey;
    project: web3.PublicKey;
    nft: web3.PublicKey;
    nftMint: web3.PublicKey;
    nftMetadata: web3.PublicKey;
    nftEdition: web3.PublicKey;
    depositAccount: web3.PublicKey;
    staker: web3.PublicKey;
    wallet: web3.PublicKey;
    authority: web3.PublicKey;
    payer: web3.PublicKey;
    systemProgram?: web3.PublicKey;
    tokenProgram?: web3.PublicKey;
    associatedTokenProgram: web3.PublicKey;
    tokenMetadataProgram: web3.PublicKey;
    clock: web3.PublicKey;
    sysvarInstructions: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const migrateCustodialInstructionDiscriminator: number[];
export declare function createMigrateCustodialInstruction(accounts: MigrateCustodialInstructionAccounts, args: MigrateCustodialInstructionArgs, programId?: web3.PublicKey): web3.TransactionInstruction;
