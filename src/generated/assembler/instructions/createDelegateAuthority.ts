/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import {
  CreateDelegateAuthorityArgs,
  createDelegateAuthorityArgsBeet,
} from '../types/CreateDelegateAuthorityArgs'

/**
 * @category Instructions
 * @category CreateDelegateAuthority
 * @category generated
 */
export type CreateDelegateAuthorityInstructionArgs = {
  args: CreateDelegateAuthorityArgs
}
/**
 * @category Instructions
 * @category CreateDelegateAuthority
 * @category generated
 */
export const createDelegateAuthorityStruct = new beet.BeetArgsStruct<
  CreateDelegateAuthorityInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', createDelegateAuthorityArgsBeet],
  ],
  'CreateDelegateAuthorityInstructionArgs'
)
/**
 * Accounts required by the _createDelegateAuthority_ instruction
 *
 * @property [_writable_] assembler
 * @property [_writable_] delegateAuthority
 * @property [] delegate
 * @property [**signer**] authority
 * @property [_writable_, **signer**] payer
 * @category Instructions
 * @category CreateDelegateAuthority
 * @category generated
 */
export type CreateDelegateAuthorityInstructionAccounts = {
  assembler: web3.PublicKey
  delegateAuthority: web3.PublicKey
  delegate: web3.PublicKey
  authority: web3.PublicKey
  payer: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const createDelegateAuthorityInstructionDiscriminator = [
  232, 124, 221, 107, 188, 245, 74, 127,
]

/**
 * Creates a _CreateDelegateAuthority_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category CreateDelegateAuthority
 * @category generated
 */
export function createCreateDelegateAuthorityInstruction(
  accounts: CreateDelegateAuthorityInstructionAccounts,
  args: CreateDelegateAuthorityInstructionArgs,
  programId = new web3.PublicKey('4cEhZgkh41JbuXsXdcKhNaeHJ2BpzmXN3VpMQ3nFPDrp')
) {
  const [data] = createDelegateAuthorityStruct.serialize({
    instructionDiscriminator: createDelegateAuthorityInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.assembler,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.delegateAuthority,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.delegate,
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
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
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