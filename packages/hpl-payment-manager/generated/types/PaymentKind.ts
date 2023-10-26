/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beet from '@metaplex-foundation/beet'
import * as beetSolana from '@metaplex-foundation/beet-solana'
import { NftPayment, nftPaymentBeet } from './NftPayment'
/**
 * This type is used to derive the {@link PaymentKind} type as well as the de/serializer.
 * However don't refer to it in your code but use the {@link PaymentKind} type instead.
 *
 * @category userTypes
 * @category enums
 * @category generated
 * @private
 */
export type PaymentKindRecord = {
  Nft: { fields: [NftPayment] }
  HplCurrency: { address: web3.PublicKey; amount: beet.bignum }
}

/**
 * Union type respresenting the PaymentKind data enum defined in Rust.
 *
 * NOTE: that it includes a `__kind` property which allows to narrow types in
 * switch/if statements.
 * Additionally `isPaymentKind*` type guards are exposed below to narrow to a specific variant.
 *
 * @category userTypes
 * @category enums
 * @category generated
 */
export type PaymentKind = beet.DataEnumKeyAsKind<PaymentKindRecord>

export const isPaymentKindNft = (
  x: PaymentKind
): x is PaymentKind & { __kind: 'Nft' } => x.__kind === 'Nft'
export const isPaymentKindHplCurrency = (
  x: PaymentKind
): x is PaymentKind & { __kind: 'HplCurrency' } => x.__kind === 'HplCurrency'

/**
 * @category userTypes
 * @category generated
 */
export const paymentKindBeet = beet.dataEnum<PaymentKindRecord>([
  [
    'Nft',
    new beet.FixableBeetArgsStruct<PaymentKindRecord['Nft']>(
      [['fields', beet.tuple([nftPaymentBeet])]],
      'PaymentKindRecord["Nft"]'
    ),
  ],

  [
    'HplCurrency',
    new beet.BeetArgsStruct<PaymentKindRecord['HplCurrency']>(
      [
        ['address', beetSolana.publicKey],
        ['amount', beet.u64],
      ],
      'PaymentKindRecord["HplCurrency"]'
    ),
  ],
]) as beet.FixableBeet<PaymentKind, PaymentKind>