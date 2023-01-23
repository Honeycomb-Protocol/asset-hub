/// <reference types="node" />
import * as web3 from '@solana/web3.js';
import * as beet from '@metaplex-foundation/beet';
import * as beetSolana from '@metaplex-foundation/beet-solana';
export type AssetManagerArgs = {
    bump: number;
    key: web3.PublicKey;
    authority: web3.PublicKey;
    treasury: web3.PublicKey;
    name: string;
};
export declare const assetManagerDiscriminator: number[];
export declare class AssetManager implements AssetManagerArgs {
    readonly bump: number;
    readonly key: web3.PublicKey;
    readonly authority: web3.PublicKey;
    readonly treasury: web3.PublicKey;
    readonly name: string;
    private constructor();
    static fromArgs(args: AssetManagerArgs): AssetManager;
    static fromAccountInfo(accountInfo: web3.AccountInfo<Buffer>, offset?: number): [AssetManager, number];
    static fromAccountAddress(connection: web3.Connection, address: web3.PublicKey, commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig): Promise<AssetManager>;
    static gpaBuilder(programId?: web3.PublicKey): beetSolana.GpaBuilder<AssetManagerArgs & {
        accountDiscriminator: number[];
    }>;
    static deserialize(buf: Buffer, offset?: number): [AssetManager, number];
    serialize(): [Buffer, number];
    static byteSize(args: AssetManagerArgs): number;
    static getMinimumBalanceForRentExemption(args: AssetManagerArgs, connection: web3.Connection, commitment?: web3.Commitment): Promise<number>;
    pretty(): {
        bump: number;
        key: string;
        authority: string;
        treasury: string;
        name: string;
    };
}
export declare const assetManagerBeet: beet.FixableBeetStruct<AssetManager, AssetManagerArgs & {
    accountDiscriminator: number[];
}>;
