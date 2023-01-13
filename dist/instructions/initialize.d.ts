import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
export declare const initializeStruct: beet.BeetArgsStruct<{
    instructionDiscriminator: number[];
}>;
export declare const initializeInstructionDiscriminator: number[];
export declare function createInitializeInstruction(programId?: web3.PublicKey): web3.TransactionInstruction;
