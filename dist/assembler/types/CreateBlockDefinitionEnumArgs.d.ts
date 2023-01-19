import * as beet from '@metaplex-foundation/beet';
export type CreateBlockDefinitionEnumArgs = {
    isCollection: boolean;
    value: string;
    image: beet.COption<string>;
};
export declare const createBlockDefinitionEnumArgsBeet: beet.FixableBeetArgsStruct<CreateBlockDefinitionEnumArgs>;
