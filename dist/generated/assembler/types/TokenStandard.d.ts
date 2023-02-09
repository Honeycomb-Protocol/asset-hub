import * as beet from '@metaplex-foundation/beet';
export declare enum TokenStandard {
    NonFungible = 0,
    ProgrammableNonFungible = 1
}
export declare const tokenStandardBeet: beet.FixedSizeBeet<TokenStandard, TokenStandard>;
