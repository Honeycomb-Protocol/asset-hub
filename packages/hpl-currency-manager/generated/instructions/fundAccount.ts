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
 * @category FundAccount
 * @category generated
 */
export type FundAccountInstructionArgs = {
  amount: beet.bignum
}
/**
 * @category Instructions
 * @category FundAccount
 * @category generated
 */
export const fundAccountStruct = new beet.BeetArgsStruct<
  FundAccountInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['amount', beet.u64],
  ],
  'FundAccountInstructionArgs'
)
/**
 * Accounts required by the _fundAccount_ instruction
 *
 * @property [_writable_] project
 * @property [] currency
 * @property [_writable_] mint
 * @property [] holderAccount
 * @property [_writable_] tokenAccount
 * @property [_writable_] sourceTokenAccount
 * @property [_writable_, **signer**] owner
 * @property [_writable_, **signer**] payer
 * @property [_writable_] vault
 * @property [] hiveControl
 * @property [] instructionsSysvar
 * @category Instructions
 * @category FundAccount
 * @category generated
 */
export type FundAccountInstructionAccounts = {
  project: web3.PublicKey
  currency: web3.PublicKey
  mint: web3.PublicKey
  holderAccount: web3.PublicKey
  tokenAccount: web3.PublicKey
  sourceTokenAccount: web3.PublicKey
  owner: web3.PublicKey
  payer: web3.PublicKey
  vault: web3.PublicKey
  systemProgram?: web3.PublicKey
  hiveControl: web3.PublicKey
  tokenProgram?: web3.PublicKey
  instructionsSysvar: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const fundAccountInstructionDiscriminator = [
  27, 104, 10, 49, 192, 219, 192, 224,
]

/**
 * Creates a _FundAccount_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category FundAccount
 * @category generated
 */
export function createFundAccountInstruction(
  accounts: FundAccountInstructionAccounts,
  args: FundAccountInstructionArgs,
  programId = new web3.PublicKey('Eo29f5874SZDf827Fyr9HThcsF5GWkDCH9UyYsPwqXER')
) {
  const [data] = fundAccountStruct.serialize({
    instructionDiscriminator: fundAccountInstructionDiscriminator,
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
      isWritable: true,
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
      pubkey: accounts.sourceTokenAccount,
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
