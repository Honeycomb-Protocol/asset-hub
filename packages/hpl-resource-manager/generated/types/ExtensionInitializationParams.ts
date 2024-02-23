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
 * This type is used to derive the {@link ExtensionInitializationParams} type as well as the de/serializer.
 * However don't refer to it in your code but use the {@link ExtensionInitializationParams} type instead.
 *
 * @category userTypes
 * @category enums
 * @category generated
 * @private
 */
export type ExtensionInitializationParamsRecord = {
  MintCloseAuthority: { closeAuthority: beet.COption<web3.PublicKey> }
  PermanentDelegate: { delegate: web3.PublicKey }
  MetadataPointer: {
    authority: beet.COption<web3.PublicKey>
    metadataAddress: beet.COption<web3.PublicKey>
  }
}

/**
 * Union type respresenting the ExtensionInitializationParams data enum defined in Rust.
 *
 * NOTE: that it includes a `__kind` property which allows to narrow types in
 * switch/if statements.
 * Additionally `isExtensionInitializationParams*` type guards are exposed below to narrow to a specific variant.
 *
 * @category userTypes
 * @category enums
 * @category generated
 */
export type ExtensionInitializationParams =
  beet.DataEnumKeyAsKind<ExtensionInitializationParamsRecord>

export const isExtensionInitializationParamsMintCloseAuthority = (
  x: ExtensionInitializationParams
): x is ExtensionInitializationParams & { __kind: 'MintCloseAuthority' } =>
  x.__kind === 'MintCloseAuthority'
export const isExtensionInitializationParamsPermanentDelegate = (
  x: ExtensionInitializationParams
): x is ExtensionInitializationParams & { __kind: 'PermanentDelegate' } =>
  x.__kind === 'PermanentDelegate'
export const isExtensionInitializationParamsMetadataPointer = (
  x: ExtensionInitializationParams
): x is ExtensionInitializationParams & { __kind: 'MetadataPointer' } =>
  x.__kind === 'MetadataPointer'

/**
 * @category userTypes
 * @category generated
 */
export const extensionInitializationParamsBeet =
  beet.dataEnum<ExtensionInitializationParamsRecord>([
    [
      'MintCloseAuthority',
      new beet.FixableBeetArgsStruct<
        ExtensionInitializationParamsRecord['MintCloseAuthority']
      >(
        [['closeAuthority', beet.coption(beetSolana.publicKey)]],
        'ExtensionInitializationParamsRecord["MintCloseAuthority"]'
      ),
    ],

    [
      'PermanentDelegate',
      new beet.BeetArgsStruct<
        ExtensionInitializationParamsRecord['PermanentDelegate']
      >(
        [['delegate', beetSolana.publicKey]],
        'ExtensionInitializationParamsRecord["PermanentDelegate"]'
      ),
    ],

    [
      'MetadataPointer',
      new beet.FixableBeetArgsStruct<
        ExtensionInitializationParamsRecord['MetadataPointer']
      >(
        [
          ['authority', beet.coption(beetSolana.publicKey)],
          ['metadataAddress', beet.coption(beetSolana.publicKey)],
        ],
        'ExtensionInitializationParamsRecord["MetadataPointer"]'
      ),
    ],
  ]) as beet.FixableBeet<
    ExtensionInitializationParams,
    ExtensionInitializationParams
  >