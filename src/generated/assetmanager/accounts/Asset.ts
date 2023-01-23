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
 * Arguments used to create {@link Asset}
 * @category Accounts
 * @category generated
 */
export type AssetArgs = {
  bump: number
  manager: web3.PublicKey
  candyGuard: beet.COption<web3.PublicKey>
  mint: web3.PublicKey
  itemsRedeemed: beet.bignum
  uri: string
}

export const assetDiscriminator = [234, 180, 241, 252, 139, 224, 160, 8]
/**
 * Holds the data for the {@link Asset} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class Asset implements AssetArgs {
  private constructor(
    readonly bump: number,
    readonly manager: web3.PublicKey,
    readonly candyGuard: beet.COption<web3.PublicKey>,
    readonly mint: web3.PublicKey,
    readonly itemsRedeemed: beet.bignum,
    readonly uri: string
  ) {}

  /**
   * Creates a {@link Asset} instance from the provided args.
   */
  static fromArgs(args: AssetArgs) {
    return new Asset(
      args.bump,
      args.manager,
      args.candyGuard,
      args.mint,
      args.itemsRedeemed,
      args.uri
    )
  }

  /**
   * Deserializes the {@link Asset} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0
  ): [Asset, number] {
    return Asset.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link Asset} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig
  ): Promise<Asset> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig
    )
    if (accountInfo == null) {
      throw new Error(`Unable to find Asset account at ${address}`)
    }
    return Asset.fromAccountInfo(accountInfo, 0)[0]
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
    return beetSolana.GpaBuilder.fromStruct(programId, assetBeet)
  }

  /**
   * Deserializes the {@link Asset} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [Asset, number] {
    return assetBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link Asset} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return assetBeet.serialize({
      accountDiscriminator: assetDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link Asset} for the provided args.
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   */
  static byteSize(args: AssetArgs) {
    const instance = Asset.fromArgs(args)
    return assetBeet.toFixedFromValue({
      accountDiscriminator: assetDiscriminator,
      ...instance,
    }).byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link Asset} data from rent
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    args: AssetArgs,
    connection: web3.Connection,
    commitment?: web3.Commitment
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      Asset.byteSize(args),
      commitment
    )
  }

  /**
   * Returns a readable version of {@link Asset} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      bump: this.bump,
      manager: this.manager.toBase58(),
      candyGuard: this.candyGuard,
      mint: this.mint.toBase58(),
      itemsRedeemed: (() => {
        const x = <{ toNumber: () => number }>this.itemsRedeemed
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      uri: this.uri,
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const assetBeet = new beet.FixableBeetStruct<
  Asset,
  AssetArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
    ['manager', beetSolana.publicKey],
    ['candyGuard', beet.coption(beetSolana.publicKey)],
    ['mint', beetSolana.publicKey],
    ['itemsRedeemed', beet.u64],
    ['uri', beet.utf8String],
  ],
  Asset.fromArgs,
  'Asset'
)
