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
 * @category DepositNft
 * @category generated
 */
export const depositNftStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'DepositNftInstructionArgs'
)
/**
 * Accounts required by the _depositNft_ instruction
 *
 * @property [] project
 * @property [] characterModel
 * @property [_writable_] assetCustody
 * @property [_writable_] nftMint
 * @property [_writable_] nftAccount
 * @property [_writable_] nftMetadata
 * @property [_writable_] nftEdition
 * @property [_writable_] nftTokenRecord (optional)
 * @property [_writable_, **signer**] wallet
 * @property [_writable_] vault
 * @property [] hiveControl
 * @property [] associatedTokenProgram
 * @property [] tokenMetadataProgram
 * @property [] authorizationRulesProgram (optional)
 * @property [] authorizationRules (optional)
 * @property [] clock
 * @property [] instructionsSysvar
 * @category Instructions
 * @category DepositNft
 * @category generated
 */
export type DepositNftInstructionAccounts = {
  project: web3.PublicKey
  characterModel: web3.PublicKey
  assetCustody: web3.PublicKey
  nftMint: web3.PublicKey
  nftAccount: web3.PublicKey
  nftMetadata: web3.PublicKey
  nftEdition: web3.PublicKey
  nftTokenRecord?: web3.PublicKey
  wallet: web3.PublicKey
  vault: web3.PublicKey
  systemProgram?: web3.PublicKey
  hiveControl: web3.PublicKey
  tokenProgram?: web3.PublicKey
  associatedTokenProgram: web3.PublicKey
  tokenMetadataProgram: web3.PublicKey
  authorizationRulesProgram?: web3.PublicKey
  authorizationRules?: web3.PublicKey
  clock: web3.PublicKey
  instructionsSysvar: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const depositNftInstructionDiscriminator = [
  93, 226, 132, 166, 141, 9, 48, 101,
]

/**
 * Creates a _DepositNft_ instruction.
 *
 * Optional accounts that are not provided default to the program ID since
 * this was indicated in the IDL from which this instruction was generated.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category DepositNft
 * @category generated
 */
export function createDepositNftInstruction(
  accounts: DepositNftInstructionAccounts,
  programId = new web3.PublicKey('4AZpzJtYZCu9yWrnK1D5W23VXHLgN1GPkL8h8CfaGBTW')
) {
  const [data] = depositNftStruct.serialize({
    instructionDiscriminator: depositNftInstructionDiscriminator,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.project,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.characterModel,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.assetCustody,
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
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.nftTokenRecord ?? programId,
      isWritable: accounts.nftTokenRecord != null,
      isSigner: false,
    },
    {
      pubkey: accounts.wallet,
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
      pubkey: accounts.tokenProgram ?? splToken.TOKEN_PROGRAM_ID,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.associatedTokenProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenMetadataProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.authorizationRulesProgram ?? programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.authorizationRules ?? programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.clock,
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
