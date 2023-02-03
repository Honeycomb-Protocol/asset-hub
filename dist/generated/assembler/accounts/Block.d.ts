/// <reference types="node" />
import * as web3 from '@solana/web3.js';
import * as beet from '@metaplex-foundation/beet';
import * as beetSolana from '@metaplex-foundation/beet-solana';
import { BlockType } from '../types/BlockType';
export type BlockArgs = {
    bump: number;
    assembler: web3.PublicKey;
    blockOrder: number;
    isGraphical: boolean;
    blockType: BlockType;
    blockName: string;
    blockDefinationCounts: number;
};
export declare const blockDiscriminator: number[];
export declare class Block implements BlockArgs {
    readonly bump: number;
    readonly assembler: web3.PublicKey;
    readonly blockOrder: number;
    readonly isGraphical: boolean;
    readonly blockType: BlockType;
    readonly blockName: string;
    readonly blockDefinationCounts: number;
    private constructor();
    static fromArgs(args: BlockArgs): Block;
    static fromAccountInfo(accountInfo: web3.AccountInfo<Buffer>, offset?: number): [Block, number];
    static fromAccountAddress(connection: web3.Connection, address: web3.PublicKey, commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig): Promise<Block>;
    static gpaBuilder(programId?: web3.PublicKey): beetSolana.GpaBuilder<BlockArgs & {
        accountDiscriminator: number[];
    }>;
    static deserialize(buf: Buffer, offset?: number): [Block, number];
    serialize(): [Buffer, number];
    static byteSize(args: BlockArgs): number;
    static getMinimumBalanceForRentExemption(args: BlockArgs, connection: web3.Connection, commitment?: web3.Commitment): Promise<number>;
    pretty(): {
        bump: number;
        assembler: string;
        blockOrder: number;
        isGraphical: boolean;
        blockType: string;
        blockName: string;
        blockDefinationCounts: number;
    };
}
export declare const blockBeet: beet.FixableBeetStruct<Block, BlockArgs & {
    accountDiscriminator: number[];
}>;
