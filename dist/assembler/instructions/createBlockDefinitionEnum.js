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
exports.createCreateBlockDefinitionEnumInstruction = exports.createBlockDefinitionEnumInstructionDiscriminator = exports.createBlockDefinitionEnumStruct = void 0;
const beet = __importStar(require("@metaplex-foundation/beet"));
const web3 = __importStar(require("@solana/web3.js"));
const CreateBlockDefinitionEnumArgs_1 = require("../types/CreateBlockDefinitionEnumArgs");
exports.createBlockDefinitionEnumStruct = new beet.FixableBeetArgsStruct([
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', CreateBlockDefinitionEnumArgs_1.createBlockDefinitionEnumArgsBeet],
], 'CreateBlockDefinitionEnumInstructionArgs');
exports.createBlockDefinitionEnumInstructionDiscriminator = [
    241, 173, 227, 189, 53, 230, 149, 206,
];
function createCreateBlockDefinitionEnumInstruction(accounts, args, programId = new web3.PublicKey('AXX2agYcoDwGFsgEWvSitqfGH4ooKXUqK5P7Ch9raDJT')) {
    var _a;
    const [data] = exports.createBlockDefinitionEnumStruct.serialize({
        instructionDiscriminator: exports.createBlockDefinitionEnumInstructionDiscriminator,
        ...args,
    });
    const keys = [
        {
            pubkey: accounts.assembler,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: accounts.block,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: accounts.blockDefinition,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.blockDefinitionMint,
            isWritable: true,
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
exports.createCreateBlockDefinitionEnumInstruction = createCreateBlockDefinitionEnumInstruction;
//# sourceMappingURL=createBlockDefinitionEnum.js.map