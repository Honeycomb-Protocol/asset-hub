/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as splToken from '@solana/spl-token'
import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import {
  CreateCurrencyArgs,
  createCurrencyArgsBeet,
} from '../types/CreateCurrencyArgs'

/**
 * @category Instructions
 * @category CreateCurrency
 * @category generated
 */
export type CreateCurrencyInstructionArgs = {
  args: CreateCurrencyArgs
}
/**
 * @category Instructions
 * @category CreateCurrency
 * @category generated
 */
export const createCurrencyStruct = new beet.FixableBeetArgsStruct<
  CreateCurrencyInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', createCurrencyArgsBeet],
  ],
  'CreateCurrencyInstructionArgs'
)
/**
 * Accounts required by the _createCurrency_ instruction
 *
 * @property [] project
 * @property [_writable_] currency
 * @property [_writable_, **signer**] mint
 * @property [_writable_] metadata
 * @property [] delegateAuthority (optional)
 * @property [**signer**] authority
 * @property [_writable_, **signer**] payer
 * @property [_writable_] vault
 * @property [] hiveControl
 * @property [] tokenMetadataProgram
 * @property [] instructionsSysvar
 * @property [] clockSysvar
 * @category Instructions
 * @category CreateCurrency
 * @category generated
 */
export type CreateCurrencyInstructionAccounts = {
  project: web3.PublicKey
  currency: web3.PublicKey
  mint: web3.PublicKey
  metadata: web3.PublicKey
  delegateAuthority?: web3.PublicKey
  authority: web3.PublicKey
  payer: web3.PublicKey
  vault: web3.PublicKey
  systemProgram?: web3.PublicKey
  hiveControl: web3.PublicKey
  tokenMetadataProgram: web3.PublicKey
  tokenProgram?: web3.PublicKey
  instructionsSysvar: web3.PublicKey
  clockSysvar: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const createCurrencyInstructionDiscriminator = [
  148, 249, 90, 34, 172, 92, 48, 196,
]

/**
 * Creates a _CreateCurrency_ instruction.
 *
 * Optional accounts that are not provided default to the program ID since
 * this was indicated in the IDL from which this instruction was generated.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category CreateCurrency
 * @category generated
 */
export function createCreateCurrencyInstruction(
  accounts: CreateCurrencyInstructionAccounts,
  args: CreateCurrencyInstructionArgs,
  programId = new web3.PublicKey('Eo29f5874SZDf827Fyr9HThcsF5GWkDCH9UyYsPwqXER')
) {
  const [data] = createCurrencyStruct.serialize({
    instructionDiscriminator: createCurrencyInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.project,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.currency,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.mint,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.metadata,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.delegateAuthority ?? programId,
      isWritable: false,
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
      pubkey: accounts.tokenMetadataProgram,
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
