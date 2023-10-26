/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

type ErrorWithCode = Error & { code: number }
type MaybeErrorWithCode = ErrorWithCode | null | undefined

const createErrorFromCodeLookup: Map<number, () => ErrorWithCode> = new Map()
const createErrorFromNameLookup: Map<string, () => ErrorWithCode> = new Map()

/**
 * Overflow: 'Opertaion overflowed'
 *
 * @category Errors
 * @category generated
 */
export class OverflowError extends Error {
  readonly code: number = 0x1770
  readonly name: string = 'Overflow'
  constructor() {
    super('Opertaion overflowed')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, OverflowError)
    }
  }
}

createErrorFromCodeLookup.set(0x1770, () => new OverflowError())
createErrorFromNameLookup.set('Overflow', () => new OverflowError())

/**
 * ConditionValidationFailed: 'Condition validation failed'
 *
 * @category Errors
 * @category generated
 */
export class ConditionValidationFailedError extends Error {
  readonly code: number = 0x1771
  readonly name: string = 'ConditionValidationFailed'
  constructor() {
    super('Condition validation failed')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, ConditionValidationFailedError)
    }
  }
}

createErrorFromCodeLookup.set(
  0x1771,
  () => new ConditionValidationFailedError()
)
createErrorFromNameLookup.set(
  'ConditionValidationFailed',
  () => new ConditionValidationFailedError()
)

/**
 * InvalidConditionalPath: 'Invalid Conditional path'
 *
 * @category Errors
 * @category generated
 */
export class InvalidConditionalPathError extends Error {
  readonly code: number = 0x1772
  readonly name: string = 'InvalidConditionalPath'
  constructor() {
    super('Invalid Conditional path')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidConditionalPathError)
    }
  }
}

createErrorFromCodeLookup.set(0x1772, () => new InvalidConditionalPathError())
createErrorFromNameLookup.set(
  'InvalidConditionalPath',
  () => new InvalidConditionalPathError()
)

/**
 * IncompletePayment: 'Incomplete Payment'
 *
 * @category Errors
 * @category generated
 */
export class IncompletePaymentError extends Error {
  readonly code: number = 0x1773
  readonly name: string = 'IncompletePayment'
  constructor() {
    super('Incomplete Payment')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, IncompletePaymentError)
    }
  }
}

createErrorFromCodeLookup.set(0x1773, () => new IncompletePaymentError())
createErrorFromNameLookup.set(
  'IncompletePayment',
  () => new IncompletePaymentError()
)

/**
 * InvalidPayment: 'Invalid payment kind'
 *
 * @category Errors
 * @category generated
 */
export class InvalidPaymentError extends Error {
  readonly code: number = 0x1774
  readonly name: string = 'InvalidPayment'
  constructor() {
    super('Invalid payment kind')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidPaymentError)
    }
  }
}

createErrorFromCodeLookup.set(0x1774, () => new InvalidPaymentError())
createErrorFromNameLookup.set('InvalidPayment', () => new InvalidPaymentError())

/**
 * InvalidNftPayment: 'Invalid nft passed as payment'
 *
 * @category Errors
 * @category generated
 */
export class InvalidNftPaymentError extends Error {
  readonly code: number = 0x1775
  readonly name: string = 'InvalidNftPayment'
  constructor() {
    super('Invalid nft passed as payment')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidNftPaymentError)
    }
  }
}

createErrorFromCodeLookup.set(0x1775, () => new InvalidNftPaymentError())
createErrorFromNameLookup.set(
  'InvalidNftPayment',
  () => new InvalidNftPaymentError()
)

/**
 * InvalidMetadata: 'The metadata provided for nft is not valid'
 *
 * @category Errors
 * @category generated
 */
export class InvalidMetadataError extends Error {
  readonly code: number = 0x1776
  readonly name: string = 'InvalidMetadata'
  constructor() {
    super('The metadata provided for nft is not valid')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidMetadataError)
    }
  }
}

createErrorFromCodeLookup.set(0x1776, () => new InvalidMetadataError())
createErrorFromNameLookup.set(
  'InvalidMetadata',
  () => new InvalidMetadataError()
)

/**
 * InvalidHplCurrencyPayment: 'Invalid hpl currency passes as payment'
 *
 * @category Errors
 * @category generated
 */
export class InvalidHplCurrencyPaymentError extends Error {
  readonly code: number = 0x1777
  readonly name: string = 'InvalidHplCurrencyPayment'
  constructor() {
    super('Invalid hpl currency passes as payment')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidHplCurrencyPaymentError)
    }
  }
}

createErrorFromCodeLookup.set(
  0x1777,
  () => new InvalidHplCurrencyPaymentError()
)
createErrorFromNameLookup.set(
  'InvalidHplCurrencyPayment',
  () => new InvalidHplCurrencyPaymentError()
)

/**
 * InvalidInstructionForCnft: 'Invalid instruction for cnft'
 *
 * @category Errors
 * @category generated
 */
export class InvalidInstructionForCnftError extends Error {
  readonly code: number = 0x1778
  readonly name: string = 'InvalidInstructionForCnft'
  constructor() {
    super('Invalid instruction for cnft')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidInstructionForCnftError)
    }
  }
}

createErrorFromCodeLookup.set(
  0x1778,
  () => new InvalidInstructionForCnftError()
)
createErrorFromNameLookup.set(
  'InvalidInstructionForCnft',
  () => new InvalidInstructionForCnftError()
)

/**
 * InvalidBeneficiary: 'Invalid beneficiary'
 *
 * @category Errors
 * @category generated
 */
export class InvalidBeneficiaryError extends Error {
  readonly code: number = 0x1779
  readonly name: string = 'InvalidBeneficiary'
  constructor() {
    super('Invalid beneficiary')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidBeneficiaryError)
    }
  }
}

createErrorFromCodeLookup.set(0x1779, () => new InvalidBeneficiaryError())
createErrorFromNameLookup.set(
  'InvalidBeneficiary',
  () => new InvalidBeneficiaryError()
)

/**
 * PaymentAlreadyMade: 'Payment already made'
 *
 * @category Errors
 * @category generated
 */
export class PaymentAlreadyMadeError extends Error {
  readonly code: number = 0x177a
  readonly name: string = 'PaymentAlreadyMade'
  constructor() {
    super('Payment already made')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, PaymentAlreadyMadeError)
    }
  }
}

createErrorFromCodeLookup.set(0x177a, () => new PaymentAlreadyMadeError())
createErrorFromNameLookup.set(
  'PaymentAlreadyMade',
  () => new PaymentAlreadyMadeError()
)

/**
 * Attempts to resolve a custom program error from the provided error code.
 * @category Errors
 * @category generated
 */
export function errorFromCode(code: number): MaybeErrorWithCode {
  const createError = createErrorFromCodeLookup.get(code)
  return createError != null ? createError() : null
}

/**
 * Attempts to resolve a custom program error from the provided error name, i.e. 'Unauthorized'.
 * @category Errors
 * @category generated
 */
export function errorFromName(name: string): MaybeErrorWithCode {
  const createError = createErrorFromNameLookup.get(name)
  return createError != null ? createError() : null
}
