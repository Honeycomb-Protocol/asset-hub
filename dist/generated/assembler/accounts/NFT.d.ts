/// <reference types="node" />
import * as web3 from '@solana/web3.js';
import * as beet from '@metaplex-foundation/beet';
import * as beetSolana from '@metaplex-foundation/beet-solana';
export type NFTArgs = {
    bump: number;
    assembler: web3.PublicKey;
    authority: web3.PublicKey;
    collectionAddress: web3.PublicKey;
    mint: web3.PublicKey;
    name: string;
    symbol: string;
    description: string;
    minted: boolean;
    id: number;
    uri: string;
};
export declare const nFTDiscriminator: number[];
export declare class NFT implements NFTArgs {
    readonly bump: number;
    readonly assembler: web3.PublicKey;
    readonly authority: web3.PublicKey;
    readonly collectionAddress: web3.PublicKey;
    readonly mint: web3.PublicKey;
    readonly name: string;
    readonly symbol: string;
    readonly description: string;
    readonly minted: boolean;
    readonly id: number;
    readonly uri: string;
    private constructor();
    static fromArgs(args: NFTArgs): NFT;
    static fromAccountInfo(accountInfo: web3.AccountInfo<Buffer>, offset?: number): [NFT, number];
    static fromAccountAddress(connection: web3.Connection, address: web3.PublicKey, commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig): Promise<NFT>;
    static gpaBuilder(programId?: web3.PublicKey): beetSolana.GpaBuilder<NFTArgs & {
        accountDiscriminator: number[];
    }>;
    static deserialize(buf: Buffer, offset?: number): [NFT, number];
    serialize(): [Buffer, number];
    static byteSize(args: NFTArgs): number;
    static getMinimumBalanceForRentExemption(args: NFTArgs, connection: web3.Connection, commitment?: web3.Commitment): Promise<number>;
    pretty(): {
        bump: number;
        assembler: string;
        authority: string;
        collectionAddress: string;
        mint: string;
        name: string;
        symbol: string;
        description: string;
        minted: boolean;
        id: number;
        uri: string;
    };
}
export declare const nFTBeet: beet.FixableBeetStruct<NFT, NFTArgs & {
    accountDiscriminator: number[];
}>;
