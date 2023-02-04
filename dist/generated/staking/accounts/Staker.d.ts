/// <reference types="node" />
import * as web3 from '@solana/web3.js';
import * as beet from '@metaplex-foundation/beet';
import * as beetSolana from '@metaplex-foundation/beet-solana';
export type StakerArgs = {
    bump: number;
    project: web3.PublicKey;
    wallet: web3.PublicKey;
    totalStaked: beet.bignum;
};
export declare const stakerDiscriminator: number[];
export declare class Staker implements StakerArgs {
    readonly bump: number;
    readonly project: web3.PublicKey;
    readonly wallet: web3.PublicKey;
    readonly totalStaked: beet.bignum;
    private constructor();
    static fromArgs(args: StakerArgs): Staker;
    static fromAccountInfo(accountInfo: web3.AccountInfo<Buffer>, offset?: number): [Staker, number];
    static fromAccountAddress(connection: web3.Connection, address: web3.PublicKey, commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig): Promise<Staker>;
    static gpaBuilder(programId?: web3.PublicKey): beetSolana.GpaBuilder<{
        bump: any;
        accountDiscriminator: any;
        project: any;
        totalStaked: any;
        wallet: any;
    }>;
    static deserialize(buf: Buffer, offset?: number): [Staker, number];
    serialize(): [Buffer, number];
    static get byteSize(): number;
    static getMinimumBalanceForRentExemption(connection: web3.Connection, commitment?: web3.Commitment): Promise<number>;
    static hasCorrectByteSize(buf: Buffer, offset?: number): boolean;
    pretty(): {
        bump: number;
        project: string;
        wallet: string;
        totalStaked: number | {
            toNumber: () => number;
        };
    };
}
export declare const stakerBeet: beet.BeetStruct<Staker, StakerArgs & {
    accountDiscriminator: number[];
}>;
