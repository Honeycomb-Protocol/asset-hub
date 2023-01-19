/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
export type CreateBlockDefinitionEnumArgs = {
  isCollection: boolean
  value: string
  image: beet.COption<string>
}

/**
 * @category userTypes
 * @category generated
 */
export const createBlockDefinitionEnumArgsBeet =
  new beet.FixableBeetArgsStruct<CreateBlockDefinitionEnumArgs>(
    [
      ['isCollection', beet.bool],
      ['value', beet.utf8String],
      ['image', beet.coption(beet.utf8String)],
    ],
    'CreateBlockDefinitionEnumArgs'
  )
