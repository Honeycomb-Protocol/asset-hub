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
exports.createCreateDelegateAuthorityInstruction = exports.createDelegateAuthorityInstructionDiscriminator = exports.createDelegateAuthorityStruct = void 0;
const beet = __importStar(require("@metaplex-foundation/beet"));
const web3 = __importStar(require("@solana/web3.js"));
const CreateDelegateAuthorityArgs_1 = require("../types/CreateDelegateAuthorityArgs");
exports.createDelegateAuthorityStruct = new beet.BeetArgsStruct([
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', CreateDelegateAuthorityArgs_1.createDelegateAuthorityArgsBeet],
], 'CreateDelegateAuthorityInstructionArgs');
exports.createDelegateAuthorityInstructionDiscriminator = [
    232, 124, 221, 107, 188, 245, 74, 127,
];
function createCreateDelegateAuthorityInstruction(accounts, args, programId = new web3.PublicKey('4cEhZgkh41JbuXsXdcKhNaeHJ2BpzmXN3VpMQ3nFPDrp')) {
    var _a;
    const [data] = exports.createDelegateAuthorityStruct.serialize({
        instructionDiscriminator: exports.createDelegateAuthorityInstructionDiscriminator,
        ...args,
    });
    const keys = [
        {
            pubkey: accounts.assembler,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.delegateAuthority,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.delegate,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: accounts.authority,
            isWritable: false,
            isSigner: true,
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
exports.createCreateDelegateAuthorityInstruction = createCreateDelegateAuthorityInstruction;
//# sourceMappingURL=createDelegateAuthority.js.map