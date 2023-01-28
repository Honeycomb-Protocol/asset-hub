/// <reference types="node" />
import * as web3 from '@solana/web3.js';
import * as beet from '@metaplex-foundation/beet';
import * as beetSolana from '@metaplex-foundation/beet-solana';
import { AssemblingAction } from '../types/AssemblingAction';
export type AssemblerArgs = {
    bump: number;
    authority: web3.PublicKey;
    collection: web3.PublicKey;
    collectionName: string;
    collectionSymbol: string;
    collectionDescription: string;
    nftBaseUri: string;
    assemblingAction: AssemblingAction;
    nfts: number;
    allowDuplicates: boolean;
};
export declare const assemblerDiscriminator: number[];
export declare class Assembler implements AssemblerArgs {
    readonly bump: number;
    readonly authority: web3.PublicKey;
    readonly collection: web3.PublicKey;
    readonly collectionName: string;
    readonly collectionSymbol: string;
    readonly collectionDescription: string;
    readonly nftBaseUri: string;
    readonly assemblingAction: AssemblingAction;
    readonly nfts: number;
    readonly allowDuplicates: boolean;
    private constructor();
    static fromArgs(args: AssemblerArgs): Assembler;
    static fromAccountInfo(accountInfo: web3.AccountInfo<Buffer>, offset?: number): [Assembler, number];
    static fromAccountAddress(connection: web3.Connection, address: web3.PublicKey, commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig): Promise<Assembler>;
    static gpaBuilder(programId?: web3.PublicKey): beetSolana.GpaBuilder<AssemblerArgs & {
        accountDiscriminator: number[];
    }>;
    static deserialize(buf: Buffer, offset?: number): [Assembler, number];
    serialize(): [Buffer, number];
    static byteSize(args: AssemblerArgs): number;
    static getMinimumBalanceForRentExemption(args: AssemblerArgs, connection: web3.Connection, commitment?: web3.Commitment): Promise<number>;
    pretty(): {
        bump: number;
        authority: string;
        collection: string;
        collectionName: string;
        collectionSymbol: string;
        collectionDescription: string;
        nftBaseUri: string;
        assemblingAction: string;
        nfts: number;
        allowDuplicates: boolean;
    };
}
export declare const assemblerBeet: beet.FixableBeetStruct<Assembler, AssemblerArgs & {
    accountDiscriminator: number[];
}>;
