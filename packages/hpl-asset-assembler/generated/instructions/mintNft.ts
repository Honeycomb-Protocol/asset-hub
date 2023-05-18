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
 * @category MintNft
 * @category generated
 */
export const mintNftStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'MintNftInstructionArgs'
)
/**
 * Accounts required by the _mintNft_ instruction
 *
 * @property [] assembler
 * @property [_writable_] nft
 * @property [_writable_] nftMint
 * @property [_writable_] nftMetadata
 * @property [_writable_] nftMasterEdition
 * @property [_writable_] nftTokenRecord (optional)
 * @property [_writable_] tokenAccount
 * @property [_writable_] uniqueConstraint (optional)
 * @property [_writable_, **signer**] authority
 * @property [_writable_, **signer**] payer
 * @property [] associatedTokenProgram
 * @property [] sysvarInstructions
 * @property [] tokenMetadataProgram
 * @property [] project
 * @property [] delegateAuthority (optional)
 * @property [_writable_] vault
 * @category Instructions
 * @category MintNft
 * @category generated
 */
export type MintNftInstructionAccounts = {
  assembler: web3.PublicKey
  nft: web3.PublicKey
  nftMint: web3.PublicKey
  nftMetadata: web3.PublicKey
  nftMasterEdition: web3.PublicKey
  nftTokenRecord?: web3.PublicKey
  tokenAccount: web3.PublicKey
  uniqueConstraint?: web3.PublicKey
  authority: web3.PublicKey
  payer: web3.PublicKey
  systemProgram?: web3.PublicKey
  tokenProgram?: web3.PublicKey
  associatedTokenProgram: web3.PublicKey
  sysvarInstructions: web3.PublicKey
  tokenMetadataProgram: web3.PublicKey
  rent?: web3.PublicKey
  project: web3.PublicKey
  delegateAuthority?: web3.PublicKey
  vault: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const mintNftInstructionDiscriminator = [
  211, 57, 6, 167, 15, 219, 35, 251,
]

/**
 * Creates a _MintNft_ instruction.
 *
 * Optional accounts that are not provided will be omitted from the accounts
 * array passed with the instruction.
 * An optional account that is set cannot follow an optional account that is unset.
 * Otherwise an Error is raised.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category MintNft
 * @category generated
 */
export function createMintNftInstruction(
  accounts: MintNftInstructionAccounts,
  programId = new web3.PublicKey('Gq1333CkB2sGernk72TKfDVLnHj9LjmeijFujM2ULxJz')
) {
  const [data] = mintNftStruct.serialize({
    instructionDiscriminator: mintNftInstructionDiscriminator,
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
  ]

  if (accounts.nftTokenRecord != null) {
    keys.push({
      pubkey: accounts.nftTokenRecord,
      isWritable: true,
      isSigner: false,
    })
  }
  keys.push({
    pubkey: accounts.tokenAccount,
    isWritable: true,
    isSigner: false,
  })
  if (accounts.uniqueConstraint != null) {
    if (accounts.nftTokenRecord == null) {
      throw new Error(
        "When providing 'uniqueConstraint' then 'accounts.nftTokenRecord' need(s) to be provided as well."
      )
    }
    keys.push({
      pubkey: accounts.uniqueConstraint,
      isWritable: true,
      isSigner: false,
    })
  }
  keys.push({
    pubkey: accounts.authority,
    isWritable: true,
    isSigner: true,
  })
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
    pubkey: accounts.tokenProgram ?? splToken.TOKEN_PROGRAM_ID,
    isWritable: false,
    isSigner: false,
  })
  keys.push({
    pubkey: accounts.associatedTokenProgram,
    isWritable: false,
    isSigner: false,
  })
  keys.push({
    pubkey: accounts.sysvarInstructions,
    isWritable: false,
    isSigner: false,
  })
  keys.push({
    pubkey: accounts.tokenMetadataProgram,
    isWritable: false,
    isSigner: false,
  })
  keys.push({
    pubkey: accounts.rent ?? web3.SYSVAR_RENT_PUBKEY,
    isWritable: false,
    isSigner: false,
  })
  keys.push({
    pubkey: accounts.project,
    isWritable: false,
    isSigner: false,
  })
  if (accounts.delegateAuthority != null) {
    if (accounts.nftTokenRecord == null || accounts.uniqueConstraint == null) {
      throw new Error(
        "When providing 'delegateAuthority' then 'accounts.nftTokenRecord', 'accounts.uniqueConstraint' need(s) to be provided as well."
      )
    }
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
