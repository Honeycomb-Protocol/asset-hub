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
exports.createCreateAssemblerInstruction = exports.createAssemblerInstructionDiscriminator = exports.createAssemblerStruct = void 0;
const splToken = __importStar(require("@solana/spl-token"));
const beet = __importStar(require("@metaplex-foundation/beet"));
const web3 = __importStar(require("@solana/web3.js"));
const CreateAssemblerArgs_1 = require("../types/CreateAssemblerArgs");
exports.createAssemblerStruct = new beet.FixableBeetArgsStruct([
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', CreateAssemblerArgs_1.createAssemblerArgsBeet],
], 'CreateAssemblerInstructionArgs');
exports.createAssemblerInstructionDiscriminator = [
    44, 78, 21, 254, 233, 225, 32, 243,
];
function createCreateAssemblerInstruction(accounts, args, programId = new web3.PublicKey('4cEhZgkh41JbuXsXdcKhNaeHJ2BpzmXN3VpMQ3nFPDrp')) {
    var _a, _b, _c;
    const [data] = exports.createAssemblerStruct.serialize({
        instructionDiscriminator: exports.createAssemblerInstructionDiscriminator,
        ...args,
    });
    const keys = [
        {
            pubkey: accounts.collectionMint,
            isWritable: true,
            isSigner: true,
        },
        {
            pubkey: accounts.collectionMetadataAccount,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.assembler,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.authority,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: accounts.payer,
            isWritable: true,
            isSigner: true,
        },
        {
            pubkey: (_a = accounts.systemProgram) !== null && _a !== void 0 ? _a : web3.SystemProgram.programId,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: (_b = accounts.tokenProgram) !== null && _b !== void 0 ? _b : splToken.TOKEN_PROGRAM_ID,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: accounts.tokenMetadataProgram,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: (_c = accounts.rent) !== null && _c !== void 0 ? _c : web3.SYSVAR_RENT_PUBKEY,
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
exports.createCreateAssemblerInstruction = createCreateAssemblerInstruction;
//# sourceMappingURL=createAssembler.js.map