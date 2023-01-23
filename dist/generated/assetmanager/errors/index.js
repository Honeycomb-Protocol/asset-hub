"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorFromName = exports.errorFromCode = exports.UnauthorizedMintError = void 0;
const createErrorFromCodeLookup = new Map();
const createErrorFromNameLookup = new Map();
class UnauthorizedMintError extends Error {
    constructor() {
        super('Unauthorized to mints');
        this.code = 0x1770;
        this.name = 'UnauthorizedMint';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, UnauthorizedMintError);
        }
    }
}
exports.UnauthorizedMintError = UnauthorizedMintError;
createErrorFromCodeLookup.set(0x1770, () => new UnauthorizedMintError());
createErrorFromNameLookup.set('UnauthorizedMint', () => new UnauthorizedMintError());
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