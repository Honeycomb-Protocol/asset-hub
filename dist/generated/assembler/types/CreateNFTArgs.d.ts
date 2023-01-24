import * as beet from '@metaplex-foundation/beet';
export type CreateNFTArgs = {
    name: string;
    symbol: string;
    description: string;
};
export declare const createNFTArgsBeet: beet.FixableBeetArgsStruct<CreateNFTArgs>;
