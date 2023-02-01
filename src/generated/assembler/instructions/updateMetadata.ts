/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import {
  UpdateMetadataArgs,
  updateMetadataArgsBeet,
} from '../types/UpdateMetadataArgs'

/**
 * @category Instructions
 * @category UpdateMetadata
 * @category generated
 */
export type UpdateMetadataInstructionArgs = {
  args: UpdateMetadataArgs
}
/**
 * @category Instructions
 * @category UpdateMetadata
 * @category generated
 */
export const updateMetadataStruct = new beet.FixableBeetArgsStruct<
  UpdateMetadataInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', updateMetadataArgsBeet],
  ],
  'UpdateMetadataInstructionArgs'
)
/**
 * Accounts required by the _updateMetadata_ instruction
 *
 * @property [_writable_] assembler
 * @property [] nft
 * @property [_writable_] metadata
 * @property [**signer**] authority
 * @property [] tokenMetadataProgram
 * @category Instructions
 * @category UpdateMetadata
 * @category generated
 */
export type UpdateMetadataInstructionAccounts = {
  assembler: web3.PublicKey
  nft: web3.PublicKey
  metadata: web3.PublicKey
  authority: web3.PublicKey
  tokenMetadataProgram: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const updateMetadataInstructionDiscriminator = [
  170, 182, 43, 239, 97, 78, 225, 186,
]

/**
 * Creates a _UpdateMetadata_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category UpdateMetadata
 * @category generated
 */
export function createUpdateMetadataInstruction(
  accounts: UpdateMetadataInstructionAccounts,
  args: UpdateMetadataInstructionArgs,
  programId = new web3.PublicKey('Gq1333CkB2sGernk72TKfDVLnHj9LjmeijFujM2ULxJz')
) {
  const [data] = updateMetadataStruct.serialize({
    instructionDiscriminator: updateMetadataInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.assembler,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.nft,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.metadata,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.authority,
      isWritable: false,
      isSigner: true,
    },
    {
      pubkey: accounts.tokenMetadataProgram,
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