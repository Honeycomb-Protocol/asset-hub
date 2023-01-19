/// <reference types="node" />
import * as web3 from '@solana/web3.js';
import * as beet from '@metaplex-foundation/beet';
import * as beetSolana from '@metaplex-foundation/beet-solana';
export type BlockDefinitionEnumArgs = {
    bump: number;
    block: web3.PublicKey;
    mint: web3.PublicKey;
    isCollection: boolean;
    value: string;
    image: beet.COption<string>;
};
export declare const blockDefinitionEnumDiscriminator: number[];
export declare class BlockDefinitionEnum implements BlockDefinitionEnumArgs {
    readonly bump: number;
    readonly block: web3.PublicKey;
    readonly mint: web3.PublicKey;
    readonly isCollection: boolean;
    readonly value: string;
    readonly image: beet.COption<string>;
    private constructor();
    static fromArgs(args: BlockDefinitionEnumArgs): BlockDefinitionEnum;
    static fromAccountInfo(accountInfo: web3.AccountInfo<Buffer>, offset?: number): [BlockDefinitionEnum, number];
    static fromAccountAddress(connection: web3.Connection, address: web3.PublicKey, commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig): Promise<BlockDefinitionEnum>;
    static gpaBuilder(programId?: web3.PublicKey): beetSolana.GpaBuilder<BlockDefinitionEnumArgs & {
        accountDiscriminator: number[];
    }>;
    static deserialize(buf: Buffer, offset?: number): [BlockDefinitionEnum, number];
    serialize(): [Buffer, number];
    static byteSize(args: BlockDefinitionEnumArgs): number;
    static getMinimumBalanceForRentExemption(args: BlockDefinitionEnumArgs, connection: web3.Connection, commitment?: web3.Commitment): Promise<number>;
    pretty(): {
        bump: number;
        block: string;
        mint: string;
        isCollection: boolean;
        value: string;
        image: string;
    };
}
export declare const blockDefinitionEnumBeet: beet.FixableBeetStruct<BlockDefinitionEnum, BlockDefinitionEnumArgs & {
    accountDiscriminator: number[];
}>;
