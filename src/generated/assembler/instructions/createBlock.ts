/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import { CreateBlockArgs, createBlockArgsBeet } from '../types/CreateBlockArgs'

/**
 * @category Instructions
 * @category CreateBlock
 * @category generated
 */
export type CreateBlockInstructionArgs = {
  args: CreateBlockArgs
}
/**
 * @category Instructions
 * @category CreateBlock
 * @category generated
 */
export const createBlockStruct = new beet.FixableBeetArgsStruct<
  CreateBlockInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', createBlockArgsBeet],
  ],
  'CreateBlockInstructionArgs'
)
/**
 * Accounts required by the _createBlock_ instruction
 *
 * @property [] assembler
 * @property [_writable_] block
 * @property [**signer**] authority
 * @property [_writable_, **signer**] payer
 * @category Instructions
 * @category CreateBlock
 * @category generated
 */
export type CreateBlockInstructionAccounts = {
  assembler: web3.PublicKey
  block: web3.PublicKey
  authority: web3.PublicKey
  payer: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const createBlockInstructionDiscriminator = [
  31, 50, 186, 144, 29, 111, 138, 153,
]

/**
 * Creates a _CreateBlock_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category CreateBlock
 * @category generated
 */
export function createCreateBlockInstruction(
  accounts: CreateBlockInstructionAccounts,
  args: CreateBlockInstructionArgs,
  programId = new web3.PublicKey('4cEhZgkh41JbuXsXdcKhNaeHJ2BpzmXN3VpMQ3nFPDrp')
) {
  const [data] = createBlockStruct.serialize({
    instructionDiscriminator: createBlockInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.assembler,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.block,
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
