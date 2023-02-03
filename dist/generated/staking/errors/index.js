"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorFromName = exports.errorFromCode = exports.InvalidNFTError = exports.InvalidMetadataError = exports.OverflowError = void 0;
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
class InvalidMetadataError extends Error {
    constructor() {
        super('Invalid metadata');
        this.code = 0x1771;
        this.name = 'InvalidMetadata';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvalidMetadataError);
        }
    }
}
exports.InvalidMetadataError = InvalidMetadataError;
createErrorFromCodeLookup.set(0x1771, () => new InvalidMetadataError());
createErrorFromNameLookup.set('InvalidMetadata', () => new InvalidMetadataError());
class InvalidNFTError extends Error {
    constructor() {
        super('Invalid NFT');
        this.code = 0x1772;
        this.name = 'InvalidNFT';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvalidNFTError);
        }
    }
}
exports.InvalidNFTError = InvalidNFTError;
createErrorFromCodeLookup.set(0x1772, () => new InvalidNFTError());
createErrorFromNameLookup.set('InvalidNFT', () => new InvalidNFTError());
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