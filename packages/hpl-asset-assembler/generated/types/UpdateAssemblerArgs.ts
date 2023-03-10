/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import { AssemblingAction, assemblingActionBeet } from './AssemblingAction'
export type UpdateAssemblerArgs = {
  assemblingAction: AssemblingAction
  nftBaseUri: string
  allowDuplicates: beet.COption<boolean>
  defaultRoyalty: beet.COption<number>
}

/**
 * @category userTypes
 * @category generated
 */
export const updateAssemblerArgsBeet =
  new beet.FixableBeetArgsStruct<UpdateAssemblerArgs>(
    [
      ['assemblingAction', assemblingActionBeet],
      ['nftBaseUri', beet.utf8String],
      ['allowDuplicates', beet.coption(beet.bool)],
      ['defaultRoyalty', beet.coption(beet.u16)],
    ],
    'UpdateAssemblerArgs'
  )
