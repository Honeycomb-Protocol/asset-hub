import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
export type MultiplierTypeRecord = {
    StakeDuration: {
        minDuration: beet.bignum;
    };
    NFTCount: {
        minCount: beet.bignum;
    };
    Creator: {
        creator: web3.PublicKey;
    };
    Collection: {
        collection: web3.PublicKey;
    };
};
export type MultiplierType = beet.DataEnumKeyAsKind<MultiplierTypeRecord>;
export declare const isMultiplierTypeStakeDuration: (x: MultiplierType) => x is {
    __kind: "StakeDuration";
} & Omit<{
    minDuration: beet.bignum;
}, "void"> & {
    __kind: 'StakeDuration';
};
export declare const isMultiplierTypeNFTCount: (x: MultiplierType) => x is {
    __kind: "NFTCount";
} & Omit<{
    minCount: beet.bignum;
}, "void"> & {
    __kind: 'NFTCount';
};
export declare const isMultiplierTypeCreator: (x: MultiplierType) => x is {
    __kind: "Creator";
} & Omit<{
    creator: web3.PublicKey;
}, "void"> & {
    __kind: 'Creator';
};
export declare const isMultiplierTypeCollection: (x: MultiplierType) => x is {
    __kind: "Collection";
} & Omit<{
    collection: web3.PublicKey;
}, "void"> & {
    __kind: 'Collection';
};
export declare const multiplierTypeBeet: beet.FixableBeet<MultiplierType, MultiplierType>;
