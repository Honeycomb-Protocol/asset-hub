/// <reference types="node" />
import * as web3 from '@solana/web3.js';
import * as beet from '@metaplex-foundation/beet';
import * as beetSolana from '@metaplex-foundation/beet-solana';
import { DelegateAuthorityPermission } from '../types/DelegateAuthorityPermission';
export type DelegateAuthorityArgs = {
    bump: number;
    authority: web3.PublicKey;
    permission: DelegateAuthorityPermission;
};
export declare const delegateAuthorityDiscriminator: number[];
export declare class DelegateAuthority implements DelegateAuthorityArgs {
    readonly bump: number;
    readonly authority: web3.PublicKey;
    readonly permission: DelegateAuthorityPermission;
    private constructor();
    static fromArgs(args: DelegateAuthorityArgs): DelegateAuthority;
    static fromAccountInfo(accountInfo: web3.AccountInfo<Buffer>, offset?: number): [DelegateAuthority, number];
    static fromAccountAddress(connection: web3.Connection, address: web3.PublicKey, commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig): Promise<DelegateAuthority>;
    static gpaBuilder(programId?: web3.PublicKey): beetSolana.GpaBuilder<{
        bump: any;
        authority: any;
        accountDiscriminator: any;
        permission: any;
    }>;
    static deserialize(buf: Buffer, offset?: number): [DelegateAuthority, number];
    serialize(): [Buffer, number];
    static get byteSize(): number;
    static getMinimumBalanceForRentExemption(connection: web3.Connection, commitment?: web3.Commitment): Promise<number>;
    static hasCorrectByteSize(buf: Buffer, offset?: number): boolean;
    pretty(): {
        bump: number;
        authority: string;
        permission: string;
    };
}
export declare const delegateAuthorityBeet: beet.BeetStruct<DelegateAuthority, DelegateAuthorityArgs & {
    accountDiscriminator: number[];
}>;
