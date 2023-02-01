import * as beet from '@metaplex-foundation/beet';
import { Creator } from './Creator';
export type UpdateMetadataArgs = {
    name: string;
    symbol: string;
    uri: string;
    sellerFeeBasisPoints: number;
    creators: beet.COption<Creator[]>;
};
export declare const updateMetadataArgsBeet: beet.FixableBeetArgsStruct<UpdateMetadataArgs>;
