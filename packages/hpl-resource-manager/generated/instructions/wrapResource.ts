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
  WrapResourceArgs,
  wrapResourceArgsBeet,
} from '../types/WrapResourceArgs'

/**
 * @category Instructions
 * @category WrapResource
 * @category generated
 */
export type WrapResourceInstructionArgs = {
  args: WrapResourceArgs
}
/**
 * @category Instructions
 * @category WrapResource
 * @category generated
 */
export const wrapResourceStruct = new beet.BeetArgsStruct<
  WrapResourceInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', wrapResourceArgsBeet],
  ],
  'WrapResourceInstructionArgs'
)
/**
 * Accounts required by the _wrapResource_ instruction
 *
 * @property [] project
 * @property [] resource
 * @property [_writable_] mint
 * @property [_writable_] merkleTree
 * @property [_writable_] tokenAccount
 * @property [_writable_, **signer**] owner
 * @property [_writable_, **signer**] payer
 * @property [] rentSysvar
 * @property [] compressionProgram
 * @property [] logWrapper
 * @property [] clock
 * @property [] associatedTokenProgram
 * @category Instructions
 * @category WrapResource
 * @category generated
 */
export type WrapResourceInstructionAccounts = {
  project: web3.PublicKey
  resource: web3.PublicKey
  mint: web3.PublicKey
  merkleTree: web3.PublicKey
  tokenAccount: web3.PublicKey
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

export const wrapResourceInstructionDiscriminator = [
  176, 14, 174, 210, 16, 217, 89, 245,
]

/**
 * Creates a _WrapResource_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category WrapResource
 * @category generated
 */
export function createWrapResourceInstruction(
  accounts: WrapResourceInstructionAccounts,
  args: WrapResourceInstructionArgs,
  programId = new web3.PublicKey('6ARwjKsMY2P3eLEWhdoU5czNezw3Qg6jEfbmLTVQqrPQ')
) {
  const [data] = wrapResourceStruct.serialize({
    instructionDiscriminator: wrapResourceInstructionDiscriminator,
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
      pubkey: accounts.tokenAccount,
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
