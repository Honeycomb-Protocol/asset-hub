/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beet from '@metaplex-foundation/beet'
import * as beetSolana from '@metaplex-foundation/beet-solana'
import {
  BlockDefinitionValue,
  blockDefinitionValueBeet,
} from '../types/BlockDefinitionValue'

/**
 * Arguments used to create {@link BlockDefinition}
 * @category Accounts
 * @category generated
 */
export type BlockDefinitionArgs = {
  bump: number
  block: web3.PublicKey
  mint: web3.PublicKey
  value: BlockDefinitionValue
  definationIndex: number
}

export const blockDefinitionDiscriminator = [107, 76, 146, 41, 130, 62, 5, 143]
/**
 * Holds the data for the {@link BlockDefinition} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class BlockDefinition implements BlockDefinitionArgs {
  private constructor(
    readonly bump: number,
    readonly block: web3.PublicKey,
    readonly mint: web3.PublicKey,
    readonly value: BlockDefinitionValue,
    readonly definationIndex: number
  ) {}

  /**
   * Creates a {@link BlockDefinition} instance from the provided args.
   */
  static fromArgs(args: BlockDefinitionArgs) {
    return new BlockDefinition(
      args.bump,
      args.block,
      args.mint,
      args.value,
      args.definationIndex
    )
  }

  /**
   * Deserializes the {@link BlockDefinition} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0
  ): [BlockDefinition, number] {
    return BlockDefinition.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link BlockDefinition} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig
  ): Promise<BlockDefinition> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig
    )
    if (accountInfo == null) {
      throw new Error(`Unable to find BlockDefinition account at ${address}`)
    }
    return BlockDefinition.fromAccountInfo(accountInfo, 0)[0]
  }

  /**
   * Provides a {@link web3.Connection.getProgramAccounts} config builder,
   * to fetch accounts matching filters that can be specified via that builder.
   *
   * @param programId - the program that owns the accounts we are filtering
   */
  static gpaBuilder(
    programId: web3.PublicKey = new web3.PublicKey(
      '4cEhZgkh41JbuXsXdcKhNaeHJ2BpzmXN3VpMQ3nFPDrp'
    )
  ) {
    return beetSolana.GpaBuilder.fromStruct(programId, blockDefinitionBeet)
  }

  /**
   * Deserializes the {@link BlockDefinition} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [BlockDefinition, number] {
    return blockDefinitionBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link BlockDefinition} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return blockDefinitionBeet.serialize({
      accountDiscriminator: blockDefinitionDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link BlockDefinition} for the provided args.
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   */
  static byteSize(args: BlockDefinitionArgs) {
    const instance = BlockDefinition.fromArgs(args)
    return blockDefinitionBeet.toFixedFromValue({
      accountDiscriminator: blockDefinitionDiscriminator,
      ...instance,
    }).byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link BlockDefinition} data from rent
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    args: BlockDefinitionArgs,
    connection: web3.Connection,
    commitment?: web3.Commitment
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      BlockDefinition.byteSize(args),
      commitment
    )
  }

  /**
   * Returns a readable version of {@link BlockDefinition} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      bump: this.bump,
      block: this.block.toBase58(),
      mint: this.mint.toBase58(),
      value: this.value.__kind,
      definationIndex: this.definationIndex,
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const blockDefinitionBeet = new beet.FixableBeetStruct<
  BlockDefinition,
  BlockDefinitionArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
    ['block', beetSolana.publicKey],
    ['mint', beetSolana.publicKey],
    ['value', blockDefinitionValueBeet],
    ['definationIndex', beet.u16],
  ],
  BlockDefinition.fromArgs,
  'BlockDefinition'
)
