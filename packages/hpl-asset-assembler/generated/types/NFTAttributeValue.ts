/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
/**
 * This type is used to derive the {@link NFTAttributeValue} type as well as the de/serializer.
 * However don't refer to it in your code but use the {@link NFTAttributeValue} type instead.
 *
 * @category userTypes
 * @category enums
 * @category generated
 * @private
 */
export type NFTAttributeValueRecord = {
  String: { value: string }
  Boolean: { value: boolean }
  Number: { value: beet.bignum }
}

/**
 * Union type respresenting the NFTAttributeValue data enum defined in Rust.
 *
 * NOTE: that it includes a `__kind` property which allows to narrow types in
 * switch/if statements.
 * Additionally `isNFTAttributeValue*` type guards are exposed below to narrow to a specific variant.
 *
 * @category userTypes
 * @category enums
 * @category generated
 */
export type NFTAttributeValue = beet.DataEnumKeyAsKind<NFTAttributeValueRecord>

export const isNFTAttributeValueString = (
  x: NFTAttributeValue
): x is NFTAttributeValue & { __kind: 'String' } => x.__kind === 'String'
export const isNFTAttributeValueBoolean = (
  x: NFTAttributeValue
): x is NFTAttributeValue & { __kind: 'Boolean' } => x.__kind === 'Boolean'
export const isNFTAttributeValueNumber = (
  x: NFTAttributeValue
): x is NFTAttributeValue & { __kind: 'Number' } => x.__kind === 'Number'

/**
 * @category userTypes
 * @category generated
 */
export const nFTAttributeValueBeet = beet.dataEnum<NFTAttributeValueRecord>([
  [
    'String',
    new beet.FixableBeetArgsStruct<NFTAttributeValueRecord['String']>(
      [['value', beet.utf8String]],
      'NFTAttributeValueRecord["String"]'
    ),
  ],

  [
    'Boolean',
    new beet.BeetArgsStruct<NFTAttributeValueRecord['Boolean']>(
      [['value', beet.bool]],
      'NFTAttributeValueRecord["Boolean"]'
    ),
  ],

  [
    'Number',
    new beet.BeetArgsStruct<NFTAttributeValueRecord['Number']>(
      [['value', beet.u64]],
      'NFTAttributeValueRecord["Number"]'
    ),
  ],
]) as beet.FixableBeet<NFTAttributeValue, NFTAttributeValue>
