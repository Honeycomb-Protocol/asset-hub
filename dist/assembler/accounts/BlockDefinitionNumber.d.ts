/// <reference types="node" />
import * as web3 from '@solana/web3.js';
import * as beet from '@metaplex-foundation/beet';
import * as beetSolana from '@metaplex-foundation/beet-solana';
export type BlockDefinitionNumberArgs = {
    bump: number;
    block: web3.PublicKey;
    min: beet.bignum;
    max: beet.bignum;
};
export declare const blockDefinitionNumberDiscriminator: number[];
export declare class BlockDefinitionNumber implements BlockDefinitionNumberArgs {
    readonly bump: number;
    readonly block: web3.PublicKey;
    readonly min: beet.bignum;
    readonly max: beet.bignum;
    private constructor();
    static fromArgs(args: BlockDefinitionNumberArgs): BlockDefinitionNumber;
    static fromAccountInfo(accountInfo: web3.AccountInfo<Buffer>, offset?: number): [BlockDefinitionNumber, number];
    static fromAccountAddress(connection: web3.Connection, address: web3.PublicKey, commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig): Promise<BlockDefinitionNumber>;
    static gpaBuilder(programId?: web3.PublicKey): beetSolana.GpaBuilder<{
        max: any;
        bump: any;
        accountDiscriminator: any;
        block: any;
        min: any;
    }>;
    static deserialize(buf: Buffer, offset?: number): [BlockDefinitionNumber, number];
    serialize(): [Buffer, number];
    static get byteSize(): number;
    static getMinimumBalanceForRentExemption(connection: web3.Connection, commitment?: web3.Commitment): Promise<number>;
    static hasCorrectByteSize(buf: Buffer, offset?: number): boolean;
    pretty(): {
        bump: number;
        block: string;
        min: number | {
            toNumber: () => number;
        };
        max: number | {
            toNumber: () => number;
        };
    };
}
export declare const blockDefinitionNumberBeet: beet.BeetStruct<BlockDefinitionNumber, BlockDefinitionNumberArgs & {
    accountDiscriminator: number[];
}>;
