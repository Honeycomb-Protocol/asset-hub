/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beet from '@metaplex-foundation/beet'
import * as beetSolana from '@metaplex-foundation/beet-solana'
import { CurrencyKind, currencyKindBeet } from '../types/CurrencyKind'

/**
 * Arguments used to create {@link Currency}
 * @category Accounts
 * @category generated
 */
export type CurrencyArgs = {
  bump: number
  project: web3.PublicKey
  mint: web3.PublicKey
  kind: CurrencyKind
}

export const currencyDiscriminator = [191, 62, 116, 219, 163, 67, 229, 200]
/**
 * Holds the data for the {@link Currency} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class Currency implements CurrencyArgs {
  private constructor(
    readonly bump: number,
    readonly project: web3.PublicKey,
    readonly mint: web3.PublicKey,
    readonly kind: CurrencyKind
  ) {}

  /**
   * Creates a {@link Currency} instance from the provided args.
   */
  static fromArgs(args: CurrencyArgs) {
    return new Currency(args.bump, args.project, args.mint, args.kind)
  }

  /**
   * Deserializes the {@link Currency} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0
  ): [Currency, number] {
    return Currency.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link Currency} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig
  ): Promise<Currency> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig
    )
    if (accountInfo == null) {
      throw new Error(`Unable to find Currency account at ${address}`)
    }
    return Currency.fromAccountInfo(accountInfo, 0)[0]
  }

  /**
   * Provides a {@link web3.Connection.getProgramAccounts} config builder,
   * to fetch accounts matching filters that can be specified via that builder.
   *
   * @param programId - the program that owns the accounts we are filtering
   */
  static gpaBuilder(
    programId: web3.PublicKey = new web3.PublicKey(
      'CrNcYmnu2nvH5fp4pspk2rLQ9h6N3XrJvZMzEhnpbJux'
    )
  ) {
    return beetSolana.GpaBuilder.fromStruct(programId, currencyBeet)
  }

  /**
   * Deserializes the {@link Currency} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [Currency, number] {
    return currencyBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link Currency} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return currencyBeet.serialize({
      accountDiscriminator: currencyDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link Currency} for the provided args.
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   */
  static byteSize(args: CurrencyArgs) {
    const instance = Currency.fromArgs(args)
    return currencyBeet.toFixedFromValue({
      accountDiscriminator: currencyDiscriminator,
      ...instance,
    }).byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link Currency} data from rent
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    args: CurrencyArgs,
    connection: web3.Connection,
    commitment?: web3.Commitment
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      Currency.byteSize(args),
      commitment
    )
  }

  /**
   * Returns a readable version of {@link Currency} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      bump: this.bump,
      project: this.project.toBase58(),
      mint: this.mint.toBase58(),
      kind: this.kind.__kind,
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const currencyBeet = new beet.FixableBeetStruct<
  Currency,
  CurrencyArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
    ['project', beetSolana.publicKey],
    ['mint', beetSolana.publicKey],
    ['kind', currencyKindBeet],
  ],
  Currency.fromArgs,
  'Currency'
)
