import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
export declare const setNftGeneratedStruct: beet.BeetArgsStruct<{
    instructionDiscriminator: number[];
}>;
export type SetNftGeneratedInstructionAccounts = {
    nft: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const setNftGeneratedInstructionDiscriminator: number[];
export declare function createSetNftGeneratedInstruction(accounts: SetNftGeneratedInstructionAccounts, programId?: web3.PublicKey): web3.TransactionInstruction;
