/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import {
  MakeCnftPaymentArgs,
  makeCnftPaymentArgsBeet,
} from '../types/MakeCnftPaymentArgs'

/**
 * @category Instructions
 * @category MakeCnftPayment
 * @category generated
 */
export type MakeCnftPaymentInstructionArgs = {
  args: MakeCnftPaymentArgs
}
/**
 * @category Instructions
 * @category MakeCnftPayment
 * @category generated
 */
export const makeCnftPaymentStruct = new beet.FixableBeetArgsStruct<
  MakeCnftPaymentInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', makeCnftPaymentArgsBeet],
  ],
  'MakeCnftPaymentInstructionArgs'
)
/**
 * Accounts required by the _makeCnftPayment_ instruction
 *
 * @property [] paymentStructure
 * @property [_writable_] paymentSession
 * @property [_writable_] merkleTree
 * @property [] treeAuthority
 * @property [] creatorHash
 * @property [] dataHash
 * @property [] root
 * @property [] beneficiary (optional)
 * @property [_writable_, **signer**] payer
 * @property [_writable_] bubblegumProgram
 * @property [] compressionProgram
 * @property [] hplEvents
 * @property [] logWrapper
 * @property [] clockSysvar
 * @category Instructions
 * @category MakeCnftPayment
 * @category generated
 */
export type MakeCnftPaymentInstructionAccounts = {
  paymentStructure: web3.PublicKey
  paymentSession: web3.PublicKey
  merkleTree: web3.PublicKey
  treeAuthority: web3.PublicKey
  creatorHash: web3.PublicKey
  dataHash: web3.PublicKey
  root: web3.PublicKey
  beneficiary?: web3.PublicKey
  payer: web3.PublicKey
  systemProgram?: web3.PublicKey
  bubblegumProgram: web3.PublicKey
  compressionProgram: web3.PublicKey
  hplEvents: web3.PublicKey
  logWrapper: web3.PublicKey
  clockSysvar: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const makeCnftPaymentInstructionDiscriminator = [
  11, 12, 83, 215, 22, 62, 230, 182,
]

/**
 * Creates a _MakeCnftPayment_ instruction.
 *
 * Optional accounts that are not provided will be omitted from the accounts
 * array passed with the instruction.
 * An optional account that is set cannot follow an optional account that is unset.
 * Otherwise an Error is raised.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category MakeCnftPayment
 * @category generated
 */
export function createMakeCnftPaymentInstruction(
  accounts: MakeCnftPaymentInstructionAccounts,
  args: MakeCnftPaymentInstructionArgs,
  programId = new web3.PublicKey('Pay9ZxrVRXjt9Da8qpwqq4yBRvvrfx3STWnKK4FstPr')
) {
  const [data] = makeCnftPaymentStruct.serialize({
    instructionDiscriminator: makeCnftPaymentInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.paymentStructure,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.paymentSession,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.merkleTree,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.treeAuthority,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.creatorHash,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.dataHash,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.root,
      isWritable: false,
      isSigner: false,
    },
  ]

  if (accounts.beneficiary != null) {
    keys.push({
      pubkey: accounts.beneficiary,
      isWritable: false,
      isSigner: false,
    })
  }
  keys.push({
    pubkey: accounts.payer,
    isWritable: true,
    isSigner: true,
  })
  keys.push({
    pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
    isWritable: false,
    isSigner: false,
  })
  keys.push({
    pubkey: accounts.bubblegumProgram,
    isWritable: true,
    isSigner: false,
  })
  keys.push({
    pubkey: accounts.compressionProgram,
    isWritable: false,
    isSigner: false,
  })
  keys.push({
    pubkey: accounts.hplEvents,
    isWritable: false,
    isSigner: false,
  })
  keys.push({
    pubkey: accounts.logWrapper,
    isWritable: false,
    isSigner: false,
  })
  keys.push({
    pubkey: accounts.clockSysvar,
    isWritable: false,
    isSigner: false,
  })

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
