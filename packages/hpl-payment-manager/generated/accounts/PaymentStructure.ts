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
  ConditionalPayment,
  conditionalPaymentBeet,
} from '../types/ConditionalPayment'

/**
 * Arguments used to create {@link PaymentStructure}
 * @category Accounts
 * @category generated
 */
export type PaymentStructureArgs = {
  bump: number
  uniqueKey: web3.PublicKey
  authority: web3.PublicKey
  payments: ConditionalPayment
}

export const paymentStructureDiscriminator = [
  206, 177, 218, 59, 44, 55, 22, 193,
]
/**
 * Holds the data for the {@link PaymentStructure} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class PaymentStructure implements PaymentStructureArgs {
  private constructor(
    readonly bump: number,
    readonly uniqueKey: web3.PublicKey,
    readonly authority: web3.PublicKey,
    readonly payments: ConditionalPayment
  ) {}

  /**
   * Creates a {@link PaymentStructure} instance from the provided args.
   */
  static fromArgs(args: PaymentStructureArgs) {
    return new PaymentStructure(
      args.bump,
      args.uniqueKey,
      args.authority,
      args.payments
    )
  }

  /**
   * Deserializes the {@link PaymentStructure} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0
  ): [PaymentStructure, number] {
    return PaymentStructure.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link PaymentStructure} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig
  ): Promise<PaymentStructure> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig
    )
    if (accountInfo == null) {
      throw new Error(`Unable to find PaymentStructure account at ${address}`)
    }
    return PaymentStructure.fromAccountInfo(accountInfo, 0)[0]
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
    return beetSolana.GpaBuilder.fromStruct(programId, paymentStructureBeet)
  }

  /**
   * Deserializes the {@link PaymentStructure} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [PaymentStructure, number] {
    return paymentStructureBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link PaymentStructure} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return paymentStructureBeet.serialize({
      accountDiscriminator: paymentStructureDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link PaymentStructure} for the provided args.
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   */
  static byteSize(args: PaymentStructureArgs) {
    const instance = PaymentStructure.fromArgs(args)
    return paymentStructureBeet.toFixedFromValue({
      accountDiscriminator: paymentStructureDiscriminator,
      ...instance,
    }).byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link PaymentStructure} data from rent
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    args: PaymentStructureArgs,
    connection: web3.Connection,
    commitment?: web3.Commitment
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      PaymentStructure.byteSize(args),
      commitment
    )
  }

  /**
   * Returns a readable version of {@link PaymentStructure} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      bump: this.bump,
      uniqueKey: this.uniqueKey.toBase58(),
      authority: this.authority.toBase58(),
      payments: this.payments.__kind,
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const paymentStructureBeet = new beet.FixableBeetStruct<
  PaymentStructure,
  PaymentStructureArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
    ['uniqueKey', beetSolana.publicKey],
    ['authority', beetSolana.publicKey],
    ['payments', conditionalPaymentBeet],
  ],
  PaymentStructure.fromArgs,
  'PaymentStructure'
)
