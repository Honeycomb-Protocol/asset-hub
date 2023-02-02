import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
import { CreateDelegateAuthorityArgs } from '../types/CreateDelegateAuthorityArgs';
export type CreateDelegateAuthorityInstructionArgs = {
    args: CreateDelegateAuthorityArgs;
};
export declare const createDelegateAuthorityStruct: beet.BeetArgsStruct<CreateDelegateAuthorityInstructionArgs & {
    instructionDiscriminator: number[];
}>;
export type CreateDelegateAuthorityInstructionAccounts = {
    assembler: web3.PublicKey;
    delegateAuthority: web3.PublicKey;
    delegate: web3.PublicKey;
    authority: web3.PublicKey;
    payer: web3.PublicKey;
    systemProgram?: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const createDelegateAuthorityInstructionDiscriminator: number[];
export declare function createCreateDelegateAuthorityInstruction(accounts: CreateDelegateAuthorityInstructionAccounts, args: CreateDelegateAuthorityInstructionArgs, programId?: web3.PublicKey): web3.TransactionInstruction;
