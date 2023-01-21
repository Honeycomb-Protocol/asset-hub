/// <reference types="node" />
import * as web3 from '@solana/web3.js';
import * as beet from '@metaplex-foundation/beet';
import * as beetSolana from '@metaplex-foundation/beet-solana';
import { BlockDefinitionValue } from '../types/BlockDefinitionValue';
export type BlockDefinitionArgs = {
    bump: number;
    block: web3.PublicKey;
    mint: web3.PublicKey;
    value: BlockDefinitionValue;
};
export declare const blockDefinitionDiscriminator: number[];
export declare class BlockDefinition implements BlockDefinitionArgs {
    readonly bump: number;
    readonly block: web3.PublicKey;
    readonly mint: web3.PublicKey;
    readonly value: BlockDefinitionValue;
    private constructor();
    static fromArgs(args: BlockDefinitionArgs): BlockDefinition;
    static fromAccountInfo(accountInfo: web3.AccountInfo<Buffer>, offset?: number): [BlockDefinition, number];
    static fromAccountAddress(connection: web3.Connection, address: web3.PublicKey, commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig): Promise<BlockDefinition>;
    static gpaBuilder(programId?: web3.PublicKey): beetSolana.GpaBuilder<BlockDefinitionArgs & {
        accountDiscriminator: number[];
    }>;
    static deserialize(buf: Buffer, offset?: number): [BlockDefinition, number];
    serialize(): [Buffer, number];
    static byteSize(args: BlockDefinitionArgs): number;
    static getMinimumBalanceForRentExemption(args: BlockDefinitionArgs, connection: web3.Connection, commitment?: web3.Commitment): Promise<number>;
    pretty(): {
        bump: number;
        block: string;
        mint: string;
        value: "Enum" | "Boolean" | "Number";
    };
}
export declare const blockDefinitionBeet: beet.FixableBeetStruct<BlockDefinition, BlockDefinitionArgs & {
    accountDiscriminator: number[];
}>;
