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
 * @property [] tokenMetadata
 * @property [] tokenEdition
 * @property [_writable_] depositAccount
 * @property [_writable_, **signer**] authority
 * @property [_writable_, **signer**] payer
 * @property [] tokenMetadataProgram
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
  tokenEdition: web3.PublicKey
  depositAccount: web3.PublicKey
  authority: web3.PublicKey
  payer: web3.PublicKey
  systemProgram?: web3.PublicKey
  tokenProgram?: web3.PublicKey
  tokenMetadataProgram: web3.PublicKey
  rent?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const addBlockInstructionDiscriminator = [
  208, 84, 156, 155, 72, 188, 114, 37,
]

/**
 * Creates a _AddBlock_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category AddBlock
 * @category generated
 */
export function createAddBlockInstruction(
  accounts: AddBlockInstructionAccounts,
  programId = new web3.PublicKey('4cEhZgkh41JbuXsXdcKhNaeHJ2BpzmXN3VpMQ3nFPDrp')
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
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenEdition,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.depositAccount,
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
      pubkey: accounts.tokenMetadataProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.rent ?? web3.SYSVAR_RENT_PUBKEY,
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
