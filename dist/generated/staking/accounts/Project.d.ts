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
    rewardsPerDuration: beet.bignum;
    rewardsDuration: beet.bignum;
    maxRewardsDuration: beet.COption<beet.bignum>;
    minStakeDuration: beet.COption<beet.bignum>;
    cooldownDuration: beet.COption<beet.bignum>;
    resetStakeDuration: boolean;
    allowedMints: boolean;
    totalStaked: beet.bignum;
    startTime: beet.COption<beet.bignum>;
    endTime: beet.COption<beet.bignum>;
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
    readonly rewardsPerDuration: beet.bignum;
    readonly rewardsDuration: beet.bignum;
    readonly maxRewardsDuration: beet.COption<beet.bignum>;
    readonly minStakeDuration: beet.COption<beet.bignum>;
    readonly cooldownDuration: beet.COption<beet.bignum>;
    readonly resetStakeDuration: boolean;
    readonly allowedMints: boolean;
    readonly totalStaked: beet.bignum;
    readonly startTime: beet.COption<beet.bignum>;
    readonly endTime: beet.COption<beet.bignum>;
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
        rewardsPerDuration: number | {
            toNumber: () => number;
        };
        rewardsDuration: number | {
            toNumber: () => number;
        };
        maxRewardsDuration: beet.bignum;
        minStakeDuration: beet.bignum;
        cooldownDuration: beet.bignum;
        resetStakeDuration: boolean;
        allowedMints: boolean;
        totalStaked: number | {
            toNumber: () => number;
        };
        startTime: beet.bignum;
        endTime: beet.bignum;
        collections: web3.PublicKey[];
        creators: web3.PublicKey[];
    };
}
export declare const projectBeet: beet.FixableBeetStruct<Project, ProjectArgs & {
    accountDiscriminator: number[];
}>;
