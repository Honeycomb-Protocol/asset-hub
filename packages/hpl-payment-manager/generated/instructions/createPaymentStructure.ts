/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import {
  CreatePaymentStructureArgs,
  createPaymentStructureArgsBeet,
} from '../types/CreatePaymentStructureArgs'

/**
 * @category Instructions
 * @category CreatePaymentStructure
 * @category generated
 */
export type CreatePaymentStructureInstructionArgs = {
  args: CreatePaymentStructureArgs
}
/**
 * @category Instructions
 * @category CreatePaymentStructure
 * @category generated
 */
export const createPaymentStructureStruct = new beet.FixableBeetArgsStruct<
  CreatePaymentStructureInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', createPaymentStructureArgsBeet],
  ],
  'CreatePaymentStructureInstructionArgs'
)
/**
 * Accounts required by the _createPaymentStructure_ instruction
 *
 * @property [] unique
 * @property [_writable_] paymentStructure
 * @property [**signer**] authority
 * @property [_writable_, **signer**] payer
 * @property [] clockSysvar
 * @category Instructions
 * @category CreatePaymentStructure
 * @category generated
 */
export type CreatePaymentStructureInstructionAccounts = {
  unique: web3.PublicKey
  paymentStructure: web3.PublicKey
  authority: web3.PublicKey
  payer: web3.PublicKey
  systemProgram?: web3.PublicKey
  clockSysvar: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const createPaymentStructureInstructionDiscriminator = [
  29, 175, 155, 242, 39, 71, 183, 18,
]

/**
 * Creates a _CreatePaymentStructure_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category CreatePaymentStructure
 * @category generated
 */
export function createCreatePaymentStructureInstruction(
  accounts: CreatePaymentStructureInstructionAccounts,
  args: CreatePaymentStructureInstructionArgs,
  programId = new web3.PublicKey('Pay9ZxrVRXjt9Da8qpwqq4yBRvvrfx3STWnKK4FstPr')
) {
  const [data] = createPaymentStructureStruct.serialize({
    instructionDiscriminator: createPaymentStructureInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.unique,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.paymentStructure,
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
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
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
