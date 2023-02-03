import * as web3 from '@solana/web3.js';
import * as beet from '@metaplex-foundation/beet';
import { NFTAttributeValue } from './NFTAttributeValue';
export type NFTAttribute = {
    blockDefinitionIndex: number;
    mint: web3.PublicKey;
    order: number;
    attributeName: string;
    attributeValue: NFTAttributeValue;
};
export declare const nFTAttributeBeet: beet.FixableBeetArgsStruct<NFTAttribute>;
