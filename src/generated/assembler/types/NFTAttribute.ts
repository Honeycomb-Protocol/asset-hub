/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beetSolana from '@metaplex-foundation/beet-solana'
import * as beet from '@metaplex-foundation/beet'
import { NFTAttributeValue, nFTAttributeValueBeet } from './NFTAttributeValue'
export type NFTAttribute = {
  block: web3.PublicKey
  blockDefinition: web3.PublicKey
  mint: web3.PublicKey
  order: number
  attributeName: string
  attributeValue: NFTAttributeValue
}

/**
 * @category userTypes
 * @category generated
 */
export const nFTAttributeBeet = new beet.FixableBeetArgsStruct<NFTAttribute>(
  [
    ['block', beetSolana.publicKey],
    ['blockDefinition', beetSolana.publicKey],
    ['mint', beetSolana.publicKey],
    ['order', beet.u8],
    ['attributeName', beet.utf8String],
    ['attributeValue', nFTAttributeValueBeet],
  ],
  'NFTAttribute'
)
