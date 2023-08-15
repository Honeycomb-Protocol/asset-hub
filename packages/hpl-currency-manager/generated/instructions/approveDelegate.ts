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
 * @category ApproveDelegate
 * @category generated
 */
export type ApproveDelegateInstructionArgs = {
  amount: beet.bignum
}
/**
 * @category Instructions
 * @category ApproveDelegate
 * @category generated
 */
export const approveDelegateStruct = new beet.BeetArgsStruct<
  ApproveDelegateInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['amount', beet.u64],
  ],
  'ApproveDelegateInstructionArgs'
)
/**
 * Accounts required by the _approveDelegate_ instruction
 *
 * @property [_writable_] project
 * @property [] currency
 * @property [] mint
 * @property [] holderAccount
 * @property [_writable_] tokenAccount
 * @property [] delegate
 * @property [**signer**] owner
 * @property [_writable_, **signer**] payer
 * @property [_writable_] vault
 * @property [] instructionsSysvar
 * @category Instructions
 * @category ApproveDelegate
 * @category generated
 */
export type ApproveDelegateInstructionAccounts = {
  project: web3.PublicKey
  currency: web3.PublicKey
  mint: web3.PublicKey
  holderAccount: web3.PublicKey
  tokenAccount: web3.PublicKey
  delegate: web3.PublicKey
  owner: web3.PublicKey
  payer: web3.PublicKey
  vault: web3.PublicKey
  systemProgram?: web3.PublicKey
  tokenProgram?: web3.PublicKey
  instructionsSysvar: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const approveDelegateInstructionDiscriminator = [
  68, 6, 248, 64, 195, 222, 182, 223,
]

/**
 * Creates a _ApproveDelegate_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category ApproveDelegate
 * @category generated
 */
export function createApproveDelegateInstruction(
  accounts: ApproveDelegateInstructionAccounts,
  args: ApproveDelegateInstructionArgs,
  programId = new web3.PublicKey('CrNcYmnu2nvH5fp4pspk2rLQ9h6N3XrJvZMzEhnpbJux')
) {
  const [data] = approveDelegateStruct.serialize({
    instructionDiscriminator: approveDelegateInstructionDiscriminator,
    ...args,
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
      pubkey: accounts.delegate,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.owner,
      isWritable: false,
      isSigner: true,
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
