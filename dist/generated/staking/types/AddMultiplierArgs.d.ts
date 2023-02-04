import * as beet from '@metaplex-foundation/beet';
import { MultiplierType } from './MultiplierType';
export type AddMultiplierArgs = {
    value: beet.bignum;
    multiplierType: MultiplierType;
};
export declare const addMultiplierArgsBeet: beet.FixableBeetArgsStruct<AddMultiplierArgs>;
