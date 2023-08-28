/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beet from '@metaplex-foundation/beet'
import * as beetSolana from '@metaplex-foundation/beet-solana'
/**
 * This type is used to derive the {@link Event} type as well as the de/serializer.
 * However don't refer to it in your code but use the {@link Event} type instead.
 *
 * @category userTypes
 * @category enums
 * @category generated
 * @private
 */
export type EventRecord = {
  NewCurrency: {
    address: web3.PublicKey
    state: Uint8Array
    timestamp: beet.bignum
  }
  UpdateCurrency: {
    address: web3.PublicKey
    state: Uint8Array
    timestamp: beet.bignum
  }
  NewHolderAccount: {
    address: web3.PublicKey
    state: Uint8Array
    timestamp: beet.bignum
  }
  UpdateHolderAccount: {
    address: web3.PublicKey
    state: Uint8Array
    timestamp: beet.bignum
  }
}

/**
 * Union type respresenting the Event data enum defined in Rust.
 *
 * NOTE: that it includes a `__kind` property which allows to narrow types in
 * switch/if statements.
 * Additionally `isEvent*` type guards are exposed below to narrow to a specific variant.
 *
 * @category userTypes
 * @category enums
 * @category generated
 */
export type Event = beet.DataEnumKeyAsKind<EventRecord>

export const isEventNewCurrency = (
  x: Event
): x is Event & { __kind: 'NewCurrency' } => x.__kind === 'NewCurrency'
export const isEventUpdateCurrency = (
  x: Event
): x is Event & { __kind: 'UpdateCurrency' } => x.__kind === 'UpdateCurrency'
export const isEventNewHolderAccount = (
  x: Event
): x is Event & { __kind: 'NewHolderAccount' } =>
  x.__kind === 'NewHolderAccount'
export const isEventUpdateHolderAccount = (
  x: Event
): x is Event & { __kind: 'UpdateHolderAccount' } =>
  x.__kind === 'UpdateHolderAccount'

/**
 * @category userTypes
 * @category generated
 */
export const eventBeet = beet.dataEnum<EventRecord>([
  [
    'NewCurrency',
    new beet.FixableBeetArgsStruct<EventRecord['NewCurrency']>(
      [
        ['address', beetSolana.publicKey],
        ['state', beet.bytes],
        ['timestamp', beet.i64],
      ],
      'EventRecord["NewCurrency"]'
    ),
  ],

  [
    'UpdateCurrency',
    new beet.FixableBeetArgsStruct<EventRecord['UpdateCurrency']>(
      [
        ['address', beetSolana.publicKey],
        ['state', beet.bytes],
        ['timestamp', beet.i64],
      ],
      'EventRecord["UpdateCurrency"]'
    ),
  ],

  [
    'NewHolderAccount',
    new beet.FixableBeetArgsStruct<EventRecord['NewHolderAccount']>(
      [
        ['address', beetSolana.publicKey],
        ['state', beet.bytes],
        ['timestamp', beet.i64],
      ],
      'EventRecord["NewHolderAccount"]'
    ),
  ],

  [
    'UpdateHolderAccount',
    new beet.FixableBeetArgsStruct<EventRecord['UpdateHolderAccount']>(
      [
        ['address', beetSolana.publicKey],
        ['state', beet.bytes],
        ['timestamp', beet.i64],
      ],
      'EventRecord["UpdateHolderAccount"]'
    ),
  ],
]) as beet.FixableBeet<Event, Event>
