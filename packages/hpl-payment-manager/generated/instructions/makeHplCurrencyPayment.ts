/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as splToken from '@solana/spl-token'
import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import { MakePaymentArgs, makePaymentArgsBeet } from '../types/MakePaymentArgs'

/**
 * @category Instructions
 * @category MakeHplCurrencyPayment
 * @category generated
 */
export type MakeHplCurrencyPaymentInstructionArgs = {
  args: MakePaymentArgs
}
/**
 * @category Instructions
 * @category MakeHplCurrencyPayment
 * @category generated
 */
export const makeHplCurrencyPaymentStruct = new beet.FixableBeetArgsStruct<
  MakeHplCurrencyPaymentInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', makePaymentArgsBeet],
  ],
  'MakeHplCurrencyPaymentInstructionArgs'
)
/**
 * Accounts required by the _makeHplCurrencyPayment_ instruction
 *
 * @property [] paymentStructure
 * @property [_writable_] paymentSession
 * @property [_writable_] project
 * @property [] currency
 * @property [_writable_] mint
 * @property [] holderAccount
 * @property [_writable_] tokenAccount
 * @property [] beneficiary (optional)
 * @property [] beneficiaryHolderAccount (optional)
 * @property [_writable_] beneficiaryTokenAccount (optional)
 * @property [_writable_] vault
 * @property [_writable_, **signer**] payer
 * @property [] hiveControl
 * @property [] hplCurrencyManager
 * @property [] clockSysvar
 * @property [] instructionsSysvar
 * @category Instructions
 * @category MakeHplCurrencyPayment
 * @category generated
 */
export type MakeHplCurrencyPaymentInstructionAccounts = {
  paymentStructure: web3.PublicKey
  paymentSession: web3.PublicKey
  project: web3.PublicKey
  currency: web3.PublicKey
  mint: web3.PublicKey
  holderAccount: web3.PublicKey
  tokenAccount: web3.PublicKey
  beneficiary?: web3.PublicKey
  beneficiaryHolderAccount?: web3.PublicKey
  beneficiaryTokenAccount?: web3.PublicKey
  vault: web3.PublicKey
  payer: web3.PublicKey
  systemProgram?: web3.PublicKey
  tokenProgram?: web3.PublicKey
  hiveControl: web3.PublicKey
  hplCurrencyManager: web3.PublicKey
  clockSysvar: web3.PublicKey
  instructionsSysvar: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const makeHplCurrencyPaymentInstructionDiscriminator = [
  77, 158, 128, 25, 57, 233, 135, 21,
]

/**
 * Creates a _MakeHplCurrencyPayment_ instruction.
 *
 * Optional accounts that are not provided default to the program ID since
 * this was indicated in the IDL from which this instruction was generated.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category MakeHplCurrencyPayment
 * @category generated
 */
export function createMakeHplCurrencyPaymentInstruction(
  accounts: MakeHplCurrencyPaymentInstructionAccounts,
  args: MakeHplCurrencyPaymentInstructionArgs,
  programId = new web3.PublicKey('Pay9ZxrVRXjt9Da8qpwqq4yBRvvrfx3STWnKK4FstPr')
) {
  const [data] = makeHplCurrencyPaymentStruct.serialize({
    instructionDiscriminator: makeHplCurrencyPaymentInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.paymentStructure,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.paymentSession,
      isWritable: true,
      isSigner: false,
    },
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
      pubkey: accounts.beneficiary ?? programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.beneficiaryHolderAccount ?? programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.beneficiaryTokenAccount ?? programId,
      isWritable: accounts.beneficiaryTokenAccount != null,
      isSigner: false,
    },
    {
      pubkey: accounts.vault,
      isWritable: true,
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
      pubkey: accounts.hiveControl,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.hplCurrencyManager,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.clockSysvar,
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
