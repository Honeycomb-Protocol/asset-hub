"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUpdatePojectInstruction = exports.updatePojectInstructionDiscriminator = exports.updatePojectStruct = void 0;
const beet = __importStar(require("@metaplex-foundation/beet"));
const web3 = __importStar(require("@solana/web3.js"));
const UpdateProjectArgs_1 = require("../types/UpdateProjectArgs");
exports.updatePojectStruct = new beet.FixableBeetArgsStruct([
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', UpdateProjectArgs_1.updateProjectArgsBeet],
], 'UpdatePojectInstructionArgs');
exports.updatePojectInstructionDiscriminator = [
    145, 101, 224, 142, 135, 126, 58, 73,
];
function createUpdatePojectInstruction(accounts, args, programId = new web3.PublicKey('8pyniLLXEHVUJKX2h5E9DrvwTsRmSR64ucUYBg8jQgPP')) {
    var _a, _b;
    const [data] = exports.updatePojectStruct.serialize({
        instructionDiscriminator: exports.updatePojectInstructionDiscriminator,
        ...args,
    });
    const keys = [
        {
            pubkey: accounts.project,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.newAuthority,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: accounts.collection,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: accounts.creator,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: accounts.authority,
            isWritable: true,
            isSigner: true,
        },
        {
            pubkey: (_a = accounts.systemProgram) !== null && _a !== void 0 ? _a : web3.SystemProgram.programId,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: (_b = accounts.rent) !== null && _b !== void 0 ? _b : web3.SYSVAR_RENT_PUBKEY,
            isWritable: false,
            isSigner: false,
        },
    ];
    if (accounts.anchorRemainingAccounts != null) {
        for (const acc of accounts.anchorRemainingAccounts) {
            keys.push(acc);
        }
    }
    const ix = new web3.TransactionInstruction({
        programId,
        keys,
        data,
    });
    return ix;
}
exports.createUpdatePojectInstruction = createUpdatePojectInstruction;
//# sourceMappingURL=updatePoject.js.map