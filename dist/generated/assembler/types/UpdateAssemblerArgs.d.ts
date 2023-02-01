import * as beet from '@metaplex-foundation/beet';
import { AssemblingAction } from './AssemblingAction';
export type UpdateAssemblerArgs = {
    assemblingAction: AssemblingAction;
    nftBaseUri: string;
    allowDuplicates: beet.COption<boolean>;
    defaultRoyalty: beet.COption<number>;
};
export declare const updateAssemblerArgsBeet: beet.FixableBeetArgsStruct<UpdateAssemblerArgs>;
