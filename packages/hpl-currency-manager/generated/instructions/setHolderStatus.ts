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
 * @property [_writable_] project
 * @property [] currency
 * @property [_writable_] holderAccount
 * @property [_writable_] tokenAccount
 * @property [**signer**] authority
 * @property [_writable_, **signer**] payer
 * @property [_writable_] vault
 * @property [] hiveControl
 * @property [] instructionsSysvar
 * @property [] clockSysvar
 * @category Instructions
 * @category SetHolderStatus
 * @category generated
 */
export type SetHolderStatusInstructionAccounts = {
  project: web3.PublicKey
  currency: web3.PublicKey
  holderAccount: web3.PublicKey
  tokenAccount: web3.PublicKey
  authority: web3.PublicKey
  payer: web3.PublicKey
  vault: web3.PublicKey
  systemProgram?: web3.PublicKey
  hiveControl: web3.PublicKey
  instructionsSysvar: web3.PublicKey
  clockSysvar: web3.PublicKey
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
  programId = new web3.PublicKey('Eo29f5874SZDf827Fyr9HThcsF5GWkDCH9UyYsPwqXER')
) {
  const [data] = setHolderStatusStruct.serialize({
    instructionDiscriminator: setHolderStatusInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.project,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.currency,
      isWritable: false,
      isSigner: false,
    },
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
    {
      pubkey: accounts.payer,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.vault,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.hiveControl,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.instructionsSysvar,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.clockSysvar,
      isWritable: false,
      isSigner: false,
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
