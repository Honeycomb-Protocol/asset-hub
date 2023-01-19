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
exports.createCreateBlockDefinitionBooleanInstruction = exports.createBlockDefinitionBooleanInstructionDiscriminator = exports.createBlockDefinitionBooleanStruct = void 0;
const beet = __importStar(require("@metaplex-foundation/beet"));
const web3 = __importStar(require("@solana/web3.js"));
const CreateBlockDefinitionBooleanArgs_1 = require("../types/CreateBlockDefinitionBooleanArgs");
exports.createBlockDefinitionBooleanStruct = new beet.BeetArgsStruct([
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', CreateBlockDefinitionBooleanArgs_1.createBlockDefinitionBooleanArgsBeet],
], 'CreateBlockDefinitionBooleanInstructionArgs');
exports.createBlockDefinitionBooleanInstructionDiscriminator = [
    23, 239, 25, 75, 162, 212, 50, 200,
];
function createCreateBlockDefinitionBooleanInstruction(accounts, args, programId = new web3.PublicKey('AXX2agYcoDwGFsgEWvSitqfGH4ooKXUqK5P7Ch9raDJT')) {
    var _a;
    const [data] = exports.createBlockDefinitionBooleanStruct.serialize({
        instructionDiscriminator: exports.createBlockDefinitionBooleanInstructionDiscriminator,
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
exports.createCreateBlockDefinitionBooleanInstruction = createCreateBlockDefinitionBooleanInstruction;
//# sourceMappingURL=createBlockDefinitionBoolean.js.map