/// <reference types="node" />
import * as web3 from '@solana/web3.js';
import * as beet from '@metaplex-foundation/beet';
import * as beetSolana from '@metaplex-foundation/beet-solana';
import { NFTAttributeValue } from '../types/NFTAttributeValue';
export type NFTAttributeArgs = {
    bump: number;
    nft: web3.PublicKey;
    block: web3.PublicKey;
    blockDefinition: web3.PublicKey;
    mint: web3.PublicKey;
    attributeName: string;
    attributeValue: NFTAttributeValue;
};
export declare const nFTAttributeDiscriminator: number[];
export declare class NFTAttribute implements NFTAttributeArgs {
    readonly bump: number;
    readonly nft: web3.PublicKey;
    readonly block: web3.PublicKey;
    readonly blockDefinition: web3.PublicKey;
    readonly mint: web3.PublicKey;
    readonly attributeName: string;
    readonly attributeValue: NFTAttributeValue;
    private constructor();
    static fromArgs(args: NFTAttributeArgs): NFTAttribute;
    static fromAccountInfo(accountInfo: web3.AccountInfo<Buffer>, offset?: number): [NFTAttribute, number];
    static fromAccountAddress(connection: web3.Connection, address: web3.PublicKey, commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig): Promise<NFTAttribute>;
    static gpaBuilder(programId?: web3.PublicKey): beetSolana.GpaBuilder<NFTAttributeArgs & {
        accountDiscriminator: number[];
    }>;
    static deserialize(buf: Buffer, offset?: number): [NFTAttribute, number];
    serialize(): [Buffer, number];
    static byteSize(args: NFTAttributeArgs): number;
    static getMinimumBalanceForRentExemption(args: NFTAttributeArgs, connection: web3.Connection, commitment?: web3.Commitment): Promise<number>;
    pretty(): {
        bump: number;
        nft: string;
        block: string;
        blockDefinition: string;
        mint: string;
        attributeName: string;
        attributeValue: "Boolean" | "Number" | "String";
    };
}
export declare const nFTAttributeBeet: beet.FixableBeetStruct<NFTAttribute, NFTAttributeArgs & {
    accountDiscriminator: number[];
}>;
