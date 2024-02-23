/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beet from '@metaplex-foundation/beet'
import * as beetSolana from '@metaplex-foundation/beet-solana'
import {
  NonFungibleHolding,
  nonFungibleHoldingBeet,
} from './NonFungibleHolding'
/**
 * This type is used to derive the {@link Holding} type as well as the de/serializer.
 * However don't refer to it in your code but use the {@link Holding} type instead.
 *
 * @category userTypes
 * @category enums
 * @category generated
 * @private
 */
export type HoldingRecord = {
  Fungible: { holder: web3.PublicKey; balance: beet.bignum }
  INF: { holder: NonFungibleHolding; characteristics: Map<string, string> }
}

/**
 * Union type respresenting the Holding data enum defined in Rust.
 *
 * NOTE: that it includes a `__kind` property which allows to narrow types in
 * switch/if statements.
 * Additionally `isHolding*` type guards are exposed below to narrow to a specific variant.
 *
 * @category userTypes
 * @category enums
 * @category generated
 */
export type Holding = beet.DataEnumKeyAsKind<HoldingRecord>

export const isHoldingFungible = (
  x: Holding
): x is Holding & { __kind: 'Fungible' } => x.__kind === 'Fungible'
export const isHoldingINF = (x: Holding): x is Holding & { __kind: 'INF' } =>
  x.__kind === 'INF'

/**
 * @category userTypes
 * @category generated
 */
export const holdingBeet = beet.dataEnum<HoldingRecord>([
  [
    'Fungible',
    new beet.BeetArgsStruct<HoldingRecord['Fungible']>(
      [
        ['holder', beetSolana.publicKey],
        ['balance', beet.u64],
      ],
      'HoldingRecord["Fungible"]'
    ),
  ],

  [
    'INF',
    new beet.FixableBeetArgsStruct<HoldingRecord['INF']>(
      [
        ['holder', nonFungibleHoldingBeet],
        ['characteristics', beet.map(beet.utf8String, beet.utf8String)],
      ],
      'HoldingRecord["INF"]'
    ),
  ],
]) as beet.FixableBeet<Holding, Holding>
