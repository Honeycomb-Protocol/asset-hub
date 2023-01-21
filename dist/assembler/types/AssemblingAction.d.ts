import * as beet from '@metaplex-foundation/beet';
export declare enum AssemblingAction {
    Burn = 0,
    Freeze = 1,
    TakeCustody = 2
}
export declare const assemblingActionBeet: beet.FixedSizeBeet<AssemblingAction, AssemblingAction>;
