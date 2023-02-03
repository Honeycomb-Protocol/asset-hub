/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import {
  DelegateAuthorityPermission,
  delegateAuthorityPermissionBeet,
} from './DelegateAuthorityPermission'
export type CreateDelegateAuthorityArgs = {
  permission: DelegateAuthorityPermission
}

/**
 * @category userTypes
 * @category generated
 */
export const createDelegateAuthorityArgsBeet =
  new beet.BeetArgsStruct<CreateDelegateAuthorityArgs>(
    [['permission', delegateAuthorityPermissionBeet]],
    'CreateDelegateAuthorityArgs'
  )