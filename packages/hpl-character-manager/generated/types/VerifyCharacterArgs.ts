/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import { DataOrHashSource, dataOrHashSourceBeet } from './DataOrHashSource'
import { DataOrHashUsedBy, dataOrHashUsedByBeet } from './DataOrHashUsedBy'
export type VerifyCharacterArgs = {
  root: number[] /* size: 32 */
  leafIdx: number
  source: DataOrHashSource
  usedBy: DataOrHashUsedBy
}

/**
 * @category userTypes
 * @category generated
 */
export const verifyCharacterArgsBeet =
  new beet.FixableBeetArgsStruct<VerifyCharacterArgs>(
    [
      ['root', beet.uniformFixedSizeArray(beet.u8, 32)],
      ['leafIdx', beet.u32],
      ['source', dataOrHashSourceBeet],
      ['usedBy', dataOrHashUsedByBeet],
    ],
    'VerifyCharacterArgs'
  )