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
/**
 * This type is used to derive the {@link WrapResourceArgs} type as well as the de/serializer.
 * However don't refer to it in your code but use the {@link WrapResourceArgs} type instead.
 *
 * @category userTypes
 * @category enums
 * @category generated
 * @private
 */
export type WrapResourceArgsRecord = {
  Fungible: { amount: beet.bignum; holdingState: HoldingAccountArgs }
  INF: { holdingState: HoldingAccountArgs }
}

/**
 * Union type respresenting the WrapResourceArgs data enum defined in Rust.
 *
 * NOTE: that it includes a `__kind` property which allows to narrow types in
 * switch/if statements.
 * Additionally `isWrapResourceArgs*` type guards are exposed below to narrow to a specific variant.
 *
 * @category userTypes
 * @category enums
 * @category generated
 */
export type WrapResourceArgs = beet.DataEnumKeyAsKind<WrapResourceArgsRecord>

export const isWrapResourceArgsFungible = (
  x: WrapResourceArgs
): x is WrapResourceArgs & { __kind: 'Fungible' } => x.__kind === 'Fungible'
export const isWrapResourceArgsINF = (
  x: WrapResourceArgs
): x is WrapResourceArgs & { __kind: 'INF' } => x.__kind === 'INF'

/**
 * @category userTypes
 * @category generated
 */
export const wrapResourceArgsBeet = beet.dataEnum<WrapResourceArgsRecord>([
  [
    'Fungible',
    new beet.FixableBeetArgsStruct<WrapResourceArgsRecord['Fungible']>(
      [
        ['amount', beet.u64],
        ['holdingState', holdingAccountArgsBeet],
      ],
      'WrapResourceArgsRecord["Fungible"]'
    ),
  ],

  [
    'INF',
    new beet.FixableBeetArgsStruct<WrapResourceArgsRecord['INF']>(
      [['holdingState', holdingAccountArgsBeet]],
      'WrapResourceArgsRecord["INF"]'
    ),
  ],
]) as beet.FixableBeet<WrapResourceArgs, WrapResourceArgs>
