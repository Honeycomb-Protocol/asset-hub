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
 * @category CreateHolderAccount
 * @category generated
 */
export const createHolderAccountStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'CreateHolderAccountInstructionArgs'
)
/**
 * Accounts required by the _createHolderAccount_ instruction
 *
 * @property [_writable_] project
 * @property [] currency
 * @property [] mint
 * @property [_writable_] holderAccount
 * @property [_writable_] tokenAccount
 * @property [] owner
 * @property [_writable_, **signer**] payer
 * @property [_writable_] vault
 * @property [] associatedTokenProgram
 * @property [] hplEvents
 * @property [] instructionsSysvar
 * @property [] clockSysvar
 * @category Instructions
 * @category CreateHolderAccount
 * @category generated
 */
export type CreateHolderAccountInstructionAccounts = {
  project: web3.PublicKey
  currency: web3.PublicKey
  mint: web3.PublicKey
  holderAccount: web3.PublicKey
  tokenAccount: web3.PublicKey
  owner: web3.PublicKey
  payer: web3.PublicKey
  vault: web3.PublicKey
  systemProgram?: web3.PublicKey
  tokenProgram?: web3.PublicKey
  associatedTokenProgram: web3.PublicKey
  hplEvents: web3.PublicKey
  instructionsSysvar: web3.PublicKey
  clockSysvar: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const createHolderAccountInstructionDiscriminator = [
  168, 146, 118, 187, 44, 53, 132, 228,
]

/**
 * Creates a _CreateHolderAccount_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category CreateHolderAccount
 * @category generated
 */
export function createCreateHolderAccountInstruction(
  accounts: CreateHolderAccountInstructionAccounts,
  programId = new web3.PublicKey('CrncyaGmZfWvpxRcpHEkSrqeeyQsdn4MAedo9KuARAc4')
) {
  const [data] = createHolderAccountStruct.serialize({
    instructionDiscriminator: createHolderAccountInstructionDiscriminator,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.project,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.currency,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.mint,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.holderAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.owner,
      isWritable: false,
      isSigner: false,
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
      pubkey: accounts.hplEvents,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.instructionsSysvar,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.clockSysvar,
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
