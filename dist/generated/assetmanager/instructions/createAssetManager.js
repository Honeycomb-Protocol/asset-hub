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
exports.createCreateAssetManagerInstruction = exports.createAssetManagerInstructionDiscriminator = exports.createAssetManagerStruct = void 0;
const beet = __importStar(require("@metaplex-foundation/beet"));
const web3 = __importStar(require("@solana/web3.js"));
const CreateAssetManagerArgs_1 = require("../types/CreateAssetManagerArgs");
exports.createAssetManagerStruct = new beet.FixableBeetArgsStruct([
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', CreateAssetManagerArgs_1.createAssetManagerArgsBeet],
], 'CreateAssetManagerInstructionArgs');
exports.createAssetManagerInstructionDiscriminator = [
    30, 237, 255, 50, 68, 210, 20, 30,
];
function createCreateAssetManagerInstruction(accounts, args, programId = new web3.PublicKey('BNGKUeQQHw2MgZc9EqFsCWmnkLEKLCUfu5cw9YFWK3hF')) {
    var _a;
    const [data] = exports.createAssetManagerStruct.serialize({
        instructionDiscriminator: exports.createAssetManagerInstructionDiscriminator,
        ...args,
    });
    const keys = [
        {
            pubkey: accounts.key,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: accounts.assetManager,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.treasury,
            isWritable: false,
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
exports.createCreateAssetManagerInstruction = createCreateAssetManagerInstruction;
//# sourceMappingURL=createAssetManager.js.map