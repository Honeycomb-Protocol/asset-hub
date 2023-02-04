/// <reference types="node" />
import * as web3 from '@solana/web3.js';
import * as beet from '@metaplex-foundation/beet';
import * as beetSolana from '@metaplex-foundation/beet-solana';
import { Multiplier } from '../types/Multiplier';
export type MultipliersArgs = {
    bump: number;
    project: web3.PublicKey;
    decimals: number;
    durationMultipliers: Multiplier[];
    countMultipliers: Multiplier[];
    creatorMultipliers: Multiplier[];
    collectionMultipliers: Multiplier[];
};
export declare const multipliersDiscriminator: number[];
export declare class Multipliers implements MultipliersArgs {
    readonly bump: number;
    readonly project: web3.PublicKey;
    readonly decimals: number;
    readonly durationMultipliers: Multiplier[];
    readonly countMultipliers: Multiplier[];
    readonly creatorMultipliers: Multiplier[];
    readonly collectionMultipliers: Multiplier[];
    private constructor();
    static fromArgs(args: MultipliersArgs): Multipliers;
    static fromAccountInfo(accountInfo: web3.AccountInfo<Buffer>, offset?: number): [Multipliers, number];
    static fromAccountAddress(connection: web3.Connection, address: web3.PublicKey, commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig): Promise<Multipliers>;
    static gpaBuilder(programId?: web3.PublicKey): beetSolana.GpaBuilder<MultipliersArgs & {
        accountDiscriminator: number[];
    }>;
    static deserialize(buf: Buffer, offset?: number): [Multipliers, number];
    serialize(): [Buffer, number];
    static byteSize(args: MultipliersArgs): number;
    static getMinimumBalanceForRentExemption(args: MultipliersArgs, connection: web3.Connection, commitment?: web3.Commitment): Promise<number>;
    pretty(): {
        bump: number;
        project: string;
        decimals: number;
        durationMultipliers: Multiplier[];
        countMultipliers: Multiplier[];
        creatorMultipliers: Multiplier[];
        collectionMultipliers: Multiplier[];
    };
}
export declare const multipliersBeet: beet.FixableBeetStruct<Multipliers, MultipliersArgs & {
    accountDiscriminator: number[];
}>;
