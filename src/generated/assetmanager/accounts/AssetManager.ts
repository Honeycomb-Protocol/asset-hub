/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beet from '@metaplex-foundation/beet'
import * as beetSolana from '@metaplex-foundation/beet-solana'

/**
 * Arguments used to create {@link AssetManager}
 * @category Accounts
 * @category generated
 */
export type AssetManagerArgs = {
  bump: number
  key: web3.PublicKey
  authority: web3.PublicKey
  treasury: web3.PublicKey
  name: string
}

export const assetManagerDiscriminator = [136, 86, 167, 98, 220, 48, 54, 97]
/**
 * Holds the data for the {@link AssetManager} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class AssetManager implements AssetManagerArgs {
  private constructor(
    readonly bump: number,
    readonly key: web3.PublicKey,
    readonly authority: web3.PublicKey,
    readonly treasury: web3.PublicKey,
    readonly name: string
  ) {}

  /**
   * Creates a {@link AssetManager} instance from the provided args.
   */
  static fromArgs(args: AssetManagerArgs) {
    return new AssetManager(
      args.bump,
      args.key,
      args.authority,
      args.treasury,
      args.name
    )
  }

  /**
   * Deserializes the {@link AssetManager} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0
  ): [AssetManager, number] {
    return AssetManager.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link AssetManager} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig
  ): Promise<AssetManager> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig
    )
    if (accountInfo == null) {
      throw new Error(`Unable to find AssetManager account at ${address}`)
    }
    return AssetManager.fromAccountInfo(accountInfo, 0)[0]
  }

  /**
   * Provides a {@link web3.Connection.getProgramAccounts} config builder,
   * to fetch accounts matching filters that can be specified via that builder.
   *
   * @param programId - the program that owns the accounts we are filtering
   */
  static gpaBuilder(
    programId: web3.PublicKey = new web3.PublicKey(
      'BNGKUeQQHw2MgZc9EqFsCWmnkLEKLCUfu5cw9YFWK3hF'
    )
  ) {
    return beetSolana.GpaBuilder.fromStruct(programId, assetManagerBeet)
  }

  /**
   * Deserializes the {@link AssetManager} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [AssetManager, number] {
    return assetManagerBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link AssetManager} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return assetManagerBeet.serialize({
      accountDiscriminator: assetManagerDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link AssetManager} for the provided args.
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   */
  static byteSize(args: AssetManagerArgs) {
    const instance = AssetManager.fromArgs(args)
    return assetManagerBeet.toFixedFromValue({
      accountDiscriminator: assetManagerDiscriminator,
      ...instance,
    }).byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link AssetManager} data from rent
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    args: AssetManagerArgs,
    connection: web3.Connection,
    commitment?: web3.Commitment
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      AssetManager.byteSize(args),
      commitment
    )
  }

  /**
   * Returns a readable version of {@link AssetManager} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      bump: this.bump,
      key: this.key.toBase58(),
      authority: this.authority.toBase58(),
      treasury: this.treasury.toBase58(),
      name: this.name,
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const assetManagerBeet = new beet.FixableBeetStruct<
  AssetManager,
  AssetManagerArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
    ['key', beetSolana.publicKey],
    ['authority', beetSolana.publicKey],
    ['treasury', beetSolana.publicKey],
    ['name', beet.utf8String],
  ],
  AssetManager.fromArgs,
  'AssetManager'
)
