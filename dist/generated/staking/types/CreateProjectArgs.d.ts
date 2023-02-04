import * as beet from '@metaplex-foundation/beet';
export type CreateProjectArgs = {
    name: string;
    rewardsPerSecond: beet.bignum;
    startTime: beet.bignum;
};
export declare const createProjectArgsBeet: beet.FixableBeetArgsStruct<CreateProjectArgs>;
