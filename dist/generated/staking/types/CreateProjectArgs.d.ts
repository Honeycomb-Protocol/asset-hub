import * as beet from '@metaplex-foundation/beet';
import { LockType } from './LockType';
export type CreateProjectArgs = {
    name: string;
    lockType: beet.COption<LockType>;
    rewardsPerDuration: beet.bignum;
    rewardsDuration: beet.COption<beet.bignum>;
    maxRewardsDuration: beet.COption<beet.bignum>;
    minStakeDuration: beet.COption<beet.bignum>;
    cooldownDuration: beet.COption<beet.bignum>;
    resetStakeDuration: beet.COption<boolean>;
    startTime: beet.COption<beet.bignum>;
    endTime: beet.COption<beet.bignum>;
};
export declare const createProjectArgsBeet: beet.FixableBeetArgsStruct<CreateProjectArgs>;
