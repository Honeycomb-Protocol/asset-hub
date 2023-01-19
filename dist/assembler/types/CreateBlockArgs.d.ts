import * as beet from '@metaplex-foundation/beet';
import { BlockType } from './BlockType';
export type CreateBlockArgs = {
    blockOrder: number;
    isGraphical: boolean;
    blockType: BlockType;
    blockName: string;
};
export declare const createBlockArgsBeet: beet.FixableBeetArgsStruct<CreateBlockArgs>;
