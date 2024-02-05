/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import { CharacterSource, characterSourceBeet } from './CharacterSource'
/**
 * This type is used to derive the {@link DataOrHashSource} type as well as the de/serializer.
 * However don't refer to it in your code but use the {@link DataOrHashSource} type instead.
 *
 * @category userTypes
 * @category enums
 * @category generated
 * @private
 */
export type DataOrHashSourceRecord = {
  Data: { fields: [CharacterSource] }
  Hash: { fields: [number[] /* size: 32 */] }
}

/**
 * Union type respresenting the DataOrHashSource data enum defined in Rust.
 *
 * NOTE: that it includes a `__kind` property which allows to narrow types in
 * switch/if statements.
 * Additionally `isDataOrHashSource*` type guards are exposed below to narrow to a specific variant.
 *
 * @category userTypes
 * @category enums
 * @category generated
 */
export type DataOrHashSource = beet.DataEnumKeyAsKind<DataOrHashSourceRecord>

export const isDataOrHashSourceData = (
  x: DataOrHashSource
): x is DataOrHashSource & { __kind: 'Data' } => x.__kind === 'Data'
export const isDataOrHashSourceHash = (
  x: DataOrHashSource
): x is DataOrHashSource & { __kind: 'Hash' } => x.__kind === 'Hash'

/**
 * @category userTypes
 * @category generated
 */
export const dataOrHashSourceBeet = beet.dataEnum<DataOrHashSourceRecord>([
  [
    'Data',
    new beet.FixableBeetArgsStruct<DataOrHashSourceRecord['Data']>(
      [['fields', beet.tuple([characterSourceBeet])]],
      'DataOrHashSourceRecord["Data"]'
    ),
  ],
  [
    'Hash',
    new beet.BeetArgsStruct<DataOrHashSourceRecord['Hash']>(
      [
        [
          'fields',
          beet.fixedSizeTuple([beet.uniformFixedSizeArray(beet.u8, 32)]),
        ],
      ],
      'DataOrHashSourceRecord["Hash"]'
    ),
  ],
]) as beet.FixableBeet<DataOrHashSource, DataOrHashSource>