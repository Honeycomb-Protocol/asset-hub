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
 * @category TransferCurrency
 * @category generated
 */
export type TransferCurrencyInstructionArgs = {
  amount: beet.bignum
}
/**
 * @category Instructions
 * @category TransferCurrency
 * @category generated
 */
export const transferCurrencyStruct = new beet.BeetArgsStruct<
  TransferCurrencyInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['amount', beet.u64],
  ],
  'TransferCurrencyInstructionArgs'
)
/**
 * Accounts required by the _transferCurrency_ instruction
 *
 * @property [_writable_] project
 * @property [] currency
 * @property [] mint
 * @property [_writable_] senderHolderAccount
 * @property [_writable_] senderTokenAccount
 * @property [] receiverHolderAccount
 * @property [_writable_] receiverTokenAccount
 * @property [_writable_, **signer**] owner
 * @property [_writable_, **signer**] payer
 * @property [_writable_] vault
 * @property [] hiveControl
 * @property [] instructionsSysvar
 * @category Instructions
 * @category TransferCurrency
 * @category generated
 */
export type TransferCurrencyInstructionAccounts = {
  project: web3.PublicKey
  currency: web3.PublicKey
  mint: web3.PublicKey
  senderHolderAccount: web3.PublicKey
  senderTokenAccount: web3.PublicKey
  receiverHolderAccount: web3.PublicKey
  receiverTokenAccount: web3.PublicKey
  owner: web3.PublicKey
  payer: web3.PublicKey
  vault: web3.PublicKey
  systemProgram?: web3.PublicKey
  hiveControl: web3.PublicKey
  tokenProgram?: web3.PublicKey
  instructionsSysvar: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const transferCurrencyInstructionDiscriminator = [
  92, 114, 155, 228, 163, 45, 105, 228,
]

/**
 * Creates a _TransferCurrency_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category TransferCurrency
 * @category generated
 */
export function createTransferCurrencyInstruction(
  accounts: TransferCurrencyInstructionAccounts,
  args: TransferCurrencyInstructionArgs,
  programId = new web3.PublicKey('CrncyaGmZfWvpxRcpHEkSrqeeyQsdn4MAedo9KuARAc4')
) {
  const [data] = transferCurrencyStruct.serialize({
    instructionDiscriminator: transferCurrencyInstructionDiscriminator,
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
      pubkey: accounts.senderHolderAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.senderTokenAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.receiverHolderAccount,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.receiverTokenAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.owner,
      isWritable: true,
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
