/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import {
  HoldingAccountArgs,
  holdingAccountArgsBeet,
} from './HoldingAccountArgs'
export type CraftRecipieArg = {
  holdingState: beet.COption<HoldingAccountArgs>
  proofSize: number
}

/**
 * @category userTypes
 * @category generated
 */
export const craftRecipieArgBeet =
  new beet.FixableBeetArgsStruct<CraftRecipieArg>(
    [
      ['holdingState', beet.coption(holdingAccountArgsBeet)],
      ['proofSize', beet.u8],
    ],
    'CraftRecipieArg'
  )