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
 * This type is used to derive the {@link MintResourceArgs} type as well as the de/serializer.
 * However don't refer to it in your code but use the {@link MintResourceArgs} type instead.
 *
 * @category userTypes
 * @category enums
 * @category generated
 * @private
 */
export type MintResourceArgsRecord = {
  Fungible: {
    holdingState: beet.COption<HoldingAccountArgs>
    amount: beet.bignum
  }
  INF: {
    holdingState: beet.COption<HoldingAccountArgs>
    characteristics: Map<string, string>
  }
}

/**
 * Union type respresenting the MintResourceArgs data enum defined in Rust.
 *
 * NOTE: that it includes a `__kind` property which allows to narrow types in
 * switch/if statements.
 * Additionally `isMintResourceArgs*` type guards are exposed below to narrow to a specific variant.
 *
 * @category userTypes
 * @category enums
 * @category generated
 */
export type MintResourceArgs = beet.DataEnumKeyAsKind<MintResourceArgsRecord>

export const isMintResourceArgsFungible = (
  x: MintResourceArgs
): x is MintResourceArgs & { __kind: 'Fungible' } => x.__kind === 'Fungible'
export const isMintResourceArgsINF = (
  x: MintResourceArgs
): x is MintResourceArgs & { __kind: 'INF' } => x.__kind === 'INF'

/**
 * @category userTypes
 * @category generated
 */
export const mintResourceArgsBeet = beet.dataEnum<MintResourceArgsRecord>([
  [
    'Fungible',
    new beet.FixableBeetArgsStruct<MintResourceArgsRecord['Fungible']>(
      [
        ['holdingState', beet.coption(holdingAccountArgsBeet)],
        ['amount', beet.u64],
      ],
      'MintResourceArgsRecord["Fungible"]'
    ),
  ],

  [
    'INF',
    new beet.FixableBeetArgsStruct<MintResourceArgsRecord['INF']>(
      [
        ['holdingState', beet.coption(holdingAccountArgsBeet)],
        ['characteristics', beet.map(beet.utf8String, beet.utf8String)],
      ],
      'MintResourceArgsRecord["INF"]'
    ),
  ],
]) as beet.FixableBeet<MintResourceArgs, MintResourceArgs>
