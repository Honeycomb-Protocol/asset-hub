"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorFromName = exports.errorFromCode = exports.DepositAccountNotProvidedError = exports.CantUnstakeYetError = exports.CantStakeYetError = exports.RewardsNotAvailableError = exports.InvalidNFTError = exports.InvalidMetadataError = exports.OnlyOwnerError = exports.OverflowError = void 0;
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
class OnlyOwnerError extends Error {
    constructor() {
        super('Only the owner can perform this operation');
        this.code = 0x1771;
        this.name = 'OnlyOwner';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, OnlyOwnerError);
        }
    }
}
exports.OnlyOwnerError = OnlyOwnerError;
createErrorFromCodeLookup.set(0x1771, () => new OnlyOwnerError());
createErrorFromNameLookup.set('OnlyOwner', () => new OnlyOwnerError());
class InvalidMetadataError extends Error {
    constructor() {
        super('Invalid metadata');
        this.code = 0x1772;
        this.name = 'InvalidMetadata';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvalidMetadataError);
        }
    }
}
exports.InvalidMetadataError = InvalidMetadataError;
createErrorFromCodeLookup.set(0x1772, () => new InvalidMetadataError());
createErrorFromNameLookup.set('InvalidMetadata', () => new InvalidMetadataError());
class InvalidNFTError extends Error {
    constructor() {
        super('Invalid NFT');
        this.code = 0x1773;
        this.name = 'InvalidNFT';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvalidNFTError);
        }
    }
}
exports.InvalidNFTError = InvalidNFTError;
createErrorFromCodeLookup.set(0x1773, () => new InvalidNFTError());
createErrorFromNameLookup.set('InvalidNFT', () => new InvalidNFTError());
class RewardsNotAvailableError extends Error {
    constructor() {
        super('Rewards not available yet');
        this.code = 0x1774;
        this.name = 'RewardsNotAvailable';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, RewardsNotAvailableError);
        }
    }
}
exports.RewardsNotAvailableError = RewardsNotAvailableError;
createErrorFromCodeLookup.set(0x1774, () => new RewardsNotAvailableError());
createErrorFromNameLookup.set('RewardsNotAvailable', () => new RewardsNotAvailableError());
class CantStakeYetError extends Error {
    constructor() {
        super("Can't stake yet");
        this.code = 0x1775;
        this.name = 'CantStakeYet';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, CantStakeYetError);
        }
    }
}
exports.CantStakeYetError = CantStakeYetError;
createErrorFromCodeLookup.set(0x1775, () => new CantStakeYetError());
createErrorFromNameLookup.set('CantStakeYet', () => new CantStakeYetError());
class CantUnstakeYetError extends Error {
    constructor() {
        super("Can't unstake yet");
        this.code = 0x1776;
        this.name = 'CantUnstakeYet';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, CantUnstakeYetError);
        }
    }
}
exports.CantUnstakeYetError = CantUnstakeYetError;
createErrorFromCodeLookup.set(0x1776, () => new CantUnstakeYetError());
createErrorFromNameLookup.set('CantUnstakeYet', () => new CantUnstakeYetError());
class DepositAccountNotProvidedError extends Error {
    constructor() {
        super('Deposit account is not provided');
        this.code = 0x1777;
        this.name = 'DepositAccountNotProvided';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, DepositAccountNotProvidedError);
        }
    }
}
exports.DepositAccountNotProvidedError = DepositAccountNotProvidedError;
createErrorFromCodeLookup.set(0x1777, () => new DepositAccountNotProvidedError());
createErrorFromNameLookup.set('DepositAccountNotProvided', () => new DepositAccountNotProvidedError());
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