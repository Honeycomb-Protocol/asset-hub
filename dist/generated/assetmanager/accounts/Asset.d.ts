/// <reference types="node" />
import * as web3 from '@solana/web3.js';
import * as beet from '@metaplex-foundation/beet';
import * as beetSolana from '@metaplex-foundation/beet-solana';
export type AssetArgs = {
    bump: number;
    manager: web3.PublicKey;
    candyGuard: beet.COption<web3.PublicKey>;
    mint: web3.PublicKey;
    itemsRedeemed: beet.bignum;
    uri: string;
};
export declare const assetDiscriminator: number[];
export declare class Asset implements AssetArgs {
    readonly bump: number;
    readonly manager: web3.PublicKey;
    readonly candyGuard: beet.COption<web3.PublicKey>;
    readonly mint: web3.PublicKey;
    readonly itemsRedeemed: beet.bignum;
    readonly uri: string;
    private constructor();
    static fromArgs(args: AssetArgs): Asset;
    static fromAccountInfo(accountInfo: web3.AccountInfo<Buffer>, offset?: number): [Asset, number];
    static fromAccountAddress(connection: web3.Connection, address: web3.PublicKey, commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig): Promise<Asset>;
    static gpaBuilder(programId?: web3.PublicKey): beetSolana.GpaBuilder<AssetArgs & {
        accountDiscriminator: number[];
    }>;
    static deserialize(buf: Buffer, offset?: number): [Asset, number];
    serialize(): [Buffer, number];
    static byteSize(args: AssetArgs): number;
    static getMinimumBalanceForRentExemption(args: AssetArgs, connection: web3.Connection, commitment?: web3.Commitment): Promise<number>;
    pretty(): {
        bump: number;
        manager: string;
        candyGuard: web3.PublicKey;
        mint: string;
        itemsRedeemed: number | {
            toNumber: () => number;
        };
        uri: string;
    };
}
export declare const assetBeet: beet.FixableBeetStruct<Asset, AssetArgs & {
    accountDiscriminator: number[];
}>;
