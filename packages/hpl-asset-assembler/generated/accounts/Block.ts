/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beet from '@metaplex-foundation/beet'
import * as beetSolana from '@metaplex-foundation/beet-solana'
import { BlockType, blockTypeBeet } from '../types/BlockType'

/**
 * Arguments used to create {@link Block}
 * @category Accounts
 * @category generated
 */
export type BlockArgs = {
  bump: number
  assembler: web3.PublicKey
  blockOrder: number
  isGraphical: boolean
  blockType: BlockType
  blockName: string
  blockDefinationCounts: number
}

export const blockDiscriminator = [12, 72, 207, 108, 1, 228, 167, 221]
/**
 * Holds the data for the {@link Block} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class Block implements BlockArgs {
  private constructor(
    readonly bump: number,
    readonly assembler: web3.PublicKey,
    readonly blockOrder: number,
    readonly isGraphical: boolean,
    readonly blockType: BlockType,
    readonly blockName: string,
    readonly blockDefinationCounts: number
  ) {}

  /**
   * Creates a {@link Block} instance from the provided args.
   */
  static fromArgs(args: BlockArgs) {
    return new Block(
      args.bump,
      args.assembler,
      args.blockOrder,
      args.isGraphical,
      args.blockType,
      args.blockName,
      args.blockDefinationCounts
    )
  }

  /**
   * Deserializes the {@link Block} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0
  ): [Block, number] {
    return Block.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link Block} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig
  ): Promise<Block> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig
    )
    if (accountInfo == null) {
      throw new Error(`Unable to find Block account at ${address}`)
    }
    return Block.fromAccountInfo(accountInfo, 0)[0]
  }

  /**
   * Provides a {@link web3.Connection.getProgramAccounts} config builder,
   * to fetch accounts matching filters that can be specified via that builder.
   *
   * @param programId - the program that owns the accounts we are filtering
   */
  static gpaBuilder(
    programId: web3.PublicKey = new web3.PublicKey(
      'Gq1333CkB2sGernk72TKfDVLnHj9LjmeijFujM2ULxJz'
    )
  ) {
    return beetSolana.GpaBuilder.fromStruct(programId, blockBeet)
  }

  /**
   * Deserializes the {@link Block} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [Block, number] {
    return blockBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link Block} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return blockBeet.serialize({
      accountDiscriminator: blockDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link Block} for the provided args.
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   */
  static byteSize(args: BlockArgs) {
    const instance = Block.fromArgs(args)
    return blockBeet.toFixedFromValue({
      accountDiscriminator: blockDiscriminator,
      ...instance,
    }).byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link Block} data from rent
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    args: BlockArgs,
    connection: web3.Connection,
    commitment?: web3.Commitment
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      Block.byteSize(args),
      commitment
    )
  }

  /**
   * Returns a readable version of {@link Block} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      bump: this.bump,
      assembler: this.assembler.toBase58(),
      blockOrder: this.blockOrder,
      isGraphical: this.isGraphical,
      blockType: 'BlockType.' + BlockType[this.blockType],
      blockName: this.blockName,
      blockDefinationCounts: this.blockDefinationCounts,
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const blockBeet = new beet.FixableBeetStruct<
  Block,
  BlockArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
    ['assembler', beetSolana.publicKey],
    ['blockOrder', beet.u8],
    ['isGraphical', beet.bool],
    ['blockType', blockTypeBeet],
    ['blockName', beet.utf8String],
    ['blockDefinationCounts', beet.u16],
  ],
  Block.fromArgs,
  'Block'
)
