import * as beet from '@metaplex-foundation/beet';
import { AssemblingAction } from './AssemblingAction';
export type CreateAssemblerArgs = {
    assemblingAction: AssemblingAction;
    collectionName: string;
    collectionSymbol: string;
    collectionUri: string;
    collectionDescription: string;
    nftBaseUri: string;
    allowDuplicates: beet.COption<boolean>;
};
export declare const createAssemblerArgsBeet: beet.FixableBeetArgsStruct<CreateAssemblerArgs>;
