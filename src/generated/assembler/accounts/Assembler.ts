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
  AssemblingAction,
  assemblingActionBeet,
} from '../types/AssemblingAction'

/**
 * Arguments used to create {@link Assembler}
 * @category Accounts
 * @category generated
 */
export type AssemblerArgs = {
  bump: number
  authority: web3.PublicKey
  collection: web3.PublicKey
  collectionName: string
  collectionSymbol: string
  collectionDescription: string
  nftBaseUri: string
  assemblingAction: AssemblingAction
  nfts: number
  allowDuplicates: boolean
  defaultRoyalty: number
}

export const assemblerDiscriminator = [102, 198, 246, 85, 86, 197, 55, 95]
/**
 * Holds the data for the {@link Assembler} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class Assembler implements AssemblerArgs {
  private constructor(
    readonly bump: number,
    readonly authority: web3.PublicKey,
    readonly collection: web3.PublicKey,
    readonly collectionName: string,
    readonly collectionSymbol: string,
    readonly collectionDescription: string,
    readonly nftBaseUri: string,
    readonly assemblingAction: AssemblingAction,
    readonly nfts: number,
    readonly allowDuplicates: boolean,
    readonly defaultRoyalty: number
  ) {}

  /**
   * Creates a {@link Assembler} instance from the provided args.
   */
  static fromArgs(args: AssemblerArgs) {
    return new Assembler(
      args.bump,
      args.authority,
      args.collection,
      args.collectionName,
      args.collectionSymbol,
      args.collectionDescription,
      args.nftBaseUri,
      args.assemblingAction,
      args.nfts,
      args.allowDuplicates,
      args.defaultRoyalty
    )
  }

  /**
   * Deserializes the {@link Assembler} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0
  ): [Assembler, number] {
    return Assembler.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link Assembler} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig
  ): Promise<Assembler> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig
    )
    if (accountInfo == null) {
      throw new Error(`Unable to find Assembler account at ${address}`)
    }
    return Assembler.fromAccountInfo(accountInfo, 0)[0]
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
    return beetSolana.GpaBuilder.fromStruct(programId, assemblerBeet)
  }

  /**
   * Deserializes the {@link Assembler} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [Assembler, number] {
    return assemblerBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link Assembler} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return assemblerBeet.serialize({
      accountDiscriminator: assemblerDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link Assembler} for the provided args.
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   */
  static byteSize(args: AssemblerArgs) {
    const instance = Assembler.fromArgs(args)
    return assemblerBeet.toFixedFromValue({
      accountDiscriminator: assemblerDiscriminator,
      ...instance,
    }).byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link Assembler} data from rent
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    args: AssemblerArgs,
    connection: web3.Connection,
    commitment?: web3.Commitment
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      Assembler.byteSize(args),
      commitment
    )
  }

  /**
   * Returns a readable version of {@link Assembler} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      bump: this.bump,
      authority: this.authority.toBase58(),
      collection: this.collection.toBase58(),
      collectionName: this.collectionName,
      collectionSymbol: this.collectionSymbol,
      collectionDescription: this.collectionDescription,
      nftBaseUri: this.nftBaseUri,
      assemblingAction:
        'AssemblingAction.' + AssemblingAction[this.assemblingAction],
      nfts: this.nfts,
      allowDuplicates: this.allowDuplicates,
      defaultRoyalty: this.defaultRoyalty,
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const assemblerBeet = new beet.FixableBeetStruct<
  Assembler,
  AssemblerArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
    ['authority', beetSolana.publicKey],
    ['collection', beetSolana.publicKey],
    ['collectionName', beet.utf8String],
    ['collectionSymbol', beet.utf8String],
    ['collectionDescription', beet.utf8String],
    ['nftBaseUri', beet.utf8String],
    ['assemblingAction', assemblingActionBeet],
    ['nfts', beet.u16],
    ['allowDuplicates', beet.bool],
    ['defaultRoyalty', beet.u16],
  ],
  Assembler.fromArgs,
  'Assembler'
)
