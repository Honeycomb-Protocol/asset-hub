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
 * Unauthorized: 'The provided authority or delegate authority is not valid'
 *
 * @category Errors
 * @category generated
 */
export class UnauthorizedError extends Error {
  readonly code: number = 0x1771
  readonly name: string = 'Unauthorized'
  constructor() {
    super('The provided authority or delegate authority is not valid')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, UnauthorizedError)
    }
  }
}

createErrorFromCodeLookup.set(0x1771, () => new UnauthorizedError())
createErrorFromNameLookup.set('Unauthorized', () => new UnauthorizedError())

/**
 * BlockTypeMismatch: 'The type of block is not same as the block definition value provided'
 *
 * @category Errors
 * @category generated
 */
export class BlockTypeMismatchError extends Error {
  readonly code: number = 0x1772
  readonly name: string = 'BlockTypeMismatch'
  constructor() {
    super(
      'The type of block is not same as the block definition value provided'
    )
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, BlockTypeMismatchError)
    }
  }
}

createErrorFromCodeLookup.set(0x1772, () => new BlockTypeMismatchError())
createErrorFromNameLookup.set(
  'BlockTypeMismatch',
  () => new BlockTypeMismatchError()
)

/**
 * RequiredBlockImage: 'The particular block requires an image in definition'
 *
 * @category Errors
 * @category generated
 */
export class RequiredBlockImageError extends Error {
  readonly code: number = 0x1773
  readonly name: string = 'RequiredBlockImage'
  constructor() {
    super('The particular block requires an image in definition')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, RequiredBlockImageError)
    }
  }
}

createErrorFromCodeLookup.set(0x1773, () => new RequiredBlockImageError())
createErrorFromNameLookup.set(
  'RequiredBlockImage',
  () => new RequiredBlockImageError()
)

/**
 * InvalidBlockType: 'The block has an invalid type'
 *
 * @category Errors
 * @category generated
 */
export class InvalidBlockTypeError extends Error {
  readonly code: number = 0x1774
  readonly name: string = 'InvalidBlockType'
  constructor() {
    super('The block has an invalid type')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidBlockTypeError)
    }
  }
}

createErrorFromCodeLookup.set(0x1774, () => new InvalidBlockTypeError())
createErrorFromNameLookup.set(
  'InvalidBlockType',
  () => new InvalidBlockTypeError()
)

/**
 * InvalidBlockDefinition: 'The block defintion is invalid'
 *
 * @category Errors
 * @category generated
 */
export class InvalidBlockDefinitionError extends Error {
  readonly code: number = 0x1775
  readonly name: string = 'InvalidBlockDefinition'
  constructor() {
    super('The block defintion is invalid')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidBlockDefinitionError)
    }
  }
}

createErrorFromCodeLookup.set(0x1775, () => new InvalidBlockDefinitionError())
createErrorFromNameLookup.set(
  'InvalidBlockDefinition',
  () => new InvalidBlockDefinitionError()
)

/**
 * InvalidMetadata: 'The metadata provided for the mint is not valid'
 *
 * @category Errors
 * @category generated
 */
export class InvalidMetadataError extends Error {
  readonly code: number = 0x1776
  readonly name: string = 'InvalidMetadata'
  constructor() {
    super('The metadata provided for the mint is not valid')
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
 * InvalidTokenForBlockDefinition: 'The token is not valid for this block definition'
 *
 * @category Errors
 * @category generated
 */
export class InvalidTokenForBlockDefinitionError extends Error {
  readonly code: number = 0x1777
  readonly name: string = 'InvalidTokenForBlockDefinition'
  constructor() {
    super('The token is not valid for this block definition')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidTokenForBlockDefinitionError)
    }
  }
}

createErrorFromCodeLookup.set(
  0x1777,
  () => new InvalidTokenForBlockDefinitionError()
)
createErrorFromNameLookup.set(
  'InvalidTokenForBlockDefinition',
  () => new InvalidTokenForBlockDefinitionError()
)

/**
 * NFTAlreadyMinted: 'The NFT is already minted'
 *
 * @category Errors
 * @category generated
 */
export class NFTAlreadyMintedError extends Error {
  readonly code: number = 0x1778
  readonly name: string = 'NFTAlreadyMinted'
  constructor() {
    super('The NFT is already minted')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, NFTAlreadyMintedError)
    }
  }
}

createErrorFromCodeLookup.set(0x1778, () => new NFTAlreadyMintedError())
createErrorFromNameLookup.set(
  'NFTAlreadyMinted',
  () => new NFTAlreadyMintedError()
)

/**
 * BlockExistsForNFT: 'NFT attribute is already present for this block'
 *
 * @category Errors
 * @category generated
 */
export class BlockExistsForNFTError extends Error {
  readonly code: number = 0x1779
  readonly name: string = 'BlockExistsForNFT'
  constructor() {
    super('NFT attribute is already present for this block')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, BlockExistsForNFTError)
    }
  }
}

