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
  BurnResourceArgs,
  burnResourceArgsBeet,
} from '../types/BurnResourceArgs'

/**
 * @category Instructions
 * @category BurnResource
 * @category generated
 */
export type BurnResourceInstructionArgs = {
  args: BurnResourceArgs
}
/**
 * @category Instructions
 * @category BurnResource
 * @category generated
 */
export const burnResourceStruct = new beet.BeetArgsStruct<
  BurnResourceInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', burnResourceArgsBeet],
  ],
  'BurnResourceInstructionArgs'
)
/**
 * Accounts required by the _burnResource_ instruction
 *
 * @property [] project
 * @property [] resource
 * @property [] mint
 * @property [] merkleTree
 * @property [_writable_, **signer**] owner
 * @property [_writable_, **signer**] payer
 * @property [] rentSysvar
 * @property [] token22Program
 * @property [] compressionProgram
 * @property [] logWrapper
 * @property [] clock
 * @category Instructions
 * @category BurnResource
 * @category generated
 */
export type BurnResourceInstructionAccounts = {
  project: web3.PublicKey
  resource: web3.PublicKey
  mint: web3.PublicKey
  merkleTree: web3.PublicKey
  owner: web3.PublicKey
  payer: web3.PublicKey
  rentSysvar: web3.PublicKey
  systemProgram?: web3.PublicKey
  token22Program: web3.PublicKey
  tokenProgram?: web3.PublicKey
  compressionProgram: web3.PublicKey
  logWrapper: web3.PublicKey
  clock: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const burnResourceInstructionDiscriminator = [
  252, 54, 4, 35, 74, 224, 187, 19,
]

/**
 * Creates a _BurnResource_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category BurnResource
 * @category generated
 */
export function createBurnResourceInstruction(
  accounts: BurnResourceInstructionAccounts,
  args: BurnResourceInstructionArgs,
  programId = new web3.PublicKey('6ARwjKsMY2P3eLEWhdoU5czNezw3Qg6jEfbmLTVQqrPQ')
) {
  const [data] = burnResourceStruct.serialize({
    instructionDiscriminator: burnResourceInstructionDiscriminator,
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
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.merkleTree,
      isWritable: false,
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
      pubkey: accounts.token22Program,
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
