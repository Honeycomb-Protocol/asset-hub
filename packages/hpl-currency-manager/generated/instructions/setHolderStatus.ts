/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import { HolderStatus, holderStatusBeet } from '../types/HolderStatus'

/**
 * @category Instructions
 * @category SetHolderStatus
 * @category generated
 */
export type SetHolderStatusInstructionArgs = {
  status: HolderStatus
}
/**
 * @category Instructions
 * @category SetHolderStatus
 * @category generated
 */
export const setHolderStatusStruct = new beet.BeetArgsStruct<
  SetHolderStatusInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['status', holderStatusBeet],
  ],
  'SetHolderStatusInstructionArgs'
)
/**
 * Accounts required by the _setHolderStatus_ instruction
 *
 * @property [_writable_] holderAccount
 * @property [_writable_] tokenAccount
 * @property [**signer**] authority
 * @category Instructions
 * @category SetHolderStatus
 * @category generated
 */
export type SetHolderStatusInstructionAccounts = {
  holderAccount: web3.PublicKey
  tokenAccount: web3.PublicKey
  authority: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const setHolderStatusInstructionDiscriminator = [
  121, 5, 238, 79, 85, 126, 216, 174,
]

/**
 * Creates a _SetHolderStatus_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category SetHolderStatus
 * @category generated
 */
export function createSetHolderStatusInstruction(
  accounts: SetHolderStatusInstructionAccounts,
  args: SetHolderStatusInstructionArgs,
  programId = new web3.PublicKey('4mGbMdQY7YgVp9rEqZnbkRg5m1H5o3ixZnneGgcT3Pvf')
) {
  const [data] = setHolderStatusStruct.serialize({
    instructionDiscriminator: setHolderStatusInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.holderAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.authority,
      isWritable: false,
      isSigner: true,
    },
  ]

  if (accounts.anchorRemainingAccounts != null) {
    for (const acc of accounts.anchorRemainingAccounts) {
      keys.push(acc)
    }
  }

  const ix = new web3.TransactionInstruction({
    programId,
    keys,
    data,
  })
  return ix
}
