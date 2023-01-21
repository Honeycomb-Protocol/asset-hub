import * as beet from '@metaplex-foundation/beet';
export type NFTAttributeValueRecord = {
    String: {
        value: string;
    };
    Boolean: {
        value: boolean;
    };
    Number: {
        value: beet.bignum;
    };
};
export type NFTAttributeValue = beet.DataEnumKeyAsKind<NFTAttributeValueRecord>;
export declare const isNFTAttributeValueString: (x: NFTAttributeValue) => x is {
    __kind: "String";
} & Omit<{
    value: string;
}, "void"> & {
    __kind: 'String';
};
export declare const isNFTAttributeValueBoolean: (x: NFTAttributeValue) => x is {
    __kind: "Boolean";
} & Omit<{
    value: boolean;
}, "void"> & {
    __kind: 'Boolean';
};
export declare const isNFTAttributeValueNumber: (x: NFTAttributeValue) => x is {
    __kind: "Number";
} & Omit<{
    value: beet.bignum;
}, "void"> & {
    __kind: 'Number';
};
export declare const nFTAttributeValueBeet: beet.FixableBeet<NFTAttributeValue, NFTAttributeValue>;
