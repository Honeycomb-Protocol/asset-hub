"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorFromName = exports.errorFromCode = exports.NFTAlreadyMintedError = exports.InvalidTokenForBlockDefinitionError = exports.InvalidMetadataError = exports.InvalidBlockDefinitionError = exports.InvalidBlockTypeError = exports.RequiredBlockImageError = exports.BlockNotBooleanError = exports.BlockNotNumberError = exports.BlockNotEnumError = void 0;
const createErrorFromCodeLookup = new Map();
const createErrorFromNameLookup = new Map();
class BlockNotEnumError extends Error {
    constructor() {
        super('The type of block is not enum, block definitions must only be created for enum');
        this.code = 0x1770;
        this.name = 'BlockNotEnum';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, BlockNotEnumError);
        }
    }
}
exports.BlockNotEnumError = BlockNotEnumError;
createErrorFromCodeLookup.set(0x1770, () => new BlockNotEnumError());
createErrorFromNameLookup.set('BlockNotEnum', () => new BlockNotEnumError());
class BlockNotNumberError extends Error {
    constructor() {
        super('The type of block is not number, block definitions must only be created for number');
        this.code = 0x1771;
        this.name = 'BlockNotNumber';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, BlockNotNumberError);
        }
    }
}
exports.BlockNotNumberError = BlockNotNumberError;
createErrorFromCodeLookup.set(0x1771, () => new BlockNotNumberError());
createErrorFromNameLookup.set('BlockNotNumber', () => new BlockNotNumberError());
class BlockNotBooleanError extends Error {
    constructor() {
        super('The type of block is not boolean, block definitions must only be created for boolean');
        this.code = 0x1772;
        this.name = 'BlockNotBoolean';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, BlockNotBooleanError);
        }
    }
}
exports.BlockNotBooleanError = BlockNotBooleanError;
createErrorFromCodeLookup.set(0x1772, () => new BlockNotBooleanError());
createErrorFromNameLookup.set('BlockNotBoolean', () => new BlockNotBooleanError());
class RequiredBlockImageError extends Error {
    constructor() {
        super('The particular block requires an image in definition');
        this.code = 0x1773;
        this.name = 'RequiredBlockImage';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, RequiredBlockImageError);
        }
    }
}
exports.RequiredBlockImageError = RequiredBlockImageError;
createErrorFromCodeLookup.set(0x1773, () => new RequiredBlockImageError());
createErrorFromNameLookup.set('RequiredBlockImage', () => new RequiredBlockImageError());
class InvalidBlockTypeError extends Error {
    constructor() {
        super('The block has an invalid type');
        this.code = 0x1774;
        this.name = 'InvalidBlockType';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvalidBlockTypeError);
        }
    }
}
exports.InvalidBlockTypeError = InvalidBlockTypeError;
createErrorFromCodeLookup.set(0x1774, () => new InvalidBlockTypeError());
createErrorFromNameLookup.set('InvalidBlockType', () => new InvalidBlockTypeError());
class InvalidBlockDefinitionError extends Error {
    constructor() {
        super('The block defintion is invalid');
        this.code = 0x1775;
        this.name = 'InvalidBlockDefinition';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvalidBlockDefinitionError);
        }
    }
}
exports.InvalidBlockDefinitionError = InvalidBlockDefinitionError;
createErrorFromCodeLookup.set(0x1775, () => new InvalidBlockDefinitionError());
createErrorFromNameLookup.set('InvalidBlockDefinition', () => new InvalidBlockDefinitionError());
class InvalidMetadataError extends Error {
    constructor() {
        super('The metadata provided for the mint is not valid');
        this.code = 0x1776;
        this.name = 'InvalidMetadata';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvalidMetadataError);
        }
    }
}
exports.InvalidMetadataError = InvalidMetadataError;
createErrorFromCodeLookup.set(0x1776, () => new InvalidMetadataError());
createErrorFromNameLookup.set('InvalidMetadata', () => new InvalidMetadataError());
class InvalidTokenForBlockDefinitionError extends Error {
    constructor() {
        super('The token is not valid for this block definition');
        this.code = 0x1777;
        this.name = 'InvalidTokenForBlockDefinition';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvalidTokenForBlockDefinitionError);
        }
    }
}
exports.InvalidTokenForBlockDefinitionError = InvalidTokenForBlockDefinitionError;
createErrorFromCodeLookup.set(0x1777, () => new InvalidTokenForBlockDefinitionError());
createErrorFromNameLookup.set('InvalidTokenForBlockDefinition', () => new InvalidTokenForBlockDefinitionError());
class NFTAlreadyMintedError extends Error {
    constructor() {
        super('The NFT is already minted');
        this.code = 0x1778;
        this.name = 'NFTAlreadyMinted';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, NFTAlreadyMintedError);
        }
    }
}
exports.NFTAlreadyMintedError = NFTAlreadyMintedError;
createErrorFromCodeLookup.set(0x1778, () => new NFTAlreadyMintedError());
createErrorFromNameLookup.set('NFTAlreadyMinted', () => new NFTAlreadyMintedError());
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