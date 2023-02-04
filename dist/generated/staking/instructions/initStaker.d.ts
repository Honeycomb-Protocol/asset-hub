import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
export declare const initStakerStruct: beet.BeetArgsStruct<{
    instructionDiscriminator: number[];
}>;
export type InitStakerInstructionAccounts = {
    project: web3.PublicKey;
    staker: web3.PublicKey;
    wallet: web3.PublicKey;
    systemProgram?: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const initStakerInstructionDiscriminator: number[];
export declare function createInitStakerInstruction(accounts: InitStakerInstructionAccounts, programId?: web3.PublicKey): web3.TransactionInstruction;
