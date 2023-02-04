/// <reference types="node" />
import * as web3 from '@solana/web3.js';
import * as beet from '@metaplex-foundation/beet';
import * as beetSolana from '@metaplex-foundation/beet-solana';
export type ProjectArgs = {
    bump: number;
    vaultBump: number;
    key: web3.PublicKey;
    authority: web3.PublicKey;
    rewardMint: web3.PublicKey;
    vault: web3.PublicKey;
    name: string;
    rewardsPerSecond: beet.bignum;
    totalStaked: beet.bignum;
    startTime: beet.bignum;
    collections: web3.PublicKey[];
    creators: web3.PublicKey[];
};
export declare const projectDiscriminator: number[];
export declare class Project implements ProjectArgs {
    readonly bump: number;
    readonly vaultBump: number;
    readonly key: web3.PublicKey;
    readonly authority: web3.PublicKey;
    readonly rewardMint: web3.PublicKey;
    readonly vault: web3.PublicKey;
    readonly name: string;
    readonly rewardsPerSecond: beet.bignum;
    readonly totalStaked: beet.bignum;
    readonly startTime: beet.bignum;
    readonly collections: web3.PublicKey[];
    readonly creators: web3.PublicKey[];
    private constructor();
    static fromArgs(args: ProjectArgs): Project;
    static fromAccountInfo(accountInfo: web3.AccountInfo<Buffer>, offset?: number): [Project, number];
    static fromAccountAddress(connection: web3.Connection, address: web3.PublicKey, commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig): Promise<Project>;
    static gpaBuilder(programId?: web3.PublicKey): beetSolana.GpaBuilder<ProjectArgs & {
        accountDiscriminator: number[];
    }>;
    static deserialize(buf: Buffer, offset?: number): [Project, number];
    serialize(): [Buffer, number];
    static byteSize(args: ProjectArgs): number;
    static getMinimumBalanceForRentExemption(args: ProjectArgs, connection: web3.Connection, commitment?: web3.Commitment): Promise<number>;
    pretty(): {
        bump: number;
        vaultBump: number;
        key: string;
        authority: string;
        rewardMint: string;
        vault: string;
        name: string;
        rewardsPerSecond: number | {
            toNumber: () => number;
        };
        totalStaked: number | {
            toNumber: () => number;
        };
        startTime: number | {
            toNumber: () => number;
        };
        collections: web3.PublicKey[];
        creators: web3.PublicKey[];
    };
}
export declare const projectBeet: beet.FixableBeetStruct<Project, ProjectArgs & {
    accountDiscriminator: number[];
}>;
