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
 * @category AddBlock
 * @category generated
 */
export const addBlockStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'AddBlockInstructionArgs'
)
/**
 * Accounts required by the _addBlock_ instruction
 *
 * @property [] assembler
 * @property [_writable_] nft
 * @property [] block
 * @property [] blockDefinition
 * @property [_writable_] tokenMint
 * @property [_writable_] tokenAccount
 * @property [_writable_] tokenMetadata
 * @property [] tokenEdition (optional)
 * @property [_writable_] tokenRecord (optional)
 * @property [_writable_] depositAccount (optional)
 * @property [_writable_] depositTokenRecord (optional)
 * @property [_writable_, **signer**] authority
 * @property [_writable_, **signer**] payer
 * @property [] associatedTokenProgram
 * @property [] tokenMetadataProgram
 * @property [] instructionsSysvar
 * @property [] project
 * @property [] delegateAuthority (optional)
 * @property [_writable_] vault
 * @category Instructions
 * @category AddBlock
 * @category generated
 */
export type AddBlockInstructionAccounts = {
  assembler: web3.PublicKey
  nft: web3.PublicKey
  block: web3.PublicKey
  blockDefinition: web3.PublicKey
  tokenMint: web3.PublicKey
  tokenAccount: web3.PublicKey
  tokenMetadata: web3.PublicKey
  tokenEdition?: web3.PublicKey
  tokenRecord?: web3.PublicKey
  depositAccount?: web3.PublicKey
  depositTokenRecord?: web3.PublicKey
  authority: web3.PublicKey
  payer: web3.PublicKey
  systemProgram?: web3.PublicKey
  tokenProgram?: web3.PublicKey
  associatedTokenProgram: web3.PublicKey
  tokenMetadataProgram: web3.PublicKey
  instructionsSysvar: web3.PublicKey
  rent?: web3.PublicKey
  project: web3.PublicKey
  delegateAuthority?: web3.PublicKey
  vault: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const addBlockInstructionDiscriminator = [
  208, 84, 156, 155, 72, 188, 114, 37,
]

/**
 * Creates a _AddBlock_ instruction.
 *
 * Optional accounts that are not provided will be omitted from the accounts
 * array passed with the instruction.
 * An optional account that is set cannot follow an optional account that is unset.
 * Otherwise an Error is raised.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category AddBlock
 * @category generated
 */
export function createAddBlockInstruction(
  accounts: AddBlockInstructionAccounts,
  programId = new web3.PublicKey('Gq1333CkB2sGernk72TKfDVLnHj9LjmeijFujM2ULxJz')
) {
  const [data] = addBlockStruct.serialize({
    instructionDiscriminator: addBlockInstructionDiscriminator,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.assembler,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.nft,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.block,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.blockDefinition,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenMint,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenMetadata,
      isWritable: true,
      isSigner: false,
    },
  ]

  if (accounts.tokenEdition != null) {
    keys.push({
      pubkey: accounts.tokenEdition,
      isWritable: false,
      isSigner: false,
    })
  }
  if (accounts.tokenRecord != null) {
    if (accounts.tokenEdition == null) {
      throw new Error(
        "When providing 'tokenRecord' then 'accounts.tokenEdition' need(s) to be provided as well."
      )
    }
    keys.push({
      pubkey: accounts.tokenRecord,
      isWritable: true,
      isSigner: false,
    })
  }
  if (accounts.depositAccount != null) {
    if (accounts.tokenEdition == null || accounts.tokenRecord == null) {
      throw new Error(
        "When providing 'depositAccount' then 'accounts.tokenEdition', 'accounts.tokenRecord' need(s) to be provided as well."
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
      accounts.tokenEdition == null ||
      accounts.tokenRecord == null ||
      accounts.depositAccount == null
    ) {
      throw new Error(
        "When providing 'depositTokenRecord' then 'accounts.tokenEdition', 'accounts.tokenRecord', 'accounts.depositAccount' need(s) to be provided as well."
      )
    }
    keys.push({
      pubkey: accounts.depositTokenRecord,
      isWritable: true,
      isSigner: false,
    })
  }
  keys.push({
    pubkey: accounts.authority,
    isWritable: true,
    isSigner: true,
  })
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
    pubkey: accounts.tokenMetadataProgram,
    isWritable: false,
    isSigner: false,
  })
  keys.push({
    pubkey: accounts.instructionsSysvar,
    isWritable: false,
    isSigner: false,
  })
  keys.push({
    pubkey: accounts.rent ?? web3.SYSVAR_RENT_PUBKEY,
    isWritable: false,
    isSigner: false,
  })
  keys.push({
    pubkey: accounts.project,
    isWritable: false,
    isSigner: false,
  })
  if (accounts.delegateAuthority != null) {
    if (
      accounts.tokenEdition == null ||
      accounts.tokenRecord == null ||
      accounts.depositAccount == null ||
      accounts.depositTokenRecord == null
    ) {
      throw new Error(
        "When providing 'delegateAuthority' then 'accounts.tokenEdition', 'accounts.tokenRecord', 'accounts.depositAccount', 'accounts.depositTokenRecord' need(s) to be provided as well."
      )
    }
    keys.push({
      pubkey: accounts.delegateAuthority,
      isWritable: false,
      isSigner: false,
    })
  }
  keys.push({
    pubkey: accounts.vault,
    isWritable: true,
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
