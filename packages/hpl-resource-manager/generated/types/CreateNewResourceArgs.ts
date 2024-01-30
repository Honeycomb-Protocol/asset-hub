/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import { ResourseKind, resourseKindBeet } from './ResourseKind'
import {
  ResourceMetadataArgs,
  resourceMetadataArgsBeet,
} from './ResourceMetadataArgs'
export type CreateNewResourceArgs = {
  kind: ResourseKind
  metadata: ResourceMetadataArgs
  decimals: number
}

/**
 * @category userTypes
 * @category generated
 */
export const createNewResourceArgsBeet =
  new beet.FixableBeetArgsStruct<CreateNewResourceArgs>(
    [
      ['kind', resourseKindBeet],
      ['metadata', resourceMetadataArgsBeet],
      ['decimals', beet.u8],
    ],
    'CreateNewResourceArgs'
  )
