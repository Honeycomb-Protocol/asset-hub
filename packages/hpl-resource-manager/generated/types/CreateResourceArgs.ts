/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import { ResourceKind, resourceKindBeet } from './ResourceKind'
import {
  ResourceMetadataArgs,
  resourceMetadataArgsBeet,
} from './ResourceMetadataArgs'
export type CreateResourceArgs = {
  kind: ResourceKind
  metadata: ResourceMetadataArgs
}

/**
 * @category userTypes
 * @category generated
 */
export const createResourceArgsBeet =
  new beet.FixableBeetArgsStruct<CreateResourceArgs>(
    [
      ['kind', resourceKindBeet],
      ['metadata', resourceMetadataArgsBeet],
    ],
    'CreateResourceArgs'
  )
