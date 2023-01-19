import * as beet from '@metaplex-foundation/beet';
export declare enum AssemblingAction {
    Burn = 0,
    TakeCustody = 1
}
export declare const assemblingActionBeet: beet.FixedSizeBeet<AssemblingAction, AssemblingAction>;
