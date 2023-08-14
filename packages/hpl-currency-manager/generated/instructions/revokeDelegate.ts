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
 * @category RevokeDelegate
 * @category generated
 */
export const revokeDelegateStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'RevokeDelegateInstructionArgs'
)
/**
 * Accounts required by the _revokeDelegate_ instruction
 *
 * @property [_writable_] project
 * @property [] currency
 * @property [] mint
 * @property [] holderAccount
 * @property [_writable_] tokenAccount
 * @property [**signer**] authority
 * @property [**signer**] payer
 * @property [_writable_] vault
 * @property [] instructionsSysvar
 * @category Instructions
 * @category RevokeDelegate
 * @category generated
 */
export type RevokeDelegateInstructionAccounts = {
  project: web3.PublicKey
  currency: web3.PublicKey
  mint: web3.PublicKey
  holderAccount: web3.PublicKey
  tokenAccount: web3.PublicKey
  authority: web3.PublicKey
  payer: web3.PublicKey
  vault: web3.PublicKey
  systemProgram?: web3.PublicKey
  tokenProgram?: web3.PublicKey
  instructionsSysvar: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const revokeDelegateInstructionDiscriminator = [
  142, 66, 98, 126, 102, 60, 92, 163,
]

/**
 * Creates a _RevokeDelegate_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category RevokeDelegate
 * @category generated
 */
export function createRevokeDelegateInstruction(
  accounts: RevokeDelegateInstructionAccounts,
  programId = new web3.PublicKey('CrNcYmnu2nvH5fp4pspk2rLQ9h6N3XrJvZMzEhnpbJux')
) {
  const [data] = revokeDelegateStruct.serialize({
    instructionDiscriminator: revokeDelegateInstructionDiscriminator,
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
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenAccount,
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
