/// <reference types="node" />
import * as web3 from '@solana/web3.js';
import * as beet from '@metaplex-foundation/beet';
import * as beetSolana from '@metaplex-foundation/beet-solana';
export type NFTUniqueConstraintArgs = {
    bump: number;
    nft: web3.PublicKey;
};
export declare const nFTUniqueConstraintDiscriminator: number[];
export declare class NFTUniqueConstraint implements NFTUniqueConstraintArgs {
    readonly bump: number;
    readonly nft: web3.PublicKey;
    private constructor();
    static fromArgs(args: NFTUniqueConstraintArgs): NFTUniqueConstraint;
    static fromAccountInfo(accountInfo: web3.AccountInfo<Buffer>, offset?: number): [NFTUniqueConstraint, number];
    static fromAccountAddress(connection: web3.Connection, address: web3.PublicKey, commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig): Promise<NFTUniqueConstraint>;
    static gpaBuilder(programId?: web3.PublicKey): beetSolana.GpaBuilder<{
        bump: any;
        accountDiscriminator: any;
        nft: any;
    }>;
    static deserialize(buf: Buffer, offset?: number): [NFTUniqueConstraint, number];
    serialize(): [Buffer, number];
    static get byteSize(): number;
    static getMinimumBalanceForRentExemption(connection: web3.Connection, commitment?: web3.Commitment): Promise<number>;
    static hasCorrectByteSize(buf: Buffer, offset?: number): boolean;
    pretty(): {
        bump: number;
        nft: string;
    };
}
export declare const nFTUniqueConstraintBeet: beet.BeetStruct<NFTUniqueConstraint, NFTUniqueConstraintArgs & {
    accountDiscriminator: number[];
}>;
