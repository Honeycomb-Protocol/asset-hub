/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as splToken from '@solana/spl-token'
import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'

/**
 * @category Instructions
 * @category BurnNft
 * @category generated
 */
export const burnNftStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'BurnNftInstructionArgs'
)
/**
 * Accounts required by the _burnNft_ instruction
 *
 * @property [] assembler
 * @property [_writable_] nft
 * @property [_writable_] nftMint
 * @property [_writable_] nftMetadata
 * @property [_writable_] nftMasterEdition
 * @property [_writable_] tokenAccount
 * @property [_writable_] uniqueConstraint
 * @property [**signer**] authority
 * @property [**signer**] payer
 * @property [] tokenMetadataProgram
 * @property [] sysvarInstructions
 * @property [] project
 * @property [] delegateAuthority
 * @property [_writable_] vault
 * @category Instructions
 * @category BurnNft
 * @category generated
 */
export type BurnNftInstructionAccounts = {
  assembler: web3.PublicKey
  nft: web3.PublicKey
  nftMint: web3.PublicKey
  nftMetadata: web3.PublicKey
  nftMasterEdition: web3.PublicKey
  tokenAccount: web3.PublicKey
  uniqueConstraint: web3.PublicKey
  authority: web3.PublicKey
  payer: web3.PublicKey
  systemProgram?: web3.PublicKey
  tokenProgram?: web3.PublicKey
  tokenMetadataProgram: web3.PublicKey
  sysvarInstructions: web3.PublicKey
  project: web3.PublicKey
  delegateAuthority: web3.PublicKey
  vault: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const burnNftInstructionDiscriminator = [
  119, 13, 183, 17, 194, 243, 38, 31,
]

/**
 * Creates a _BurnNft_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category BurnNft
 * @category generated
 */
export function createBurnNftInstruction(
  accounts: BurnNftInstructionAccounts,
  programId = new web3.PublicKey('Gq1333CkB2sGernk72TKfDVLnHj9LjmeijFujM2ULxJz')
) {
  const [data] = burnNftStruct.serialize({
    instructionDiscriminator: burnNftInstructionDiscriminator,
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
      pubkey: accounts.tokenAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.uniqueConstraint,
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
      pubkey: accounts.tokenMetadataProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.sysvarInstructions,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.project,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.delegateAuthority,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.vault,
      isWritable: true,
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
