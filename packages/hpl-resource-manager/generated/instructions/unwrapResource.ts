/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as splToken from '@solana/spl-token'
import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import {
  UnWrapResourceArgs,
  unWrapResourceArgsBeet,
} from '../types/UnWrapResourceArgs'

/**
 * @category Instructions
 * @category UnwrapResource
 * @category generated
 */
export type UnwrapResourceInstructionArgs = {
  args: UnWrapResourceArgs
}
/**
 * @category Instructions
 * @category UnwrapResource
 * @category generated
 */
export const unwrapResourceStruct = new beet.BeetArgsStruct<
  UnwrapResourceInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', unWrapResourceArgsBeet],
  ],
  'UnwrapResourceInstructionArgs'
)
/**
 * Accounts required by the _unwrapResource_ instruction
 *
 * @property [] project
 * @property [] resource
 * @property [_writable_] mint
 * @property [_writable_] merkleTree
 * @property [_writable_] recipientAccount
 * @property [_writable_, **signer**] owner
 * @property [_writable_, **signer**] payer
 * @property [] rentSysvar
 * @property [] compressionProgram
 * @property [] logWrapper
 * @property [] clock
 * @property [] associatedTokenProgram
 * @category Instructions
 * @category UnwrapResource
 * @category generated
 */
export type UnwrapResourceInstructionAccounts = {
  project: web3.PublicKey
  resource: web3.PublicKey
  mint: web3.PublicKey
  merkleTree: web3.PublicKey
  recipientAccount: web3.PublicKey
  owner: web3.PublicKey
  payer: web3.PublicKey
  rentSysvar: web3.PublicKey
  systemProgram?: web3.PublicKey
  tokenProgram?: web3.PublicKey
  compressionProgram: web3.PublicKey
  logWrapper: web3.PublicKey
  clock: web3.PublicKey
  associatedTokenProgram: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const unwrapResourceInstructionDiscriminator = [
  110, 83, 236, 85, 230, 247, 205, 106,
]

/**
 * Creates a _UnwrapResource_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category UnwrapResource
 * @category generated
 */
export function createUnwrapResourceInstruction(
  accounts: UnwrapResourceInstructionAccounts,
  args: UnwrapResourceInstructionArgs,
  programId = new web3.PublicKey('4tJgAkjtSk6vFPtcXZeNybMsjrqRyWxKfPdeGu8bmh6y')
) {
  const [data] = unwrapResourceStruct.serialize({
    instructionDiscriminator: unwrapResourceInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.project,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.resource,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.mint,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.merkleTree,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.recipientAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.owner,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.payer,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.rentSysvar,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenProgram ?? splToken.TOKEN_PROGRAM_ID,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.compressionProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.logWrapper,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.clock,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.associatedTokenProgram,
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