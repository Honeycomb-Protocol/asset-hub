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
  InitilizeResourceTreeArgs,
  initilizeResourceTreeArgsBeet,
} from '../types/InitilizeResourceTreeArgs'

/**
 * @category Instructions
 * @category InitilizeResourceTree
 * @category generated
 */
export type InitilizeResourceTreeInstructionArgs = {
  args: InitilizeResourceTreeArgs
}
/**
 * @category Instructions
 * @category InitilizeResourceTree
 * @category generated
 */
export const initilizeResourceTreeStruct = new beet.BeetArgsStruct<
  InitilizeResourceTreeInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', initilizeResourceTreeArgsBeet],
  ],
  'InitilizeResourceTreeInstructionArgs'
)
/**
 * Accounts required by the _initilizeResourceTree_ instruction
 *
 * @property [] project
 * @property [_writable_] resource
 * @property [_writable_, **signer**] owner
 * @property [_writable_, **signer**] payer
 * @property [_writable_, **signer**] merkleTree
 * @property [] rentSysvar
 * @property [] compressionProgram
 * @property [] logWrapper
 * @property [] clock
 * @category Instructions
 * @category InitilizeResourceTree
 * @category generated
 */
export type InitilizeResourceTreeInstructionAccounts = {
  project: web3.PublicKey
  resource: web3.PublicKey
  owner: web3.PublicKey
  payer: web3.PublicKey
  merkleTree: web3.PublicKey
  rentSysvar: web3.PublicKey
  systemProgram?: web3.PublicKey
  tokenProgram?: web3.PublicKey
  compressionProgram: web3.PublicKey
  logWrapper: web3.PublicKey
  clock: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const initilizeResourceTreeInstructionDiscriminator = [
  28, 77, 36, 158, 111, 178, 59, 83,
]

/**
 * Creates a _InitilizeResourceTree_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category InitilizeResourceTree
 * @category generated
 */
export function createInitilizeResourceTreeInstruction(
  accounts: InitilizeResourceTreeInstructionAccounts,
  args: InitilizeResourceTreeInstructionArgs,
  programId = new web3.PublicKey('ATQfyuSouoFHW393YFYeojfBcsPD6KpM4cVCzSwkguT2')
) {
  const [data] = initilizeResourceTreeStruct.serialize({
    instructionDiscriminator: initilizeResourceTreeInstructionDiscriminator,
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
      pubkey: accounts.merkleTree,
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
