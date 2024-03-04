/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import { XpPair, xpPairBeet } from './XpPair'
export type InitilizeRecipeArgs = {
  xp: XpPair
  amounts: beet.bignum[]
  outputCharacteristics: Map<string, string>
}

/**
 * @category userTypes
 * @category generated
 */
export const initilizeRecipeArgsBeet =
  new beet.FixableBeetArgsStruct<InitilizeRecipeArgs>(
    [
      ['xp', xpPairBeet],
      ['amounts', beet.array(beet.u64)],
      ['outputCharacteristics', beet.map(beet.utf8String, beet.utf8String)],
    ],
    'InitilizeRecipeArgs'
  )