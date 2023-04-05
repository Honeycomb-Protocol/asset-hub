/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'

/**
 * @category Instructions
 * @category CreateAssetManager
 * @category generated
 */
export const createAssetManagerStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'CreateAssetManagerInstructionArgs'
)
/**
 * Accounts required by the _createAssetManager_ instruction
 *
 * @property [_writable_] assetManager
 * @property [**signer**] authority
 * @property [_writable_, **signer**] payer
 * @property [_writable_] project
 * @property [] delegateAuthority
 * @property [_writable_] vault
 * @property [] rentSysvar
 * @property [] hiveControl
 * @category Instructions
 * @category CreateAssetManager
 * @category generated
 */
export type CreateAssetManagerInstructionAccounts = {
  assetManager: web3.PublicKey
  authority: web3.PublicKey
  payer: web3.PublicKey
  project: web3.PublicKey
  delegateAuthority: web3.PublicKey
  vault: web3.PublicKey
  systemProgram?: web3.PublicKey
  rentSysvar: web3.PublicKey
  hiveControl: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const createAssetManagerInstructionDiscriminator = [
  30, 237, 255, 50, 68, 210, 20, 30,
]

/**
 * Creates a _CreateAssetManager_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category CreateAssetManager
 * @category generated
 */
export function createCreateAssetManagerInstruction(
  accounts: CreateAssetManagerInstructionAccounts,
  programId = new web3.PublicKey('7cJdKSjPtZqiGV4CFAGtbhhpf5CsYjbkbEkLKcXfHLYd')
) {
  const [data] = createAssetManagerStruct.serialize({
    instructionDiscriminator: createAssetManagerInstructionDiscriminator,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.assetManager,
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
      pubkey: accounts.project,
      isWritable: true,
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
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.rentSysvar,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.hiveControl,
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