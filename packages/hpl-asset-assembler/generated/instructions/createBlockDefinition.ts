/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import {
  BlockDefinitionValue,
  blockDefinitionValueBeet,
} from '../types/BlockDefinitionValue'

/**
 * @category Instructions
 * @category CreateBlockDefinition
 * @category generated
 */
export type CreateBlockDefinitionInstructionArgs = {
  args: BlockDefinitionValue
  proofIndex: number
}
/**
 * @category Instructions
 * @category CreateBlockDefinition
 * @category generated
 */
export const createBlockDefinitionStruct = new beet.FixableBeetArgsStruct<
  CreateBlockDefinitionInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', blockDefinitionValueBeet],
    ['proofIndex', beet.u8],
  ],
  'CreateBlockDefinitionInstructionArgs'
)
/**
 * Accounts required by the _createBlockDefinition_ instruction
 *
 * @property [] project
 * @property [] assembler
 * @property [_writable_] block
 * @property [_writable_] blockDefinition
 * @property [_writable_] blockDefinitionMint
 * @property [] delegateAuthority (optional)
 * @property [**signer**] authority
 * @property [_writable_, **signer**] payer
 * @property [_writable_] vault
 * @property [] hiveControl
 * @property [] instructionsSysvar
 * @category Instructions
 * @category CreateBlockDefinition
 * @category generated
 */
export type CreateBlockDefinitionInstructionAccounts = {
  project: web3.PublicKey
  assembler: web3.PublicKey
  block: web3.PublicKey
  blockDefinition: web3.PublicKey
  blockDefinitionMint: web3.PublicKey
  delegateAuthority?: web3.PublicKey
  authority: web3.PublicKey
  payer: web3.PublicKey
  vault: web3.PublicKey
  systemProgram?: web3.PublicKey
  hiveControl: web3.PublicKey
  instructionsSysvar: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const createBlockDefinitionInstructionDiscriminator = [
  84, 173, 223, 150, 100, 247, 106, 4,
]

/**
 * Creates a _CreateBlockDefinition_ instruction.
 *
 * Optional accounts that are not provided default to the program ID since
 * this was indicated in the IDL from which this instruction was generated.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category CreateBlockDefinition
 * @category generated
 */
export function createCreateBlockDefinitionInstruction(
  accounts: CreateBlockDefinitionInstructionAccounts,
  args: CreateBlockDefinitionInstructionArgs,
  programId = new web3.PublicKey('Gq1333CkB2sGernk72TKfDVLnHj9LjmeijFujM2ULxJz')
) {
  const [data] = createBlockDefinitionStruct.serialize({
    instructionDiscriminator: createBlockDefinitionInstructionDiscriminator,
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
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.block,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.blockDefinition,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.blockDefinitionMint,
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
