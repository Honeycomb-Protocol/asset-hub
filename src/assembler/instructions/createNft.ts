/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as splToken from '@solana/spl-token'
import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import { CreateNFTArgs, createNFTArgsBeet } from '../types/CreateNFTArgs'

/**
 * @category Instructions
 * @category CreateNft
 * @category generated
 */
export type CreateNftInstructionArgs = {
  args: CreateNFTArgs
}
/**
 * @category Instructions
 * @category CreateNft
 * @category generated
 */
export const createNftStruct = new beet.FixableBeetArgsStruct<
  CreateNftInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', createNFTArgsBeet],
  ],
  'CreateNftInstructionArgs'
)
/**
 * Accounts required by the _createNft_ instruction
 *
 * @property [_writable_] assembler
 * @property [_writable_] collectionMint
 * @property [_writable_] collectionMetadataAccount
 * @property [_writable_] collectionMasterEdition
 * @property [_writable_, **signer**] nftMint
 * @property [_writable_] nftMetadata
 * @property [_writable_] nft
 * @property [] authority
 * @property [_writable_, **signer**] payer
 * @property [] tokenMetadataProgram
 * @category Instructions
 * @category CreateNft
 * @category generated
 */
export type CreateNftInstructionAccounts = {
  assembler: web3.PublicKey
  collectionMint: web3.PublicKey
  collectionMetadataAccount: web3.PublicKey
  collectionMasterEdition: web3.PublicKey
  nftMint: web3.PublicKey
  nftMetadata: web3.PublicKey
  nft: web3.PublicKey
  authority: web3.PublicKey
  payer: web3.PublicKey
  systemProgram?: web3.PublicKey
  tokenProgram?: web3.PublicKey
  tokenMetadataProgram: web3.PublicKey
  rent?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const createNftInstructionDiscriminator = [
  231, 119, 61, 97, 217, 46, 142, 109,
]

/**
 * Creates a _CreateNft_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category CreateNft
 * @category generated
 */
export function createCreateNftInstruction(
  accounts: CreateNftInstructionAccounts,
  args: CreateNftInstructionArgs,
  programId = new web3.PublicKey('AXX2agYcoDwGFsgEWvSitqfGH4ooKXUqK5P7Ch9raDJT')
) {
  const [data] = createNftStruct.serialize({
    instructionDiscriminator: createNftInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.assembler,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.collectionMint,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.collectionMetadataAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.collectionMasterEdition,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.nftMint,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.nftMetadata,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.nft,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.authority,
      isWritable: false,
      isSigner: false,
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
      pubkey: accounts.rent ?? web3.SYSVAR_RENT_PUBKEY,
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
