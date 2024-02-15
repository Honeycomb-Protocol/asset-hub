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
  InitilizeRecipieArgs,
  initilizeRecipieArgsBeet,
} from '../types/InitilizeRecipieArgs'

/**
 * @category Instructions
 * @category InitilizeRecipe
 * @category generated
 */
export type InitilizeRecipeInstructionArgs = {
  args: InitilizeRecipieArgs
}
/**
 * @category Instructions
 * @category InitilizeRecipe
 * @category generated
 */
export const initilizeRecipeStruct = new beet.FixableBeetArgsStruct<
  InitilizeRecipeInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', initilizeRecipieArgsBeet],
  ],
  'InitilizeRecipeInstructionArgs'
)
/**
 * Accounts required by the _initilizeRecipe_ instruction
 *
 * @property [] project
 * @property [] key
 * @property [_writable_] recipe
 * @property [_writable_, **signer**] authority
 * @property [_writable_, **signer**] payer
 * @property [] rentSysvar
 * @property [_writable_] outputResource
 * @property [] inputResourceOne
 * @property [] inputResourceTwo (optional)
 * @property [] inputResourceThree (optional)
 * @property [] inputResourceFour (optional)
 * @category Instructions
 * @category InitilizeRecipe
 * @category generated
 */
export type InitilizeRecipeInstructionAccounts = {
  project: web3.PublicKey
  key: web3.PublicKey
  recipe: web3.PublicKey
  authority: web3.PublicKey
  payer: web3.PublicKey
  rentSysvar: web3.PublicKey
  systemProgram?: web3.PublicKey
  tokenProgram?: web3.PublicKey
  outputResource: web3.PublicKey
  inputResourceOne: web3.PublicKey
  inputResourceTwo?: web3.PublicKey
  inputResourceThree?: web3.PublicKey
  inputResourceFour?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const initilizeRecipeInstructionDiscriminator = [
  19, 35, 51, 41, 55, 104, 180, 163,
]

/**
 * Creates a _InitilizeRecipe_ instruction.
 *
 * Optional accounts that are not provided default to the program ID since
 * this was indicated in the IDL from which this instruction was generated.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category InitilizeRecipe
 * @category generated
 */
export function createInitilizeRecipeInstruction(
  accounts: InitilizeRecipeInstructionAccounts,
  args: InitilizeRecipeInstructionArgs,
  programId = new web3.PublicKey('6ARwjKsMY2P3eLEWhdoU5czNezw3Qg6jEfbmLTVQqrPQ')
) {
  const [data] = initilizeRecipeStruct.serialize({
    instructionDiscriminator: initilizeRecipeInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.project,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.key,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.recipe,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.authority,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.payer,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.rentSysvar,
      isWritable: false,
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
      pubkey: accounts.outputResource,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.inputResourceOne,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.inputResourceTwo ?? programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.inputResourceThree ?? programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.inputResourceFour ?? programId,
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
