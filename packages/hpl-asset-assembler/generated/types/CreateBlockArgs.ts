/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import { BlockType, blockTypeBeet } from './BlockType'
export type CreateBlockArgs = {
  blockOrder: number
  isGraphical: boolean
  blockType: BlockType
  blockName: string
}

/**
 * @category userTypes
 * @category generated
 */
export const createBlockArgsBeet =
  new beet.FixableBeetArgsStruct<CreateBlockArgs>(
    [
      ['blockOrder', beet.u8],
      ['isGraphical', beet.bool],
      ['blockType', blockTypeBeet],
      ['blockName', beet.utf8String],
    ],
    'CreateBlockArgs'
  )
