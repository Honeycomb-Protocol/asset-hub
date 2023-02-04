import * as web3 from '@solana/web3.js';
import * as beet from '@metaplex-foundation/beet';
export type ValidateCollectionCreatorOutputRecord = {
    Collection: {
        address: web3.PublicKey;
    };
    Creator: {
        address: web3.PublicKey;
    };
};
export type ValidateCollectionCreatorOutput = beet.DataEnumKeyAsKind<ValidateCollectionCreatorOutputRecord>;
export declare const isValidateCollectionCreatorOutputCollection: (x: ValidateCollectionCreatorOutput) => x is {
    __kind: "Collection";
} & Omit<{
    address: web3.PublicKey;
}, "void"> & {
    __kind: 'Collection';
};
export declare const isValidateCollectionCreatorOutputCreator: (x: ValidateCollectionCreatorOutput) => x is {
    __kind: "Creator";
} & Omit<{
    address: web3.PublicKey;
}, "void"> & {
    __kind: 'Creator';
};
export declare const validateCollectionCreatorOutputBeet: beet.FixableBeet<ValidateCollectionCreatorOutput, ValidateCollectionCreatorOutput>;
