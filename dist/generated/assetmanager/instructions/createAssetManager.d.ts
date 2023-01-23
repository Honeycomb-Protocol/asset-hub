import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
import { CreateAssetManagerArgs } from '../types/CreateAssetManagerArgs';
export type CreateAssetManagerInstructionArgs = {
    args: CreateAssetManagerArgs;
};
export declare const createAssetManagerStruct: beet.FixableBeetArgsStruct<CreateAssetManagerInstructionArgs & {
    instructionDiscriminator: number[];
}>;
export type CreateAssetManagerInstructionAccounts = {
    key: web3.PublicKey;
    assetManager: web3.PublicKey;
    treasury: web3.PublicKey;
    authority: web3.PublicKey;
    payer: web3.PublicKey;
    systemProgram?: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const createAssetManagerInstructionDiscriminator: number[];
export declare function createCreateAssetManagerInstruction(accounts: CreateAssetManagerInstructionAccounts, args: CreateAssetManagerInstructionArgs, programId?: web3.PublicKey): web3.TransactionInstruction;
