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
 * Arguments used to create {@link NFT}
 * @category Accounts
 * @category generated
 */
export type NFTArgs = {
  bump: number
  assembler: web3.PublicKey
  authority: web3.PublicKey
  collectionAddress: web3.PublicKey
  mint: web3.PublicKey
  minted: boolean
  id: number
  name: string
  symbol: string
  description: string
  image: string
}

export const nFTDiscriminator = [88, 10, 146, 176, 101, 11, 40, 217]
/**
 * Holds the data for the {@link NFT} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class NFT implements NFTArgs {
  private constructor(
    readonly bump: number,
    readonly assembler: web3.PublicKey,
    readonly authority: web3.PublicKey,
    readonly collectionAddress: web3.PublicKey,
    readonly mint: web3.PublicKey,
    readonly minted: boolean,
    readonly id: number,
    readonly name: string,
    readonly symbol: string,
    readonly description: string,
    readonly image: string
  ) {}

  /**
   * Creates a {@link NFT} instance from the provided args.
   */
  static fromArgs(args: NFTArgs) {
    return new NFT(
      args.bump,
      args.assembler,
      args.authority,
      args.collectionAddress,
      args.mint,
      args.minted,
      args.id,
      args.name,
      args.symbol,
      args.description,
      args.image
    )
  }

  /**
   * Deserializes the {@link NFT} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0
  ): [NFT, number] {
    return NFT.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link NFT} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig
  ): Promise<NFT> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig
    )
    if (accountInfo == null) {
      throw new Error(`Unable to find NFT account at ${address}`)
    }
    return NFT.fromAccountInfo(accountInfo, 0)[0]
  }

  /**
   * Provides a {@link web3.Connection.getProgramAccounts} config builder,
   * to fetch accounts matching filters that can be specified via that builder.
   *
   * @param programId - the program that owns the accounts we are filtering
   */
  static gpaBuilder(
    programId: web3.PublicKey = new web3.PublicKey(
      'AXX2agYcoDwGFsgEWvSitqfGH4ooKXUqK5P7Ch9raDJT'
    )
  ) {
    return beetSolana.GpaBuilder.fromStruct(programId, nFTBeet)
  }

  /**
   * Deserializes the {@link NFT} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [NFT, number] {
    return nFTBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link NFT} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return nFTBeet.serialize({
      accountDiscriminator: nFTDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link NFT} for the provided args.
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   */
  static byteSize(args: NFTArgs) {
    const instance = NFT.fromArgs(args)
    return nFTBeet.toFixedFromValue({
      accountDiscriminator: nFTDiscriminator,
      ...instance,
    }).byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link NFT} data from rent
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    args: NFTArgs,
    connection: web3.Connection,
    commitment?: web3.Commitment
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      NFT.byteSize(args),
      commitment
    )
  }

  /**
   * Returns a readable version of {@link NFT} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      bump: this.bump,
      assembler: this.assembler.toBase58(),
      authority: this.authority.toBase58(),
      collectionAddress: this.collectionAddress.toBase58(),
      mint: this.mint.toBase58(),
      minted: this.minted,
      id: this.id,
      name: this.name,
      symbol: this.symbol,
      description: this.description,
      image: this.image,
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const nFTBeet = new beet.FixableBeetStruct<
  NFT,
  NFTArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
    ['assembler', beetSolana.publicKey],
    ['authority', beetSolana.publicKey],
    ['collectionAddress', beetSolana.publicKey],
    ['mint', beetSolana.publicKey],
    ['minted', beet.bool],
    ['id', beet.u16],
    ['name', beet.utf8String],
    ['symbol', beet.utf8String],
    ['description', beet.utf8String],
    ['image', beet.utf8String],
  ],
  NFT.fromArgs,
  'NFT'
)
