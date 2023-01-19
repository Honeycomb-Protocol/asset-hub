/// <reference types="node" />
import * as web3 from '@solana/web3.js';
import * as beet from '@metaplex-foundation/beet';
import * as beetSolana from '@metaplex-foundation/beet-solana';
export type BlockDefinitionBooleanArgs = {
    bump: number;
    block: web3.PublicKey;
    value: boolean;
};
export declare const blockDefinitionBooleanDiscriminator: number[];
export declare class BlockDefinitionBoolean implements BlockDefinitionBooleanArgs {
    readonly bump: number;
    readonly block: web3.PublicKey;
    readonly value: boolean;
    private constructor();
    static fromArgs(args: BlockDefinitionBooleanArgs): BlockDefinitionBoolean;
    static fromAccountInfo(accountInfo: web3.AccountInfo<Buffer>, offset?: number): [BlockDefinitionBoolean, number];
    static fromAccountAddress(connection: web3.Connection, address: web3.PublicKey, commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig): Promise<BlockDefinitionBoolean>;
    static gpaBuilder(programId?: web3.PublicKey): beetSolana.GpaBuilder<{
        bump: any;
        accountDiscriminator: any;
        block: any;
        value: any;
    }>;
    static deserialize(buf: Buffer, offset?: number): [BlockDefinitionBoolean, number];
    serialize(): [Buffer, number];
    static get byteSize(): number;
    static getMinimumBalanceForRentExemption(connection: web3.Connection, commitment?: web3.Commitment): Promise<number>;
    static hasCorrectByteSize(buf: Buffer, offset?: number): boolean;
    pretty(): {
        bump: number;
        block: string;
        value: boolean;
    };
}
export declare const blockDefinitionBooleanBeet: beet.BeetStruct<BlockDefinitionBoolean, BlockDefinitionBooleanArgs & {
    accountDiscriminator: number[];
}>;
