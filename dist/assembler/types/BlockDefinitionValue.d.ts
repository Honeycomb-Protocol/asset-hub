import * as beet from '@metaplex-foundation/beet';
export type BlockDefinitionValueRecord = {
    Enum: {
        isCollection: boolean;
        value: string;
        image: beet.COption<string>;
    };
    Boolean: {
        value: boolean;
    };
    Number: {
        min: beet.bignum;
        max: beet.bignum;
    };
};
export type BlockDefinitionValue = beet.DataEnumKeyAsKind<BlockDefinitionValueRecord>;
export declare const isBlockDefinitionValueEnum: (x: BlockDefinitionValue) => x is {
    __kind: "Enum";
} & Omit<{
    isCollection: boolean;
    value: string;
    image: beet.COption<string>;
}, "void"> & {
    __kind: 'Enum';
};
export declare const isBlockDefinitionValueBoolean: (x: BlockDefinitionValue) => x is {
    __kind: "Boolean";
} & Omit<{
    value: boolean;
}, "void"> & {
    __kind: 'Boolean';
};
export declare const isBlockDefinitionValueNumber: (x: BlockDefinitionValue) => x is {
    __kind: "Number";
} & Omit<{
    min: beet.bignum;
    max: beet.bignum;
}, "void"> & {
    __kind: 'Number';
};
export declare const blockDefinitionValueBeet: beet.FixableBeet<BlockDefinitionValue, BlockDefinitionValue>;
