import * as beet from '@metaplex-foundation/beet';
import { AssemblingAction } from './AssemblingAction';
export type CreateAssemblerArgs = {
    assemblingAction: AssemblingAction;
    collectionName: string;
    collectionSymbol: string;
    collectionUri: string;
    collectionDescription: string;
    nftBaseUri: string;
};
export declare const createAssemblerArgsBeet: beet.FixableBeetArgsStruct<CreateAssemblerArgs>;
