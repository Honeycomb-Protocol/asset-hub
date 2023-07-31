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
  SetNFTGeneratedArgs,
  setNFTGeneratedArgsBeet,
} from '../types/SetNFTGeneratedArgs'

/**
 * @category Instructions
 * @category SetNftGenerated
 * @category generated
 */
export type SetNftGeneratedInstructionArgs = {
  args: SetNFTGeneratedArgs
  proofIndex: number
}
/**
 * @category Instructions
 * @category SetNftGenerated
 * @category generated
 */
export const setNftGeneratedStruct = new beet.FixableBeetArgsStruct<
  SetNftGeneratedInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', setNFTGeneratedArgsBeet],
    ['proofIndex', beet.u8],
  ],
  'SetNftGeneratedInstructionArgs'
)
/**
 * Accounts required by the _setNftGenerated_ instruction
 *
 * @property [] assembler
 * @property [_writable_] nft
 * @property [_writable_] nftMint
 * @property [_writable_] nftMetadata
 * @property [_writable_] nftMasterEdition
 * @property [**signer**] authority
 * @property [**signer**] payer
 * @property [] instructionsSysvar
 * @property [] project
 * @property [] delegateAuthority (optional)
 * @property [_writable_] vault
 * @category Instructions
 * @category SetNftGenerated
 * @category generated
 */
export type SetNftGeneratedInstructionAccounts = {
  assembler: web3.PublicKey
  nft: web3.PublicKey
  nftMint: web3.PublicKey
  nftMetadata: web3.PublicKey
  nftMasterEdition: web3.PublicKey
  authority: web3.PublicKey
  payer: web3.PublicKey
  systemProgram?: web3.PublicKey
  tokenProgram?: web3.PublicKey
  instructionsSysvar: web3.PublicKey
  project: web3.PublicKey
  delegateAuthority?: web3.PublicKey
  vault: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const setNftGeneratedInstructionDiscriminator = [
  19, 33, 138, 249, 8, 87, 27, 176,
]

/**
 * Creates a _SetNftGenerated_ instruction.
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
 * @category SetNftGenerated
 * @category generated
 */
export function createSetNftGeneratedInstruction(
  accounts: SetNftGeneratedInstructionAccounts,
  args: SetNftGeneratedInstructionArgs,
  programId = new web3.PublicKey('Gq1333CkB2sGernk72TKfDVLnHj9LjmeijFujM2ULxJz')
) {
  const [data] = setNftGeneratedStruct.serialize({
    instructionDiscriminator: setNftGeneratedInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.assembler,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.nft,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.nftMint,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.nftMetadata,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.nftMasterEdition,
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
      isWritable: false,
      isSigner: true,
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
      pubkey: accounts.instructionsSysvar,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.project,
      isWritable: false,
      isSigner: false,
    },
  ]

  if (accounts.delegateAuthority != null) {
    keys.push({
      pubkey: accounts.delegateAuthority,
      isWritable: false,
      isSigner: false,
    })
  }
  keys.push({
    pubkey: accounts.vault,
    isWritable: true,
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
