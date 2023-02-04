import * as beet from '@metaplex-foundation/beet';
import { MultiplierType } from './MultiplierType';
export type Multiplier = {
    value: beet.bignum;
    multiplierType: MultiplierType;
};
export declare const multiplierBeet: beet.FixableBeetArgsStruct<Multiplier>;