createErrorFromCodeLookup.set(0x1779, () => new BlockExistsForNFTError())
createErrorFromNameLookup.set(
  'BlockExistsForNFT',
  () => new BlockExistsForNFTError()
)

/**
 * BlockDoesNotExistsForNFT: 'NFT does not have attribute for this block'
 *
 * @category Errors
 * @category generated
 */
export class BlockDoesNotExistsForNFTError extends Error {
  readonly code: number = 0x177a
  readonly name: string = 'BlockDoesNotExistsForNFT'
  constructor() {
    super('NFT does not have attribute for this block')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, BlockDoesNotExistsForNFTError)
    }
  }
}

createErrorFromCodeLookup.set(0x177a, () => new BlockDoesNotExistsForNFTError())
createErrorFromNameLookup.set(
  'BlockDoesNotExistsForNFT',
  () => new BlockDoesNotExistsForNFTError()
)

/**
 * InvalidUniqueConstraint: 'Unique constraint is not valid'
 *
 * @category Errors
 * @category generated
 */
export class InvalidUniqueConstraintError extends Error {
  readonly code: number = 0x177b
  readonly name: string = 'InvalidUniqueConstraint'
  constructor() {
    super('Unique constraint is not valid')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidUniqueConstraintError)
    }
  }
}

createErrorFromCodeLookup.set(0x177b, () => new InvalidUniqueConstraintError())
createErrorFromNameLookup.set(
  'InvalidUniqueConstraint',
  () => new InvalidUniqueConstraintError()
)

/**
 * UniqueConstraintNotProvided: 'Unique constraint is not provided'
 *
 * @category Errors
 * @category generated
 */
export class UniqueConstraintNotProvidedError extends Error {
  readonly code: number = 0x177c
  readonly name: string = 'UniqueConstraintNotProvided'
  constructor() {
    super('Unique constraint is not provided')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, UniqueConstraintNotProvidedError)
    }
  }
}

createErrorFromCodeLookup.set(
  0x177c,
  () => new UniqueConstraintNotProvidedError()
)
createErrorFromNameLookup.set(
  'UniqueConstraintNotProvided',
  () => new UniqueConstraintNotProvidedError()
)

/**
 * DelegateAccountNotProvided: 'Delegate is not provided'
 *
 * @category Errors
 * @category generated
 */
export class DelegateAccountNotProvidedError extends Error {
  readonly code: number = 0x177d
  readonly name: string = 'DelegateAccountNotProvided'
  constructor() {
    super('Delegate is not provided')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, DelegateAccountNotProvidedError)
    }
  }
}

createErrorFromCodeLookup.set(
  0x177d,
  () => new DelegateAccountNotProvidedError()
)
createErrorFromNameLookup.set(
  'DelegateAccountNotProvided',
  () => new DelegateAccountNotProvidedError()
)

/**
 * DepositAccountNotProvided: 'Deposit account is not provided'
 *
 * @category Errors
 * @category generated
 */
export class DepositAccountNotProvidedError extends Error {
  readonly code: number = 0x177e
  readonly name: string = 'DepositAccountNotProvided'
  constructor() {
    super('Deposit account is not provided')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, DepositAccountNotProvidedError)
    }
  }
}

createErrorFromCodeLookup.set(
  0x177e,
  () => new DepositAccountNotProvidedError()
)
createErrorFromNameLookup.set(
  'DepositAccountNotProvided',
  () => new DepositAccountNotProvidedError()
)

/**
 * NFTNotMinted: 'The NFT is not minted'
 *
 * @category Errors
 * @category generated
 */
export class NFTNotMintedError extends Error {
  readonly code: number = 0x177f
  readonly name: string = 'NFTNotMinted'
  constructor() {
    super('The NFT is not minted')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, NFTNotMintedError)
    }
  }
}

createErrorFromCodeLookup.set(0x177f, () => new NFTNotMintedError())
createErrorFromNameLookup.set('NFTNotMinted', () => new NFTNotMintedError())

/**
 * NFTNotBurnable: 'The NFT is cannot be burned'
 *
 * @category Errors
 * @category generated
 */
export class NFTNotBurnableError extends Error {
  readonly code: number = 0x1780
  readonly name: string = 'NFTNotBurnable'
  constructor() {
    super('The NFT is cannot be burned')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, NFTNotBurnableError)
    }
  }
}

createErrorFromCodeLookup.set(0x1780, () => new NFTNotBurnableError())
createErrorFromNameLookup.set('NFTNotBurnable', () => new NFTNotBurnableError())

/**
 * InitialArtGenerated: 'The initial generation of art is already complete'
 *
 * @category Errors
 * @category generated
 */
export class InitialArtGeneratedError extends Error {
  readonly code: number = 0x1781
  readonly name: string = 'InitialArtGenerated'
  constructor() {
    super('The initial generation of art is already complete')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InitialArtGeneratedError)
    }
  }
}

createErrorFromCodeLookup.set(0x1781, () => new InitialArtGeneratedError())
createErrorFromNameLookup.set(
  'InitialArtGenerated',
  () => new InitialArtGeneratedError()
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
