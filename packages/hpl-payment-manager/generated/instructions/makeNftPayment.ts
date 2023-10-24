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
 * @category MakeNftPayment
 * @category generated
 */
export type MakeNftPaymentInstructionArgs = {
  args: MakePaymentArgs
}
/**
 * @category Instructions
 * @category MakeNftPayment
 * @category generated
 */
export const makeNftPaymentStruct = new beet.FixableBeetArgsStruct<
  MakeNftPaymentInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', makePaymentArgsBeet],
  ],
  'MakeNftPaymentInstructionArgs'
)
/**
 * Accounts required by the _makeNftPayment_ instruction
 *
 * @property [] paymentStructure
 * @property [_writable_] paymentSession
 * @property [_writable_] nftMint
 * @property [_writable_] nftAccount
 * @property [_writable_] nftMetadata
 * @property [_writable_] nftEdition (optional)
 * @property [_writable_] nftTokenRecord (optional)
 * @property [_writable_] depositAccount (optional)
 * @property [_writable_] depositTokenRecord (optional)
 * @property [] beneficiary (optional)
 * @property [_writable_, **signer**] payer
 * @property [] associatedTokenProgram
 * @property [] hplEvents
 * @property [] authorizationRulesProgram (optional)
 * @property [] authorizationRules (optional)
 * @property [] clockSysvar
 * @property [] instructionsSysvar
 * @category Instructions
 * @category MakeNftPayment
 * @category generated
 */
export type MakeNftPaymentInstructionAccounts = {
  paymentStructure: web3.PublicKey
  paymentSession: web3.PublicKey
  nftMint: web3.PublicKey
  nftAccount: web3.PublicKey
  nftMetadata: web3.PublicKey
  nftEdition?: web3.PublicKey
  nftTokenRecord?: web3.PublicKey
  depositAccount?: web3.PublicKey
  depositTokenRecord?: web3.PublicKey
  beneficiary?: web3.PublicKey
  payer: web3.PublicKey
  systemProgram?: web3.PublicKey
  tokenProgram?: web3.PublicKey
  associatedTokenProgram: web3.PublicKey
  hplEvents: web3.PublicKey
  authorizationRulesProgram?: web3.PublicKey
  authorizationRules?: web3.PublicKey
  clockSysvar: web3.PublicKey
  instructionsSysvar: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const makeNftPaymentInstructionDiscriminator = [
  184, 3, 132, 94, 240, 136, 38, 103,
]

/**
 * Creates a _MakeNftPayment_ instruction.
 *
 * Optional accounts that are not provided will be omitted from the accounts
 * array passed with the instruction.
 * An optional account that is set cannot follow an optional account that is unset.
 * Otherwise an Error is raised.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category MakeNftPayment
 * @category generated
 */
export function createMakeNftPaymentInstruction(
  accounts: MakeNftPaymentInstructionAccounts,
  args: MakeNftPaymentInstructionArgs,
  programId = new web3.PublicKey('Pay9ZxrVRXjt9Da8qpwqq4yBRvvrfx3STWnKK4FstPr')
) {
  const [data] = makeNftPaymentStruct.serialize({
    instructionDiscriminator: makeNftPaymentInstructionDiscriminator,
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
  ]

  if (accounts.nftEdition != null) {
    keys.push({
      pubkey: accounts.nftEdition,
      isWritable: true,
      isSigner: false,
    })
  }
  if (accounts.nftTokenRecord != null) {
    if (accounts.nftEdition == null) {
      throw new Error(
        "When providing 'nftTokenRecord' then 'accounts.nftEdition' need(s) to be provided as well."
      )
    }
    keys.push({
      pubkey: accounts.nftTokenRecord,
      isWritable: true,
      isSigner: false,
    })
  }
  if (accounts.depositAccount != null) {
    if (accounts.nftEdition == null || accounts.nftTokenRecord == null) {
      throw new Error(
        "When providing 'depositAccount' then 'accounts.nftEdition', 'accounts.nftTokenRecord' need(s) to be provided as well."
      )
    }
    keys.push({
      pubkey: accounts.depositAccount,
      isWritable: true,
      isSigner: false,
    })
  }
  if (accounts.depositTokenRecord != null) {
    if (
      accounts.nftEdition == null ||
      accounts.nftTokenRecord == null ||
      accounts.depositAccount == null
    ) {
      throw new Error(
        "When providing 'depositTokenRecord' then 'accounts.nftEdition', 'accounts.nftTokenRecord', 'accounts.depositAccount' need(s) to be provided as well."
      )
    }
    keys.push({
      pubkey: accounts.depositTokenRecord,
      isWritable: true,
      isSigner: false,
    })
  }
  if (accounts.beneficiary != null) {
    if (
      accounts.nftEdition == null ||
      accounts.nftTokenRecord == null ||
      accounts.depositAccount == null ||
      accounts.depositTokenRecord == null
    ) {
      throw new Error(
        "When providing 'beneficiary' then 'accounts.nftEdition', 'accounts.nftTokenRecord', 'accounts.depositAccount', 'accounts.depositTokenRecord' need(s) to be provided as well."
      )
    }
    keys.push({
      pubkey: accounts.beneficiary,
      isWritable: false,
      isSigner: false,
    })
  }
  keys.push({
    pubkey: accounts.payer,
    isWritable: true,
    isSigner: true,
  })
  keys.push({
    pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
    isWritable: false,
    isSigner: false,
  })
  keys.push({
    pubkey: accounts.tokenProgram ?? splToken.TOKEN_PROGRAM_ID,
    isWritable: false,
    isSigner: false,
  })
  keys.push({
    pubkey: accounts.associatedTokenProgram,
    isWritable: false,
    isSigner: false,
  })
  keys.push({
    pubkey: accounts.hplEvents,
    isWritable: false,
    isSigner: false,
  })
  if (accounts.authorizationRulesProgram != null) {
    if (
      accounts.nftEdition == null ||
      accounts.nftTokenRecord == null ||
      accounts.depositAccount == null ||
      accounts.depositTokenRecord == null ||
      accounts.beneficiary == null
    ) {
      throw new Error(
        "When providing 'authorizationRulesProgram' then 'accounts.nftEdition', 'accounts.nftTokenRecord', 'accounts.depositAccount', 'accounts.depositTokenRecord', 'accounts.beneficiary' need(s) to be provided as well."
      )
    }
    keys.push({
      pubkey: accounts.authorizationRulesProgram,
      isWritable: false,
      isSigner: false,
    })
  }
  if (accounts.authorizationRules != null) {
    if (
      accounts.nftEdition == null ||
      accounts.nftTokenRecord == null ||
      accounts.depositAccount == null ||
      accounts.depositTokenRecord == null ||
      accounts.beneficiary == null ||
      accounts.authorizationRulesProgram == null
    ) {
      throw new Error(
        "When providing 'authorizationRules' then 'accounts.nftEdition', 'accounts.nftTokenRecord', 'accounts.depositAccount', 'accounts.depositTokenRecord', 'accounts.beneficiary', 'accounts.authorizationRulesProgram' need(s) to be provided as well."
      )
    }
    keys.push({
      pubkey: accounts.authorizationRules,
      isWritable: false,
      isSigner: false,
    })
  }
  keys.push({
    pubkey: accounts.clockSysvar,
    isWritable: false,
    isSigner: false,
  })
  keys.push({
    pubkey: accounts.instructionsSysvar,
    isWritable: false,
    isSigner: false,
  })

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
