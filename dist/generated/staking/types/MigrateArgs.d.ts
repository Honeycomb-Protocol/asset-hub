import * as beet from '@metaplex-foundation/beet';
export type MigrateArgs = {
    stakedAt: beet.bignum;
    lastClaim: beet.bignum;
};
export declare const migrateArgsBeet: beet.BeetArgsStruct<MigrateArgs>;
