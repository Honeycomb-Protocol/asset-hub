import * as beet from '@metaplex-foundation/beet';
export declare enum BlockType {
    Enum = 0,
    Boolean = 1,
    Random = 2,
    Computed = 3
}
export declare const blockTypeBeet: beet.FixedSizeBeet<BlockType, BlockType>;
