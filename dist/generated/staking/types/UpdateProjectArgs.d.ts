import * as beet from '@metaplex-foundation/beet';
export type UpdateProjectArgs = {
    name: beet.COption<string>;
    rewardsPerSecond: beet.COption<beet.bignum>;
    startTime: beet.COption<beet.bignum>;
};
export declare const updateProjectArgsBeet: beet.FixableBeetArgsStruct<UpdateProjectArgs>;
