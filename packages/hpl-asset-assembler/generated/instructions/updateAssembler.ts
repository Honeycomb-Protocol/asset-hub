/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import {
  UpdateAssemblerArgs,
  updateAssemblerArgsBeet,
} from '../types/UpdateAssemblerArgs'

/**
 * @category Instructions
 * @category UpdateAssembler
 * @category generated
 */
export type UpdateAssemblerInstructionArgs = {
  args: UpdateAssemblerArgs
  proofIndex: number
}
/**
 * @category Instructions
 * @category UpdateAssembler
 * @category generated
 */
export const updateAssemblerStruct = new beet.FixableBeetArgsStruct<
  UpdateAssemblerInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', updateAssemblerArgsBeet],
    ['proofIndex', beet.u8],
  ],
  'UpdateAssemblerInstructionArgs'
)
/**
 * Accounts required by the _updateAssembler_ instruction
 *
 * @property [] project
 * @property [_writable_] assembler
 * @property [] delegateAuthority (optional)
 * @property [**signer**] authority
 * @property [**signer**] payer
 * @property [_writable_] vault
 * @property [] hiveControl
 * @property [] instructionsSysvar
 * @category Instructions
 * @category UpdateAssembler
 * @category generated
 */
export type UpdateAssemblerInstructionAccounts = {
  project: web3.PublicKey
  assembler: web3.PublicKey
  delegateAuthority?: web3.PublicKey
  authority: web3.PublicKey
  payer: web3.PublicKey
  vault: web3.PublicKey
  systemProgram?: web3.PublicKey
  hiveControl: web3.PublicKey
  instructionsSysvar: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const updateAssemblerInstructionDiscriminator = [
  23, 247, 28, 6, 104, 204, 226, 121,
]

/**
 * Creates a _UpdateAssembler_ instruction.
 *
 * Optional accounts that are not provided default to the program ID since
 * this was indicated in the IDL from which this instruction was generated.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category UpdateAssembler
 * @category generated
 */
export function createUpdateAssemblerInstruction(
  accounts: UpdateAssemblerInstructionAccounts,
  args: UpdateAssemblerInstructionArgs,
  programId = new web3.PublicKey('Gq1333CkB2sGernk72TKfDVLnHj9LjmeijFujM2ULxJz')
) {
  const [data] = updateAssemblerStruct.serialize({
    instructionDiscriminator: updateAssemblerInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.project,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.assembler,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.delegateAuthority ?? programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.authority,
      isWritable: false,
      isSigner: true,
    },
    {
      pubkey: accounts.payer,
      isWritable: false,
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
