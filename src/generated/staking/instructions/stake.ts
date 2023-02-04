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
 * @category Stake
 * @category generated
 */
export const stakeStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'StakeInstructionArgs'
)
/**
 * Accounts required by the _stake_ instruction
 *
 * @property [] project
 * @property [_writable_] nft
 * @property [_writable_] nftMint
 * @property [_writable_] nftAccount
 * @property [_writable_] nftMetadata
 * @property [] nftEdition
 * @property [_writable_, **signer**] wallet
 * @property [] tokenMetadataProgram
 * @property [] clock
 * @property [] sysvarInstructions
 * @category Instructions
 * @category Stake
 * @category generated
 */
export type StakeInstructionAccounts = {
  project: web3.PublicKey
  nft: web3.PublicKey
  nftMint: web3.PublicKey
  nftAccount: web3.PublicKey
  nftMetadata: web3.PublicKey
  nftEdition: web3.PublicKey
  wallet: web3.PublicKey
  systemProgram?: web3.PublicKey
  tokenProgram?: web3.PublicKey
  tokenMetadataProgram: web3.PublicKey
  clock: web3.PublicKey
  sysvarInstructions: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const stakeInstructionDiscriminator = [
  206, 176, 202, 18, 200, 209, 179, 108,
]

/**
 * Creates a _Stake_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category Stake
 * @category generated
 */
export function createStakeInstruction(
  accounts: StakeInstructionAccounts,
  programId = new web3.PublicKey('8pyniLLXEHVUJKX2h5E9DrvwTsRmSR64ucUYBg8jQgPP')
) {
  const [data] = stakeStruct.serialize({
    instructionDiscriminator: stakeInstructionDiscriminator,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.project,
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
      pubkey: accounts.nftAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.nftMetadata,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.nftEdition,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.wallet,
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
      pubkey: accounts.clock,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.sysvarInstructions,
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
