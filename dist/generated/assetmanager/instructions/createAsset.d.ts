import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
import { CreateAssetArgs } from '../types/CreateAssetArgs';
export type CreateAssetInstructionArgs = {
    args: CreateAssetArgs;
};
export declare const createAssetStruct: beet.FixableBeetArgsStruct<CreateAssetInstructionArgs & {
    instructionDiscriminator: number[];
}>;
export type CreateAssetInstructionAccounts = {
    assetManager: web3.PublicKey;
    mint: web3.PublicKey;
    metadata: web3.PublicKey;
    asset: web3.PublicKey;
    authority: web3.PublicKey;
    payer: web3.PublicKey;
    systemProgram?: web3.PublicKey;
    tokenProgram?: web3.PublicKey;
    tokenMetadataProgram: web3.PublicKey;
    rent?: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const createAssetInstructionDiscriminator: number[];
export declare function createCreateAssetInstruction(accounts: CreateAssetInstructionAccounts, args: CreateAssetInstructionArgs, programId?: web3.PublicKey): web3.TransactionInstruction;
