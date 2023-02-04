/// <reference types="node" />
import * as web3 from '@solana/web3.js';
import * as beet from '@metaplex-foundation/beet';
import * as beetSolana from '@metaplex-foundation/beet-solana';
export type NFTArgs = {
    bump: number;
    project: web3.PublicKey;
    staker: web3.PublicKey;
    mint: web3.PublicKey;
    creator: web3.PublicKey;
    collection: web3.PublicKey;
    lastClaim: beet.bignum;
    stakedAt: beet.bignum;
    lastStakedAt: beet.bignum;
    lastUnstakedAt: beet.bignum;
};
export declare const nFTDiscriminator: number[];
export declare class NFT implements NFTArgs {
    readonly bump: number;
    readonly project: web3.PublicKey;
    readonly staker: web3.PublicKey;
    readonly mint: web3.PublicKey;
    readonly creator: web3.PublicKey;
    readonly collection: web3.PublicKey;
    readonly lastClaim: beet.bignum;
    readonly stakedAt: beet.bignum;
    readonly lastStakedAt: beet.bignum;
    readonly lastUnstakedAt: beet.bignum;
    private constructor();
    static fromArgs(args: NFTArgs): NFT;
    static fromAccountInfo(accountInfo: web3.AccountInfo<Buffer>, offset?: number): [NFT, number];
    static fromAccountAddress(connection: web3.Connection, address: web3.PublicKey, commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig): Promise<NFT>;
    static gpaBuilder(programId?: web3.PublicKey): beetSolana.GpaBuilder<{
        bump: any;
        collection: any;
        accountDiscriminator: any;
        mint: any;
        creator: any;
        project: any;
        staker: any;
        lastClaim: any;
        stakedAt: any;
        lastStakedAt: any;
        lastUnstakedAt: any;
    }>;
    static deserialize(buf: Buffer, offset?: number): [NFT, number];
    serialize(): [Buffer, number];
    static get byteSize(): number;
    static getMinimumBalanceForRentExemption(connection: web3.Connection, commitment?: web3.Commitment): Promise<number>;
    static hasCorrectByteSize(buf: Buffer, offset?: number): boolean;
    pretty(): {
        bump: number;
        project: string;
        staker: string;
        mint: string;
        creator: string;
        collection: string;
        lastClaim: number | {
            toNumber: () => number;
        };
        stakedAt: number | {
            toNumber: () => number;
        };
        lastStakedAt: number | {
            toNumber: () => number;
        };
        lastUnstakedAt: number | {
            toNumber: () => number;
        };
    };
}
export declare const nFTBeet: beet.BeetStruct<NFT, NFTArgs & {
    accountDiscriminator: number[];
}>;
