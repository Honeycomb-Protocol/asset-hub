import * as beet from '@metaplex-foundation/beet';
export declare enum LockType {
    Freeze = 0,
    Custoday = 1
}
export declare const lockTypeBeet: beet.FixedSizeBeet<LockType, LockType>;
