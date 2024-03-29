/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beet from '@metaplex-foundation/beet'
import * as beetSolana from '@metaplex-foundation/beet-solana'
import { Conditionalbool, conditionalboolBeet } from '../types/Conditionalbool'

/**
 * Arguments used to create {@link PaymentSession}
 * @category Accounts
 * @category generated
 */
export type PaymentSessionArgs = {
  bump: number
  paymentStructure: web3.PublicKey
  payer: web3.PublicKey
  paymentsStatus: Conditionalbool
}

export const paymentSessionDiscriminator = [54, 26, 27, 179, 52, 57, 56, 21]
/**
 * Holds the data for the {@link PaymentSession} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class PaymentSession implements PaymentSessionArgs {
  private constructor(
    readonly bump: number,
    readonly paymentStructure: web3.PublicKey,
    readonly payer: web3.PublicKey,
    readonly paymentsStatus: Conditionalbool
  ) {}

  /**
   * Creates a {@link PaymentSession} instance from the provided args.
   */
  static fromArgs(args: PaymentSessionArgs) {
    return new PaymentSession(
      args.bump,
      args.paymentStructure,
      args.payer,
      args.paymentsStatus
    )
  }

  /**
   * Deserializes the {@link PaymentSession} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0
  ): [PaymentSession, number] {
    return PaymentSession.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link PaymentSession} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig
  ): Promise<PaymentSession> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig
    )
    if (accountInfo == null) {
      throw new Error(`Unable to find PaymentSession account at ${address}`)
    }
    return PaymentSession.fromAccountInfo(accountInfo, 0)[0]
  }

  /**
   * Provides a {@link web3.Connection.getProgramAccounts} config builder,
   * to fetch accounts matching filters that can be specified via that builder.
   *
   * @param programId - the program that owns the accounts we are filtering
   */
  static gpaBuilder(
    programId: web3.PublicKey = new web3.PublicKey(
      'Pay9ZxrVRXjt9Da8qpwqq4yBRvvrfx3STWnKK4FstPr'
    )
  ) {
    return beetSolana.GpaBuilder.fromStruct(programId, paymentSessionBeet)
  }

  /**
   * Deserializes the {@link PaymentSession} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [PaymentSession, number] {
    return paymentSessionBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link PaymentSession} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return paymentSessionBeet.serialize({
      accountDiscriminator: paymentSessionDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link PaymentSession} for the provided args.
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   */
  static byteSize(args: PaymentSessionArgs) {
    const instance = PaymentSession.fromArgs(args)
    return paymentSessionBeet.toFixedFromValue({
      accountDiscriminator: paymentSessionDiscriminator,
      ...instance,
    }).byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link PaymentSession} data from rent
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    args: PaymentSessionArgs,
    connection: web3.Connection,
    commitment?: web3.Commitment
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      PaymentSession.byteSize(args),
      commitment
    )
  }

  /**
   * Returns a readable version of {@link PaymentSession} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      bump: this.bump,
      paymentStructure: this.paymentStructure.toBase58(),
      payer: this.payer.toBase58(),
      paymentsStatus: this.paymentsStatus.__kind,
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const paymentSessionBeet = new beet.FixableBeetStruct<
  PaymentSession,
  PaymentSessionArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
    ['paymentStructure', beetSolana.publicKey],
    ['payer', beetSolana.publicKey],
    ['paymentsStatus', conditionalboolBeet],
  ],
  PaymentSession.fromArgs,
  'PaymentSession'
)
