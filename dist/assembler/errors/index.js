"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorFromName = exports.errorFromCode = exports.NFTNotBurnableError = exports.NFTNotMintedError = exports.DepositAccountNotProvidedError = exports.NFTAlreadyMintedError = exports.InvalidTokenForBlockDefinitionError = exports.InvalidMetadataError = exports.InvalidBlockDefinitionError = exports.InvalidBlockTypeError = exports.RequiredBlockImageError = exports.BlockTypeMismatchError = exports.OverflowError = void 0;
const createErrorFromCodeLookup = new Map();
const createErrorFromNameLookup = new Map();
class OverflowError extends Error {
    constructor() {
        super('Opertaion overflowed');
        this.code = 0x1770;
        this.name = 'Overflow';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, OverflowError);
        }
    }
}
exports.OverflowError = OverflowError;
createErrorFromCodeLookup.set(0x1770, () => new OverflowError());
createErrorFromNameLookup.set('Overflow', () => new OverflowError());
class BlockTypeMismatchError extends Error {
    constructor() {
        super('The type of block is not same as the block definition value provided');
        this.code = 0x1771;
        this.name = 'BlockTypeMismatch';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, BlockTypeMismatchError);
        }
    }
}
exports.BlockTypeMismatchError = BlockTypeMismatchError;
createErrorFromCodeLookup.set(0x1771, () => new BlockTypeMismatchError());
createErrorFromNameLookup.set('BlockTypeMismatch', () => new BlockTypeMismatchError());
class RequiredBlockImageError extends Error {
    constructor() {
        super('The particular block requires an image in definition');
        this.code = 0x1772;
        this.name = 'RequiredBlockImage';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, RequiredBlockImageError);
        }
    }
}
exports.RequiredBlockImageError = RequiredBlockImageError;
createErrorFromCodeLookup.set(0x1772, () => new RequiredBlockImageError());
createErrorFromNameLookup.set('RequiredBlockImage', () => new RequiredBlockImageError());
class InvalidBlockTypeError extends Error {
    constructor() {
        super('The block has an invalid type');
        this.code = 0x1773;
        this.name = 'InvalidBlockType';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvalidBlockTypeError);
        }
    }
}
exports.InvalidBlockTypeError = InvalidBlockTypeError;
createErrorFromCodeLookup.set(0x1773, () => new InvalidBlockTypeError());
createErrorFromNameLookup.set('InvalidBlockType', () => new InvalidBlockTypeError());
class InvalidBlockDefinitionError extends Error {
    constructor() {
        super('The block defintion is invalid');
        this.code = 0x1774;
        this.name = 'InvalidBlockDefinition';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvalidBlockDefinitionError);
        }
    }
}
exports.InvalidBlockDefinitionError = InvalidBlockDefinitionError;
createErrorFromCodeLookup.set(0x1774, () => new InvalidBlockDefinitionError());
createErrorFromNameLookup.set('InvalidBlockDefinition', () => new InvalidBlockDefinitionError());
class InvalidMetadataError extends Error {
    constructor() {
        super('The metadata provided for the mint is not valid');
        this.code = 0x1775;
        this.name = 'InvalidMetadata';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvalidMetadataError);
        }
    }
}
exports.InvalidMetadataError = InvalidMetadataError;
createErrorFromCodeLookup.set(0x1775, () => new InvalidMetadataError());
createErrorFromNameLookup.set('InvalidMetadata', () => new InvalidMetadataError());
class InvalidTokenForBlockDefinitionError extends Error {
    constructor() {
        super('The token is not valid for this block definition');
        this.code = 0x1776;
        this.name = 'InvalidTokenForBlockDefinition';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvalidTokenForBlockDefinitionError);
        }
    }
}
exports.InvalidTokenForBlockDefinitionError = InvalidTokenForBlockDefinitionError;
createErrorFromCodeLookup.set(0x1776, () => new InvalidTokenForBlockDefinitionError());
createErrorFromNameLookup.set('InvalidTokenForBlockDefinition', () => new InvalidTokenForBlockDefinitionError());
class NFTAlreadyMintedError extends Error {
    constructor() {
        super('The NFT is already minted');
        this.code = 0x1777;
        this.name = 'NFTAlreadyMinted';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, NFTAlreadyMintedError);
        }
    }
}
exports.NFTAlreadyMintedError = NFTAlreadyMintedError;
createErrorFromCodeLookup.set(0x1777, () => new NFTAlreadyMintedError());
createErrorFromNameLookup.set('NFTAlreadyMinted', () => new NFTAlreadyMintedError());
class DepositAccountNotProvidedError extends Error {
    constructor() {
        super('Deposit account is not provided');
        this.code = 0x1778;
        this.name = 'DepositAccountNotProvided';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, DepositAccountNotProvidedError);
        }
    }
}
exports.DepositAccountNotProvidedError = DepositAccountNotProvidedError;
createErrorFromCodeLookup.set(0x1778, () => new DepositAccountNotProvidedError());
createErrorFromNameLookup.set('DepositAccountNotProvided', () => new DepositAccountNotProvidedError());
class NFTNotMintedError extends Error {
    constructor() {
        super('The NFT is not minted');
        this.code = 0x1779;
        this.name = 'NFTNotMinted';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, NFTNotMintedError);
        }
    }
}
exports.NFTNotMintedError = NFTNotMintedError;
createErrorFromCodeLookup.set(0x1779, () => new NFTNotMintedError());
createErrorFromNameLookup.set('NFTNotMinted', () => new NFTNotMintedError());
class NFTNotBurnableError extends Error {
    constructor() {
        super('The NFT is cannot be burned');
        this.code = 0x177a;
        this.name = 'NFTNotBurnable';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, NFTNotBurnableError);
        }
    }
}
exports.NFTNotBurnableError = NFTNotBurnableError;
createErrorFromCodeLookup.set(0x177a, () => new NFTNotBurnableError());
createErrorFromNameLookup.set('NFTNotBurnable', () => new NFTNotBurnableError());
function errorFromCode(code) {
    const createError = createErrorFromCodeLookup.get(code);
    return createError != null ? createError() : null;
}
exports.errorFromCode = errorFromCode;
function errorFromName(name) {
    const createError = createErrorFromNameLookup.get(name);
    return createError != null ? createError() : null;
}
exports.errorFromName = errorFromName;
//# sourceMappingURL=index.js.map