import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
import { AssemblingAction } from './AssemblingAction';
import { TokenStandard } from './TokenStandard';
import { Creator } from './Creator';
export type CreateAssemblerArgs = {
    assemblingAction: AssemblingAction;
    collectionName: string;
    collectionSymbol: string;
    collectionUri: string;
    collectionDescription: string;
    nftBaseUri: string;
    allowDuplicates: beet.COption<boolean>;
    defaultRoyalty: beet.COption<number>;
    tokenStandard: beet.COption<TokenStandard>;
    ruleSet: beet.COption<web3.PublicKey>;
    defaultCreators: Creator[];
};
export declare const createAssemblerArgsBeet: beet.FixableBeetArgsStruct<CreateAssemblerArgs>;
